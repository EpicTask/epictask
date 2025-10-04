import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getFirestore, 
  getDoc, 
  doc, 
  setDoc, 
  onSnapshot,
  orderBy,
  limit,
  startAfter,
  updateDoc,
  writeBatch,
  documentId
} from "@react-native-firebase/firestore";
import { TestCollections } from "../constants/CollectionNames";

const db = getFirestore();

// Enhanced Cache System with configurable TTL and size limits
class EnhancedCache {
  constructor(maxSize = 100, defaultTTL = 300000) { // 5 minutes default
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    this.accessOrder = new Map(); // Track access order for LRU
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.accessOrder.delete(key);
      return null;
    }

    // Update access order for LRU
    this.accessOrder.delete(key);
    this.accessOrder.set(key, Date.now());
    
    return item.data;
  }

  set(key, data, ttl = this.defaultTTL) {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldestKey = this.accessOrder.keys().next().value;
      this.cache.delete(oldestKey);
      this.accessOrder.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    
    this.accessOrder.set(key, Date.now());
  }

  invalidate(pattern) {
    if (typeof pattern === 'string') {
      // Exact match
      this.cache.delete(pattern);
      this.accessOrder.delete(pattern);
    } else if (pattern instanceof RegExp) {
      // Pattern match
      for (const key of this.cache.keys()) {
        if (pattern.test(key)) {
          this.cache.delete(key);
          this.accessOrder.delete(key);
        }
      }
    }
  }

  clear() {
    this.cache.clear();
    this.accessOrder.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.hitCount / (this.hitCount + this.missCount) || 0
    };
  }
}

// Initialize enhanced cache
const TaskCache = new EnhancedCache(200, 300000); // 200 items, 5 min TTL
const UserCache = new EnhancedCache(50, 600000);  // 50 items, 10 min TTL

// Performance monitoring utilities
const PerformanceMonitor = {
  timers: new Map(),
  
  start(operation) {
    this.timers.set(operation, Date.now());
  },
  
  end(operation) {
    const startTime = this.timers.get(operation);
    if (startTime) {
      const duration = Date.now() - startTime;
      console.log(`[Performance] ${operation}: ${duration}ms`);
      this.timers.delete(operation);
      return duration;
    }
    return 0;
  }
};

// Error handling utilities
const ErrorHandler = {
  createError(operation, originalError, context = {}) {
    const error = new Error(`${operation} failed: ${originalError.message}`);
    error.originalError = originalError;
    error.context = context;
    error.timestamp = new Date().toISOString();
    return error;
  },

  logError(operation, error, context = {}) {
    console.error(`[FirestoreService] ${operation} error:`, {
      message: error.message,
      code: error.code,
      context,
      timestamp: new Date().toISOString()
    });
  }
};

// Batch operations utility
const BatchOperations = {
  async batchGetDocs(docRefs, maxBatchSize = 10) {
    const batches = [];
    for (let i = 0; i < docRefs.length; i += maxBatchSize) {
      batches.push(docRefs.slice(i, i + maxBatchSize));
    }

    const results = await Promise.all(
      batches.map(batch => Promise.all(batch.map(ref => getDoc(ref))))
    );

    return results.flat();
  }
};

export const firestoreService = {
  // Enhanced user profile creation with validation
  createUserProfile: async (uid, userData) => {
    const operation = 'createUserProfile';
    PerformanceMonitor.start(operation);
    
    try {
      // Input validation
      if (!uid || !userData?.email) {
        throw new Error('Invalid user data: UID and email are required');
      }

      const userProfile = {
        uid,
        email: userData.email,
        displayName: userData.displayName || '',
        role: userData.role || "child",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        children: userData.role === "parent" ? [] : undefined,
        parentId: userData.role === "child" ? null : undefined,
      };

      await setDoc(doc(db, "users", uid), userProfile);
      
      // Cache the created user
      UserCache.set(`user:${uid}`, userProfile);
      
      PerformanceMonitor.end(operation);
      return { success: true, message: "User profile created successfully", user: userProfile };
    } catch (error) {
      ErrorHandler.logError(operation, error, { uid, userData });
      throw ErrorHandler.createError(operation, error, { uid });
    }
  },

  // Enhanced user profile fetching with caching
  getUserProfile: async (uid, useCache = true) => {
    const operation = 'getUserProfile';
    PerformanceMonitor.start(operation);
    
    try {
      if (!uid) {
        throw new Error('UID is required');
      }

      const cacheKey = `user:${uid}`;
      
      // Check cache first
      if (useCache) {
        const cachedUser = UserCache.get(cacheKey);
        if (cachedUser) {
          PerformanceMonitor.end(operation);
          return { success: true, user: cachedUser, fromCache: true };
        }
      }

      const userDoc = await getDoc(doc(db, "users", uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Cache the result
        if (useCache) {
          UserCache.set(cacheKey, userData);
        }
        
        PerformanceMonitor.end(operation);
        return { success: true, user: userData };
      } else {
        PerformanceMonitor.end(operation);
        return { success: false, error: "User not found" };
      }
    } catch (error) {
      ErrorHandler.logError(operation, error, { uid });
      throw ErrorHandler.createError(operation, error, { uid });
    }
  },

  // Optimized batch children fetching
  getLinkedChildren: async (parentUid, useCache = true) => {
    const operation = 'getLinkedChildren';
    PerformanceMonitor.start(operation);
    
    try {
      if (!parentUid) {
        throw new Error('Parent UID is required');
      }

      const cacheKey = `children:${parentUid}`;
      
      // Check cache first
      if (useCache) {
        const cachedChildren = UserCache.get(cacheKey);
        if (cachedChildren) {
          PerformanceMonitor.end(operation);
          return { success: true, children: cachedChildren, fromCache: true };
        }
      }

      const parentResult = await firestoreService.getUserProfile(parentUid, useCache);
      if (!parentResult.success) {
        return { success: false, error: "Parent user not found" };
      }

      const childrenIds = parentResult.user.children || [];
      
      if (childrenIds.length === 0) {
        const emptyResult = [];
        if (useCache) {
          UserCache.set(cacheKey, emptyResult, 60000); // Cache empty results for 1 minute
        }
        PerformanceMonitor.end(operation);
        return { success: true, children: emptyResult };
      }

      // Use batch operations for better performance
      const childRefs = childrenIds.map(childId => doc(db, "users", childId));
      const childrenDocs = await BatchOperations.batchGetDocs(childRefs);
      
      const children = childrenDocs
        .filter(doc => doc.exists())
        .map(doc => ({ uid: doc.id, ...doc.data() }));

      // Cache the results
      if (useCache) {
        UserCache.set(cacheKey, children);
      }

      PerformanceMonitor.end(operation);
      return { success: true, children };
    } catch (error) {
      ErrorHandler.logError(operation, error, { parentUid });
      throw ErrorHandler.createError(operation, error, { parentUid });
    }
  },

  // Enhanced task fetching with better query optimization
  getTasksForUser: async (uid, options = {}) => {
    const operation = 'getTasksForUser';
    PerformanceMonitor.start(operation);
    
    try {
      if (!uid) {
        throw new Error('UID is required');
      }

      const {
        useCache = true,
        limitCount = 50,
        orderField = "expiration_date",
        orderDirection = "desc",
        includeCompleted = true,
        status = null
      } = options;

      const cacheKey = `tasks:${uid}:${JSON.stringify(options)}`;
      
      // Check cache first
      if (useCache) {
        const cachedTasks = TaskCache.get(cacheKey);
        if (cachedTasks) {
          PerformanceMonitor.end(operation);
          return { success: true, tasks: cachedTasks, fromCache: true };
        }
      }

      // Build optimized query
      let taskQuery = query(
        collection(db, TestCollections.Tasks),
        where("assigned_to_ids", "array-contains", uid),
        orderBy(orderField, orderDirection),
        limit(limitCount)
      );

      // Add status filter if specified
      if (status) {
        taskQuery = query(
          collection(db, TestCollections.Tasks),
          where("assigned_to_ids", "array-contains", uid),
          where("status", "==", status),
          orderBy(orderField, orderDirection),
          limit(limitCount)
        );
      } else if (!includeCompleted) {
        taskQuery = query(
          collection(db, TestCollections.Tasks),
          where("assigned_to_ids", "array-contains", uid),
          where("status", "!=", "completed"),
          orderBy("status"),
          orderBy(orderField, orderDirection),
          limit(limitCount)
        );
      }

      const tasksSnapshot = await getDocs(taskQuery);
      const tasks = tasksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Cache the results with shorter TTL for frequently changing data
      if (useCache) {
        TaskCache.set(cacheKey, tasks, 180000); // 3 minutes for tasks
      }

      PerformanceMonitor.end(operation);
      return { success: true, tasks };
    } catch (error) {
      ErrorHandler.logError(operation, error, { uid, options });
      throw ErrorHandler.createError(operation, error, { uid });
    }
  },

  // Optimized family task fetching with better error handling
  getTasksForFamily: async (parentUid, options = {}) => {
    const operation = 'getTasksForFamily';
    PerformanceMonitor.start(operation);
    
    try {
      if (!parentUid) {
        throw new Error('Parent UID is required');
      }

      const { useCache = true, ...taskOptions } = options;
      const cacheKey = `family-tasks:${parentUid}:${JSON.stringify(options)}`;
      
      // Check cache first
      if (useCache) {
        const cachedFamilyTasks = TaskCache.get(cacheKey);
        if (cachedFamilyTasks) {
          PerformanceMonitor.end(operation);
          return { success: true, familyTasks: cachedFamilyTasks, fromCache: true };
        }
      }

      // Get parent's children
      const childrenResult = await firestoreService.getLinkedChildren(parentUid, useCache);
      if (!childrenResult.success) {
        return { success: false, error: "Failed to fetch children" };
      }

      const children = childrenResult.children;
      if (children.length === 0) {
        const emptyResult = {};
        if (useCache) {
          TaskCache.set(cacheKey, emptyResult, 60000); // Cache empty results for 1 minute
        }
        PerformanceMonitor.end(operation);
        return { success: true, familyTasks: emptyResult };
      }

      // Execute parallel queries with better error handling
      const taskPromises = children.map(async (child) => {
        try {
          const result = await firestoreService.getTasksForUser(child.uid, { ...taskOptions, useCache });
          return { 
            childId: child.uid, 
            childName: child.displayName || child.email,
            tasks: result.tasks || [], 
            fromCache: result.fromCache 
          };
        } catch (error) {
          ErrorHandler.logError(`getTasksForUser-${child.uid}`, error);
          return { 
            childId: child.uid, 
            childName: child.displayName || child.email,
            tasks: [], 
            error: error.message 
          };
        }
      });

      const results = await Promise.all(taskPromises);
      
      // Organize results by child
      const familyTasks = {};
      results.forEach(({ childId, childName, tasks, error, fromCache }) => {
        familyTasks[childId] = {
          childName,
          tasks,
          error: error || null,
          fromCache: fromCache || false,
          lastUpdated: new Date().toISOString()
        };
      });

      // Cache the results
      if (useCache) {
        TaskCache.set(cacheKey, familyTasks, 180000); // 3 minutes
      }

      PerformanceMonitor.end(operation);
      return { success: true, familyTasks };
    } catch (error) {
      ErrorHandler.logError(operation, error, { parentUid, options });
      throw ErrorHandler.createError(operation, error, { parentUid });
    }
  },

  // Enhanced real-time subscription with better memory management
  subscribeToUserTasks: (uid, callback, options = {}) => {
    const operation = 'subscribeToUserTasks';
    
    try {
      if (!uid || typeof callback !== 'function') {
        throw new Error('UID and callback are required');
      }

      const { 
        limitCount = 50, 
        includeCompleted = true,
        orderField = "created_at",
        orderDirection = "desc"
      } = options;
      
      let taskQuery = query(
        collection(db, TestCollections.Tasks),
        where("assigned_to_ids", "array-contains", uid),
        orderBy(orderField, orderDirection),
        limit(limitCount)
      );

      // Add status filter if needed
      if (!includeCompleted) {
        taskQuery = query(
          collection(db, TestCollections.Tasks),
          where("assigned_to_ids", "array-contains", uid),
          where("status", "!=", "completed"),
          orderBy("status"),
          orderBy(orderField, orderDirection),
          limit(limitCount)
        );
      }

      const unsubscribe = onSnapshot(
        taskQuery,
        (snapshot) => {
          const tasks = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          
          // Update cache with fresh data
          const cacheKey = `tasks:${uid}`;
          TaskCache.set(cacheKey, tasks, 180000);
          
          // Invalidate related family cache
          TaskCache.invalidate(new RegExp(`family-tasks:.*`));
          
          callback({ success: true, tasks, timestamp: Date.now() });
        },
        (error) => {
          ErrorHandler.logError(operation, error, { uid, options });
          callback({ success: false, error: error.message, timestamp: Date.now() });
        }
      );

      return unsubscribe;
    } catch (error) {
      ErrorHandler.logError(`${operation}-setup`, error, { uid, options });
      throw ErrorHandler.createError(`${operation}-setup`, error, { uid });
    }
  },

  // Enhanced family subscription with better cleanup
  subscribeToFamilyTasks: (parentUid, callback, options = {}) => {
    const operation = 'subscribeToFamilyTasks';
    
    try {
      if (!parentUid || typeof callback !== 'function') {
        throw new Error('Parent UID and callback are required');
      }

      const unsubscribes = [];
      const familyTasks = {};
      let childrenCount = 0;
      let initializedChildren = 0;

      // Get parent's children first
      firestoreService.getLinkedChildren(parentUid).then((childrenResult) => {
        if (!childrenResult.success) {
          callback({ success: false, error: "Failed to fetch children" });
          return;
        }

        const children = childrenResult.children;
        childrenCount = children.length;
        
        if (childrenCount === 0) {
          callback({ success: true, familyTasks: {} });
          return;
        }

        // Subscribe to each child's tasks
        children.forEach((child) => {
          const unsubscribe = firestoreService.subscribeToUserTasks(
            child.uid,
            (result) => {
              if (result.success) {
                familyTasks[child.uid] = {
                  childName: child.displayName || child.email,
                  tasks: result.tasks,
                  error: null,
                  lastUpdated: new Date().toISOString()
                };
              } else {
                familyTasks[child.uid] = {
                  childName: child.displayName || child.email,
                  tasks: [],
                  error: result.error,
                  lastUpdated: new Date().toISOString()
                };
              }
              
              // Only call callback after first initialization or on updates
              initializedChildren++;
              if (initializedChildren >= childrenCount || familyTasks[child.uid]) {
                callback({ 
                  success: true, 
                  familyTasks: { ...familyTasks },
                  timestamp: Date.now()
                });
              }
            },
            options
          );
          
          unsubscribes.push(unsubscribe);
        });
      }).catch((error) => {
        ErrorHandler.logError(operation, error, { parentUid });
        callback({ success: false, error: error.message });
      });

      // Return enhanced cleanup function
      return () => {
        unsubscribes.forEach(unsubscribe => {
          try {
            unsubscribe();
          } catch (error) {
            console.warn('Error during unsubscribe:', error);
          }
        });
        unsubscribes.length = 0; // Clear array
      };
    } catch (error) {
      ErrorHandler.logError(`${operation}-setup`, error, { parentUid });
      throw ErrorHandler.createError(`${operation}-setup`, error, { parentUid });
    }
  },

  // Enhanced pagination with better performance
  getTasksWithPagination: async (uid, lastDoc = null, options = {}) => {
    const operation = 'getTasksWithPagination';
    PerformanceMonitor.start(operation);
    
    try {
      if (!uid) {
        throw new Error('UID is required');
      }

      const {
        limitCount = 20,
        orderField = "created_at",
        orderDirection = "desc",
        status = null
      } = options;

      let taskQuery = query(
        collection(db, TestCollections.Tasks),
        where("assigned_to_ids", "array-contains", uid),
        orderBy(orderField, orderDirection),
        limit(limitCount)
      );

      // Add status filter if specified
      if (status) {
        taskQuery = query(
          collection(db, TestCollections.Tasks),
          where("assigned_to_ids", "array-contains", uid),
          where("status", "==", status),
          orderBy(orderField, orderDirection),
          limit(limitCount)
        );
      }

      if (lastDoc) {
        taskQuery = query(taskQuery, startAfter(lastDoc));
      }

      const tasksSnapshot = await getDocs(taskQuery);
      const tasks = tasksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        _doc: doc // Keep reference for pagination
      }));

      const hasMore = tasks.length === limitCount;
      const lastDocument = tasks.length > 0 ? tasks[tasks.length - 1]._doc : null;

      PerformanceMonitor.end(operation);
      return { 
        success: true, 
        tasks: tasks.map(({ _doc, ...task }) => task), // Remove _doc from returned data
        hasMore,
        lastDocument,
        totalFetched: tasks.length
      };
    } catch (error) {
      ErrorHandler.logError(operation, error, { uid, options });
      throw ErrorHandler.createError(operation, error, { uid });
    }
  },

  // Enhanced user fetching with caching and filtering
  getAllUsers: async (options = {}) => {
    const operation = 'getAllUsers';
    PerformanceMonitor.start(operation);
    
    try {
      const { useCache = true, role = null } = options;
      const cacheKey = `all-users:${role || 'all'}`;
      
      // Check cache first
      if (useCache) {
        const cachedUsers = UserCache.get(cacheKey);
        if (cachedUsers) {
          PerformanceMonitor.end(operation);
          return { success: true, users: cachedUsers, fromCache: true };
        }
      }

      let usersQuery = collection(db, "users");
      
      // Add role filter if specified
      if (role) {
        usersQuery = query(usersQuery, where("role", "==", role));
      }

      const usersSnapshot = await getDocs(usersQuery);
      const users = usersSnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      }));

      // Cache the results
      if (useCache) {
        UserCache.set(cacheKey, users);
      }

      PerformanceMonitor.end(operation);
      return { success: true, users };
    } catch (error) {
      ErrorHandler.logError(operation, error, { options });
      throw ErrorHandler.createError(operation, error);
    }
  },

  // Enhanced task reward with cache invalidation
  rewardTask: async (taskId, rewardData = {}) => {
    const operation = 'rewardTask';
    PerformanceMonitor.start(operation);
    
    try {
      if (!taskId) {
        throw new Error('Task ID is required');
      }

      const taskRef = doc(db, TestCollections.Tasks, taskId);
      const updateData = {
        rewarded: true,
        rewardedAt: new Date().toISOString(),
        ...rewardData
      };

      await updateDoc(taskRef, updateData);
      
      // Invalidate related caches
      TaskCache.invalidate(new RegExp(`tasks:.*`));
      TaskCache.invalidate(new RegExp(`family-tasks:.*`));
      
      PerformanceMonitor.end(operation);
      return { success: true, message: "Task rewarded successfully", updateData };
    } catch (error) {
      ErrorHandler.logError(operation, error, { taskId, rewardData });
      throw ErrorHandler.createError(operation, error, { taskId });
    }
  },

  // Batch operations for better performance
  batchUpdateTasks: async (updates) => {
    const operation = 'batchUpdateTasks';
    PerformanceMonitor.start(operation);
    
    try {
      if (!Array.isArray(updates) || updates.length === 0) {
        throw new Error('Updates array is required and must not be empty');
      }

      const batch = writeBatch(db);
      const maxBatchSize = 500; // Firestore limit
      
      if (updates.length > maxBatchSize) {
        throw new Error(`Batch size exceeds limit. Maximum ${maxBatchSize} operations allowed.`);
      }

      updates.forEach(({ taskId, data }) => {
        if (!taskId || !data) {
          throw new Error('Each update must have taskId and data');
        }
        
        const taskRef = doc(db, TestCollections.Tasks, taskId);
        batch.update(taskRef, {
          ...data,
          updatedAt: new Date().toISOString()
        });
      });

      await batch.commit();
      
      // Invalidate all task caches
      TaskCache.clear();
      
      PerformanceMonitor.end(operation);
      return { success: true, message: `${updates.length} tasks updated successfully` };
    } catch (error) {
      ErrorHandler.logError(operation, error, { updatesCount: updates?.length });
      throw ErrorHandler.createError(operation, error);
    }
  },

  // Cache management utilities
  cache: {
    clear: () => {
      TaskCache.clear();
      UserCache.clear();
    },
    
    clearTasks: () => TaskCache.clear(),
    clearUsers: () => UserCache.clear(),
    
    invalidateUser: (uid) => {
      UserCache.invalidate(`user:${uid}`);
      UserCache.invalidate(new RegExp(`children:${uid}`));
    },
    
    invalidateUserTasks: (uid) => {
      TaskCache.invalidate(new RegExp(`tasks:${uid}`));
      TaskCache.invalidate(new RegExp(`family-tasks:.*`));
    },
    
    getStats: () => ({
      tasks: TaskCache.getStats(),
      users: UserCache.getStats()
    })
  },

  // Performance monitoring utilities
  performance: {
    getStats: () => PerformanceMonitor.timers.size,
    clearTimers: () => PerformanceMonitor.timers.clear()
  },

  // Task Summary Functions (moved from backend)
  
  /**
   * Get task summary for a user that created tasks (parent view)
   * @param {string} userId - The user ID who created the tasks
   * @param {object} options - Options for caching and filtering
   * @returns {Promise<object>} Task summary with completed, in_progress, and total counts
   */
  getTaskSummary: async (userId, options = {}) => {
    const operation = 'getTaskSummary';
    PerformanceMonitor.start(operation);
    
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const { useCache = true } = options;
      const cacheKey = `task-summary:${userId}`;
      
      // Check cache first
      if (useCache) {
        const cachedSummary = TaskCache.get(cacheKey);
        if (cachedSummary) {
          PerformanceMonitor.end(operation);
          return cachedSummary;
        }
      }

      // Query all tasks created by this user
      const tasksQuery = query(
        collection(db, TestCollections.Tasks),
        where("user_id", "==", userId)
      );

      const tasksSnapshot = await getDocs(tasksQuery);
      
      // Count by status
      let completedCount = 0;
      let inProgressCount = 0;

      tasksSnapshot.docs.forEach((doc) => {
        const taskData = doc.data();
        const rewarded = taskData.rewarded || false;
        
        if (rewarded === true) {
          completedCount++;
        } else {
          inProgressCount++;
        }
      });

      const summary = {
        completed: completedCount,
        in_progress: inProgressCount,
        total: tasksSnapshot.docs.length
      };

      // Cache the results
      if (useCache) {
        TaskCache.set(cacheKey, summary, 300000); // 5 minutes
      }

      PerformanceMonitor.end(operation);
      return summary;
    } catch (error) {
      ErrorHandler.logError(operation, error, { userId });
      throw new Error(`Failed to get task summary: ${error.message}`);
    }
  },

  /**
   * Get task summary for a user that was assigned tasks (child view)
   * @param {string} userId - The user ID who was assigned the tasks
   * @param {object} options - Options for caching and filtering
   * @returns {Promise<object>} Task summary with completed, in_progress, and total counts
   */
  getKidTaskSummary: async (userId, options = {}) => {
    const operation = 'getKidTaskSummary';
    PerformanceMonitor.start(operation);
    
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const { useCache = true } = options;
      const cacheKey = `kid-task-summary:${userId}`;
      
      // Check cache first
      if (useCache) {
        const cachedSummary = TaskCache.get(cacheKey);
        if (cachedSummary) {
          PerformanceMonitor.end(operation);
          return cachedSummary;
        }
      }

      // Query all tasks assigned to this user
      const tasksQuery = query(
        collection(db, TestCollections.Tasks),
        where("assigned_to_ids", "array-contains", userId)
      );

      const tasksSnapshot = await getDocs(tasksQuery);
      
      // Count by status
      let completedCount = 0;
      let inProgressCount = 0;

      tasksSnapshot.docs.forEach((doc) => {
        const taskData = doc.data();
        const rewarded = taskData.rewarded || false;
        
        if (rewarded === true) {
          completedCount++;
        } else {
          inProgressCount++;
        }
      });

      const summary = {
        completed: completedCount,
        in_progress: inProgressCount,
        total: tasksSnapshot.docs.length
      };

      // Cache the results
      if (useCache) {
        TaskCache.set(cacheKey, summary, 300000); // 5 minutes
      }

      PerformanceMonitor.end(operation);
      return summary;
    } catch (error) {
      ErrorHandler.logError(operation, error, { userId });
      throw new Error(`Failed to get kid task summary: ${error.message}`);
    }
  },

  /**
   * Get recent tasks assigned to a user within specified days
   * @param {string} userId - The user ID
   * @param {number} limitCount - Maximum number of tasks to return (default: 5)
   * @param {number} days - Number of days to look back (default: 7)
   * @param {object} options - Options for caching
   * @returns {Promise<Array>} Recent tasks array
   */
  getRecentTasks: async (userId, limitCount = 5, days = 7, options = {}) => {
    const operation = 'getRecentTasks';
    PerformanceMonitor.start(operation);
    
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const { useCache = true } = options;
      const cacheKey = `recent-tasks:${userId}:${limitCount}:${days}`;
      
      // Check cache first
      if (useCache) {
        const cachedTasks = TaskCache.get(cacheKey);
        if (cachedTasks) {
          PerformanceMonitor.end(operation);
          return cachedTasks;
        }
      }

      // Calculate start date
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Query recent tasks assigned to this user
      const tasksQuery = query(
        collection(db, TestCollections.Tasks),
        where("assigned_to_ids", "array-contains", userId),
        where("timestamp", ">=", startDate),
        orderBy("timestamp", "desc"),
        limit(limitCount)
      );

      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = tasksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      // Cache the results
      if (useCache) {
        TaskCache.set(cacheKey, tasks, 180000); // 3 minutes for recent data
      }

      PerformanceMonitor.end(operation);
      return tasks;
    } catch (error) {
      ErrorHandler.logError(operation, error, { userId, limitCount, days });
      throw new Error(`Failed to get recent tasks: ${error.message}`);
    }
  },

  /**
   * Get rewards information for a user
   * @param {string} userId - The user ID
   * @param {object} options - Options for caching
   * @returns {Promise<object>} User rewards with tokens_earned, level, and rank
   */
  getUserRewards: async (userId, options = {}) => {
    const operation = 'getUserRewards';
    PerformanceMonitor.start(operation);
    
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const { useCache = true } = options;
      const cacheKey = `user-rewards:${userId}`;
      
      // Check cache first
      if (useCache) {
        const cachedRewards = UserCache.get(cacheKey);
        if (cachedRewards) {
          PerformanceMonitor.end(operation);
          return cachedRewards;
        }
      }

      // Get user rewards from paid_tasks collection
      const rewardsRef = doc(db, TestCollections.PAID_TASKS, userId);
      const rewardsDoc = await getDoc(rewardsRef);

      let rewards;
      if (!rewardsDoc.exists()) {
        rewards = {
          tokens_earned: 0,
          level: 1,
          rank: 0
        };
      } else {
        const rewardData = rewardsDoc.data();
        const tokensEarned = rewardData.tokens_earned || 0;

        // Calculate level: Level = floor(tokens_earned / 1000) + 1
        const level = Math.floor(tokensEarned / 1000) + 1;

        // Get rank from leaderboard (simplified calculation)
        const rank = await firestoreService.getUserRank(userId, tokensEarned);

        rewards = {
          tokens_earned: tokensEarned,
          level: level,
          rank: rank
        };
      }

      // Cache the results
      if (useCache) {
        UserCache.set(cacheKey, rewards, 600000); // 10 minutes
      }

      PerformanceMonitor.end(operation);
      return rewards;
    } catch (error) {
      ErrorHandler.logError(operation, error, { userId });
      throw new Error(`Failed to get user rewards: ${error.message}`);
    }
  },

  /**
   * Calculate user's rank based on tokens earned
   * @param {string} userId - The user ID
   * @param {number} tokensEarned - The user's tokens earned
   * @returns {Promise<number>} User's rank
   */
  getUserRank: async (userId, tokensEarned) => {
    const operation = 'getUserRank';
    
    try {
      // Count users with more tokens
      const leaderboardQuery = query(
        collection(db, TestCollections.LEADERBOARD),
        where("tokens_earned", ">", tokensEarned)
      );

      const higherUsersSnapshot = await getDocs(leaderboardQuery);
      return higherUsersSnapshot.docs.length + 1;
    } catch (error) {
      ErrorHandler.logError(operation, error, { userId, tokensEarned });
      return 0;
    }
  },

  /**
   * Get rewards for all children of a parent
   * @param {string} parentId - The parent user ID
   * @param {object} options - Options for caching
   * @returns {Promise<Array>} Array of children rewards
   */
  getChildrenRewards: async (parentId, options = {}) => {
    const operation = 'getChildrenRewards';
    PerformanceMonitor.start(operation);
    
    try {
      if (!parentId) {
        throw new Error('Parent ID is required');
      }

      const { useCache = true } = options;
      const cacheKey = `children-rewards:${parentId}`;
      
      // Check cache first
      if (useCache) {
        const cachedRewards = UserCache.get(cacheKey);
        if (cachedRewards) {
          PerformanceMonitor.end(operation);
          return cachedRewards;
        }
      }

      // Get parent user to find children
      const parentRef = doc(db, "users", parentId);
      const parentDoc = await getDoc(parentRef);

      if (!parentDoc.exists()) {
        throw new Error("Parent user not found");
      }

      const parentData = parentDoc.data();
      const childIds = parentData.children || [];

      if (childIds.length === 0) {
        const emptyResult = [];
        if (useCache) {
          UserCache.set(cacheKey, emptyResult, 300000); // 5 minutes
        }
        PerformanceMonitor.end(operation);
        return emptyResult;
      }

      // Get rewards for all children
      const rewardsPromises = childIds.map(async (childId) => {
        try {
          const rewards = await firestoreService.getUserRewards(childId, { useCache });
          return {
            user_id: childId,
            ...rewards,
            error: null
          };
        } catch (error) {
          ErrorHandler.logError(`getUserRewards-${childId}`, error);
          return {
            user_id: childId,
            tokens_earned: 0,
            level: 1,
            rank: 0,
            error: error.message
          };
        }
      });

      const rewards = await Promise.all(rewardsPromises);

      // Cache the results
      if (useCache) {
        UserCache.set(cacheKey, rewards, 300000); // 5 minutes
      }

      PerformanceMonitor.end(operation);
      return rewards;
    } catch (error) {
      ErrorHandler.logError(operation, error, { parentId });
      throw new Error(`Failed to get children rewards: ${error.message}`);
    }
  }
};
