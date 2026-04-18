import MicroserviceUrls from "@/constants/Microservices";
import createAuthenticatedClient from "./apiClient";

const userApiClient = createAuthenticatedClient(MicroserviceUrls.userManagement);

export const userService = {
  updateProfile: async (profileData) => {
    try {
      const response = await userApiClient.put("/profile", profileData);
      return response.data;
    } catch (error) {
      console.error("Update profile error:", error);
      throw new Error("Failed to update profile");
    }
  },

  deleteAccount: async () => {
    try {
      const response = await userApiClient.delete("/account");
      return response.data;
    } catch (error) {
      console.error("Delete account error:", error);
      throw new Error("Failed to delete account");
    }
  },

  generateInviteCode: async () => {
    try {
      const response = await userApiClient.post("/invite-code");
      return response.data;
    } catch (error) {
      console.error("Generate invite code error:", error);
      throw new Error("Failed to generate invite code");
    }
  },

  linkChild: async (linkData) => {
    try {
      const response = await userApiClient.post("/link-child", linkData);
      return response.data;
    } catch (error) {
      console.error("Link child error:", error);
      throw new Error("Failed to link child account");
    }
  },

  getMetrics: async () => {
    try {
      const response = await userApiClient.get("/admin/metrics");
      return response.data;
    } catch (error) {
      console.error("Get metrics error:", error);
      throw new Error("Failed to get metrics");
    }
  },

  /**
   * Register (or rotate) the device push token with mono_service.
   * Called by usePushNotifications after expo-notifications grants permission
   * and returns a device token.
   *
   * @param {string} token    - Raw FCM token (Android) or APNs token (iOS)
   * @param {string} platform - "android" | "ios"
   */
  registerPushToken: async (token, platform) => {
    try {
      const response = await userApiClient.put("/fcm-token", { token, platform });
      return response.data;
    } catch (error) {
      console.error("Register push token error:", error);
      // Non-fatal — don't throw, so the app keeps working without push
    }
  },

  /**
   * Remove the push token from mono_service (e.g. on sign-out or when
   * the user disables notifications in settings).
   */
  unregisterPushToken: async () => {
    try {
      const response = await userApiClient.delete("/fcm-token");
      return response.data;
    } catch (error) {
      console.error("Unregister push token error:", error);
    }
  },

  getNotificationPreferences: async () => {
    try {
      const response = await userApiClient.get("/preferences/notifications");
      return response.data;
    } catch (error) {
      console.error("Get notification preferences error:", error);
      throw new Error("Failed to fetch notification preferences");
    }
  },

  updateNotificationPreferences: async (prefs) => {
    try {
      const response = await userApiClient.put("/preferences/notifications", prefs);
      return response.data;
    } catch (error) {
      console.error("Update notification preferences error:", error);
      throw new Error("Failed to update notification preferences");
    }
  },

  askParentForHelp: async () => {
    try {
      const response = await userApiClient.post("/ask-help");
      return response.data;
    } catch (error) {
      console.error("Ask parent for help error:", error);
      throw new Error(error.response?.data?.detail || "Failed to ask parent for help");
    }
  },
};

export { userApiClient };
export default userApiClient;
