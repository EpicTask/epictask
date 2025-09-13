import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * Enhanced error handling and offline support utilities for task management
 */

// Error types for better error handling
export const TaskErrorTypes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  FIRESTORE_ERROR: 'FIRESTORE_ERROR',
  CACHE_ERROR: 'CACHE_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

// Network status manager
class NetworkStatusManager {
  constructor() {
    this.isConnected = true;
    this.listeners = new Set();
    this.initialize();
  }

  initialize() {
    NetInfo.addEventListener(state => {
      const wasConnected = this.isConnected;
      this.isConnected = state.isConnected;
      
      // Notify listeners of network status change
      if (wasConnected !== this.isConnected) {
        this.listeners.forEach(listener => {
          try {
            listener(this.isConnected);
          } catch (error) {
            console.error('Error in network status listener:', error);
          }
        });
      }
    });
  }

  addListener(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getStatus() {
    return this.isConnected;
  }
}

export const networkStatusManager = new NetworkStatusManager();

// Offline queue for failed operations
class OfflineQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    
    // Listen for network status changes
    networkStatusManager.addListener((isConnected) => {
      if (isConnected && this.queue.length > 0) {
        this.processQueue();
      }
    });
  }

  add(operation) {
    this.queue.push({
      ...operation,
      timestamp: Date.now(),
      retryCount: 0
    });
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const operation = this.queue.shift();
      
      try {
        await operation.execute();
        console.log('Offline operation completed:', operation.type);
      } catch (error) {
        operation.retryCount++;
        
        if (operation.retryCount < 3) {
          // Re-queue for retry
          this.queue.push(operation);
          console.log(`Retrying offline operation (${operation.retryCount}/3):`, operation.type);
        } else {
          console.error('Failed to execute offline operation after 3 retries:', operation.type, error);
        }
      }
    }
    
    this.processing = false;
  }

  clear() {
    this.queue = [];
  }

  getQueueSize() {
    return this.queue.length;
  }
}

export const offlineQueue = new OfflineQueue();

// Error classifier to determine error type
export const classifyError = (error) => {
  if (!error) return TaskErrorTypes.UNKNOWN_ERROR;

  const errorMessage = error.message?.toLowerCase() || '';
  const errorCode = error.code?.toLowerCase() || '';

  // Network errors
  if (errorMessage.includes('network') || 
      errorMessage.includes('connection') ||
      errorCode.includes('unavailable') ||
      errorCode.includes('deadline-exceeded')) {
    return TaskErrorTypes.NETWORK_ERROR;
  }

  // Permission errors
  if (errorMessage.includes('permission') ||
      errorMessage.includes('unauthorized') ||
      errorCode.includes('permission-denied')) {
    return TaskErrorTypes.PERMISSION_ERROR;
  }

  // Firestore specific errors
  if (errorCode.includes('firestore') ||
      errorMessage.includes('firestore') ||
      errorCode.includes('invalid-argument') ||
      errorCode.includes('not-found')) {
    return TaskErrorTypes.FIRESTORE_ERROR;
  }

  // Timeout errors
  if (errorMessage.includes('timeout') ||
      errorCode.includes('timeout')) {
    return TaskErrorTypes.TIMEOUT_ERROR;
  }

  return TaskErrorTypes.UNKNOWN_ERROR;
};

// Enhanced error handler with retry logic
export const handleTaskError = async (error, operation, options = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    enableOfflineQueue = true,
    onRetry = null,
    onFinalFailure = null
  } = options;

  const errorType = classifyError(error);
  console.error(`Task operation failed (${errorType}):`, error);

  // If offline and operation supports queuing
  if (!networkStatusManager.getStatus() && enableOfflineQueue && operation) {
    offlineQueue.add({
      type: operation.type || 'unknown',
      execute: operation.execute,
      data: operation.data
    });
    
    return {
      success: false,
      error: 'Operation queued for when connection is restored',
      errorType: TaskErrorTypes.NETWORK_ERROR,
      queued: true
    };
  }

  // Retry logic for certain error types
  if (errorType === TaskErrorTypes.NETWORK_ERROR || 
      errorType === TaskErrorTypes.TIMEOUT_ERROR) {
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (onRetry) {
          onRetry(attempt, maxRetries);
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        
        // Execute the operation again
        if (operation && operation.execute) {
          const result = await operation.execute();
          return { success: true, data: result, retriedAfter: attempt };
        }
        
        break;
      } catch (retryError) {
        console.error(`Retry attempt ${attempt}/${maxRetries} failed:`, retryError);
        
        if (attempt === maxRetries) {
          if (onFinalFailure) {
            onFinalFailure(retryError);
          }
          
          return {
            success: false,
            error: retryError.message,
            errorType: classifyError(retryError),
            retriesExhausted: true
          };
        }
      }
    }
  }

  return {
    success: false,
    error: error.message,
    errorType,
    retryable: errorType === TaskErrorTypes.NETWORK_ERROR || 
               errorType === TaskErrorTypes.TIMEOUT_ERROR
  };
};

// User-friendly error messages
export const getErrorMessage = (errorType, error) => {
  switch (errorType) {
    case TaskErrorTypes.NETWORK_ERROR:
      return 'Unable to connect. Please check your internet connection and try again.';
    
    case TaskErrorTypes.PERMISSION_ERROR:
      return 'You don\'t have permission to perform this action. Please contact support.';
    
    case TaskErrorTypes.FIRESTORE_ERROR:
      return 'There was a problem with the database. Please try again in a moment.';
    
    case TaskErrorTypes.CACHE_ERROR:
      return 'There was a problem loading cached data. Refreshing...';
    
    case TaskErrorTypes.VALIDATION_ERROR:
      return 'The information provided is invalid. Please check and try again.';
    
    case TaskErrorTypes.TIMEOUT_ERROR:
      return 'The request took too long. Please try again.';
    
    default:
      return error?.message || 'An unexpected error occurred. Please try again.';
  }
};

// Offline data manager
export class OfflineDataManager {
  constructor() {
    this.storage = new Map();
    this.syncQueue = [];
  }

  // Store data for offline access
  storeOfflineData(key, data) {
    try {
      this.storage.set(key, {
        data,
        timestamp: Date.now(),
        synced: false
      });
    } catch (error) {
      console.error('Error storing offline data:', error);
    }
  }

  // Retrieve offline data
  getOfflineData(key) {
    try {
      const item = this.storage.get(key);
      if (item) {
        // Check if data is not too old (24 hours)
        const isStale = Date.now() - item.timestamp > 24 * 60 * 60 * 1000;
        return {
          ...item,
          isStale
        };
      }
      return null;
    } catch (error) {
      console.error('Error retrieving offline data:', error);
      return null;
    }
  }

  // Mark data as synced
  markAsSynced(key) {
    const item = this.storage.get(key);
    if (item) {
      item.synced = true;
      this.storage.set(key, item);
    }
  }

  // Get all unsynced data
  getUnsyncedData() {
    const unsynced = [];
    this.storage.forEach((value, key) => {
      if (!value.synced) {
        unsynced.push({ key, ...value });
      }
    });
    return unsynced;
  }

  // Clear offline data
  clearOfflineData(key) {
    if (key) {
      this.storage.delete(key);
    } else {
      this.storage.clear();
    }
  }
}

export const offlineDataManager = new OfflineDataManager();

// Connection status hook
export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(networkStatusManager.getStatus());

  useEffect(() => {
    const unsubscribe = networkStatusManager.addListener(setIsConnected);
    return unsubscribe;
  }, []);

  return isConnected;
};

// Enhanced task operation wrapper with error handling
export const withErrorHandling = (operation, options = {}) => {
  return async (...args) => {
    try {
      const result = await operation(...args);
      return { success: true, data: result };
    } catch (error) {
      return await handleTaskError(error, {
        type: operation.name || 'task_operation',
        execute: () => operation(...args),
        data: args
      }, options);
    }
  };
};

// Validation utilities
export const validateTaskData = (taskData) => {
  const errors = [];

  if (!taskData.title || taskData.title.trim().length === 0) {
    errors.push('Task title is required');
  }

  if (taskData.title && taskData.title.length > 100) {
    errors.push('Task title must be less than 100 characters');
  }

  if (!taskData.assigned_to_ids || taskData.assigned_to_ids.length === 0) {
    errors.push('Task must be assigned to at least one user');
  }

  if (taskData.due_date) {
    const dueDate = new Date(taskData.due_date);
    if (isNaN(dueDate.getTime())) {
      errors.push('Invalid due date format');
    } else if (dueDate < new Date()) {
      errors.push('Due date cannot be in the past');
    }
  }

  if (taskData.reward_amount && (isNaN(taskData.reward_amount) || taskData.reward_amount < 0)) {
    errors.push('Reward amount must be a positive number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
