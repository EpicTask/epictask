import axios from "axios";
import MicroserviceUrls from "@/constants/Microservices";
import authService from "./authService";

// Helper to get base URL for notifications
// Assuming taskManagement URL ends in /api/tasks based on usage in taskService.js
const getNotificationBaseUrl = () => {
  const taskUrl = MicroserviceUrls.taskManagement || "";
  if (taskUrl.endsWith("/tasks")) {
    return taskUrl.replace("/tasks", "/notifications");
  }
  // If it doesn't end in /tasks, maybe it's just the host? 
  // But taskService does .post('/') which implies it hits the resource root.
  // Let's assume standard mono_service structure: /api/tasks -> /api/notifications
  return taskUrl.replace("/tasks", "/notifications");
};

const notificationApiClient = axios.create({
  baseURL: getNotificationBaseUrl(),
});

notificationApiClient.interceptors.request.use(
  async (config) => {
    // Refresh base URL in case MicroserviceUrls changes (e.g. strict mode)
    config.baseURL = getNotificationBaseUrl();
    
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

  markAsRead: async (notificationId) => {
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

  deleteNotification: async (notificationId) => {
    try {
      const response = await notificationApiClient.delete(`/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error("Delete notification error:", error);
      throw new Error("Failed to delete notification");
    }
  },
  
  // Create notification (for testing or manual triggers)
  createNotification: async (notificationData) => {
    try {
        const response = await notificationApiClient.post("/", notificationData);
        return response.data;
    } catch (error) {
        console.error("Create notification error:", error);
        throw new Error("Failed to create notification");
    }
  }
};

export default notificationService;
