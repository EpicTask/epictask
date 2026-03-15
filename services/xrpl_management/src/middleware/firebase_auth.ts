import { Context, Next } from 'koa';
import admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

export const requireAuth = async (ctx: Context, next: Next) => {

  const authHeader = ctx.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ctx.status = 401;
    ctx.body = { error: 'Authentication credentials were not provided' };
    return;
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    ctx.state.user = decodedToken; // Store user details in context state
    await next();
  } catch (error: any) {
    ctx.status = 401;
    if (error.code === 'auth/id-token-expired') {
      ctx.body = { error: 'Authentication token has expired' };
    } else if (error.code === 'auth/argument-error' || error.code === 'auth/invalid-id-token') {
      ctx.body = { error: 'Invalid authentication token' };
    } else {
      ctx.body = { error: `Authentication failed: ${error.message}` };
    }
  }
};
