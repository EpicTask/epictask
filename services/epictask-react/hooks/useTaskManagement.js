import { useState, useEffect, useCallback, useRef } from 'react';
import { firestoreService } from '../api/firestoreService';

/**
 * Hook for managing tasks for a single user (child)
 * Provides real-time updates and caching
 */
export const useChildTasks = (childId, options = {}) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromCache, setFromCache] = useState(false);
  const unsubscribeRef = useRef(null);

  const {
    realTime = true,
    limitCount = 50,
    includeCompleted = true,
    useCache = true
  } = options;

  // Cleanup function
  const cleanup = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
  }, []);

  // Fetch tasks function
  const fetchTasks = useCallback(async () => {
    if (!childId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (realTime) {
        cleanup(); // Clean up any existing subscription
        
        const unsubscribe = firestoreService.subscribeToUserTasks(
          childId,
          (result) => {
            if (result.success) {
              setTasks(result.tasks);
              setFromCache(false);
              setError(null);
            } else {
              setError(result.error);
              setTasks([]);
            }
            setLoading(false);
          },
          { 
            limitCount, 
            includeCompleted,
            orderField: "created_at",
            orderDirection: "desc"
          }
        );
        
        unsubscribeRef.current = unsubscribe;
      } else {
        // One-time fetch with enhanced options
        const result = await firestoreService.getTasksForUser(childId, {
          useCache,
          limitCount,
          includeCompleted,
          orderField: "expiration_date",
          orderDirection: "desc"
        });
        
        if (result.success) {
          setTasks(result.tasks);
          setFromCache(result.fromCache || false);
          setError(null);
        } else {
          setError(result.error);
          setTasks([]);
        }
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching child tasks:', err);
      setError(err.message);
      setTasks([]);
      setLoading(false);
    }
  }, [childId, realTime, limitCount, includeCompleted, useCache, cleanup]);

  // Refresh tasks manually with cache invalidation
  const refreshTasks = useCallback(async () => {
    if (!childId) return;
    
    try {
      // Invalidate cache first, then fetch fresh data
      firestoreService.cache.invalidateUserTasks(childId);
      
      const result = await firestoreService.getTasksForUser(childId, {
        useCache: false,
        limitCount,
        includeCompleted,
        orderField: "expiration_date",
        orderDirection: "desc"
      });
      
      if (result.success) {
        setTasks(result.tasks);
        setFromCache(false);
        setError(null);
      }
    } catch (err) {
      console.error('Error refreshing tasks:', err);
      setError(err.message);
    }
  }, [childId, limitCount, includeCompleted]);

  // Setup effect
  useEffect(() => {
    fetchTasks();
    
    // Cleanup on unmount or childId change
    return cleanup;
  }, [fetchTasks, cleanup]);

  return {
    tasks,
    loading,
    error,
    fromCache,
    refreshTasks,
    cleanup
  };
};

/**
 * Hook for managing tasks for all children in a family (parent view)
 * Provides real-time updates for all children simultaneously
 */
export const useFamilyTasks = (parentId, options = {}) => {
  const [familyTasks, setFamilyTasks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [children, setChildren] = useState([]);
  const unsubscribeRef = useRef(null);

  const { realTime = true } = options;

  // Cleanup function
  const cleanup = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
  }, []);

  // Fetch family tasks function
  const fetchFamilyTasks = useCallback(async () => {
    if (!parentId) {
      setFamilyTasks({});
      setChildren([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // First get children list
      const childrenResult = await firestoreService.getLinkedChildren(parentId);
      if (childrenResult.success) {
        setChildren(childrenResult.children);
      }

      if (realTime) {
        // Setup real-time subscription for family with enhanced options
        cleanup(); // Clean up any existing subscription
        
        const unsubscribe = firestoreService.subscribeToFamilyTasks(
          parentId,
          (result) => {
            if (result.success) {
              setFamilyTasks(result.familyTasks);
              setError(null);
            } else {
              setError(result.error);
              setFamilyTasks({});
            }
            setLoading(false);
          },
          {
            limitCount: 50,
            includeCompleted: true,
            orderField: "created_at",
            orderDirection: "desc"
          }
        );
        
        unsubscribeRef.current = unsubscribe;
      } else {
        // One-time fetch with enhanced options
        const result = await firestoreService.getTasksForFamily(parentId, {
          useCache: true,
          limitCount: 50,
          includeCompleted: true,
          orderField: "expiration_date",
          orderDirection: "desc"
        });
        
        if (result.success) {
          setFamilyTasks(result.familyTasks);
          setError(null);
        } else {
          setError(result.error);
          setFamilyTasks({});
        }
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching family tasks:', err);
      setError(err.message);
      setFamilyTasks({});
      setLoading(false);
    }
  }, [parentId, realTime, cleanup]);

  // Refresh family tasks manually with enhanced cache management
  const refreshFamilyTasks = useCallback(async () => {
    if (!parentId) return;
    
    try {
      // Clear specific cache patterns and fetch fresh data
      firestoreService.cache.clearTasks();
      
      const result = await firestoreService.getTasksForFamily(parentId, {
        useCache: false,
        limitCount: 50,
        includeCompleted: true,
        orderField: "expiration_date",
        orderDirection: "desc"
      });
      
      if (result.success) {
        setFamilyTasks(result.familyTasks);
        setError(null);
      }
    } catch (err) {
      console.error('Error refreshing family tasks:', err);
      setError(err.message);
    }
  }, [parentId]);

  // Get tasks for a specific child
  const getTasksForChild = useCallback((childId) => {
    return familyTasks[childId]?.tasks || [];
  }, [familyTasks]);

  // Get task counts for a specific child
  const getTaskCountsForChild = useCallback((childId) => {
    const childTasks = familyTasks[childId]?.tasks || [];
    return {
      total: childTasks.length,
      completed: childTasks.filter(task => task.status === 'completed').length,
      inProgress: childTasks.filter(task => task.status === 'in_progress' || task.status === 'assigned').length,
      overdue: childTasks.filter(task => {
        const dueDate = task.due_date ? new Date(task.due_date) : null;
        return dueDate && dueDate < new Date() && task.status !== 'completed';
      }).length
    };
  }, [familyTasks]);

  // Get overall family task summary
  const getFamilyTaskSummary = useCallback(() => {
    const summary = {
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      overdueTasks: 0,
      childrenWithTasks: 0
    };

    Object.keys(familyTasks).forEach(childId => {
      const childTasks = familyTasks[childId]?.tasks || [];
      if (childTasks.length > 0) {
        summary.childrenWithTasks++;
      }
      
      summary.totalTasks += childTasks.length;
      summary.completedTasks += childTasks.filter(task => task.status === 'completed').length;
      summary.inProgressTasks += childTasks.filter(task => task.status === 'in_progress' || task.status === 'assigned').length;
      
      const overdue = childTasks.filter(task => {
        const dueDate = task.due_date ? new Date(task.due_date) : null;
        return dueDate && dueDate < new Date() && task.status !== 'completed';
      }).length;
      summary.overdueTasks += overdue;
    });

    return summary;
  }, [familyTasks]);

  // Setup effect
  useEffect(() => {
    fetchFamilyTasks();
    
    // Cleanup on unmount or parentId change
    return cleanup;
  }, [fetchFamilyTasks, cleanup]);

  return {
    familyTasks,
    children,
    loading,
    error,
    refreshFamilyTasks,
    getTasksForChild,
    getTaskCountsForChild,
    getFamilyTaskSummary,
    cleanup
  };
};

/**
 * Hook for paginated task loading
 * Useful for infinite scroll or load more functionality
 */
export const usePaginatedTasks = (userId, pageSize = 20) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDocument, setLastDocument] = useState(null);

  // Load initial tasks
  const loadInitialTasks = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      
      const result = await firestoreService.getTasksWithPagination(userId, null, {
        limitCount: pageSize,
        orderField: "created_at",
        orderDirection: "desc"
      });
      
      if (result.success) {
        setTasks(result.tasks);
        setHasMore(result.hasMore);
        setLastDocument(result.lastDocument);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error loading initial tasks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, pageSize]);

  // Load more tasks
  const loadMoreTasks = useCallback(async () => {
    if (!userId || !hasMore || loading) return;

    try {
      setLoading(true);
      setError(null);
      
      const result = await firestoreService.getTasksWithPagination(userId, lastDocument, {
        limitCount: pageSize,
        orderField: "created_at",
        orderDirection: "desc"
      });
      
      if (result.success) {
        setTasks(prevTasks => [...prevTasks, ...result.tasks]);
        setHasMore(result.hasMore);
        setLastDocument(result.lastDocument);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error loading more tasks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, lastDocument, hasMore, loading, pageSize]);

  // Reset pagination
  const resetPagination = useCallback(() => {
    setTasks([]);
    setLastDocument(null);
    setHasMore(true);
    setError(null);
  }, []);

  // Initialize
  useEffect(() => {
    resetPagination();
    loadInitialTasks();
  }, [userId, resetPagination, loadInitialTasks]);

  return {
    tasks,
    loading,
    error,
    hasMore,
    loadMoreTasks,
    resetPagination,
    refresh: loadInitialTasks
  };
};

/**
 * Hook for enhanced task cache management
 * Provides utilities for managing the task cache with granular control
 */
export const useTaskCache = () => {
  const clearCache = useCallback(() => {
    firestoreService.cache.clearTasks();
  }, []);

  const clearCacheForUser = useCallback((userId) => {
    firestoreService.cache.invalidateUserTasks(userId);
  }, []);

  const clearUserCache = useCallback((userId) => {
    firestoreService.cache.invalidateUser(userId);
  }, []);

  const clearAllCache = useCallback(() => {
    firestoreService.cache.clear();
  }, []);

  const getCacheStats = useCallback(() => {
    return firestoreService.cache.getStats();
  }, []);

  const getPerformanceStats = useCallback(() => {
    return firestoreService.performance.getStats();
  }, []);

  return {
    clearCache,
    clearCacheForUser,
    clearUserCache,
    clearAllCache,
    getCacheStats,
    getPerformanceStats
  };
};
