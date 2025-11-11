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

export default userApiClient;
