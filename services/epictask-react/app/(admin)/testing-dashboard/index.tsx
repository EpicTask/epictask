import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import { TESTING_CONFIG } from '@/constants/TestingConfig';
import { responsiveWidth, responsiveFontSize, responsiveHeight } from 'react-native-responsive-dimensions';
import EnvironmentToggle from '@/components/testing/EnvironmentToggle';
import connectionTest from '@/api/connectionTest';
import functionalityTest from '@/api/functionalityTest';
import { metricsService } from '@/api/metricsService';
import { useAuth } from '@/context/AuthContext';

interface MetricCard {
  title: string;
  value: number | string;
  subtitle?: string;
  color?: string;
}

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message?: string;
  duration?: number;
}

const MetricsCard: React.FC<MetricCard> = ({ title, value, subtitle, color = COLORS.primary }) => (
  <View style={[styles.metricCard, { borderLeftColor: color }]}>
    <Text style={styles.metricTitle}>{title}</Text>
    <Text style={[styles.metricValue, { color }]}>{value}</Text>
    {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
  </View>
);

const TestResultCard: React.FC<{ test: TestResult; onRun: () => void }> = ({ test, onRun }) => (
  <View style={styles.testCard}>
    <View style={styles.testHeader}>
      <Text style={styles.testName}>{test.name}</Text>
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(test.status) }]}>
        <Text style={styles.statusText}>{test.status.toUpperCase()}</Text>
      </View>
    </View>
    {test.message && <Text style={styles.testMessage}>{test.message}</Text>}
    {test.duration && <Text style={styles.testDuration}>Duration: {test.duration}ms</Text>}
    <TouchableOpacity style={styles.runButton} onPress={onRun}>
      <Text style={styles.runButtonText}>Run Test</Text>
    </TouchableOpacity>
  </View>
);

const getStatusColor = (status: string) => {
  switch (status) {
    case 'passed': return '#44AA44';
    case 'failed': return '#FF4444';
    case 'running': return '#FFA500';
    default: return COLORS.grey;
  }
};

function TestingDashboard() {
  const { user } = useAuth();
  const [currentEnvironment, setCurrentEnvironment] = useState('test');
  const [metrics, setMetrics] = useState<MetricCard[]>([
    { title: 'Total Users', value: 0, subtitle: 'Registered users' },
    { title: 'Total Tasks', value: 0, subtitle: 'All tasks created' },
    { title: 'Transactions', value: 0, subtitle: 'XRPL transactions' },
    { title: 'Events', value: 0, subtitle: 'System events' },
  ]);
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'API Connection Test', status: 'pending' },
    { name: 'Firebase Connection Test', status: 'pending' },
    { name: 'User Authentication Test', status: 'pending' },
    { name: 'Task Management Test', status: 'pending' },
    { name: 'Rewards System Test', status: 'pending' },
  ]);
  const [isRunningAllTests, setIsRunningAllTests] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, [currentEnvironment]);

  const loadMetrics = async () => {
    try {
      const allMetrics = await metricsService.getAllMetrics(currentEnvironment);
      
      setMetrics([
        { 
          title: 'Total Users', 
          value: allMetrics.users.total_users, 
          subtitle: 'Registered users', 
          color: COLORS.primary 
        },
        { 
          title: 'Total Tasks', 
          value: allMetrics.tasks.total_tasks, 
          subtitle: 'All tasks created', 
          color: COLORS.purple 
        },
        { 
          title: 'Transactions', 
          value: allMetrics.transactions.total_transactions, 
          subtitle: 'XRPL transactions', 
          color: COLORS.secondary 
        },
        { 
          title: 'Events', 
          value: allMetrics.events.total_events, 
          subtitle: 'System events', 
          color: COLORS.light_green 
        },
      ]);
    } catch (error) {
      console.error('Failed to load metrics:', error);
      // Fallback to default values
      setMetrics([
        { title: 'Total Users', value: 0, subtitle: 'Registered users', color: COLORS.primary },
        { title: 'Total Tasks', value: 0, subtitle: 'All tasks created', color: COLORS.purple },
        { title: 'Transactions', value: 0, subtitle: 'XRPL transactions', color: COLORS.secondary },
        { title: 'Events', value: 0, subtitle: 'System events', color: COLORS.light_green },
      ]);
    }
  };

  const runIndividualTest = async (testIndex: number) => {
    const updatedTests = [...tests];
    updatedTests[testIndex].status = 'running';
    setTests(updatedTests);

    const startTime = Date.now();
    let result;

    try {
      switch (testIndex) {
        case 0: // API Connection Test
          result = await connectionTest.testApiConnection();
          break;
        case 1: // Firebase Connection Test
          result = await connectionTest.testFirebaseConnection();
          break;
        case 2: // User Authentication Test
          result = await connectionTest.testAuthenticatedApiCall();
          break;
        case 3: // Task Management Test
          result = await functionalityTest.testTaskSummary(user?.uid);
          break;
        case 4: // Rewards System Test
          result = await functionalityTest.testUserRewards(user?.uid);
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
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      updatedTests[testIndex] = {
        ...updatedTests[testIndex],
        status: 'failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration,
      };
    }

    setTests(updatedTests);
  };

  const runAllTests = async () => {
    setIsRunningAllTests(true);
    
    for (let i = 0; i < tests.length; i++) {
      await runIndividualTest(i);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsRunningAllTests(false);
    
    const passedTests = tests.filter(t => t.status === 'passed').length;
    Alert.alert(
      'Tests Completed',
      `${passedTests}/${tests.length} tests passed`,
      [{ text: 'OK' }]
    );
  };

  const clearTestData = () => {
    Alert.alert(
      'Clear Test Data',
      'This will reset all test results. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            const resetTests = tests.map(test => ({ ...test, status: 'pending' as const, message: undefined, duration: undefined }));
            setTests(resetTests);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Environment Toggle */}
        <EnvironmentToggle onEnvironmentChange={setCurrentEnvironment} />

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
              onPress={runAllTests}
              disabled={isRunningAllTests}
            >
              {isRunningAllTests ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.actionButtonText}>Run All Tests</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: COLORS.grey }]}
              onPress={clearTestData}
            >
              <Text style={styles.actionButtonText}>Clear Test Data</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* System Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Metrics</Text>
          <View style={styles.metricsGrid}>
            {metrics.map((metric, index) => (
              <MetricsCard key={index} {...metric} />
            ))}
          </View>
        </View>

        {/* Test Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Individual Tests</Text>
          <View style={styles.testsContainer}>
            {tests.map((test, index) => (
              <TestResultCard
                key={index}
                test={test}
                onRun={() => runIndividualTest(index)}
              />
            ))}
          </View>
        </View>

        {/* Navigation to Detailed Views */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detailed Views</Text>
          <View style={styles.navigationButtons}>
            <Link href="/(admin)/testing-dashboard/metrics/users" asChild>
              <TouchableOpacity style={styles.navButton}>
                <Text style={styles.navButtonText}>User Metrics</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/(admin)/testing-dashboard/metrics/tasks" asChild>
              <TouchableOpacity style={styles.navButton}>
                <Text style={styles.navButtonText}>Task Metrics</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/(admin)/testing-dashboard/tests/connectivity" asChild>
              <TouchableOpacity style={styles.navButton}>
                <Text style={styles.navButtonText}>Connectivity Tests</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
    fontSize: responsiveFontSize(2.5),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricTitle: {
    fontSize: responsiveFontSize(1.6),
    color: '#666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: responsiveFontSize(2.8),
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: responsiveFontSize(1.4),
    color: '#999',
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
    alignItems: 'center',
    marginBottom: 8,
  },
  testName: {
    fontSize: responsiveFontSize(1.8),
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: 'white',
    fontSize: responsiveFontSize(1.2),
    fontWeight: '600',
  },
  testMessage: {
    fontSize: responsiveFontSize(1.4),
    color: '#666',
    marginBottom: 4,
  },
  testDuration: {
    fontSize: responsiveFontSize(1.2),
    color: '#999',
    marginBottom: 8,
  },
  runButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  runButtonText: {
    color: 'white',
    fontSize: responsiveFontSize(1.6),
    fontWeight: '600',
  },
  navigationButtons: {
    gap: 12,
  },
  navButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  navButtonText: {
    color: COLORS.primary,
    fontSize: responsiveFontSize(1.8),
    fontWeight: '600',
  },
});

export default TestingDashboard;
