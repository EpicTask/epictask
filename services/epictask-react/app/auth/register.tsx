import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Button, Text, Alert, Switch } from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomText from '@/components/CustomText';
import { useAuth } from '@/context/AuthContext';

const RegisterScreen = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isParent, setIsParent] = useState(false);
  const { register, loading, error } = useAuth();

  const handleRegister = async () => {
    try {
      const role = isParent ? 'parent' : 'child';
      await register(email, password, displayName, role);
      // Navigation will be handled automatically by the AuthContext and _layout.tsx
    } catch (error) {
      Alert.alert('Registration Failed', error instanceof Error ? error.message : 'Registration failed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomText variant="bold" style={styles.title}>Register</CustomText>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <TextInput
        style={styles.input}
        placeholder="Display Name"
        value={displayName}
        onChangeText={setDisplayName}
        editable={!loading}
      />
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
      <View style={styles.switchContainer}>
        <Text>Are you a parent?</Text>
        <Switch value={isParent} onValueChange={setIsParent} disabled={loading} />
      </View>
      <Button title={loading ? "Registering..." : "Register"} onPress={handleRegister} disabled={loading} />
      <View style={styles.loginLink}>
        <Text>Already have an account? </Text>
        <Text style={styles.link} onPress={() => router.push('/auth/login')}>
          Login
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  link: {
    color: 'blue',
  },
});

export default RegisterScreen;
