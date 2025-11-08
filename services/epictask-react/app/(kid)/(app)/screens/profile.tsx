import React, { useContext, useState } from "react";
import { View, StyleSheet, TextInput, Button, Text, Alert } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "@/context/AuthContext";
import userApiClient from "@/api/userService";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomText from "@/components/CustomText";

const ProfileScreen = () => {
  const { user, setUser } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [inviteCode, setInviteCode] = useState("");

  const updateProfileMutation = useMutation({
    mutationFn: (updatedProfile) =>
      userApiClient.put("/profileUpdate", updatedProfile),
    onSuccess: (data) => {
      setUser({ ...user, ...data.data });
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
    mutationFn: () => userApiClient.post("/users/generate-invite-code", {displayName}),
    onSuccess: (data) => {
      setInviteCode(data.data.inviteCode);
      Alert.alert(
        "Invite Code",
        `Your invite code is: ${data.data.inviteCode}`
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
    updateProfileMutation.mutate();
  };

  const handleGenerateInviteCode = () => {
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
