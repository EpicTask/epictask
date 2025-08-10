import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Button, Text, Alert, Switch } from 'react-native';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import apiClient from '../../api/apiClient';
import { COLORS } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomText from '@/components/CustomText';

const RegisterScreen = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isParent, setIsParent] = useState(false);

  const handleRegister = async () => {
    try {
      const role = isParent ? 'parent' : 'kid';
      await apiClient.post('/registerWithPassword', {
        email,
        password,
        displayName,
        role,
      });
    } catch (error) {
      Alert.alert('Registration Failed', error.response?.data?.error || error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomText variant="h1">Register</CustomText>
      <TextInput
        style={styles.input}
        placeholder="Display Name"
        value={displayName}
        onChangeText={setDisplayName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <View style={styles.switchContainer}>
        <Text>Are you a parent?</Text>
        <Switch value={isParent} onValueChange={setIsParent} />
      </View>
      <Button title="Register" onPress={handleRegister} />
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
