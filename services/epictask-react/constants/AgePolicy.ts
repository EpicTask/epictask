/**
 * Single source of truth for the age bands that drive account type.
 *
 * Mirrors `services/mono_service/src/config/age_policy.py` — keep the two in
 * sync. Every gate in the app (which signup path a child takes, whether a
 * parent may switch into their profile, which copy is shown) reads from here
 * rather than hard-coding a number.
 *
 *     5 – 12   managed profile. No email, no password, no independent sign-in.
 *              Lives on the parent's device behind a 4-digit PIN.
 *     13 – 18  own credentialed account. Email + password, created by
 *              redeeming a single-use invite the parent generates.
 */

export const MIN_CHILD_AGE = 5;
export const MAX_CHILD_AGE = 18;

/** First age at which a child gets their own credentialed account. */
export const TEEN_MIN_AGE = 13;

const toAge = (age: number | string | null | undefined): number => {
  const parsed = typeof age === "number" ? age : parseInt(String(age ?? ""), 10);
  return Number.isNaN(parsed) ? -1 : parsed;
};

export const isValidChildAge = (age: number | string | null | undefined): boolean => {
  const value = toAge(age);
  return value >= MIN_CHILD_AGE && value <= MAX_CHILD_AGE;
};

/** True when the child gets a parent-managed profile (no credentials). */
export const isManagedAge = (age: number | string | null | undefined): boolean => {
  const value = toAge(age);
  return value >= MIN_CHILD_AGE && value < TEEN_MIN_AGE;
};

/** True when the child gets their own email/password account. */
export const isTeenAge = (age: number | string | null | undefined): boolean => {
  const value = toAge(age);
  return value >= TEEN_MIN_AGE && value <= MAX_CHILD_AGE;
};

/**
 * True when a parent may switch into this child's profile with a PIN.
 *
 * Only managed (under-13) profiles are shareable. A teen has their own
 * credentials and signs in for themselves, so a parent switching into their
 * account would be impersonation rather than supervision.
 */
export const deviceSharingAllowed = (age: number | string | null | undefined): boolean =>
  isManagedAge(age);

/** Age options for the add-kid dropdown, as strings. */
export const AGE_OPTIONS: string[] = Array.from(
  { length: MAX_CHILD_AGE - MIN_CHILD_AGE + 1 },
  (_, i) => String(MIN_CHILD_AGE + i)
);

/** Why a given child can't be switched into, or null when they can. */
export const deviceSharingBlockedReason = (child: {
  age?: number | string | null;
  displayName?: string;
  device_sharing_enabled?: boolean;
}): string | null => {
  if (!deviceSharingAllowed(child.age)) {
    return `Age ${TEEN_MIN_AGE}+ signs in with their own email and password`;
  }
  if (child.device_sharing_enabled === false) {
    return "Profile sharing is turned off for this child";
  }
  return null;
};

export default {
  MIN_CHILD_AGE,
  MAX_CHILD_AGE,
  TEEN_MIN_AGE,
  AGE_OPTIONS,
  isValidChildAge,
  isManagedAge,
  isTeenAge,
  deviceSharingAllowed,
  deviceSharingBlockedReason,
};
