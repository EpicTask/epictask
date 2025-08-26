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

interface UserMetrics {
  total_users: number;
  active_users: number;
  parent_users: number;
  child_users: number;
  registration_trends: {
    daily: number;
    weekly: number;
    monthly: number;
  };
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

const UserMetricsScreen: React.FC = () => {
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentEnvironment, setCurrentEnvironment] = useState('test');

  useEffect(() => {
    loadMetrics();
  }, [currentEnvironment]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await metricsService.getUserMetrics(currentEnvironment);
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load user metrics:', error);
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

  if (loading && !metrics) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading user metrics...</Text>
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

        {/* Overview Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Overview</Text>
          <View style={styles.card}>
            <MetricRow label="Total Users" value={metrics?.total_users || 0} color={COLORS.primary} />
            <MetricRow label="Active Users (30 days)" value={metrics?.active_users || 0} color={COLORS.secondary} />
            <MetricRow label="Parent Users" value={metrics?.parent_users || 0} color={COLORS.purple} />
            <MetricRow label="Child Users" value={metrics?.child_users || 0} color={COLORS.light_green} />
          </View>
        </View>

        {/* Registration Trends */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Registration Trends</Text>
          <View style={styles.card}>
            <MetricRow 
              label="Daily Registrations" 
              value={metrics?.registration_trends.daily || 0} 
              color={COLORS.primary} 
            />
            <MetricRow 
              label="Weekly Registrations" 
              value={metrics?.registration_trends.weekly || 0} 
              color={COLORS.secondary} 
            />
            <MetricRow 
              label="Monthly Registrations" 
              value={metrics?.registration_trends.monthly || 0} 
              color={COLORS.purple} 
            />
          </View>
        </View>

        {/* User Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Distribution</Text>
          <View style={styles.card}>
            <View style={styles.distributionContainer}>
              <View style={styles.distributionItem}>
                <View style={[styles.distributionBar, { 
                  width: `${((metrics?.parent_users || 0) / (metrics?.total_users || 1)) * 100}%`,
                  backgroundColor: COLORS.purple 
                }]} />
                <Text style={styles.distributionLabel}>
                  Parents: {metrics?.parent_users || 0} ({Math.round(((metrics?.parent_users || 0) / (metrics?.total_users || 1)) * 100)}%)
                </Text>
              </View>
              <View style={styles.distributionItem}>
                <View style={[styles.distributionBar, { 
                  width: `${((metrics?.child_users || 0) / (metrics?.total_users || 1)) * 100}%`,
                  backgroundColor: COLORS.light_green 
                }]} />
                <Text style={styles.distributionLabel}>
                  Children: {metrics?.child_users || 0} ({Math.round(((metrics?.child_users || 0) / (metrics?.total_users || 1)) * 100)}%)
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Activity Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Metrics</Text>
          <View style={styles.card}>
            <MetricRow 
              label="Active Rate" 
              value={`${Math.round(((metrics?.active_users || 0) / (metrics?.total_users || 1)) * 100)}%`} 
              color={COLORS.secondary} 
            />
            <MetricRow 
              label="Inactive Users" 
              value={(metrics?.total_users || 0) - (metrics?.active_users || 0)} 
              color={COLORS.grey} 
            />
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

export default UserMetricsScreen;
