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
        // Setup real-time subscription
        cleanup(); // Clean up any existing subscription
        
        const unsubscribe = firestoreService.subscribeToUserTasks(
          childId,
          (result) => {
            if (result.success) {
              setTasks(result.tasks);
              setError(null);
            } else {
              setError(result.error);
              setTasks([]);
            }
            setLoading(false);
          },
          { limitCount, includeCompleted }
        );
        
        unsubscribeRef.current = unsubscribe;
      } else {
        // One-time fetch
        const result = await firestoreService.getTasksForUser(childId, useCache);
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

  // Refresh tasks manually
  const refreshTasks = useCallback(async () => {
    if (!childId) return;
    
    try {
      // Force refresh without cache
      const result = await firestoreService.getTasksForUser(childId, false);
      if (result.success) {
        setTasks(result.tasks);
        setError(null);
      }
    } catch (err) {
      console.error('Error refreshing tasks:', err);
      setError(err.message);
    }
  }, [childId]);

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
        // Setup real-time subscription for family
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
          }
        );
        
        unsubscribeRef.current = unsubscribe;
      } else {
        // One-time fetch
        const result = await firestoreService.getTasksForFamily(parentId);
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

  // Refresh family tasks manually
  const refreshFamilyTasks = useCallback(async () => {
    if (!parentId) return;
    
    try {
      // Clear cache and fetch fresh data
      firestoreService.clearTaskCache();
      const result = await firestoreService.getTasksForFamily(parentId);
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
      
      const result = await firestoreService.getTasksWithPagination(userId, null, pageSize);
      
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
      
      const result = await firestoreService.getTasksWithPagination(userId, lastDocument, pageSize);
      
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
 * Hook for task cache management
 * Provides utilities for managing the task cache
 */
export const useTaskCache = () => {
  const clearCache = useCallback(() => {
    firestoreService.clearTaskCache();
  }, []);

  const clearCacheForUser = useCallback((userId) => {
    // This would require extending the cache to support selective clearing
    // For now, we clear all cache
    firestoreService.clearTaskCache();
  }, []);

  return {
    clearCache,
    clearCacheForUser
  };
};
