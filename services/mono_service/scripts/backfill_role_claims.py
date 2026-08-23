#!/usr/bin/env python3
"""
One-off backfill: copy every user's Firestore `role` into their Firebase
custom claims.

Accounts created before role claims existed - and any account the client
created directly in Firestore - have no `role` claim, so every authorization
check for them falls back to a Firestore read. Running this once removes that
read for the existing user base; new accounts get their claim at creation time
(see src/config/role_claims.py).

Usage:
    python -m scripts.backfill_role_claims --dry-run
    python -m scripts.backfill_role_claims

Requires the same credentials as the service (GOOGLE_APPLICATION_CREDENTIALS
or CREDENTIALS_PATH).
"""

import argparse
import sys

from firebase_admin import auth

from src.config.collection_names import collections
from src.config.firebase_config import db

VALID_ROLES = {"parent", "child", "kid", "admin"}


def backfill(dry_run: bool) -> int:
    scanned = updated = skipped = failed = 0

    for doc in db.collection(collections.USERS).stream():
        scanned += 1
        uid = doc.id
        role = (doc.to_dict() or {}).get("role")

        if not role:
            print(f"  skip {uid}: no role in Firestore")
            skipped += 1
            continue
        if role not in VALID_ROLES:
            print(f"  skip {uid}: unexpected role {role!r}")
            skipped += 1
            continue

        try:
            user = auth.get_user(uid)
        except auth.UserNotFoundError:
            # Firestore profile with no Auth user behind it - nothing to claim.
            print(f"  skip {uid}: no Firebase Auth user")
            skipped += 1
            continue
        except Exception as exc:
            print(f"  FAIL {uid}: {exc}")
            failed += 1
            continue

        existing = user.custom_claims or {}
        if existing.get("role") == role:
            skipped += 1
            continue

        if dry_run:
            print(f"  would set {uid}: {existing.get('role')!r} -> {role!r}")
            updated += 1
            continue

        try:
            auth.set_custom_user_claims(uid, {**existing, "role": role})
            print(f"  set {uid}: {role}")
            updated += 1
        except Exception as exc:
            print(f"  FAIL {uid}: {exc}")
            failed += 1

    verb = "would update" if dry_run else "updated"
    print(
        f"\nscanned={scanned} {verb}={updated} "
        f"already-correct/skipped={skipped} failed={failed}"
    )
    return 1 if failed else 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Report what would change without writing any claims.",
    )
    args = parser.parse_args()

    if args.dry_run:
        print("DRY RUN - no claims will be written\n")

    return backfill(args.dry_run)


if __name__ == "__main__":
    sys.exit(main())
