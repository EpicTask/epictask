import { FONT_SIZES } from "@/constants/FontSize";
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS } from '@/constants/Colors';
import { responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message?: string;
  duration?: number;
  lastRun?: string;
  data?: any;
  error?: any;
}

interface TestResultsProps {
  results: TestResult[];
  title?: string;
  onExport?: () => void;
  onClear?: () => void;
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

const ResultCard: React.FC<{ result: TestResult }> = ({ result }) => {
  const showDetails = () => {
    const details = [
      `Test: ${result.name}`,
      `Status: ${result.status}`,
      result.message ? `Message: ${result.message}` : '',
      result.duration ? `Duration: ${result.duration}ms` : '',
      result.lastRun ? `Last Run: ${new Date(result.lastRun).toLocaleString()}` : '',
      result.data ? `Data: ${JSON.stringify(result.data, null, 2)}` : '',
      result.error ? `Error: ${JSON.stringify(result.error, null, 2)}` : '',
    ].filter(Boolean).join('\n\n');
    
    Alert.alert(`${result.name} Details`, details, [{ text: 'OK' }]);
  };

  return (
    <TouchableOpacity style={styles.resultCard} onPress={showDetails}>
      <View style={styles.resultHeader}>
        <View style={styles.resultInfo}>
          <View style={styles.resultTitleRow}>
            <Text style={[styles.statusIcon, { color: getStatusColor(result.status) }]}>
              {getStatusIcon(result.status)}
            </Text>
            <Text style={styles.resultName}>{result.name}</Text>
          </View>
          {result.message && (
            <Text style={[styles.resultMessage, { 
              color: result.status === 'failed' ? '#FF4444' : '#666' 
            }]}>
              {result.message}
            </Text>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(result.status) }]}>
          <Text style={styles.statusText}>{result.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.resultFooter}>
        {result.duration && (
          <Text style={styles.duration}>Duration: {result.duration}ms</Text>
        )}
        {result.lastRun && (
          <Text style={styles.lastRun}>
            {new Date(result.lastRun).toLocaleTimeString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const TestResults: React.FC<TestResultsProps> = ({
  results,
  title = 'Test Results',
  onExport,
  onClear,
}) => {
  const getOverallStats = () => {
    const total = results.length;
    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const running = results.filter(r => r.status === 'running').length;
    const pending = results.filter(r => r.status === 'pending').length;
    
    return { total, passed, failed, running, pending };
  };

  const stats = getOverallStats();

  const exportResults = () => {
    if (onExport) {
      onExport();
    } else {
      // Default export behavior
      const exportData = {
        timestamp: new Date().toISOString(),
        environment: 'test', // This should be passed as prop
        results: results.map(r => ({
          name: r.name,
          status: r.status,
          message: r.message,
          duration: r.duration,
          lastRun: r.lastRun,
        })),
        summary: stats,
      };
      
      console.log('Test Results Export:', JSON.stringify(exportData, null, 2));
      Alert.alert('Export', 'Test results have been logged to console', [{ text: 'OK' }]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.actions}>
          {onExport && (
            <TouchableOpacity style={styles.actionButton} onPress={exportResults}>
              <Text style={styles.actionButtonText}>Export</Text>
            </TouchableOpacity>
          )}
          {onClear && (
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: COLORS.grey }]} 
              onPress={onClear}
            >
              <Text style={styles.actionButtonText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Test Summary</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#44AA44' }]}>{stats.passed}</Text>
              <Text style={styles.statLabel}>Passed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#FF4444' }]}>{stats.failed}</Text>
              <Text style={styles.statLabel}>Failed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#FFA500' }]}>{stats.running}</Text>
              <Text style={styles.statLabel}>Running</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: COLORS.grey }]}>{stats.pending}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Results List */}
      <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
        {results.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No test results available</Text>
          </View>
        ) : (
          results.map((result) => (
            <ResultCard key={result.id} result={result} />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  actionButtonText: {
    color: 'white',
    fontSize: FONT_SIZES.extraSmall,
    fontWeight: '600',
  },
  summaryContainer: {
    padding: responsiveWidth(4),
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.extraLarge,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: FONT_SIZES.extraSmall,
    color: '#666',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: responsiveWidth(4),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.grey,
  },
  resultCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  resultInfo: {
    flex: 1,
    marginRight: 12,
  },
  resultTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusIcon: {
    fontSize: FONT_SIZES.medium,
    marginRight: 8,
    fontWeight: 'bold',
  },
  resultName: {
    fontSize: FONT_SIZES.extraSmall,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  resultMessage: {
    fontSize: FONT_SIZES.extraSmall,
    lineHeight: 18,
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
    fontSize: FONT_SIZES.extraSmall,
    fontWeight: '600',
  },
  resultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  duration: {
    fontSize: FONT_SIZES.extraSmall,
    color: '#999',
  },
  lastRun: {
    fontSize: FONT_SIZES.extraSmall,
    color: '#999',
  },
});

export default TestResults;
