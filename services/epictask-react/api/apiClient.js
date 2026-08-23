/**
 * apiClient.js
 *
 * Shared Axios client factory that wires up:
 *  1. Request interceptor  — attaches a valid Firebase ID token to every request
 *  2. Response interceptor — on a 401, force-refreshes the token and retries once
 *
 * Token freshness is the Firebase SDK's job, not ours. `getIdToken()` returns
 * the in-memory token when it still has life left (StsTokenManager keeps a 30s
 * safety buffer) and performs a securetoken.googleapis.com exchange only when
 * it doesn't. A background ProactiveRefresh timer already renews the token five
 * minutes before it expires. Re-deriving any of that from a copy in
 * AsyncStorage produced redundant token exchanges, because the SDK's own
 * refreshes never wrote to that copy.
 *
 * Usage:
 *   import createAuthenticatedClient from '@/api/apiClient';
 */

import axios from "axios";
import { auth } from "../config/firebaseConfig";

/**
 * Returns a valid Firebase ID token, or null when nobody is signed in.
 *
 * Cheap: no network and no storage read unless the SDK decides the token is
 * actually stale.
 */
export const getToken = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
};

// Shared promise for an in-flight forced refresh. The Firebase SDK does not
// de-duplicate concurrent getIdToken(true) calls — each one issues its own
// token exchange — so a burst of parallel 401s would otherwise fan out into a
// burst of refreshes.
let refreshInFlight = null;

/**
 * Force-refreshes the Firebase ID token, collapsing concurrent callers onto a
 * single token exchange.
 *
 * Only for cases where the cached token is known to be unusable: a 401 from a
 * backend, or immediately after custom claims change server-side.
 */
export const forceRefreshToken = async () => {
  const user = auth.currentUser;
  if (!user) return null;

  if (!refreshInFlight) {
    refreshInFlight = user.getIdToken(true).finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
};

/**
 * Creates an Axios instance pre-configured with auth interceptors.
 *
 * @param {string} baseURL - Base URL for the microservice
 * @returns {import('axios').AxiosInstance}
 */
const createAuthenticatedClient = (baseURL) => {
  const client = axios.create({ baseURL });

  // ── Request interceptor ──────────────────────────────────────────────────
  // Attach a valid Firebase ID token to every outgoing request.
  client.interceptors.request.use(
    async (config) => {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // ── Response interceptor ─────────────────────────────────────────────────
  // On 401, force-refresh the token and retry the original request once.
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const freshToken = await forceRefreshToken();
          if (freshToken) {
            originalRequest.headers.Authorization = `Bearer ${freshToken}`;
            return client(originalRequest);
          }
        } catch (refreshError) {
          console.log(
            "[apiClient] Token refresh failed during 401 retry:",
            refreshError,
          );
        }
      }

      return Promise.reject(error);
    },
  );

  return client;
};

export default createAuthenticatedClient;
