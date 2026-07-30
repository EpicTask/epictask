import React, { useContext, useState } from "react";
import { View, StyleSheet, TextInput, Button, Text, Alert } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "@/context/AuthContext";
import { userService } from "@/api/userService";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomText from "@/components/CustomText";

const ProfileScreen = () => {
  const { user, setUser, isSharedDeviceMode, activeChildContext } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState(
    isSharedDeviceMode && activeChildContext?.childName
      ? activeChildContext.childName
      : user?.displayName || ""
  );
  const [inviteCode, setInviteCode] = useState("");

  const updateProfileMutation = useMutation({
    mutationFn: (updatedProfile: any) =>
      userService.updateProfile(updatedProfile),
    onSuccess: (data: any) => {
      setUser({ ...user, ...data });
      Alert.alert("Success", "Profile updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        error.message || "Failed to update profile."
      );
    },
  });

  const generateInviteCodeMutation = useMutation({
    mutationFn: () => userService.generateInviteCode(),
    onSuccess: (data: any) => {
      setInviteCode(data.inviteCode);
      Alert.alert(
        "Invite Code",
        `Your invite code is: ${data.inviteCode}`
      );
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        error.message || "Failed to generate invite code."
      );
    },
  });

  const handleUpdateProfile = () => {
    if (isSharedDeviceMode) {
      Alert.alert("Return to Parent", "Return to parent mode to edit child profile details.");
      return;
    }

    updateProfileMutation.mutate({ displayName });
  };

  const handleGenerateInviteCode = () => {
    if (isSharedDeviceMode) {
      Alert.alert("Return to Parent", "Return to parent mode before linking accounts.");
      return;
    }

    generateInviteCodeMutation.mutate();
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomText variant="bold">Profile</CustomText>
      <TextInput
        style={styles.input}
        placeholder="Display Name"
        value={displayName}
        onChangeText={setDisplayName}
      />
      <Button title="Update Profile" onPress={handleUpdateProfile} />

      <View style={styles.section}>
        <CustomText variant="medium">Link to Parent Account</CustomText>
        <Button
          title="Generate Invite Code"
          onPress={handleGenerateInviteCode}
        />
        {inviteCode ? (
          <Text style={styles.inviteCode}>{inviteCode}</Text>
        ) : null}
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
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  section: {
    marginTop: 24,
  },
  inviteCode: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default ProfileScreen;
