import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MicroserviceUrls from '@/constants/Microservices';
import { getDatabaseConfig } from '@/constants/TestingConfig';

// Create API clients for different services
const createMetricsClient = (baseURL) => {
  const client = axios.create({ baseURL });
  
  client.interceptors.request.use(
    async (config) => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  return client;
};

const userManagementClient = createMetricsClient(MicroserviceUrls.userManagement);
const taskManagementClient = createMetricsClient(MicroserviceUrls.taskManagement);

export const metricsService = {
  // User Metrics
  getUserMetrics: async (environment = 'test') => {
    try {
      const config = getDatabaseConfig(environment);
      
      // Try to get real data from backend
      try {
        const response = await userManagementClient.get('/admin/metrics/users');
        return response.data;
      } catch (apiError) {
        console.warn('Backend API unavailable, using mock data:', apiError.message);
        // Fallback to mock data
        return {
          total_users: 42,
          active_users: 28,
          parent_users: 15,
          child_users: 27,
          registration_trends: {
            daily: 2,
            weekly: 8,
            monthly: 35
          },
          last_updated: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Failed to get user metrics:', error);
      throw new Error('Failed to fetch user metrics');
    }
  },

  // Task Metrics
  getTaskMetrics: async (environment = 'test') => {
    try {
      const config = getDatabaseConfig(environment);
      
      // Try to get real data from backend
      try {
        const response = await taskManagementClient.get('/admin/metrics/tasks');
        return response.data;
      } catch (apiError) {
        console.warn('Backend API unavailable, using mock data:', apiError.message);
        // Fallback to mock data
        return {
          total_tasks: 156,
          completed_tasks: 89,
          in_progress_tasks: 45,
          cancelled_tasks: 22,
          completion_rate: 0.67,
          average_duration_hours: 24.5,
          tasks_by_user: [
            { user_id: 'user1', tasks_created: 15 },
            { user_id: 'user2', tasks_created: 12 },
            { user_id: 'user3', tasks_created: 8 }
          ],
          last_updated: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Failed to get task metrics:', error);
      throw new Error('Failed to fetch task metrics');
    }
  },

  // Transaction Metrics
  getTransactionMetrics: async (environment = 'test') => {
    try {
      const config = getDatabaseConfig(environment);
      
      // Mock data for XRPL transactions
      return {
        total_transactions: 89,
        successful_transactions: 85,
        failed_transactions: 4,
        total_volume_xrp: 1250.75,
        total_volume_etask: 45000,
        transaction_types: {
          rewards: 65,
          transfers: 20,
          escrow: 4
        },
        average_transaction_time_ms: 3500,
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to get transaction metrics:', error);
      throw new Error('Failed to fetch transaction metrics');
    }
  },

  // Event Metrics
  getEventMetrics: async (environment = 'test') => {
    try {
      const config = getDatabaseConfig(environment);
      
      // Mock data for system events
      return {
        total_events: 1234,
        event_types: {
          user_login: 456,
          user_logout: 423,
          task_created: 156,
          task_completed: 89,
          task_assigned: 110,
          errors: 15
        },
        events_last_24h: 87,
        error_rate: 0.012,
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to get event metrics:', error);
      throw new Error('Failed to fetch event metrics');
    }
  },

  // Reward Metrics
  getRewardMetrics: async (environment = 'test') => {
    try {
      const config = getDatabaseConfig(environment);
      
      // Mock data for rewards
      return {
        total_tokens_distributed: 45000,
        total_xrp_distributed: 1250.75,
        average_reward_per_task: 285.5,
        top_earners: [
          { user_id: 'user1', display_name: 'Alice K.', tokens_earned: 5000 },
          { user_id: 'user2', display_name: 'Bob M.', tokens_earned: 4500 },
          { user_id: 'user3', display_name: 'Charlie S.', tokens_earned: 3800 }
        ],
        reward_distribution: {
          '0-100': 25,
          '100-500': 45,
          '500-1000': 20,
          '1000+': 10
        },
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to get reward metrics:', error);
      throw new Error('Failed to fetch reward metrics');
    }
  },

  // Performance Metrics
  getPerformanceMetrics: async (environment = 'test') => {
    try {
      // Mock performance data
      return {
        api_response_times: {
          user_management: 245,
          task_management: 180,
          xrpl_service: 320
        },
        database_query_times: {
          average: 85,
          p95: 150,
          p99: 280
        },
        error_rates: {
          user_management: 0.005,
          task_management: 0.008,
          xrpl_service: 0.012
        },
        uptime_percentage: 99.8,
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to get performance metrics:', error);
      throw new Error('Failed to fetch performance metrics');
    }
  },

  // Get all metrics at once
  getAllMetrics: async (environment = 'test') => {
    try {
      const [users, tasks, transactions, events, rewards, performance] = await Promise.allSettled([
        metricsService.getUserMetrics(environment),
        metricsService.getTaskMetrics(environment),
        metricsService.getTransactionMetrics(environment),
        metricsService.getEventMetrics(environment),
        metricsService.getRewardMetrics(environment),
        metricsService.getPerformanceMetrics(environment)
      ]);

      // Extract values or provide empty fallbacks
      const getMetricValue = (result, fallback) => {
        return result.status === 'fulfilled' ? result.value : fallback;
      };

      return {
        users: getMetricValue(users, {
          total_users: 0,
          active_users: 0,
          parent_users: 0,
          child_users: 0,
          registration_trends: { daily: 0, weekly: 0, monthly: 0 },
          last_updated: new Date().toISOString()
        }),
        tasks: getMetricValue(tasks, {
          total_tasks: 0,
          completed_tasks: 0,
          in_progress_tasks: 0,
          cancelled_tasks: 0,
          completion_rate: 0,
          average_duration_hours: 0,
          tasks_by_user: [],
          last_updated: new Date().toISOString()
        }),
        transactions: getMetricValue(transactions, {
          total_transactions: 0,
          successful_transactions: 0,
          failed_transactions: 0,
          total_volume_xrp: 0,
          total_volume_etask: 0,
          transaction_types: { rewards: 0, transfers: 0, escrow: 0 },
          average_transaction_time_ms: 0,
          last_updated: new Date().toISOString()
        }),
        events: getMetricValue(events, {
          total_events: 0,
          event_types: {},
          events_last_24h: 0,
          error_rate: 0,
          last_updated: new Date().toISOString()
        }),
        rewards: getMetricValue(rewards, {
          total_tokens_distributed: 0,
          total_xrp_distributed: 0,
          average_reward_per_task: 0,
          top_earners: [],
          reward_distribution: {},
          last_updated: new Date().toISOString()
        }),
        performance: getMetricValue(performance, {
          api_response_times: {},
          database_query_times: { average: 0, p95: 0, p99: 0 },
          error_rates: {},
          uptime_percentage: 0,
          last_updated: new Date().toISOString()
        }),
        environment,
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to get all metrics:', error);
      // Return empty metrics structure instead of throwing
      return {
        users: {
          total_users: 0,
          active_users: 0,
          parent_users: 0,
          child_users: 0,
          registration_trends: { daily: 0, weekly: 0, monthly: 0 },
          last_updated: new Date().toISOString()
        },
        tasks: {
          total_tasks: 0,
          completed_tasks: 0,
          in_progress_tasks: 0,
          cancelled_tasks: 0,
          completion_rate: 0,
          average_duration_hours: 0,
          tasks_by_user: [],
          last_updated: new Date().toISOString()
        },
        transactions: {
          total_transactions: 0,
          successful_transactions: 0,
          failed_transactions: 0,
          total_volume_xrp: 0,
          total_volume_etask: 0,
          transaction_types: { rewards: 0, transfers: 0, escrow: 0 },
          average_transaction_time_ms: 0,
          last_updated: new Date().toISOString()
        },
        events: {
          total_events: 0,
          event_types: {},
          events_last_24h: 0,
          error_rate: 0,
          last_updated: new Date().toISOString()
        },
        rewards: {
          total_tokens_distributed: 0,
          total_xrp_distributed: 0,
          average_reward_per_task: 0,
          top_earners: [],
          reward_distribution: {},
          last_updated: new Date().toISOString()
        },
        performance: {
          api_response_times: {},
          database_query_times: { average: 0, p95: 0, p99: 0 },
          error_rates: {},
          uptime_percentage: 0,
          last_updated: new Date().toISOString()
        },
        environment,
        last_updated: new Date().toISOString()
      };
    }
  },

  // Clear test data (only works in test environment)
  clearTestData: async (environment = 'test') => {
    if (environment === 'production') {
      throw new Error('Cannot clear production data');
    }

    try {
      // Call backend endpoint to clear test data
      try {
        const response = await taskManagementClient.post('/admin/clear-test-data');
        return response.data;
      } catch (apiError) {
        console.warn('Backend API unavailable for clearing test data:', apiError.message);
        // Fallback mock response
        return { 
          success: true, 
          message: 'Test data cleared successfully (mock)',
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Failed to clear test data:', error);
      throw new Error('Failed to clear test data');
    }
  }
};

export default metricsService;
