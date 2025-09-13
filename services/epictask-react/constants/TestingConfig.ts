import {TestCollections, ProdCollections} from './CollectionNames';

// Testing Dashboard Configuration
export const TESTING_CONFIG = {
  // Authorized test user UIDs
  AUTHORIZED_TEST_UIDS: [
    'FDxFKcGFi2ecjojXKQTKGtJ38FF2',
    // Add more authorized UIDs here
  ],

  // Database environments
  DATABASE_ENVIRONMENTS: {
    TEST: 'test',
    PRODUCTION: 'production'
  },

  // Default environment
  DEFAULT_ENVIRONMENT: 'test',

  // Database configurations
  DATABASE_CONFIG: {
    test: {
      projectId: 'epictask-test',
      collections: {
        users: TestCollections.Users,
        tasks: TestCollections.Tasks,
        taskEvents: TestCollections.TaskEvents,
        userEvents: TestCollections.UserEvents,
        contracts: TestCollections.Contracts,
        interactions: TestCollections.Interactions,
        leaderboard: TestCollections.Leaderboard,
        paidTasks: TestCollections.PaidTasks,
        taskComments: TestCollections.TaskComments,
        xrplService: TestCollections.XRPLService,
        xummCallbacks: TestCollections.XummCallbacks
      }
    },
    production: {
      projectId: 'task-coin-384722',
      collections: {
        users: ProdCollections.Users,
        tasks: ProdCollections.Tasks,
        taskEvents: ProdCollections.TaskEvents,
        userEvents: ProdCollections.UserEvents,
        contracts: ProdCollections.Contracts,
        interactions: ProdCollections.Interactions,
        leaderboard: ProdCollections.Leaderboard,
        paidTasks: ProdCollections.PaidTasks,
        taskComments: ProdCollections.TaskComments,
        xrplService: ProdCollections.XRPLService,
        xummCallbacks: ProdCollections.XummCallbacks
      }
    }
  },

  // Test categories
  TEST_CATEGORIES: {
    CONNECTIVITY: 'connectivity',
    API_ENDPOINTS: 'api_endpoints',
    FRONTEND: 'frontend',
    INTEGRATION: 'integration',
    PERFORMANCE: 'performance'
  },

  // Metrics refresh intervals (in milliseconds)
  METRICS_REFRESH_INTERVAL: 30000, // 30 seconds
  REALTIME_REFRESH_INTERVAL: 5000,  // 5 seconds

  // Test timeouts
  TEST_TIMEOUT: 10000, // 10 seconds per test
};

// Access control helper
export const isAuthorizedTestUser = (uid: string): boolean => {
  return TESTING_CONFIG.AUTHORIZED_TEST_UIDS.includes(uid);
};

// Environment helper
export const getDatabaseConfig = (environment: string) => {
  return TESTING_CONFIG.DATABASE_CONFIG[environment as keyof typeof TESTING_CONFIG.DATABASE_CONFIG] || TESTING_CONFIG.DATABASE_CONFIG.test;
};

export default TESTING_CONFIG;
