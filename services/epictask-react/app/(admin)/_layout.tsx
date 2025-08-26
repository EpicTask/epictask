import React from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { isAuthorizedTestUser } from '@/constants/TestingConfig';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/Colors';

export default function AdminLayout() {
  const { user } = useAuth();

  // Check if user is authorized for admin access
  if (!user || !isAuthorizedTestUser(user.uid)) {
    return (
      <SafeAreaView style={styles.unauthorizedContainer}>
        <View style={styles.unauthorizedContent}>
          <Text style={styles.unauthorizedTitle}>Access Denied</Text>
          <Text style={styles.unauthorizedMessage}>
            You don't have permission to access the testing dashboard.
          </Text>
          <Text style={styles.unauthorizedDetails}>
            Contact an administrator if you believe this is an error.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="testing-dashboard"
        options={{
          title: 'Testing Dashboard',
          headerBackVisible: true,
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  unauthorizedContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  unauthorizedContent: {
    backgroundColor: COLORS.white,
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  unauthorizedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF4444',
    marginBottom: 16,
  },
  unauthorizedMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  unauthorizedDetails: {
    fontSize: 14,
    color: COLORS.grey,
    textAlign: 'center',
  },
});
