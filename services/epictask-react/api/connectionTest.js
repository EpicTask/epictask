import apiClient from './apiClient';
import authService from './authService';
import auth from '@react-native-firebase/auth';

export const connectionTest = {
  // Test basic API connectivity
  testApiConnection: async () => {
    try {
      const response = await fetch('https://user-management-5wpxgn35iq-uc.a.run.app/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const text = await response.text();
        return {
          success: true,
          message: 'API connection successful',
          data: text
        };
      } else {
        return {
          success: false,
          message: `API connection failed with status: ${response.status}`,
          error: response.statusText
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'API connection failed',
        error: error.message
      };
    }
  },

  // Test Firebase configuration
  testFirebaseConnection: async () => {
    try {
      // Check if Firebase is properly initialized
      if (!auth) {
        return {
          success: false,
          message: 'Firebase auth not initialized'
        };
      }

      // Check current auth state
      const currentUser = auth().currentUser;
      return {
        success: true,
        message: 'Firebase connection successful',
        data: {
          isAuthenticated: !!currentUser,
          user: currentUser ? {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName
          } : null
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Firebase connection failed',
        error: error.message
      };
    }
  },

  // Test authenticated API call (requires user to be logged in)
  testAuthenticatedApiCall: async () => {
    try {
      const response = await apiClient.get('/users/me');
      return {
        success: true,
        message: 'Authenticated API call successful',
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Authenticated API call failed',
        error: error.response?.data?.error || error.message,
        status: error.response?.status
      };
    }
  },

  // Test user registration (use with caution - creates actual user)
  testUserRegistration: async (testEmail, testPassword, displayName = 'Test User') => {
    try {
      const result = await authService.register(testEmail, testPassword, displayName, 'child');
      
      // Clean up - delete the test user
      try {
        await authService.deleteAccount();
      } catch (cleanupError) {
        console.warn('Failed to cleanup test user:', cleanupError);
      }

      return {
        success: true,
        message: 'User registration test successful',
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: 'User registration test failed',
        error: error.message
      };
    }
  },

  // Run comprehensive connection tests
  runAllTests: async () => {
    console.log('🔍 Starting connection tests...');
    
    const results = {
      apiConnection: await connectionTest.testApiConnection(),
      firebaseConnection: await connectionTest.testFirebaseConnection(),
      authenticatedApiCall: null
    };

    // Only test authenticated call if user is logged in
    if (auth().currentUser) {
      results.authenticatedApiCall = await connectionTest.testAuthenticatedApiCall();
    } else {
      results.authenticatedApiCall = {
        success: false,
        message: 'Skipped - no authenticated user',
        skipped: true
      };
    }

    // Summary
    const successCount = Object.values(results).filter(r => r.success).length;
    const totalTests = Object.values(results).filter(r => !r.skipped).length;
    
    console.log(`✅ Connection tests completed: ${successCount}/${totalTests} passed`);
    
    return {
      summary: {
        passed: successCount,
        total: totalTests,
        success: successCount === totalTests
      },
      results
    };
  }
};

export default connectionTest;
