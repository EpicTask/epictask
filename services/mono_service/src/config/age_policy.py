"""Single source of truth for the age bands that drive account type.

Mirrored on the client in ``services/epictask-react/constants/AgePolicy.ts``.
Keep the two files in sync — every gate in the app (which signup path a child
takes, whether a parent may switch into their profile, which copy is shown)
reads from here rather than hard-coding a number.

Bands
-----
    4 – 12   managed profile. No email, no password, no independent sign-in.
             Lives on the parent's device behind a 4-digit PIN.
    13 – 18  own credentialed account. Email + password, created by redeeming
             a single-use invite the parent generates.
"""

MIN_CHILD_AGE = 4
MAX_CHILD_AGE = 18

# First age at which a child gets their own credentialed account.
TEEN_MIN_AGE = 13


def is_valid_child_age(age: int) -> bool:
    """True when age is inside the supported 4-18 product range."""
    return MIN_CHILD_AGE <= age <= MAX_CHILD_AGE


def is_managed_age(age: int) -> bool:
    """True when the child gets a parent-managed profile (no credentials)."""
    return MIN_CHILD_AGE <= age < TEEN_MIN_AGE


def is_teen_age(age: int) -> bool:
    """True when the child gets their own email/password account."""
    return TEEN_MIN_AGE <= age <= MAX_CHILD_AGE


def device_sharing_allowed(age: int) -> bool:
    """True when a parent may switch into this child's profile with a PIN.

    Only managed (under-13) profiles are shareable. A teen has their own
    credentials and signs in for themselves, so a parent switching into their
    account would be impersonation rather than supervision.
    """
    return is_managed_age(age)
