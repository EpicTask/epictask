import axios from "axios";
import MicroserviceUrls from "@/constants/Microservices";
import authService from "./authService";

const notificationApiClient = axios.create({
  baseURL: MicroserviceUrls.notificationsManagement,
});

notificationApiClient.interceptors.request.use(
  async (config) => {
    // Refresh base URL in case MicroserviceUrls changes (e.g. strict mode)
    config.baseURL = MicroserviceUrls.notificationsManagement;
    
    const token = await authService.refreshToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const notificationService = {
  getNotifications: async (limit = 20, unreadOnly = false) => {
    try {
      const response = await notificationApiClient.get("/", {
        params: { limit, unread_only: unreadOnly },
      });
      return response.data;
    } catch (error) {
      console.error("Get notifications error:", error);
      throw new Error("Failed to get notifications");
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      const response = await notificationApiClient.patch(`/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error("Mark as read error:", error);
      throw new Error("Failed to mark notification as read");
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await notificationApiClient.post("/mark-all-read");
      return response.data;
    } catch (error) {
      console.error("Mark all as read error:", error);
      throw new Error("Failed to mark all notifications as read");
    }
  },

  deleteNotification: async (notificationId: string) => {
    try {
      const response = await notificationApiClient.delete(`/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error("Delete notification error:", error);
      throw new Error("Failed to delete notification");
    }
  },
  
  // NOTE: createNotification has been intentionally removed.
  // Notifications are created exclusively server-side on real events.
  // See: mono_service/src/routes/notifications/notification_routes.py for context.
};

export default notificationService;
