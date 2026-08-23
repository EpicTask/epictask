import { describe, it, expect, jest, beforeEach } from "@jest/globals";

const mockVerifyIdToken = jest.fn<any>();

jest.mock("firebase-admin", () => ({
  __esModule: true,
  default: {
    // Non-empty so the module under test skips initializeApp().
    apps: [{}],
    initializeApp: jest.fn(),
    auth: () => ({ verifyIdToken: mockVerifyIdToken }),
  },
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { requireAuth, requireAuthStrict } = require("../middleware/firebase_auth");

const makeCtx = (authorization?: string): any => ({
  headers: authorization === undefined ? {} : { authorization },
  state: {},
  status: undefined,
  body: undefined,
});

const firebaseError = (code: string, message = "boom") =>
  Object.assign(new Error(message), { code });

describe("firebase auth middleware", () => {
  let next: any;

  beforeEach(() => {
    jest.clearAllMocks();
    next = jest.fn<any>().mockResolvedValue(undefined);
  });

  describe("header handling", () => {
    it.each([
      ["missing header", undefined],
      ["non-bearer scheme", "Basic abc123"],
      ["bearer with no token", "Bearer "],
    ])("rejects a request with a %s", async (_label, header) => {
      const ctx = makeCtx(header as string | undefined);

      await requireAuth(ctx, next);

      expect(ctx.status).toBe(401);
      expect(ctx.body).toEqual({
        error: "Authentication credentials were not provided",
      });
      expect(next).not.toHaveBeenCalled();
      expect(mockVerifyIdToken).not.toHaveBeenCalled();
    });
  });

  describe("happy path", () => {
    it("puts the decoded token on ctx.state and continues", async () => {
      mockVerifyIdToken.mockResolvedValue({ uid: "u1", role: "parent" });
      const ctx = makeCtx("Bearer good-token");

      await requireAuth(ctx, next);

      expect(ctx.state.user).toEqual({ uid: "u1", role: "parent" });
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("requireAuth does not pay for a revocation check", async () => {
      mockVerifyIdToken.mockResolvedValue({ uid: "u1" });

      await requireAuth(makeCtx("Bearer good-token"), next);

      expect(mockVerifyIdToken).toHaveBeenCalledWith("good-token", false);
    });

    it("requireAuthStrict does check revocation", async () => {
      mockVerifyIdToken.mockResolvedValue({ uid: "u1" });

      await requireAuthStrict(makeCtx("Bearer good-token"), next);

      expect(mockVerifyIdToken).toHaveBeenCalledWith("good-token", true);
    });
  });

  describe("error mapping", () => {
    it.each([
      ["auth/id-token-revoked", 401, "Session has been revoked, please sign in again"],
      ["auth/user-disabled", 401, "This account has been disabled"],
      ["auth/id-token-expired", 401, "Authentication token has expired"],
      ["auth/argument-error", 401, "Invalid authentication token"],
      ["auth/invalid-id-token", 401, "Invalid authentication token"],
      ["auth/internal-error", 503, "Authentication service temporarily unavailable"],
      ["auth/network-error", 503, "Authentication service temporarily unavailable"],
      ["app/network-error", 503, "Authentication service temporarily unavailable"],
    ])("maps %s to %i", async (code, status, message) => {
      mockVerifyIdToken.mockRejectedValue(firebaseError(code as string));
      const ctx = makeCtx("Bearer some-token");

      await requireAuthStrict(ctx, next);

      expect(ctx.status).toBe(status);
      expect(ctx.body).toEqual({ error: message });
      expect(next).not.toHaveBeenCalled();
    });

    it("falls back to 401 for an unrecognised code", async () => {
      mockVerifyIdToken.mockRejectedValue(firebaseError("auth/whatever", "nope"));
      const ctx = makeCtx("Bearer some-token");

      await requireAuth(ctx, next);

      expect(ctx.status).toBe(401);
      expect(ctx.body).toEqual({ error: "Authentication failed: nope" });
    });

    it("never lets a revoked session reach the handler", async () => {
      mockVerifyIdToken.mockRejectedValue(firebaseError("auth/id-token-revoked"));
      const ctx = makeCtx("Bearer revoked-token");

      await requireAuthStrict(ctx, next);

      expect(next).not.toHaveBeenCalled();
      expect(ctx.state.user).toBeUndefined();
    });
  });
});
