import MicroserviceUrls from "@/constants/Microservices";
import createAuthenticatedClient from "./apiClient";

// Shares the one place that knows how to attach a token and how to recover
// from a 401 (this client used to attach a token but never retry).
const notificationApiClient = createAuthenticatedClient(
  MicroserviceUrls.notificationsManagement,
);

export const notificationService = {
  getNotifications: async (limit = 20, unreadOnly = false) => {
    try {
      const response = await notificationApiClient.get("/", {
        params: { limit, unread_only: unreadOnly },
      });
      return response.data;
    } catch (error) {
      console.log("Get notifications error:", error);
      throw new Error("Failed to get notifications");
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      const response = await notificationApiClient.patch(
        `/${notificationId}/read`,
      );
      return response.data;
    } catch (error) {
      console.log("Mark as read error:", error);
      throw new Error("Failed to mark notification as read");
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await notificationApiClient.post("/mark-all-read");
      return response.data;
    } catch (error) {
      console.log("Mark all as read error:", error);
      throw new Error("Failed to mark all notifications as read");
    }
  },

  deleteNotification: async (notificationId: string) => {
    try {
      const response = await notificationApiClient.delete(`/${notificationId}`);
      return response.data;
    } catch (error) {
      console.log("Delete notification error:", error);
      throw new Error("Failed to delete notification");
    }
  },

  // NOTE: createNotification has been intentionally removed.
  // Notifications are created exclusively server-side on real events.
  // See: mono_service/src/routes/notifications/notification_routes.py for context.
};

export default notificationService;
