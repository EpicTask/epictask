import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MicroserviceUrls from "@/constants/Microservices";
import Task from "@/constants/Interfaces";
import { Alert } from "react-native";

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
  // Task Management Service API Calls Only
  
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
      const response = await taskApiClient.post(
        "/TaskAssigned",
        assignmentData
      );
      return response.data;
    } catch (error) {
      console.error("Task assigned error:", error);
      throw new Error("Failed to assign task");
    }
  },

  taskCanceled: async (taskId) => {
    try {
      const cancelData = { task_id: taskId };
      const response = await taskApiClient.post("/TaskCancelled", cancelData);
      Alert.alert(response.data.response || "Task canceled successfully");
      return response.data;
    } catch (error) {
      console.error("Task canceled error:", error);
      throw new Error("Failed to cancel task");
    }
  },

  // Enhanced Rewards and Leaderboard API Calls

  getFamilyLeaderboard: async (parentId) => {
    try {
      const response = await taskApiClient.get(`/leaderboard/family/${parentId}`);
      return response.data;
    } catch (error) {
      console.error("Get family leaderboard error:", error);
      throw new Error("Failed to get family leaderboard");
    }
  },

  getKidLeaderboardView: async (kidId) => {
    try {
      const response = await taskApiClient.get(`/leaderboard/kid/${kidId}`);
      return response.data;
    } catch (error) {
      console.error("Get kid leaderboard view error:", error);
      throw new Error("Failed to get kid leaderboard view");
    }
  },


  getEnhancedGlobalLeaderboard: async (limit = 100) => {
    try {
      const response = await taskApiClient.get(`/leaderboard/enhanced-global?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error("Get enhanced global leaderboard error:", error);
      throw new Error("Failed to get enhanced global leaderboard");
    }
  },


  updateTask: async (taskData) => {
    try {
      const updatedData = {
        task_id: taskData.task_id,
        updated_fields: taskData,
      };
      const response = await taskApiClient.post("/TaskUpdated", updatedData);
      return response.data;
    } catch (error) {
      console.error("Update task error:", error);
      throw new Error("Failed to update task");
    }
  },

  // Additional Task Management Service endpoints
  
  taskCommentAdded: async (commentData) => {
    try {
      const response = await taskApiClient.post("/TaskCommentAdded", commentData);
      return response.data;
    } catch (error) {
      console.error("Task comment added error:", error);
      throw new Error("Failed to add task comment");
    }
  },

  taskCompleted: async (completionData) => {
    try {
      const response = await taskApiClient.post("/TaskCompleted", completionData);
      return response.data;
    } catch (error) {
      console.error("Task completed error:", error);
      throw new Error("Failed to mark task as completed");
    }
  },

  taskExpired: async (expirationData) => {
    try {
      const response = await taskApiClient.post("/TaskExpired", expirationData);
      return response.data;
    } catch (error) {
      console.error("Task expired error:", error);
      throw new Error("Failed to mark task as expired");
    }
  },

  taskRatingUpdate: async (ratingData) => {
    try {
      const response = await taskApiClient.post("/TaskRatingUpdate", ratingData);
      return response.data;
    } catch (error) {
      console.error("Task rating update error:", error);
      throw new Error("Failed to update task rating");
    }
  },

  taskRewarded: async (rewardData) => {
    try {
      const response = await taskApiClient.post("/TaskRewarded", rewardData);
      return response.data;
    } catch (error) {
      console.error("Task rewarded error:", error);
      throw new Error("Failed to reward task");
    }
  },

  taskVerified: async (verificationData) => {
    try {
      const response = await taskApiClient.post("/TaskVerified", verificationData);
      return response.data;
    } catch (error) {
      console.error("Task verified error:", error);
      throw new Error("Failed to verify task");
    }
  },


  // Get endpoints that call the backend API
  
  getAllTasks: async (userId) => {
    try {
      const response = await taskApiClient.get(`/tasks?user_id=${userId}`);
      return response.data;
    } catch (error) {
      console.error("Get all tasks error:", error);
      throw new Error("Failed to get all tasks");
    }
  },

  getTask: async (taskId) => {
    try {
      const response = await taskApiClient.get(`/get_task/${taskId}`);
      return response.data;
    } catch (error) {
      console.error("Get task error:", error);
      throw new Error("Failed to get task");
    }
  }
};

export default taskService;
