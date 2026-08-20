import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../config/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import authService from '../../api/authService';
import { queryClient } from '../../api/queryClient';
import { firestoreService } from '../../api/firestoreService';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

jest.mock('../../config/firebaseConfig', () => ({
  auth: {
    currentUser: null,
  },
}));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
}));

jest.mock('../../api/authService', () => ({
  getCurrentUser: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  clearChildContext: jest.fn(),
  getChildContext: jest.fn().mockResolvedValue({ success: false }),
}));

jest.mock('../../api/apiClient', () => ({
  forceRefreshToken: jest.fn(),
}));

jest.mock('../../api/queryClient', () => ({
  queryClient: {
    cancelQueries: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn(),
  },
}));

jest.mock('../../api/firestoreService', () => ({
  firestoreService: {
    cache: {
      clear: jest.fn(),
    },
  },
}));

describe('AuthContext Caching Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load user from cache when network fetch fails', async () => {
    const mockFirebaseUser = {
      uid: 'test-uid',
      getIdToken: jest.fn().mockResolvedValue('test-token'),
    };

    const mockCachedUser = {
      uid: 'test-uid',
      role: 'parent',
      displayName: 'Cached User',
    };

    // Setup mocks
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockFirebaseUser);
      return jest.fn(); // unsubscribe
    });

    authService.getCurrentUser.mockRejectedValue(new Error('Network error'));
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockCachedUser));

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for the effect to run
    await act(async () => {});

    expect(result.current.user).toEqual(mockCachedUser);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('cachedUserProfile');
  });

  it('should persist user to cache on successful fetch', async () => {
    const mockFirebaseUser = {
      uid: 'test-uid',
      getIdToken: jest.fn().mockResolvedValue('test-token'),
    };

    const mockUserProfile = {
      uid: 'test-uid',
      role: 'parent',
      success: true,
      user: { uid: 'test-uid', role: 'parent' }
    };

    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockFirebaseUser);
      return jest.fn();
    });

    authService.getCurrentUser.mockResolvedValue(mockUserProfile);

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {});

    expect(result.current.user).toEqual(mockUserProfile.user);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'cachedUserProfile',
      JSON.stringify(mockUserProfile.user)
    );
  });

  it('should clear cache on logout', async () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logout();
    });

    expect(authService.logout).toHaveBeenCalled();
    // onAuthStateChanged will be triggered with null when logout happens in a real app,
    // but here we are testing the logout method in the context.
    // The current logout method doesn't explicitly clear cachedUserProfile, 
    // it relies on onAuthStateChanged(null) which we added to clear it.
    
    // Let's simulate the null state transition
    let authCallback;
    onAuthStateChanged.mockImplementation((auth, callback) => {
      authCallback = callback;
      return jest.fn();
    });

    renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      authCallback(null);
    });

    expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
      'authToken',
      'cachedUserProfile',
      'childContext',
    ]);
    expect(queryClient.cancelQueries).toHaveBeenCalled();
    expect(queryClient.clear).toHaveBeenCalled();
    expect(firestoreService.cache.clear).toHaveBeenCalled();
  });
});
