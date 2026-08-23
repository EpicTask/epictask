import { Context, Next } from 'koa';
import admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Firebase error codes that mean the auth backend is having a bad day rather
 * than the caller's credentials being wrong. Answering 401 to these would sign
 * a legitimate user out mid-payment over a transient blip.
 */
const TRANSIENT_ERROR_CODES = new Set([
  'auth/internal-error',
  'auth/network-error',
  'app/network-error',
]);

const deny = (ctx: Context, status: number, error: string) => {
  ctx.status = status;
  ctx.body = { error };
};

const verify = async (ctx: Context, next: Next, checkRevoked: boolean) => {
  const authHeader = ctx.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return deny(ctx, 401, 'Authentication credentials were not provided');
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    return deny(ctx, 401, 'Authentication credentials were not provided');
  }

  let decodedToken: admin.auth.DecodedIdToken;
  try {
    decodedToken = await admin.auth().verifyIdToken(token, checkRevoked);
  } catch (error: any) {
    switch (error?.code) {
      case 'auth/id-token-revoked':
        return deny(ctx, 401, 'Session has been revoked, please sign in again');
      case 'auth/user-disabled':
        return deny(ctx, 401, 'This account has been disabled');
      case 'auth/id-token-expired':
        return deny(ctx, 401, 'Authentication token has expired');
      case 'auth/argument-error':
      case 'auth/invalid-id-token':
        return deny(ctx, 401, 'Invalid authentication token');
      default:
        if (TRANSIENT_ERROR_CODES.has(error?.code)) {
          return deny(ctx, 503, 'Authentication service temporarily unavailable');
        }
        return deny(ctx, 401, `Authentication failed: ${error?.message}`);
    }
  }

  ctx.state.user = decodedToken; // Store user details in context state
  await next();
};

/**
 * Standard check: verifies the token's signature, issuer and expiry locally
 * against Google's cached public keys. No network round trip per request.
 */
export const requireAuth = async (ctx: Context, next: Next) =>
  verify(ctx, next, false);

/**
 * Adds a revocation/disabled-account check on top of `requireAuth`.
 *
 * An ID token stays cryptographically valid for its full hour, so `requireAuth`
 * alone keeps honouring one for up to an hour after a parent revokes a child's
 * sessions or an account is disabled. On routes that move money that window is
 * too long, so those pay the extra Identity Toolkit round trip.
 *
 * Mirrors `get_current_user_strict` in mono_service.
 */
export const requireAuthStrict = async (ctx: Context, next: Next) =>
  verify(ctx, next, true);
