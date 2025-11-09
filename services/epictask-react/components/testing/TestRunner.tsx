import { FONT_SIZES } from "@/constants/FontSize";
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { COLORS } from '@/constants/Colors';
import { responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';

interface TestResult {
  success: boolean;
  message: string;
  duration?: number;
  data?: any;
  error?: any;
}

interface TestRunnerProps {
  testName: string;
  testFunction: () => Promise<TestResult>;
  onResult?: (result: TestResult) => void;
  disabled?: boolean;
}

const getStatusColor = (status: 'pending' | 'running' | 'passed' | 'failed') => {
  switch (status) {
    case 'passed': return '#44AA44';
    case 'failed': return '#FF4444';
    case 'running': return '#FFA500';
    default: return COLORS.grey;
  }
};

const TestRunner: React.FC<TestRunnerProps> = ({
  testName,
  testFunction,
  onResult,
  disabled = false,
}) => {
  const [status, setStatus] = useState<'pending' | 'running' | 'passed' | 'failed'>('pending');
  const [result, setResult] = useState<TestResult | null>(null);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const runTest = async () => {
    if (disabled || status === 'running') return;

    setStatus('running');
    setResult(null);
    
    const startTime = Date.now();
    
    try {
      const testResult = await testFunction();
      const duration = Date.now() - startTime;
      
      const finalResult = {
        ...testResult,
        duration,
      };
      
      setResult(finalResult);
      setStatus(testResult.success ? 'passed' : 'failed');
      setLastRun(new Date());
      
      onResult?.(finalResult);
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorResult = {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        duration,
        error,
      };
      
      setResult(errorResult);
      setStatus('failed');
      setLastRun(new Date());
      
      onResult?.(errorResult);
    }
  };

  const showDetails = () => {
    if (!result) return;
    
    const details = [
      `Status: ${status}`,
      `Message: ${result.message}`,
      result.duration ? `Duration: ${result.duration}ms` : '',
      lastRun ? `Last Run: ${lastRun.toLocaleString()}` : '',
    ].filter(Boolean).join('\n');
    
    Alert.alert(`${testName} Details`, details, [{ text: 'OK' }]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.testName}>{testName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
          <Text style={styles.statusText}>{status.toUpperCase()}</Text>
        </View>
      </View>
      
      {result?.message && (
        <Text style={[styles.message, { 
          color: status === 'failed' ? '#FF4444' : '#666' 
        }]}>
          {result.message}
        </Text>
      )}
      
      <View style={styles.footer}>
        <View style={styles.metadata}>
          {result?.duration && (
            <Text style={styles.duration}>Duration: {result.duration}ms</Text>
          )}
          {lastRun && (
            <Text style={styles.lastRun}>
              Last run: {lastRun.toLocaleTimeString()}
            </Text>
          )}
        </View>
        
        <View style={styles.actions}>
          {result && (
            <TouchableOpacity style={styles.detailsButton} onPress={showDetails}>
              <Text style={styles.detailsButtonText}>Details</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.runButton, disabled && styles.disabledButton]}
            onPress={runTest}
            disabled={disabled || status === 'running'}
          >
            {status === 'running' ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.runButtonText}>Run</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  testName: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
    color: '#333',
    flex: 1,
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
  message: {
    fontSize: FONT_SIZES.extraSmall,
    marginBottom: 8,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metadata: {
    flex: 1,
  },
  duration: {
    fontSize: FONT_SIZES.extraSmall,
    color: '#999',
    marginBottom: 2,
  },
  lastRun: {
    fontSize: FONT_SIZES.extraSmall,
    color: '#999',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  detailsButton: {
    backgroundColor: COLORS.grey,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  detailsButtonText: {
    color: 'white',
    fontSize: FONT_SIZES.extraSmall,
    fontWeight: '500',
  },
  runButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 4,
    minWidth: 60,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.grey,
    opacity: 0.6,
  },
  runButtonText: {
    color: 'white',
    fontSize: FONT_SIZES.extraSmall,
    fontWeight: '600',
  },
});

export default TestRunner;
