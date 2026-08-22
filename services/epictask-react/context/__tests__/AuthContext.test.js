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
  clearChildContext: jest.fn().mockResolvedValue({ success: true }),
  getChildContext: jest.fn().mockResolvedValue({ success: false }),
  switchToChildContext: jest.fn(),
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

describe('Shared device mode', () => {
  const parentProfile = { uid: 'parent-1', role: 'parent', displayName: 'Sam' };

  const renderAsParent = async () => {
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback({ uid: 'parent-1', getIdToken: jest.fn().mockResolvedValue('t') });
      return jest.fn();
    });
    authService.getCurrentUser.mockResolvedValue({
      success: true,
      user: parentProfile,
    });

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {});
    return result;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts a parent in parent mode and drops any stored child session', async () => {
    const result = await renderAsParent();

    // A child session must not survive an app restart — an unattended device
    // should never reopen straight into the kid's profile.
    expect(authService.clearChildContext).toHaveBeenCalled();
    expect(result.current.isSharedDeviceMode).toBe(false);
    expect(result.current.effectiveUserId).toBe('parent-1');
  });

  it('switches identity on a correct PIN without changing the signed-in user', async () => {
    const result = await renderAsParent();

    authService.switchToChildContext.mockResolvedValue({
      success: true,
      child: { displayName: 'Ada' },
      context: {
        childId: 'child-1',
        childName: 'Ada',
        childAge: 8,
        expires: Date.now() + 15 * 60 * 1000,
      },
    });

    let outcome;
    await act(async () => {
      outcome = await result.current.switchToChildContext('child-1', '2468');
    });

    expect(outcome.success).toBe(true);
    expect(result.current.isSharedDeviceMode).toBe(true);
    // Data reads follow the child...
    expect(result.current.effectiveUserId).toBe('child-1');
    expect(result.current.childAge).toBe(8);
    expect(result.current.activeChildContext.childName).toBe('Ada');
    // ...but the session is still the parent's.
    expect(result.current.user.uid).toBe('parent-1');
  });

  it('reports a wrong PIN instead of throwing', async () => {
    const result = await renderAsParent();
    authService.switchToChildContext.mockResolvedValue({
      success: false,
      error: 'That PIN isn\'t right. 3 tries left.',
    });

    let outcome;
    await act(async () => {
      outcome = await result.current.switchToChildContext('child-1', '0000');
    });

    expect(outcome.success).toBe(false);
    expect(outcome.error).toMatch('3 tries left');
    expect(result.current.isSharedDeviceMode).toBe(false);
    expect(result.current.effectiveUserId).toBe('parent-1');
  });

  it('returns to the parent identity on exit', async () => {
    const result = await renderAsParent();
    authService.switchToChildContext.mockResolvedValue({
      success: true,
      child: {},
      context: {
        childId: 'child-1',
        childName: 'Ada',
        childAge: 8,
        expires: Date.now() + 15 * 60 * 1000,
      },
    });

    await act(async () => {
      await result.current.switchToChildContext('child-1', '2468');
    });
    expect(result.current.effectiveUserId).toBe('child-1');

    await act(async () => {
      result.current.exitSharedDeviceMode();
    });

    expect(result.current.isSharedDeviceMode).toBe(false);
    expect(result.current.activeChildContext).toBeNull();
    expect(result.current.effectiveUserId).toBe('parent-1');
    expect(authService.clearChildContext).toHaveBeenCalled();
  });

  it('expires the child session on its own and returns to parent mode', async () => {
    jest.useFakeTimers();
    try {
      const result = await renderAsParent();
      authService.switchToChildContext.mockResolvedValue({
        success: true,
        child: {},
        context: {
          childId: 'child-1',
          childName: 'Ada',
          childAge: 8,
          expires: Date.now() + 1000,
        },
      });

      await act(async () => {
        await result.current.switchToChildContext('child-1', '2468');
      });
      expect(result.current.isSharedDeviceMode).toBe(true);

      await act(async () => {
        jest.advanceTimersByTime(1500);
      });

      expect(result.current.isSharedDeviceMode).toBe(false);
      expect(result.current.effectiveUserId).toBe('parent-1');
    } finally {
      jest.useRealTimers();
    }
  });
});
