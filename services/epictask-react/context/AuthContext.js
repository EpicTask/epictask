import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import authService from '../api/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          await AsyncStorage.setItem('authToken', token);
          
          // Fetch user profile from user management service
          const userProfileResponse = await authService.getCurrentUser(firebaseUser.uid);
          
          // Handle the response structure properly
          if (userProfileResponse && userProfileResponse.success && userProfileResponse.user) {
            setUser(userProfileResponse.user);
          } else if (userProfileResponse && userProfileResponse.user) {
            // Handle case where response doesn't have success flag but has user data
            setUser(userProfileResponse.user);
          } else {
            // If profile fetch fails, still set basic user info from Firebase
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
            });
          }
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          // If profile fetch fails, still set basic user info from Firebase
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
          });
        }
      } else {
        await AsyncStorage.removeItem('authToken');
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
      const currentFirebaseUser = auth().currentUser;
      if (currentFirebaseUser) {
        const updatedUser = await authService.getCurrentUser(currentFirebaseUser.uid);
        setUser(updatedUser);
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
      clearError
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
