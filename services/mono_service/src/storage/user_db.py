import datetime
import secrets
import string
from typing import Optional, List, Dict, Any
import bcrypt
from firebase_admin import auth, firestore
from google.cloud.firestore_v1.base_query import FieldFilter

from ..config.firebase_config import db
from ..config.collection_names import collections
from ..config import age_policy
from ..config.role_claims import set_role_claim
from ..domain.user_models import UserProfile, InviteCodeResponse, UserMetrics, NotificationPreferences

# PIN brute-force protection. Enforced server-side and persisted in Firestore
# so the counter survives process restarts and is shared across instances.
PIN_MAX_ATTEMPTS = 5
PIN_LOCKOUT_MINUTES = 15

INVITE_CODE_LENGTH = 6
INVITE_TTL_DAYS = 7
# I, O, 0 and 1 are omitted — these codes get read aloud and typed by teens.
INVITE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def _utc_now() -> datetime.datetime:
    return datetime.datetime.now(datetime.timezone.utc)


def _as_aware(value) -> Optional[datetime.datetime]:
    """Normalise a Firestore timestamp / ISO string to an aware datetime."""
    if value is None:
        return None
    if isinstance(value, str):
        try:
            value = datetime.datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return None
    if isinstance(value, datetime.datetime):
        if value.tzinfo is None:
            return value.replace(tzinfo=datetime.timezone.utc)
        return value
    return None


def hash_pin(pin: str) -> str:
    """Hash a raw 4-digit PIN securely using bcrypt.

    Uses the bcrypt library directly rather than passlib — passlib 1.7.x reads
    `bcrypt.__about__`, which was removed in bcrypt 4.1, so the combination
    pinned in requirements.txt raises at hash time. The output format ($2b$…)
    is identical, so hashes written either way verify here.
    """
    return bcrypt.hashpw(pin.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_pin(plain_pin: str, hashed_pin: str) -> bool:
    """Verify a plain PIN against a bcrypt hash."""
    if not hashed_pin:
        return False
    try:
        return bcrypt.checkpw(plain_pin.encode("utf-8"), hashed_pin.encode("utf-8"))
    except Exception:
        return False


def _security_doc(uid: str):
    """Server-only document holding a child's PIN hash and lockout state."""
    return (
        db.collection(collections.USERS)
        .document(uid)
        .collection(collections.USER_PRIVATE)
        .document(collections.USER_SECURITY_DOC)
    )


def set_child_pin(uid: str, pin: str) -> None:
    """Store (or rotate) a child's PIN hash in the server-only subcollection.

    Writing a new PIN also clears any active lockout, which is what a parent
    resetting a forgotten PIN expects to happen.
    """
    _security_doc(uid).set(
        {
            "pin_hash": hash_pin(pin),
            "failed_attempts": 0,
            "locked_until": None,
            "updated_at": _utc_now().isoformat(),
        },
        merge=True,
    )


def has_child_pin(uid: str) -> bool:
    """True when a PIN has been configured for this child."""
    snap = _security_doc(uid).get()
    if snap.exists and snap.to_dict().get("pin_hash"):
        return True
    profile = db.collection(collections.USERS).document(uid).get()
    return bool(profile.exists and profile.to_dict().get("pin_hash"))

def get_user_profile(uid: str) -> Optional[dict]:
    """Get user profile from Firestore."""
    try:
        user_ref = db.collection(collections.USERS).document(uid)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            return None
            
        data = user_doc.to_dict()
        data['uid'] = uid
        return data
    except Exception as e:
        print(f"Failed to get user profile: {e}")
        # In a real app, you might want to raise a custom exception here
        return None

def update_user_profile(uid: str, profile_data: dict) -> bool:
    """Update user profile in Firestore and Firebase Auth."""
    try:
        # Update Firestore
        user_ref = db.collection(collections.USERS).document(uid)
        user_ref.update(profile_data)
        
        # Update Firebase Auth if display_name or photo_url are present
        auth_update = {}
        if 'display_name' in profile_data and profile_data['display_name']:
            auth_update['display_name'] = profile_data['display_name']
        if 'photo_url' in profile_data and profile_data['photo_url']:
            auth_update['photo_url'] = profile_data['photo_url']
            
        if auth_update:
            auth.update_user(uid, **auth_update)
            
        print(f"Profile updated successfully for user: {uid}")
        return True
    except Exception as e:
        print(f"Failed to update profile: {e}")
        return False

def create_managed_child(parent_uid: str, child_data: dict) -> dict:
    """Create a child profile controlled by a parent on a shared device.

    Managed profiles are for under-13s: the Auth user carries no email and no
    password, so the child can never sign in on their own. Access is always
    through the parent's session plus the child's PIN.
    """
    age = child_data["age"]
    if not age_policy.is_managed_age(age):
        raise ValueError(
            f"Managed profiles are for ages {age_policy.MIN_CHILD_AGE}-"
            f"{age_policy.TEEN_MIN_AGE - 1}. Age {age} needs their own account."
        )

    child_user = None
    try:
        child_user = auth.create_user(display_name=child_data["display_name"])
        set_role_claim(child_user.uid, "child")
        now = _utc_now().isoformat()
        child_profile = {
            "uid": child_user.uid,
            "display_name": child_data["display_name"],
            "role": "child",
            "account_type": "managed",
            "age": age,
            "grade_level": child_data["grade_level"],
            "parent_id": parent_uid,
            "device_sharing_enabled": age_policy.device_sharing_allowed(age),
            "parental_consent_at": child_data.get("parental_consent_at") or now,
            "parental_consent_by": parent_uid,
            "created_at": now,
            "updated_at": now,
        }
        if child_data.get("avatar_key"):
            child_profile["avatar_key"] = child_data["avatar_key"]
        if child_data.get("photo_url"):
            child_profile["photo_url"] = child_data["photo_url"]

        batch = db.batch()
        child_ref = db.collection(collections.USERS).document(child_user.uid)
        parent_ref = db.collection(collections.USERS).document(parent_uid)
        batch.set(child_ref, child_profile)
        batch.update(parent_ref, {"children": firestore.ArrayUnion([child_user.uid])})
        batch.commit()

        # PIN lives outside the profile document so that no client — not even
        # the parent, who can read their child's profile — can read the hash.
        set_child_pin(child_user.uid, child_data["pin"])

        return {"success": True, "child": child_profile}
    except Exception:
        if child_user:
            try:
                auth.delete_user(child_user.uid)
            except Exception as cleanup_error:
                print(f"Failed to clean up managed child Auth user: {cleanup_error}")
        raise

def delete_user_account(uid: str) -> bool:
    """Delete user account from Firestore and Firebase Auth."""
    try:
        # Delete from Firestore
        db.collection(collections.USERS).document(uid).delete()
        
        # Delete from Firebase Auth
        auth.delete_user(uid)
        
        print(f"Deleted account for user: {uid}")
        return True
    except Exception as e:
        print(f"Error deleting user account: {e}")
        return False

def generate_invite_code(child_id: str) -> InviteCodeResponse:
    """Generate a 6-character alphanumeric single-use invite code for a child."""
    try:
        alphabet = string.ascii_uppercase + string.digits
        invite_code = ''.join(secrets.choice(alphabet) for _ in range(6))
        
        invites_ref = db.collection(collections.INVITES)
        new_invite_ref = invites_ref.document(invite_code)
        
        # Expires in 7 days
        expires_at = datetime.datetime.now() + datetime.timedelta(days=7)
        
        invite_data = {
            "childId": child_id,
            "expiresAt": expires_at,
            "code": invite_code,
            "attempts": 0,
            "rate_limit_max": 10,
            "used": False
        }
        
        new_invite_ref.set(invite_data)
        
        return InviteCodeResponse(
            invite_code=invite_code,
            expires_at=expires_at,
            child_id=child_id
        )
    except Exception as e:
        print(f"Failed to generate invite code: {e}")
        raise e

def link_child_account(parent_uid: str, invite_code: str) -> Dict[str, str]:
    """Link a child account to a parent using an invite code."""
    try:
        invite_ref = db.collection(collections.INVITES).document(invite_code)
        invite_doc = invite_ref.get()
        
        if not invite_doc.exists:
            raise ValueError("Invalid invite code")
            
        invite_data = invite_doc.to_dict()
        
        expires_at = invite_data.get('expiresAt')
        if expires_at:
            now_utc = datetime.datetime.now(tz=datetime.timezone.utc)
            if getattr(expires_at, 'tzinfo', None):
                expired = expires_at < now_utc
            else:
                expired = expires_at < datetime.datetime.now(datetime.timezone.utc)
            if expired:
                raise ValueError("Invite code has expired")

        child_id = invite_data.get('childId')
        
        # Add child to parent's list and parent to child's list
        parent_ref = db.collection(collections.USERS).document(parent_uid)
        child_ref = db.collection(collections.USERS).document(child_id)
        
        # Use transaction or batch for atomicity? 
        # For simplicity following the Node.js implementation which was sequential awaits
        
        parent_ref.update({"children": firestore.ArrayUnion([child_id])})
        child_ref.update({"parent_id": parent_uid})
        
        # Delete the invite code after use
        invite_ref.delete()
        
        return {
            "message": "Child linked successfully.",
            "child_id": child_id
        }
    except Exception as e:
        print(f"Failed to link child account: {e}")
        raise e

def get_linked_children(parent_uid: str) -> List[dict]:
    """Get all children linked to a parent."""
    try:
        parent_doc = db.collection(collections.USERS).document(parent_uid).get()
        if not parent_doc.exists:
            raise ValueError("Parent not found")
            
        parent_data = parent_doc.to_dict()
        child_ids = parent_data.get('children', [])
        
        if not child_ids:
            return []
            
        # Firestore 'in' query supports up to 10 (or 30 now) values
        # If there are many children, we might need to batch or loop, 
        # but realistically a parent won't have that many.
        
        children = []
        # Chunking if needed, but for now simple query
        if child_ids:
            # Firestore requires non-empty list for 'in'
            users_ref = db.collection(collections.USERS)
            # Use FieldFilter for better readability/compatibility
            query = users_ref.where(filter=FieldFilter("uid", "in", child_ids))
            docs = query.stream()
            
            for doc in docs:
                child_data = doc.to_dict()
                child_data['uid'] = doc.id
                children.append(child_data)
                
        return children
    except Exception as e:
        print(f"Failed to get linked children: {e}")
        raise e

def get_fcm_token(uid: str) -> Optional[str]:
    """Return the stored FCM / APNs push token for a user, or None."""
    try:
        doc = db.collection(collections.USERS).document(uid).get()
        if not doc.exists:
            return None
        return doc.to_dict().get("fcm_token")
    except Exception as e:
        print(f"Failed to get FCM token for {uid}: {e}")
        return None


def update_fcm_token(uid: str, token: str, platform: str) -> bool:
    """Persist a device push token on the user's profile document."""
    try:
        db.collection(collections.USERS).document(uid).update(
            {"fcm_token": token, "fcm_token_platform": platform}
        )
        return True
    except Exception as e:
        print(f"Failed to update FCM token for {uid}: {e}")
        return False


def clear_fcm_token(uid: str) -> bool:
    """Remove an invalid / expired push token from the user's profile."""
    try:
        db.collection(collections.USERS).document(uid).update(
            {"fcm_token": None, "fcm_token_platform": None}
        )
        return True
    except Exception as e:
        print(f"Failed to clear FCM token for {uid}: {e}")
        return False


def get_user_metrics() -> UserMetrics:
    """Get aggregate user metrics."""
    try:
        users_ref = db.collection(collections.USERS)
        # Note: getting all documents is expensive. 
        # In production, use aggregation queries or counters.
        docs = users_ref.stream()
        
        total_users = 0
        parent_users = 0
        child_users = 0
        
        for doc in docs:
            total_users += 1
            data = doc.to_dict()
            role = data.get('role')
            if role == 'parent':
                parent_users += 1
            else:
                child_users += 1
                
        # Mock calculation for active users as in Node.js
        active_users = int(total_users * 0.7)
        
        return UserMetrics(
            total_users=total_users,
            active_users=active_users,
            parent_users=parent_users,
            child_users=child_users,
            registration_trends={
                "daily": int(total_users * 0.05),
                "weekly": int(total_users * 0.15),
                "monthly": total_users
            },
            last_updated=datetime.datetime.now()
        )
    except Exception as e:
        print(f"Failed to get user metrics: {e}")
        # Return empty metrics on error
        return UserMetrics(
            total_users=0,
            active_users=0,
            parent_users=0,
            child_users=0,
            registration_trends={},
            last_updated=datetime.datetime.now()
        )

def get_notification_preferences(uid: str) -> NotificationPreferences:
    """Get user notification preferences from the sub-collection."""
    try:
        pref_ref = db.collection(collections.USERS).document(uid).collection(collections.PREFERENCES).document("notifications")
        doc = pref_ref.get()
        if doc.exists:
            return NotificationPreferences(**doc.to_dict())
        return NotificationPreferences()  # Return defaults if not found
    except Exception as e:
        print(f"Failed to get notification preferences for {uid}: {e}")
        return NotificationPreferences()

def update_notification_preferences(uid: str, prefs_dict: dict) -> bool:
    """Update user notification preferences in the sub-collection."""
    try:
        pref_ref = db.collection(collections.USERS).document(uid).collection(collections.PREFERENCES).document("notifications")
        prefs_dict['updated_at'] = datetime.datetime.now()
        pref_ref.set(prefs_dict, merge=True)
        return True
    except Exception as e:
        print(f"Failed to update notification preferences for {uid}: {e}")
        return False

def verify_child_pin(child_id: str, pin: str) -> dict:
    """Verify a child's PIN with durable, server-side lockout.

    Never returns the PIN hash or the raw profile document — only the handful
    of fields the caller needs to render the switched-into session.
    """
    user_ref = db.collection(collections.USERS).document(child_id)
    user_doc = user_ref.get()
    if not user_doc.exists:
        # Same shape as a wrong PIN so the endpoint can't be used to probe
        # which child ids exist.
        return {"success": False, "message": "Invalid PIN", "attempts_remaining": PIN_MAX_ATTEMPTS}

    profile = user_doc.to_dict()
    security_ref = _security_doc(child_id)
    security_snap = security_ref.get()
    security = security_snap.to_dict() if security_snap.exists else {}

    locked_until = _as_aware(security.get("locked_until"))
    now = _utc_now()
    if locked_until and locked_until > now:
        return {
            "success": False,
            "locked": True,
            "locked_until": locked_until.isoformat(),
            "retry_after_seconds": int((locked_until - now).total_seconds()),
            "message": "Too many incorrect PIN attempts. Try again later.",
        }

    stored_hash = security.get("pin_hash")
    legacy_plaintext = None
    if not stored_hash:
        # Profiles created before PINs moved into the private subcollection
        # kept the value on the user document — and the teen signup path used
        # to store it unhashed. Accept it once, then migrate and scrub.
        legacy = profile.get("pin_hash") or profile.get("pinHash")
        if legacy and legacy.startswith("$2"):
            stored_hash = legacy
        elif legacy:
            legacy_plaintext = legacy

    if not stored_hash and legacy_plaintext is None:
        return {"success": False, "message": "No PIN has been set for this profile yet."}

    is_valid = verify_pin(pin, stored_hash) if stored_hash else (pin == legacy_plaintext)

    if not is_valid:
        attempts = int(security.get("failed_attempts") or 0) + 1
        update = {"failed_attempts": attempts, "updated_at": now.isoformat()}
        if attempts >= PIN_MAX_ATTEMPTS:
            lock_until = now + datetime.timedelta(minutes=PIN_LOCKOUT_MINUTES)
            update["locked_until"] = lock_until.isoformat()
            update["failed_attempts"] = 0
            security_ref.set(update, merge=True)
            return {
                "success": False,
                "locked": True,
                "locked_until": lock_until.isoformat(),
                "retry_after_seconds": PIN_LOCKOUT_MINUTES * 60,
                "message": "Too many incorrect PIN attempts. Try again later.",
            }
        security_ref.set(update, merge=True)
        return {
            "success": False,
            "message": "Invalid PIN",
            "attempts_remaining": PIN_MAX_ATTEMPTS - attempts,
        }

    # Success: reset the counter and finish migrating any legacy PIN.
    security_ref.set(
        {
            "pin_hash": stored_hash or hash_pin(pin),
            "failed_attempts": 0,
            "locked_until": None,
            "updated_at": now.isoformat(),
        },
        merge=True,
    )
    if profile.get("pin_hash") is not None or profile.get("pinHash") is not None:
        try:
            user_ref.update(
                {"pin_hash": firestore.DELETE_FIELD, "pinHash": firestore.DELETE_FIELD}
            )
        except Exception as scrub_error:
            print(f"Failed to scrub legacy PIN for {child_id}: {scrub_error}")

    return {
        "success": True,
        "child": {
            "uid": child_id,
            "display_name": profile.get("display_name"),
            "age": profile.get("age"),
            "grade_level": profile.get("grade_level"),
            "photo_url": profile.get("photo_url"),
            "avatar_key": profile.get("avatar_key"),
            "parent_id": profile.get("parent_id"),
            "account_type": profile.get("account_type", "managed"),
            "device_sharing_enabled": profile.get("device_sharing_enabled", False),
        },
    }


# ---------------------------------------------------------------------------
# Teen (13+) invites
# ---------------------------------------------------------------------------

def _generate_invite_code() -> str:
    return "".join(secrets.choice(INVITE_ALPHABET) for _ in range(INVITE_CODE_LENGTH))


def _public_invite(code: str, data: dict) -> dict:
    """Projection of an invite that is safe to hand to whoever holds the code."""
    expires_at = _as_aware(data.get("expires_at"))
    email = data.get("child_email") or ""
    local, _, domain = email.partition("@")
    masked = f"{local[:1]}{'•' * max(len(local) - 1, 1)}@{domain}" if domain else ""
    return {
        "code": code,
        "child_name": data.get("child_name"),
        "age": data.get("age"),
        "grade_level": data.get("grade_level"),
        "parent_name": data.get("parent_name"),
        "child_email_masked": masked,
        "status": data.get("status"),
        "expires_at": expires_at.isoformat() if expires_at else None,
    }


def create_child_invite(parent_uid: str, parent_name: str, invite_data: dict) -> dict:
    """Issue a single-use invite that lets a teen create their own account."""
    age = invite_data["age"]
    if not age_policy.is_teen_age(age):
        raise ValueError(
            f"Invites are for ages {age_policy.TEEN_MIN_AGE}-{age_policy.MAX_CHILD_AGE}. "
            f"Age {age} should use a managed profile instead."
        )

    email = invite_data["child_email"].strip().lower()
    invites_ref = db.collection(collections.CHILD_INVITES)

    # Re-issuing for the same child replaces any invite still outstanding, so a
    # parent who taps "Add Kid" twice doesn't leave a live orphan code behind.
    for stale in (
        invites_ref
        .where(filter=FieldFilter("parent_id", "==", parent_uid))
        .where(filter=FieldFilter("child_email", "==", email))
        .where(filter=FieldFilter("status", "==", "pending"))
        .stream()
    ):
        stale.reference.update({"status": "superseded", "updated_at": _utc_now().isoformat()})

    now = _utc_now()
    expires_at = now + datetime.timedelta(days=INVITE_TTL_DAYS)

    # Collision on a 32^6 space is vanishingly unlikely, but a used code that
    # still exists would silently shadow the new one, so check.
    for _ in range(5):
        code = _generate_invite_code()
        invite_ref = invites_ref.document(code)
        if not invite_ref.get().exists:
            break
    else:
        raise RuntimeError("Could not allocate an invite code, please retry")

    record = {
        "code": code,
        "parent_id": parent_uid,
        "parent_name": parent_name,
        "child_name": invite_data["display_name"],
        "child_email": email,
        "age": age,
        "grade_level": invite_data["grade_level"],
        "status": "pending",
        "parental_consent_at": invite_data.get("parental_consent_at") or now.isoformat(),
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
        "expires_at": expires_at.isoformat(),
    }
    invite_ref.set(record)
    return {"success": True, "invite": _public_invite(code, record), "invite_code": code}


def get_child_invite(code: str) -> dict:
    """Look up an invite for the join screen. Returns the public projection."""
    code = (code or "").strip().upper()
    snap = db.collection(collections.CHILD_INVITES).document(code).get()
    if not snap.exists:
        return {"success": False, "message": "That invite code doesn't exist. Check it and try again."}

    data = snap.to_dict()
    if data.get("status") == "redeemed":
        return {"success": False, "message": "This invite code has already been used."}
    if data.get("status") not in ("pending",):
        return {"success": False, "message": "This invite code is no longer valid."}

    expires_at = _as_aware(data.get("expires_at"))
    if expires_at and expires_at < _utc_now():
        return {"success": False, "message": "This invite code has expired. Ask your parent for a new one."}

    return {"success": True, "invite": _public_invite(code, data)}


def list_child_invites(parent_uid: str) -> List[dict]:
    """Outstanding invites for a parent, newest first."""
    query = (
        db.collection(collections.CHILD_INVITES)
        .where(filter=FieldFilter("parent_id", "==", parent_uid))
        .where(filter=FieldFilter("status", "==", "pending"))
    )
    invites = [_public_invite(doc.id, doc.to_dict()) for doc in query.stream()]
    return sorted(invites, key=lambda i: i.get("expires_at") or "", reverse=True)


def revoke_child_invite(parent_uid: str, code: str) -> bool:
    """Cancel an outstanding invite. Only the issuing parent may do this."""
    code = (code or "").strip().upper()
    invite_ref = db.collection(collections.CHILD_INVITES).document(code)
    snap = invite_ref.get()
    if not snap.exists or snap.to_dict().get("parent_id") != parent_uid:
        return False
    if snap.to_dict().get("status") != "pending":
        return False
    invite_ref.update({"status": "revoked", "updated_at": _utc_now().isoformat()})
    return True


def redeem_child_invite(code: str, email: str, password: str, pin: str, avatar_key: Optional[str] = None) -> dict:
    """Create a teen's own account from an invite code.

    The invite code plus a matching email is the authorization here — the teen
    has no account yet. The server creates the Auth user so a failed redeem can
    never strand a half-registered login.
    """
    code = (code or "").strip().upper()
    email = (email or "").strip().lower()
    invite_ref = db.collection(collections.CHILD_INVITES).document(code)

    transaction = db.transaction()

    @firestore.transactional
    def _claim(tx) -> dict:
        snap = invite_ref.get(transaction=tx)
        if not snap.exists:
            raise ValueError("That invite code doesn't exist. Check it and try again.")

        data = snap.to_dict()
        if data.get("status") == "redeemed":
            raise ValueError("This invite code has already been used.")
        if data.get("status") != "pending":
            raise ValueError("This invite code is no longer valid.")

        expires_at = _as_aware(data.get("expires_at"))
        if expires_at and expires_at < _utc_now():
            raise ValueError("This invite code has expired. Ask your parent for a new one.")

        if (data.get("child_email") or "").lower() != email:
            raise ValueError("That email doesn't match the invite. Use the address your parent entered.")

        tx.update(invite_ref, {"status": "claiming", "updated_at": _utc_now().isoformat()})
        return data

    invite = _claim(transaction)

    child_user = None
    try:
        child_user = auth.create_user(
            email=email,
            password=password,
            display_name=invite["child_name"],
        )
        set_role_claim(child_user.uid, "child")
        now = _utc_now().isoformat()
        parent_uid = invite["parent_id"]
        profile = {
            "uid": child_user.uid,
            "email": email,
            "display_name": invite["child_name"],
            "role": "child",
            "account_type": "independent",
            "age": invite["age"],
            "grade_level": invite["grade_level"],
            "parent_id": parent_uid,
            # Teens sign in for themselves; a parent cannot switch into their
            # profile. See config/age_policy.py.
            "device_sharing_enabled": age_policy.device_sharing_allowed(invite["age"]),
            "parental_consent_at": invite.get("parental_consent_at"),
            "parental_consent_by": parent_uid,
            "created_at": now,
            "updated_at": now,
        }
        if avatar_key:
            profile["avatar_key"] = avatar_key

        batch = db.batch()
        batch.set(db.collection(collections.USERS).document(child_user.uid), profile)
        batch.update(
            db.collection(collections.USERS).document(parent_uid),
            {"children": firestore.ArrayUnion([child_user.uid])},
        )
        batch.update(
            invite_ref,
            {
                "status": "redeemed",
                "redeemed_by": child_user.uid,
                "redeemed_at": now,
                "updated_at": now,
            },
        )
        batch.commit()

        # The teen's own PIN, chosen during signup — used for quick re-entry on
        # their device, never for a parent switching in.
        set_child_pin(child_user.uid, pin)

        return {
            "success": True,
            "uid": child_user.uid,
            "email": email,
            "display_name": invite["child_name"],
            "parent_id": parent_uid,
            "parent_name": invite.get("parent_name"),
        }
    except Exception:
        if child_user:
            try:
                auth.delete_user(child_user.uid)
            except Exception as cleanup_error:
                print(f"Failed to clean up teen Auth user: {cleanup_error}")
        # Hand the code back so the teen can retry rather than being locked out
        # of an invite that was never actually consumed.
        try:
            invite_ref.update({"status": "pending", "updated_at": _utc_now().isoformat()})
        except Exception as release_error:
            print(f"Failed to release invite {code}: {release_error}")
        raise
