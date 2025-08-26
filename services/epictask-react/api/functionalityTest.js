import taskService from './taskService';
import authService from './authService';

export const functionalityTest = {
  // Test task summary endpoint
  testTaskSummary: async (userId) => {
    try {
      const summary = await taskService.getTaskSummary(userId);
      if (summary && typeof summary.completed === 'number') {
        return { success: true, message: 'Task summary test passed', data: summary };
      }
      return { success: false, message: 'Task summary test failed: Invalid data format' };
    } catch (error) {
      return { success: false, message: 'Task summary test failed', error: error.message };
    }
  },

  // Test recent tasks endpoint
  testRecentTasks: async (userId) => {
    try {
      const tasks = await taskService.getRecentTasks(userId);
      if (Array.isArray(tasks)) {
        return { success: true, message: 'Recent tasks test passed', data: tasks };
      }
      return { success: false, message: 'Recent tasks test failed: Invalid data format' };
    } catch (error) {
      return { success: false, message: 'Recent tasks test failed', error: error.message };
    }
  },

  // Test user rewards endpoint
  testUserRewards: async (userId) => {
    try {
      const rewards = await taskService.getUserRewards(userId);
      if (rewards && typeof rewards.tokens_earned === 'number') {
        return { success: true, message: 'User rewards test passed', data: rewards };
      }
      return { success: false, message: 'User rewards test failed: Invalid data format' };
    } catch (error) {
      return { success: false, message: 'User rewards test failed', error: error.message };
    }
  },

  // Test global leaderboard endpoint
  testGlobalLeaderboard: async () => {
    try {
      const leaderboard = await taskService.getGlobalLeaderboard();
      if (Array.isArray(leaderboard)) {
        return { success: true, message: 'Global leaderboard test passed', data: leaderboard };
      }
      return { success: false, message: 'Global leaderboard test failed: Invalid data format' };
    } catch (error) {
      return { success: false, message: 'Global leaderboard test failed', error: error.message };
    }
  },

  // Test children rewards endpoint
  testChildrenRewards: async (parentId) => {
    try {
      const rewards = await taskService.getChildrenRewards(parentId);
      if (Array.isArray(rewards)) {
        return { success: true, message: 'Children rewards test passed', data: rewards };
      }
      return { success: false, message: 'Children rewards test failed: Invalid data format' };
    } catch (error) {
      return { success: false, message: 'Children rewards test failed', error: error.message };
    }
  },

  // Run all functionality tests
  runAllTests: async (user) => {
    if (!user) {
      return { summary: { success: false, message: 'User not authenticated' }, results: {} };
    }

    console.log('🔍 Starting functionality tests...');
    
    const results = {
      taskSummary: await functionalityTest.testTaskSummary(user.uid),
      recentTasks: await functionalityTest.testRecentTasks(user.uid),
      userRewards: await functionalityTest.testUserRewards(user.uid),
      globalLeaderboard: await functionalityTest.testGlobalLeaderboard(),
      childrenRewards: await functionalityTest.testChildrenRewards(user.uid),
    };

    const successCount = Object.values(results).filter(r => r.success).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`✅ Functionality tests completed: ${successCount}/${totalTests} passed`);
    
    return {
      summary: {
        passed: successCount,
        total: totalTests,
        success: successCount === totalTests,
      },
      results,
    };
  },
};

export default functionalityTest;
