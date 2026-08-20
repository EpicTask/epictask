import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { Alert, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import authService from '../api/authService';
import { forceRefreshToken } from '../api/apiClient';
import { queryClient } from '../api/queryClient';
import { firestoreService } from '../api/firestoreService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSharedDeviceMode, setIsSharedDeviceMode] = useState(false);
  const [activeChildContext, setActiveChildContext] = useState(null);
  const authStateChangeRef = useRef(0);
  const sharedModeExpirationRef = useRef(null);

  const clearSharedModeTimer = () => {
    if (sharedModeExpirationRef.current) {
      clearTimeout(sharedModeExpirationRef.current);
      sharedModeExpirationRef.current = null;
    }
  };

  const scheduleSharedModeExpiration = (expires) => {
    clearSharedModeTimer();

    const timeUntilExpiration = expires - Date.now();
    if (timeUntilExpiration > 0) {
      sharedModeExpirationRef.current = setTimeout(() => {
        exitSharedDeviceMode({ expired: true });
      }, timeUntilExpiration);
    } else {
      exitSharedDeviceMode({ expired: true });
    }
  };

  const enterSharedDeviceMode = async () => {
    const context = await authService.getChildContext();
    if (context.success) {
      setActiveChildContext(context.context);
      setIsSharedDeviceMode(true);
      scheduleSharedModeExpiration(context.context.expires);
    }
  };

  const exitSharedDeviceMode = (options = {}) => {
    clearSharedModeTimer();
    setIsSharedDeviceMode(false);
    setActiveChildContext(null);
    authService.clearChildContext().catch(() => {});
    if (options.expired) {
      Alert.alert("Child Session Expired", "You're back in parent mode.");
    }
  };

  // Restore shared device mode on app start if context is valid
  useEffect(() => {
    const restoreSharedMode = async () => {
      if (user && user.role === 'parent') {
        const context = await authService.getChildContext();
        if (context.success) {
          setActiveChildContext(context.context);
          setIsSharedDeviceMode(true);
          scheduleSharedModeExpiration(context.context.expires);
        } else if (isSharedDeviceMode) {
          exitSharedDeviceMode({ expired: context.error === "Session expired" });
        }
      }
    };

    restoreSharedMode();

    return () => {
      clearSharedModeTimer();
    };
  }, [user]);

  const effectiveUserId = (user?.role === 'parent' && isSharedDeviceMode && activeChildContext)
    ? activeChildContext.childId
    : user?.uid;

  const childAge = (user?.role === 'parent' && isSharedDeviceMode && activeChildContext)
    ? activeChildContext.childAge
    : user?.age;

  // Proactively refresh the Firebase ID token whenever the app comes back to
  // the foreground. This prevents stale-token errors after the device has been
  // idle / the app has been backgrounded for longer than 1 hour.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState) => {
      if (nextState === 'active' && auth.currentUser) {
        try {
          await forceRefreshToken();
        } catch (e) {
          console.warn('[AuthContext] Foreground token refresh failed:', e);
        }

        if (isSharedDeviceMode) {
          const context = await authService.getChildContext();
          if (!context.success) {
            exitSharedDeviceMode({ expired: context.error === "Session expired" });
          } else {
            scheduleSharedModeExpiration(context.context.expires);
          }
        }
      }
    });
    return () => subscription.remove();
  }, [isSharedDeviceMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const authStateChangeId = ++authStateChangeRef.current;
      const isCurrentAuthState = () => authStateChangeId === authStateChangeRef.current;

      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          if (!isCurrentAuthState()) return;
          await AsyncStorage.setItem('authToken', token);
          
          // Fetch user profile from user management service
          const userProfileResponse = await authService.getCurrentUser(firebaseUser.uid);
          if (!isCurrentAuthState()) return;
          
          // Handle the response structure properly
          if (userProfileResponse && userProfileResponse.success && userProfileResponse.user) {
            setUser(userProfileResponse.user);
            await AsyncStorage.setItem('cachedUserProfile', JSON.stringify(userProfileResponse.user));
          } else if (userProfileResponse && userProfileResponse.user) {
            // Handle case where response doesn't have success flag but has user data
            setUser(userProfileResponse.user);
            await AsyncStorage.setItem('cachedUserProfile', JSON.stringify(userProfileResponse.user));
          } else {
            // If profile fetch fails, try to load from cache first
            const cachedData = await AsyncStorage.getItem('cachedUserProfile');
            if (cachedData) {
              setUser(JSON.parse(cachedData));
            } else {
              // If no cache, set basic user info from Firebase
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
              });
            }
          }
        } catch (error) {
          if (!isCurrentAuthState()) return;
          console.error("Failed to fetch user profile:", error);
          // If profile fetch fails, try to load from cache first
          const cachedData = await AsyncStorage.getItem('cachedUserProfile');
          if (!isCurrentAuthState()) return;

          if (cachedData) {
            setUser(JSON.parse(cachedData));
          } else {
            // If no cache, set basic user info from Firebase
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
            });
          }
        }
      } else {
        // Firebase Auth is the source of truth for session state. Clean up
        // local state after it reports that the user is signed out, while
        // allowing React state to reset even if storage cleanup fails.
        await Promise.allSettled([
          queryClient.cancelQueries(),
          AsyncStorage.multiRemove([
            'authToken',
            'cachedUserProfile',
            'childContext',
          ]),
        ]);
        queryClient.clear();
        firestoreService.cache.clear();
        if (!isCurrentAuthState()) return;

        setIsSharedDeviceMode(false);
        setActiveChildContext(null);
        setUser(null);
      }

      if (isCurrentAuthState()) {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Authentication methods
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const result = await authService.login(email, password);
      if (result && result.user) {
        await AsyncStorage.setItem('cachedUserProfile', JSON.stringify(result.user));
      }
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, displayName, role) => {
    try {
      setLoading(true);
      setError(null);
      const result = await authService.register(email, password, displayName, role);
      if (result && result.user) {
        await AsyncStorage.setItem('cachedUserProfile', JSON.stringify(result.user));
      }
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await authService.logout();
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const result = await authService.updateProfile(profileData);
      // Refresh user data - get current Firebase user UID
      const currentFirebaseUser = auth.currentUser;
      if (currentFirebaseUser) {
        const updatedUserResponse = await authService.getCurrentUser(currentFirebaseUser.uid);
        const updatedUser = updatedUserResponse.user || updatedUserResponse;
        setUser(updatedUser);
        await AsyncStorage.setItem('cachedUserProfile', JSON.stringify(updatedUser));
      }
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const generateInviteCode = async () => {
    try {
      setError(null);
      return await authService.generateInviteCode();
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const linkChild = async (inviteCode) => {
    try {
      setError(null);
      return await authService.linkChild(inviteCode);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const getLinkedChildren = async (parentUid) => {
    try {
      setError(null);
      return await authService.getLinkedChildren(parentUid || user?.uid);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const deleteAccount = async () => {
    try {
      setLoading(true);
      setError(null);
      await authService.deleteAccount();
      setUser(null);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      childAge,
      loading,
      error,
      login,
      register,
      logout,
      updateProfile,
      generateInviteCode,
      linkChild,
      getLinkedChildren,
      deleteAccount,
      clearError,
      isSharedDeviceMode,
      activeChildContext,
      effectiveUserId,
      enterSharedDeviceMode,
      exitSharedDeviceMode,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
