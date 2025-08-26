import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '@/constants/Colors';
import { TESTING_CONFIG, getDatabaseConfig } from '@/constants/TestingConfig';
import { responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';

interface EnvironmentToggleProps {
  onEnvironmentChange?: (environment: string) => void;
}

const EnvironmentToggle: React.FC<EnvironmentToggleProps> = ({ onEnvironmentChange }) => {
  const [currentEnvironment, setCurrentEnvironment] = useState<string>(TESTING_CONFIG.DEFAULT_ENVIRONMENT);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSavedEnvironment();
  }, []);

  const loadSavedEnvironment = async () => {
    try {
      const savedEnvironment = await AsyncStorage.getItem('testing_environment');
      if (savedEnvironment) {
        setCurrentEnvironment(savedEnvironment);
        onEnvironmentChange?.(savedEnvironment);
      }
    } catch (error) {
      console.error('Failed to load saved environment:', error);
    }
  };

  const switchEnvironment = async (environment: string) => {
    if (environment === TESTING_CONFIG.DATABASE_ENVIRONMENTS.PRODUCTION) {
      Alert.alert(
        'Switch to Production',
        'Are you sure you want to switch to the production environment? This will affect real data.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Confirm', 
            style: 'destructive',
            onPress: () => performEnvironmentSwitch(environment)
          }
        ]
      );
    } else {
      performEnvironmentSwitch(environment);
    }
  };

  const performEnvironmentSwitch = async (environment: string) => {
    setIsLoading(true);
    try {
      await AsyncStorage.setItem('testing_environment', environment);
      setCurrentEnvironment(environment);
      onEnvironmentChange?.(environment);
      
      const config = getDatabaseConfig(environment);
      console.log(`Switched to ${environment} environment:`, config);
    } catch (error) {
      console.error('Failed to switch environment:', error);
      Alert.alert('Error', 'Failed to switch environment');
    } finally {
      setIsLoading(false);
    }
  };

  const getEnvironmentColor = (env: string) => {
    return env === TESTING_CONFIG.DATABASE_ENVIRONMENTS.PRODUCTION 
      ? '#FF4444'  // Red for production
      : '#44AA44'; // Green for test
  };

  const getEnvironmentLabel = (env: string) => {
    return env === TESTING_CONFIG.DATABASE_ENVIRONMENTS.PRODUCTION ? 'Production' : 'Test';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Database Environment:</Text>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            currentEnvironment === TESTING_CONFIG.DATABASE_ENVIRONMENTS.TEST && styles.activeButton,
            { borderColor: getEnvironmentColor(TESTING_CONFIG.DATABASE_ENVIRONMENTS.TEST) }
          ]}
          onPress={() => switchEnvironment(TESTING_CONFIG.DATABASE_ENVIRONMENTS.TEST)}
          disabled={isLoading}
        >
          <Text style={[
            styles.toggleText,
            currentEnvironment === TESTING_CONFIG.DATABASE_ENVIRONMENTS.TEST && styles.activeText
          ]}>
            Test
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.toggleButton,
            currentEnvironment === TESTING_CONFIG.DATABASE_ENVIRONMENTS.PRODUCTION && styles.activeButton,
            { borderColor: getEnvironmentColor(TESTING_CONFIG.DATABASE_ENVIRONMENTS.PRODUCTION) }
          ]}
          onPress={() => switchEnvironment(TESTING_CONFIG.DATABASE_ENVIRONMENTS.PRODUCTION)}
          disabled={isLoading}
        >
          <Text style={[
            styles.toggleText,
            currentEnvironment === TESTING_CONFIG.DATABASE_ENVIRONMENTS.PRODUCTION && styles.activeText
          ]}>
            Production
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={[styles.statusIndicator, { backgroundColor: getEnvironmentColor(currentEnvironment) }]}>
        <Text style={styles.statusText}>
          Current: {getEnvironmentLabel(currentEnvironment)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: responsiveWidth(4),
    backgroundColor: 'white',
    borderRadius: 8,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: responsiveFontSize(2),
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  activeButton: {
    backgroundColor: '#f0f8ff',
  },
  toggleText: {
    fontSize: responsiveFontSize(1.8),
    fontWeight: '500',
    color: '#666',
  },
  activeText: {
    color: '#333',
    fontWeight: '600',
  },
  statusIndicator: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: responsiveFontSize(1.6),
    fontWeight: '600',
  },
});

export default EnvironmentToggle;
