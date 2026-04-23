import React, { createContext, useState, useEffect, useContext } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import authService from '../api/authService';
import { forceRefreshToken } from '../api/apiClient';
import { queryClient } from '../api/queryClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSharedDeviceMode, setIsSharedDeviceMode] = useState(false);

  const enterSharedDeviceMode = () => setIsSharedDeviceMode(true);
  const exitSharedDeviceMode = () => {
    setIsSharedDeviceMode(false);
    authService.clearChildContext().catch(() => {});
  };

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
      }
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          await AsyncStorage.setItem('authToken', token);
          
          // Fetch user profile from user management service
          const userProfileResponse = await authService.getCurrentUser(firebaseUser.uid);
          
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
          console.error("Failed to fetch user profile:", error);
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
      } else {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('cachedUserProfile');
        setUser(null);
      }
      setLoading(false);
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
      queryClient.clear();
      setUser(null);
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
      childAge: user?.age,
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
