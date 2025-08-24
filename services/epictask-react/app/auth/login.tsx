import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Button, Text, Alert } from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomText from '@/components/CustomText';
import { useAuth } from '@/context/AuthContext';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();

  const handleLogin = async () => {
    try {
      await login(email, password);
      // Navigation will be handled automatically by the AuthContext and _layout.tsx
    } catch (error) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'Login failed');
    }
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
