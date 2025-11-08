import React, { useContext, useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "@/context/AuthContext";
import userApiClient from "@/api/userService";
import CustomText from "@/components/CustomText";
import SafeArea from "@/components/SafeArea";
import CustomInput from "@/components/custom-input/CustomInput";
import AuthButton from "@/components/buttons/AuthButton";
import { COLORS } from "@/constants/Colors";
import { ICONS, IMAGES } from "@/assets";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { MediaType } from "expo-image-picker";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { firestoreService } from "@/api/firestoreService";

const fetchLinkedChildren = async (uid: string) => {
  try {
    const result = await firestoreService.getLinkedChildren(uid);
    if (result.success) {
      return result.children || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching linked children:", error);
    return [];
  }
};

const ProfileScreen = () => {
  const { user, setUser } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [inviteCode, setInviteCode] = useState("");
  const [profileImage, setProfileImage] = useState(user?.imageUrl || null);

  const { data: children, isLoading: isLoadingChildren } = useQuery({
    queryKey: ["linkedChildren", user?.uid],
    queryFn: () => fetchLinkedChildren(user?.uid || ""),
    enabled: !!user?.uid,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (updatedProfile: { displayName: string; imageUrl?: string }) =>
      userApiClient.put("/profileUpdate", updatedProfile),
    onSuccess: (data) => {
      setUser({ ...user, ...data.data });
      Alert.alert("Success", "Profile updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: any) => {
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to update profile."
      );
    },
  });

  const linkChildMutation = useMutation({
    mutationFn: (code: string) =>
      userApiClient.post("/users/link-child", { inviteCode: code }),
    onSuccess: () => {
      Alert.alert("Success", "Child account linked successfully.");
      queryClient.invalidateQueries({ queryKey: ["linkedChildren"] });
      setInviteCode("");
    },
    onError: (error: any) => {
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to link child account."
      );
    },
  });

  const handleUpdateProfile = () => {
    if (!displayName.trim()) {
      Alert.alert("Error", "Please enter a display name");
      return;
    }
    const updateData: { displayName: string; imageUrl?: string } = {
      displayName: displayName.trim(),
    };
    if (profileImage && profileImage !== user?.imageUrl) {
      updateData.imageUrl = profileImage;
    }
    updateProfileMutation.mutate(updateData);
  };

  const pickImage = async () => {
    try {
      // Request permission
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "Permission to access camera roll is required!"
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"] as MediaType[],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const takePhoto = async () => {
    try {
      // Request permission
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "Permission to access camera is required!"
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      "Select Profile Picture",
      "Choose how you want to select your profile picture",
      [
        { text: "Camera", onPress: takePhoto },
        { text: "Photo Library", onPress: pickImage },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleLinkChild = () => {
    if (!inviteCode.trim()) {
      Alert.alert("Error", "Please enter an invite code");
      return;
    }
    linkChildMutation.mutate(inviteCode.trim());
  };

  const ChildItem = ({ item }: { item: any }) => (
    <View style={styles.childItem}>
      <View style={styles.childInfo}>
        <Image
          source={item.imageUrl ? { uri: item.imageUrl } : IMAGES.profile}
          style={styles.childAvatar}
        />
        <CustomText variant="medium" style={styles.childName}>
          {item.displayName}
        </CustomText>
      </View>
    </View>
  );

  return (
    <SafeArea>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            {ICONS.back_arrow}
          </TouchableOpacity>
          <CustomText variant="semiBold" style={styles.headerTitle}>
            Edit Profile
          </CustomText>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <CustomText variant="semiBold" style={styles.sectionTitle}>
            Profile Information
          </CustomText>

          <View style={styles.card}>
            {/* Profile Image Section */}
            <View style={styles.imageSection}>
              <TouchableOpacity
                onPress={showImageOptions}
                style={styles.imageContainer}
              >
                <Image
                  source={profileImage ? { uri: profileImage } : IMAGES.profile}
                  style={styles.editProfileImage}
                />
                <View style={styles.imageOverlay}>
                  <View style={styles.cameraIcon}>{ICONS.edit}</View>
                </View>
              </TouchableOpacity>
              <CustomText variant="medium" style={styles.imageHint}>
                Tap to change profile picture
              </CustomText>
            </View>

            <CustomInput
              label="Display Name"
              placeholder="Enter Your Display Name"
              value={displayName}
              onChangeText={setDisplayName}
            />

            <View style={styles.buttonContainer}>
              <AuthButton
                fill={true}
                text={
                  updateProfileMutation.isPending
                    ? "Updating..."
                    : "Update Profile"
                }
                height={responsiveHeight(6)}
                onPress={
                  updateProfileMutation.isPending
                    ? () => {}
                    : handleUpdateProfile
                }
              />
            </View>
          </View>
        </View>

        {/* Link Child Section */}
        <View style={styles.section}>
          <CustomText variant="semiBold" style={styles.sectionTitle}>
            Link Child Account
          </CustomText>
          <View style={styles.card}>
            <CustomInput
              label="Invite Code"
              placeholder="Enter Child's Invite Code"
              value={inviteCode}
              onChangeText={setInviteCode}
            />

            <View style={styles.buttonContainer}>
              <AuthButton
                fill={false}
                text={
                  linkChildMutation.isPending ? "Linking..." : "Link Account"
                }
                height={responsiveHeight(6)}
                onPress={
                  linkChildMutation.isPending ? () => {} : handleLinkChild
                }
              />
            </View>
          </View>
        </View>

        {/* Linked Children Section */}
        <View style={styles.section}>
          <CustomText variant="semiBold" style={styles.sectionTitle}>
            Linked Children
          </CustomText>
          <View style={styles.card}>
            {isLoadingChildren ? (
              <View style={styles.loadingContainer}>
                <CustomText variant="medium" style={styles.loadingText}>
                  Loading children...
                </CustomText>
              </View>
            ) : children && children.length > 0 ? (
              <FlatList
                data={children}
                keyExtractor={(item) => item.uid}
                renderItem={({ item }) => <ChildItem item={item} />}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <CustomText variant="medium" style={styles.emptyText}>
                  No children linked yet
                </CustomText>
                <CustomText variant="regular" style={styles.emptySubtext}>
                  Use an invite code to link your child's account
                </CustomText>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeArea>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    marginBottom: responsiveHeight(5),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: responsiveHeight(2),
    marginBottom: responsiveHeight(1),
  },
  backButton: {
    paddingVertical: 10,
    marginRight: responsiveWidth(4),
  },
  headerTitle: {
    color: COLORS.primary,
    fontSize: responsiveFontSize(3),
  },
  section: {
    marginBottom: responsiveHeight(3),
  },
  sectionTitle: {
    fontSize: responsiveFontSize(2.5),
    color: COLORS.black,
    marginBottom: responsiveHeight(1.5),
    fontWeight: "600",
  },
  imageSection: {
    alignItems: "center",
    marginBottom: responsiveHeight(2.5),
  },
  imageContainer: {
    position: "relative",
    marginBottom: responsiveHeight(1),
  },
  editProfileImage: {
    width: responsiveWidth(25),
    height: responsiveWidth(25),
    borderRadius: responsiveWidth(12.5),
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: responsiveWidth(6),
    padding: responsiveWidth(2),
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  cameraIcon: {
    width: responsiveWidth(6),
    height: responsiveWidth(6),
    alignItems: "center",
    justifyContent: "center",
  },
  imageHint: {
    fontSize: responsiveFontSize(1.8),
    color: COLORS.grey,
    textAlign: "center",
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingVertical: responsiveHeight(2.5),
    paddingHorizontal: responsiveWidth(5),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonContainer: {
    marginTop: responsiveHeight(2),
    width: "100%",
  },
  childItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: responsiveHeight(1.5),
  },
  childInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: responsiveWidth(3),
  },
  childAvatar: {
    width: responsiveWidth(10),
    height: responsiveWidth(10),
    borderRadius: responsiveWidth(5),
  },
  childName: {
    fontSize: responsiveFontSize(2.2),
    color: COLORS.black,
    fontWeight: "500",
  },
  separator: {
    height: 1,
    backgroundColor: "#00000010",
    marginVertical: responsiveHeight(0.5),
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: responsiveHeight(2),
  },
  loadingText: {
    fontSize: responsiveFontSize(2),
    color: COLORS.grey,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: responsiveHeight(3),
  },
  emptyText: {
    fontSize: responsiveFontSize(2.2),
    color: COLORS.black,
    marginBottom: responsiveHeight(0.5),
  },
  emptySubtext: {
    fontSize: responsiveFontSize(1.8),
    color: COLORS.grey,
    textAlign: "center",
  },
});

export default ProfileScreen;
