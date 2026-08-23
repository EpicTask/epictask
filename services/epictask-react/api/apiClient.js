/**
 * apiClient.js
 *
 * Shared Axios client factory that wires up:
 *  1. Request interceptor  — attaches a fresh Firebase ID token to every request
 *  2. Response interceptor — on a 401, force-refreshes the token and retries once
 *
 * Usage:
 *   import createAuthenticatedClient from '@/api/apiClient';
 */

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../config/firebaseConfig";

/**
 * Returns true if the given JWT is missing, unparseable, or will expire
 * within `bufferMs` milliseconds (default 5 minutes).
 */
export const isTokenExpiredOrExpiringSoon = (
  token,
  bufferMs = 5 * 60 * 1000,
) => {
  if (!token) return true;
  try {
    // JWT payload is the second segment, base-64 encoded
    const base64 = token.split(".")[1];
    // atob works in React Native's JS engine; Buffer fallback for Node envs
    const json =
      typeof atob === "function"
        ? atob(base64)
        : Buffer.from(base64, "base64").toString("utf-8");
    const { exp } = JSON.parse(json);
    // exp is in seconds; convert to ms for comparison
    return exp * 1000 - Date.now() < bufferMs;
  } catch {
    return true; // can't parse → assume stale
  }
};

/**
 * Force-refreshes the Firebase ID token and persists it to AsyncStorage.
 * Exported so AuthContext can call it directly (e.g. on AppState 'active').
 */
export const forceRefreshToken = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  const token = await user.getIdToken(true);
  await AsyncStorage.setItem("authToken", token);
  return token;
};

/**
 * Smart token refresh:
 *  - Reads the cached token from AsyncStorage
 *  - Only hits the Firebase network if the token is expired / expiring soon
 *  - Always persists the (possibly new) token back to AsyncStorage
 */
export const smartRefreshToken = async () => {
  const user = auth.currentUser;
  if (!user) return null;

  const cached = await AsyncStorage.getItem("authToken");
  const needsRefresh = isTokenExpiredOrExpiringSoon(cached);

  const token = await user.getIdToken(needsRefresh);
  // Only write back if we actually fetched a new one or had none
  if (needsRefresh) {
    await AsyncStorage.setItem("authToken", token);
  }
  return token;
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
      const token = await smartRefreshToken();
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
