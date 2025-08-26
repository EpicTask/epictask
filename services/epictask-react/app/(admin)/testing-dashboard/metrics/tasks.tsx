import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/Colors';
import { responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import { metricsService } from '@/api/metricsService';
import EnvironmentToggle from '@/components/testing/EnvironmentToggle';

interface TaskMetrics {
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  cancelled_tasks: number;
  completion_rate: number;
  average_duration_hours: number;
  tasks_by_user: Array<{
    user_id: string;
    tasks_created: number;
  }>;
  last_updated: string;
}

const MetricRow: React.FC<{ label: string; value: string | number; color?: string }> = ({ 
  label, 
  value, 
  color = COLORS.primary 
}) => (
  <View style={styles.metricRow}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={[styles.metricValue, { color }]}>{value}</Text>
  </View>
);

const TaskMetricsScreen: React.FC = () => {
  const [metrics, setMetrics] = useState<TaskMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentEnvironment, setCurrentEnvironment] = useState('test');

  useEffect(() => {
    loadMetrics();
  }, [currentEnvironment]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await metricsService.getTaskMetrics(currentEnvironment);
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load task metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMetrics();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value * 100)}%`;
  };

  if (loading && !metrics) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading task metrics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Environment Toggle */}
        <EnvironmentToggle onEnvironmentChange={setCurrentEnvironment} />

        {/* Task Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Task Overview</Text>
          <View style={styles.card}>
            <MetricRow label="Total Tasks" value={metrics?.total_tasks || 0} color={COLORS.primary} />
            <MetricRow label="Completed Tasks" value={metrics?.completed_tasks || 0} color={COLORS.light_green} />
            <MetricRow label="In Progress Tasks" value={metrics?.in_progress_tasks || 0} color={COLORS.secondary} />
            <MetricRow label="Cancelled Tasks" value={metrics?.cancelled_tasks || 0} color={COLORS.grey} />
          </View>
        </View>

        {/* Task Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Task Performance</Text>
          <View style={styles.card}>
            <MetricRow 
              label="Completion Rate" 
              value={formatPercentage(metrics?.completion_rate || 0)} 
              color={COLORS.light_green} 
            />
            <MetricRow 
              label="Average Duration" 
              value={`${metrics?.average_duration_hours || 0} hours`} 
              color={COLORS.purple} 
            />
          </View>
        </View>

        {/* Task Status Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Task Status Distribution</Text>
          <View style={styles.card}>
            <View style={styles.distributionContainer}>
              <View style={styles.distributionItem}>
                <View style={[styles.distributionBar, { 
                  width: `${((metrics?.completed_tasks || 0) / (metrics?.total_tasks || 1)) * 100}%`,
                  backgroundColor: COLORS.light_green 
                }]} />
                <Text style={styles.distributionLabel}>
                  Completed: {metrics?.completed_tasks || 0} ({Math.round(((metrics?.completed_tasks || 0) / (metrics?.total_tasks || 1)) * 100)}%)
                </Text>
              </View>
              <View style={styles.distributionItem}>
                <View style={[styles.distributionBar, { 
                  width: `${((metrics?.in_progress_tasks || 0) / (metrics?.total_tasks || 1)) * 100}%`,
                  backgroundColor: COLORS.secondary 
                }]} />
                <Text style={styles.distributionLabel}>
                  In Progress: {metrics?.in_progress_tasks || 0} ({Math.round(((metrics?.in_progress_tasks || 0) / (metrics?.total_tasks || 1)) * 100)}%)
                </Text>
              </View>
              <View style={styles.distributionItem}>
                <View style={[styles.distributionBar, { 
                  width: `${((metrics?.cancelled_tasks || 0) / (metrics?.total_tasks || 1)) * 100}%`,
                  backgroundColor: COLORS.grey 
                }]} />
                <Text style={styles.distributionLabel}>
                  Cancelled: {metrics?.cancelled_tasks || 0} ({Math.round(((metrics?.cancelled_tasks || 0) / (metrics?.total_tasks || 1)) * 100)}%)
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Top Task Creators */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Task Creators</Text>
          <View style={styles.card}>
            {metrics?.tasks_by_user?.slice(0, 5).map((user, index) => (
              <MetricRow 
                key={user.user_id}
                label={`User ${index + 1} (${user.user_id.substring(0, 8)}...)`}
                value={`${user.tasks_created} tasks`}
                color={index === 0 ? COLORS.primary : COLORS.secondary}
              />
            ))}
          </View>
        </View>

        {/* Last Updated */}
        <View style={styles.section}>
          <Text style={styles.lastUpdated}>
            Last Updated: {metrics?.last_updated ? formatDate(metrics.last_updated) : 'Never'}
          </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: responsiveFontSize(1.8),
    color: COLORS.grey,
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
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  metricLabel: {
    fontSize: responsiveFontSize(1.8),
    color: '#666',
    flex: 1,
  },
  metricValue: {
    fontSize: responsiveFontSize(2),
    fontWeight: 'bold',
  },
  distributionContainer: {
    gap: 16,
  },
  distributionItem: {
    gap: 8,
  },
  distributionBar: {
    height: 8,
    borderRadius: 4,
  },
  distributionLabel: {
    fontSize: responsiveFontSize(1.6),
    color: '#666',
  },
  lastUpdated: {
    fontSize: responsiveFontSize(1.4),
    color: COLORS.grey,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default TaskMetricsScreen;
