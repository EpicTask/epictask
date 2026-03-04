import axios from "axios";
import MicroserviceUrls from "@/constants/Microservices";

const userApiClient = axios.create({
  baseURL: MicroserviceUrls.userManagement,
});

import authService from "./authService";

userApiClient.interceptors.request.use(
  async (config) => {
    const token = await authService.refreshToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
  }
};

export default userService;
