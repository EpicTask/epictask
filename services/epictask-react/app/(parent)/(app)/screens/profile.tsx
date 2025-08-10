import React, { useContext, useState } from 'react';
import { View, StyleSheet, TextInput, Button, Text, Alert, FlatList } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '@/context/AuthContext';
import apiClient from '@/api/apiClient';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomText from '@/components/CustomText';

const fetchLinkedChildren = async () => {
  const { data } = await apiClient.get('/users/me/children');
  return data;
};

const ProfileScreen = () => {
  const { user, setUser } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [inviteCode, setInviteCode] = useState('');

  const { data: children, isLoading: isLoadingChildren } = useQuery({
    queryKey: ['linkedChildren'],
    queryFn: fetchLinkedChildren,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (updatedProfile) => apiClient.put('/profileUpdate', updatedProfile),
    onSuccess: (data) => {
      setUser({ ...user, ...data.data });
      Alert.alert('Success', 'Profile updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update profile.');
    },
  });

  const linkChildMutation = useMutation({
    mutationFn: (code) => apiClient.post('/users/link-child', { inviteCode: code }),
    onSuccess: () => {
      Alert.alert('Success', 'Child account linked successfully.');
      queryClient.invalidateQueries({ queryKey: ['linkedChildren'] });
    },
    onError: (error) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to link child account.');
    },
  });

  const handleUpdateProfile = () => {
    updateProfileMutation.mutate({ displayName });
  };

  const handleLinkChild = () => {
    linkChildMutation.mutate(inviteCode);
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomText variant="h1">Profile</CustomText>
      <TextInput
        style={styles.input}
        placeholder="Display Name"
        value={displayName}
        onChangeText={setDisplayName}
      />
      <Button title="Update Profile" onPress={handleUpdateProfile} />

      <View style={styles.section}>
        <CustomText variant="h2">Link Child Account</CustomText>
        <TextInput
          style={styles.input}
          placeholder="Enter Invite Code"
          value={inviteCode}
          onChangeText={setInviteCode}
        />
        <Button title="Link Account" onPress={handleLinkChild} />
      </View>

      <View style={styles.section}>
        <CustomText variant="h2">Linked Children</CustomText>
        {isLoadingChildren ? (
          <Text>Loading...</Text>
        ) : (
          <FlatList
            data={children}
            keyExtractor={(item) => item.uid}
            renderItem={({ item }) => <Text>{item.displayName}</Text>}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  section: {
    marginTop: 24,
  },
});

export default ProfileScreen;
