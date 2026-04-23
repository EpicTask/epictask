import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Button, Text, Alert, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomText from '@/components/CustomText';
import { useAuth } from '@/context/AuthContext';
import authService from '@/api/authService';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (error) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'Login failed');
    }
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      Alert.alert('Reset Password', 'Enter your email address above, then tap Forgot Password.');
      return;
    }
    Alert.alert(
      'Reset Password',
      `Send a password reset link to ${email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            try {
              await authService.resetPassword(email.trim());
              Alert.alert('Email Sent', 'Check your inbox for a password reset link.');
            } catch (e) {
              Alert.alert('Error', e instanceof Error ? e.message : 'Failed to send reset email');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomText variant="bold" style={styles.title}>Login</CustomText>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />
      <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotLink}>
        <Text style={styles.link}>Forgot Password?</Text>
      </TouchableOpacity>
      <Button title={loading ? "Logging in..." : "Login"} onPress={handleLogin} disabled={loading} />
      <View style={styles.registerLink}>
        <Text>Don't have an account? </Text>
        <Text style={styles.link} onPress={() => router.push('/auth/register')}>
          Register
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    // backgroundColor: COLORS.light.background,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 12,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: 12,
  },
  registerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  link: {
    color: 'blue',
  },
});

export default LoginScreen;
