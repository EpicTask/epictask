import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/Colors';
import { responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import connectionTest from '@/api/connectionTest';
import EnvironmentToggle from '@/components/testing/EnvironmentToggle';

interface ConnectivityTest {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message?: string;
  duration?: number;
  lastRun?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'passed': return '#44AA44';
    case 'failed': return '#FF4444';
    case 'running': return '#FFA500';
    default: return COLORS.grey;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'passed': return '✓';
    case 'failed': return '✗';
    case 'running': return '⟳';
    default: return '○';
  }
};

const TestCard: React.FC<{ 
  test: ConnectivityTest; 
  onRun: () => void; 
  disabled?: boolean;
}> = ({ test, onRun, disabled = false }) => (
  <View style={styles.testCard}>
    <View style={styles.testHeader}>
      <View style={styles.testInfo}>
        <View style={styles.testTitleRow}>
          <Text style={[styles.statusIcon, { color: getStatusColor(test.status) }]}>
            {getStatusIcon(test.status)}
          </Text>
          <Text style={styles.testName}>{test.name}</Text>
        </View>
        <Text style={styles.testDescription}>{test.description}</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(test.status) }]}>
        <Text style={styles.statusText}>{test.status.toUpperCase()}</Text>
      </View>
    </View>
    
    {test.message && (
      <View style={styles.messageContainer}>
        <Text style={[styles.testMessage, { 
          color: test.status === 'failed' ? '#FF4444' : '#666' 
        }]}>
          {test.message}
        </Text>
      </View>
    )}
    
    <View style={styles.testFooter}>
      <View style={styles.testMeta}>
        {test.duration && (
          <Text style={styles.testDuration}>Duration: {test.duration}ms</Text>
        )}
        {test.lastRun && (
          <Text style={styles.lastRun}>
            Last run: {new Date(test.lastRun).toLocaleTimeString()}
          </Text>
        )}
      </View>
      
      <TouchableOpacity 
        style={[styles.runButton, disabled && styles.disabledButton]} 
        onPress={onRun}
        disabled={disabled}
      >
        {test.status === 'running' ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.runButtonText}>Run Test</Text>
        )}
      </TouchableOpacity>
    </View>
  </View>
);

const ConnectivityTestsScreen: React.FC = () => {
  const [currentEnvironment, setCurrentEnvironment] = useState('test');
  const [tests, setTests] = useState<ConnectivityTest[]>([
    {
      id: 'api_connection',
      name: 'API Connection Test',
      description: 'Tests basic connectivity to all microservices',
      status: 'pending',
    },
    {
      id: 'firebase_connection',
      name: 'Firebase Connection Test',
      description: 'Tests connection to Firebase/Firestore database',
      status: 'pending',
    },
    {
      id: 'user_management',
      name: 'User Management Service',
      description: 'Tests connectivity to user management microservice',
      status: 'pending',
    },
    {
      id: 'task_management',
      name: 'Task Management Service',
      description: 'Tests connectivity to task management microservice',
      status: 'pending',
    },
    {
      id: 'xrpl_service',
      name: 'XRPL Service',
      description: 'Tests connectivity to XRPL blockchain service',
      status: 'pending',
    },
    {
      id: 'auth_service',
      name: 'Authentication Service',
      description: 'Tests authenticated API calls and token validation',
      status: 'pending',
    },
  ]);
  const [isRunningAll, setIsRunningAll] = useState(false);

  const runIndividualTest = async (testId: string) => {
    const testIndex = tests.findIndex(t => t.id === testId);
    if (testIndex === -1) return;

    const updatedTests = [...tests];
    updatedTests[testIndex] = {
      ...updatedTests[testIndex],
      status: 'running',
      message: undefined,
      duration: undefined,
    };
    setTests(updatedTests);

    const startTime = Date.now();
    let result;

    try {
      switch (testId) {
        case 'api_connection':
          result = await connectionTest.testApiConnection();
          break;
        case 'firebase_connection':
          result = await connectionTest.testFirebaseConnection();
          break;
        case 'user_management':
          result = await connectionTest.testUserManagementService();
          break;
        case 'task_management':
          result = await connectionTest.testTaskManagementService();
          break;
        case 'xrpl_service':
          result = await connectionTest.testXRPLService();
          break;
        case 'auth_service':
          result = await connectionTest.testAuthenticatedApiCall();
          break;
        default:
          result = { success: false, message: 'Unknown test' };
      }

      const duration = Date.now() - startTime;
      updatedTests[testIndex] = {
        ...updatedTests[testIndex],
        status: result.success ? 'passed' : 'failed',
        message: result.message,
        duration,
        lastRun: new Date().toISOString(),
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      updatedTests[testIndex] = {
        ...updatedTests[testIndex],
        status: 'failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration,
        lastRun: new Date().toISOString(),
      };
    }

    setTests(updatedTests);
  };

  const runAllTests = async () => {
    setIsRunningAll(true);
    
    for (const test of tests) {
      await runIndividualTest(test.id);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsRunningAll(false);
    
    const passedTests = tests.filter(t => t.status === 'passed').length;
    Alert.alert(
      'Connectivity Tests Completed',
      `${passedTests}/${tests.length} tests passed`,
      [{ text: 'OK' }]
    );
  };

  const clearResults = () => {
    Alert.alert(
      'Clear Test Results',
      'This will reset all connectivity test results. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            const resetTests = tests.map(test => ({
              ...test,
              status: 'pending' as const,
              message: undefined,
              duration: undefined,
              lastRun: undefined,
            }));
            setTests(resetTests);
          }
        }
      ]
    );
  };

  const getOverallStatus = () => {
    const passedCount = tests.filter(t => t.status === 'passed').length;
    const failedCount = tests.filter(t => t.status === 'failed').length;
    const runningCount = tests.filter(t => t.status === 'running').length;
    
    if (runningCount > 0) return { status: 'running', text: 'Tests Running...' };
    if (failedCount > 0) return { status: 'failed', text: `${failedCount} Failed` };
    if (passedCount === tests.length) return { status: 'passed', text: 'All Tests Passed' };
    return { status: 'pending', text: 'Ready to Test' };
  };

  const overallStatus = getOverallStatus();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Environment Toggle */}
        <EnvironmentToggle onEnvironmentChange={setCurrentEnvironment} />

        {/* Overall Status */}
        <View style={styles.section}>
          <View style={[styles.overallStatusCard, { borderLeftColor: getStatusColor(overallStatus.status) }]}>
            <Text style={styles.overallStatusTitle}>Connectivity Status</Text>
            <Text style={[styles.overallStatusText, { color: getStatusColor(overallStatus.status) }]}>
              {overallStatus.text}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
              onPress={runAllTests}
              disabled={isRunningAll}
            >
              {isRunningAll ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.actionButtonText}>Run All Tests</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: COLORS.grey }]}
              onPress={clearResults}
            >
              <Text style={styles.actionButtonText}>Clear Results</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Individual Tests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Individual Tests</Text>
          <View style={styles.testsContainer}>
            {tests.map((test) => (
              <TestCard
                key={test.id}
                test={test}
                onRun={() => runIndividualTest(test.id)}
                disabled={isRunningAll || test.status === 'running'}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    padding: responsiveWidth(4),
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: responsiveFontSize(2.2),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  overallStatusCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  overallStatusTitle: {
    fontSize: responsiveFontSize(1.8),
    color: '#666',
    marginBottom: 8,
  },
  overallStatusText: {
    fontSize: responsiveFontSize(2.4),
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: responsiveFontSize(1.8),
    fontWeight: '600',
  },
  testsContainer: {
    gap: 12,
  },
  testCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  testInfo: {
    flex: 1,
    marginRight: 12,
  },
  testTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusIcon: {
    fontSize: responsiveFontSize(2),
    marginRight: 8,
    fontWeight: 'bold',
  },
  testName: {
    fontSize: responsiveFontSize(1.8),
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  testDescription: {
    fontSize: responsiveFontSize(1.4),
    color: '#666',
    lineHeight: 20,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 60,
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: responsiveFontSize(1.2),
    fontWeight: '600',
  },
  messageContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  testMessage: {
    fontSize: responsiveFontSize(1.4),
    lineHeight: 18,
  },
  testFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testMeta: {
    flex: 1,
  },
  testDuration: {
    fontSize: responsiveFontSize(1.2),
    color: '#999',
    marginBottom: 2,
  },
  lastRun: {
    fontSize: responsiveFontSize(1.2),
    color: '#999',
  },
  runButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.grey,
    opacity: 0.6,
  },
  runButtonText: {
    color: 'white',
    fontSize: responsiveFontSize(1.6),
    fontWeight: '600',
  },
});

export default ConnectivityTestsScreen;
