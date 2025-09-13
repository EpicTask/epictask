import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MicroserviceUrls from "@/constants/Microservices";
import { create } from "react-test-renderer";

// Create a separate API client for Task Management Service
const taskApiClient = axios.create({
  baseURL: MicroserviceUrls.taskManagement,
});

taskApiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const taskService = {
  createTask: async (taskData) => {
    try {
      const response = await taskApiClient.post("/TaskCreated", taskData);
      return response.data;
    } catch (error) {
      console.error("Create task error:", error);
      throw new Error("Failed to create task");
    }
  },

  taskAssigned: async (assignmentData) => {
    try {
      const response = await taskApiClient.post("/TaskAssigned", assignmentData);
      return response.data;
    } catch (error) {
      console.error("Task assigned error:", error);
      throw new Error("Failed to assign task");
    }
  },

  taskCanceled: async (cancellationData) => {
    try {
      const response = await taskApiClient.post("/TaskCanceled", cancellationData);
      return response.data;
    } catch (error) {
      console.error("Task canceled error:", error);
      throw new Error("Failed to cancel task");
    }
  },

  getTaskSummary: async (userId) => {
    try {
      const response = await taskApiClient.get(`/user/${userId}/task-summary`);
      return response.data;
    } catch (error) {
      console.error("Get task summary error:", error);
      throw new Error("Failed to get task summary");
    }
  },

  getRecentTasks: async (userId, limit = 5, days = 7) => {
    try {
      const response = await taskApiClient.get(
        `/user/${userId}/recent-tasks?limit=${limit}&days=${days}`
      );
      return response.data;
    } catch (error) {
      console.error("Get recent tasks error:", error);
      throw new Error("Failed to get recent tasks");
    }
  },

  getUserRewards: async (userId) => {
    try {
      const response = await taskApiClient.get(`/user/${userId}/rewards`);
      return response.data;
    } catch (error) {
      console.error("Get user rewards error:", error);
      throw new Error("Failed to get user rewards");
    }
  },

  getGlobalLeaderboard: async () => {
    try {
      const response = await taskApiClient.get("/leaderboard/global");
      return response.data;
    } catch (error) {
      console.error("Get global leaderboard error:", error);
      throw new Error("Failed to get global leaderboard");
    }
  },

  getChildrenRewards: async (parentId) => {
    try {
      const response = await taskApiClient.get(
        `/parent/${parentId}/children-rewards`
      );
      return response.data;
    } catch (error) {
      console.error("Get children rewards error:", error);
      throw new Error("Failed to get children rewards");
    }
  },
};

export default taskService;
