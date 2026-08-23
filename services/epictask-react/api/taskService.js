import MicroserviceUrls from "@/constants/Microservices";
import { Alert } from "react-native";
import { firestoreService } from "./firestoreService";
import createAuthenticatedClient from "./apiClient";

// Create a separate API client for Task Management Service
const taskApiClient = createAuthenticatedClient(
  MicroserviceUrls.taskManagement,
);

export const taskService = {
  // Task Management Service API Calls Only

  createTask: async (taskData) => {
    try {
      const response = await taskApiClient.post("/", taskData);
      // Invalidate cache after creating a task
      firestoreService.cache.clearTasks();
      return response.data;
    } catch (error) {
      console.log("Create task error:", error);
      throw new Error("Failed to create task");
    }
  },

  taskAssigned: async (assignmentData) => {
    try {
      const response = await taskApiClient.post(
        `/${assignmentData.task_id}/assign`,
        assignmentData,
      );
      firestoreService.cache.clearTasks();
      return response.data;
    } catch (error) {
      console.log("Task assigned error:", error);
      throw new Error("Failed to assign task");
    }
  },

  taskCanceled: async (taskId) => {
    try {
      const cancelData = { task_id: taskId };
      const response = await taskApiClient.post(
        `/${taskId}/cancel`,
        cancelData,
      );
      Alert.alert(response.data.response || "Task canceled successfully");
      firestoreService.cache.clearTasks();
      return response.data;
    } catch (error) {
      console.log("Task canceled error:", error);
      throw new Error("Failed to cancel task");
    }
  },

  updateTask: async (taskData) => {
    try {
      const updatedData = {
        task_id: taskData.task_id,
        updated_fields: taskData,
        user_id: taskData.user_id,
      };
      console.log("Api Call: ", taskApiClient);
      const response = await taskApiClient.post(
        `/${taskData.task_id}/update`,
        updatedData,
      );
      firestoreService.cache.clearTasks();
      return response.data;
    } catch (error) {
      console.log("Update task error:", error);
      throw new Error("Failed to update task");
    }
  },

  // Additional Task Management Service endpoints

  taskCommentAdded: async (commentData) => {
    try {
      const response = await taskApiClient.post(
        `/${commentData.task_id}/comment`,
        commentData,
      );
      return response.data;
    } catch (error) {
      console.log("Task comment added error:", error);
      throw new Error("Failed to add task comment");
    }
  },

  taskCompleted: async (completionData) => {
    try {
      if (!completionData?.task_id || !completionData?.completed_by_id) {
        throw new Error("task_id and completed_by_id are required");
      }

      const payload = {
        task_id: completionData.task_id,
        completed_by_id: completionData.completed_by_id,
        marked_completed: true,
        ...(completionData.attachments ? { attachments: completionData.attachments } : {}),
        ...(completionData.verified !== undefined ? { verified: completionData.verified } : {}),
        ...(completionData.verification_method
          ? { verification_method: completionData.verification_method }
          : {}),
      };
      const response = await taskApiClient.post(
        `/${completionData.task_id}/complete`,
        payload,
      );
      return response.data;
    } catch (error) {
      console.log("Task completed error:", error);
      throw new Error("Failed to mark task as completed");
    }
  },

  taskExpired: async (expirationData) => {
    try {
      const response = await taskApiClient.post(
        `/${expirationData.task_id}/expire`,
        expirationData,
      );
      return response.data;
    } catch (error) {
      console.log("Task expired error:", error);
      throw new Error("Failed to mark task as expired");
    }
  },

  taskRatingUpdate: async (ratingData) => {
    try {
      const response = await taskApiClient.post(
        `/${ratingData.task_id}/rating`,
        ratingData,
      );
      return response.data;
    } catch (error) {
      console.log("Task rating update error:", error);
      throw new Error("Failed to update task rating");
    }
  },

  taskRewarded: async (rewardData) => {
    try {
      const response = await taskApiClient.post(
        `/${rewardData.task_id}/reward`,
        rewardData,
      );
      return response.data;
    } catch (error) {
      console.log("Task rewarded error:", error);
      throw new Error("Failed to reward task");
    }
  },

  taskVerified: async (verificationData) => {
    try {
      const response = await taskApiClient.post(
        `/${verificationData.task_id}/verify`,
        verificationData,
      );
      return response.data;
    } catch (error) {
      console.log("Task verified error:", error);
      throw new Error("Failed to verify task");
    }
  },

  // Get endpoints that call the backend API

  getAllTasks: async (userId) => {
    try {
      const response = await taskApiClient.get(`/user/${userId}`);
      return response.data;
    } catch (error) {
      console.log("Get all tasks error:", error);
      throw new Error("Failed to get all tasks");
    }
  },

  getTask: async (taskId) => {
    try {
      const response = await taskApiClient.get(`/${taskId}`);
      return response.data;
    } catch (error) {
      console.log("Get task error:", error);
      throw new Error("Failed to get task");
    }
  },

  // Enhanced Rewards and Leaderboard API Calls

  getFamilyLeaderboard: async (parentId) => {
    try {
      const response = await taskApiClient.get(
        `/leaderboard/family/${parentId}`,
      );
      return response.data;
    } catch (error) {
      console.log("Get family leaderboard error:", error);
      throw new Error("Failed to get family leaderboard");
    }
  },

  getKidLeaderboardView: async (kidId) => {
    try {
      const response = await taskApiClient.get(`/leaderboard/kid/${kidId}`);
      return response.data;
    } catch (error) {
      console.log("Get kid leaderboard view error:", error);
      throw new Error("Failed to get kid leaderboard view");
    }
  },

  getEnhancedGlobalLeaderboard: async (limit = 100) => {
    try {
      const response = await taskApiClient.get(
        `/leaderboard/global?limit=${limit}`,
      );
      return response.data;
    } catch (error) {
      console.log("Get enhanced global leaderboard error:", error);
      throw new Error("Failed to get enhanced global leaderboard");
    }
  },
};

export default taskService;
