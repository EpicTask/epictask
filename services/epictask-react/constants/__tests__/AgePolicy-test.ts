import {
  AGE_OPTIONS,
  MAX_CHILD_AGE,
  MIN_CHILD_AGE,
  TEEN_MIN_AGE,
  deviceSharingAllowed,
  deviceSharingBlockedReason,
  isManagedAge,
  isTeenAge,
  isValidChildAge,
} from "../AgePolicy";

// Mirrors services/mono_service/src/config/age_policy.py. If these two drift,
// the client offers a signup path the server then rejects.
describe("age bands", () => {
  it("routes under-13s to a managed profile", () => {
    for (const age of [5, 8, 12]) {
      expect(isManagedAge(age)).toBe(true);
      expect(isTeenAge(age)).toBe(false);
    }
  });

  it("routes 13+ to their own account", () => {
    for (const age of [13, 15, 18]) {
      expect(isTeenAge(age)).toBe(true);
      expect(isManagedAge(age)).toBe(false);
    }
  });

  it("puts the boundary at exactly 13", () => {
    expect(isManagedAge(TEEN_MIN_AGE - 1)).toBe(true);
    expect(isTeenAge(TEEN_MIN_AGE)).toBe(true);
  });

  it("rejects ages outside the supported product range", () => {
    expect(isValidChildAge(MIN_CHILD_AGE - 1)).toBe(false);
    expect(isValidChildAge(MAX_CHILD_AGE + 1)).toBe(false);
    expect(isManagedAge(4)).toBe(false);
    expect(isTeenAge(19)).toBe(false);
  });

  it("treats string ages the same as numbers", () => {
    // Ages come out of a dropdown as strings and off Firestore as numbers.
    expect(isManagedAge("8")).toBe(true);
    expect(isTeenAge("15")).toBe(true);
    expect(deviceSharingAllowed("12")).toBe(true);
    expect(deviceSharingAllowed("13")).toBe(false);
  });

  it("treats missing or junk ages as not shareable", () => {
    for (const age of [undefined, null, "", "abc", NaN]) {
      expect(deviceSharingAllowed(age as any)).toBe(false);
    }
  });

  it("offers exactly the supported ages in the picker", () => {
    expect(AGE_OPTIONS[0]).toBe(String(MIN_CHILD_AGE));
    expect(AGE_OPTIONS[AGE_OPTIONS.length - 1]).toBe(String(MAX_CHILD_AGE));
    expect(AGE_OPTIONS).toHaveLength(MAX_CHILD_AGE - MIN_CHILD_AGE + 1);
    expect(AGE_OPTIONS.every((a) => isValidChildAge(a))).toBe(true);
  });
});

describe("who a parent may switch into", () => {
  it("allows a managed child", () => {
    expect(deviceSharingAllowed(9)).toBe(true);
    expect(deviceSharingBlockedReason({ age: 9 })).toBeNull();
  });

  it("blocks a teen and says why", () => {
    expect(deviceSharingAllowed(14)).toBe(false);
    expect(deviceSharingBlockedReason({ age: 14 })).toMatch(
      /own email and password/
    );
  });

  it("blocks a managed child whose sharing was turned off", () => {
    expect(deviceSharingBlockedReason({ age: 9, device_sharing_enabled: false }))
      .toMatch(/turned off/);
  });

  it("does not block on an absent sharing flag", () => {
    // Older profiles predate the field; age is the authority.
    expect(deviceSharingBlockedReason({ age: 9, device_sharing_enabled: undefined }))
      .toBeNull();
  });
});
