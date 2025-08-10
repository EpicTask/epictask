import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MicroserviceUrls from '@/constants/Microservices';

const apiClient = axios.create({
  baseURL: MicroserviceUrls.userManagement,
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
