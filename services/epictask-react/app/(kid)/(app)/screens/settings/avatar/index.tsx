import { FONT_SIZES } from "@/constants/FontSize";
import React, { useEffect, useState } from "react";
import CustomText from "@/components/CustomText";
import CustomButton from "@/components/buttons/CustomButton";
import ScreenHeading from "@/components/headings/ScreenHeading";
import { useAuth } from "@/context/AuthContext";
import * as ImagePicker from "expo-image-picker";
import storageService from "@/api/storageService";
import { firestoreService } from "@/api/firestoreService";

import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

import { IMAGES } from "@/assets";
import { Image, StyleSheet, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

const AvatarScreen = () => {
  const { user, updateProfile, isSharedDeviceMode, activeChildContext, effectiveUserId } = useAuth();
  const [profileImage, setProfileImage] = useState(user?.image || user?.imageUrl || null);
  const [displayName, setDisplayName] = useState(user?.displayName || user?.name || "Kid");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      if (isSharedDeviceMode && activeChildContext) {
        setDisplayName(activeChildContext.childName || "Kid");
        setProfileImage(activeChildContext.childImageUrl || null);

        if (effectiveUserId) {
          try {
            const result = await firestoreService.getUserProfile(effectiveUserId);
            if (active && result.success) {
              const child = result.user;
              setDisplayName(child.displayName || activeChildContext.childName || "Kid");
              setProfileImage(child.imageUrl || child.photoURL || child.image || activeChildContext.childImageUrl || null);
            }
          } catch (error) {
            console.error("Failed to load child avatar profile", error);
          }
        }
        return;
      }

      if (active) {
        setDisplayName(user?.displayName || user?.name || "Kid");
        setProfileImage(user?.image || user?.imageUrl || user?.photoURL || null);
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [user, isSharedDeviceMode, activeChildContext, effectiveUserId]);

  const handleUpdateProfile = async (uri: string) => {
    if (isSharedDeviceMode) {
      Alert.alert("Return to Parent", "Return to parent mode to edit child avatar details.");
      return;
    }

    try {
      setIsSaving(true);
      
      // Upload image to Firebase Storage
      const storagePath = `avatars/${user.uid}_${Date.now()}.jpg`;
      const downloadURL = await storageService.uploadImage(uri, storagePath);
      
      await updateProfile({
        imageUrl: downloadURL,
      });
      setProfileImage(downloadURL);
      Alert.alert("Success", "Avatar updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update avatar");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "Permission to access camera roll is required!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"] as ImagePicker.MediaType[],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        handleUpdateProfile(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "Permission to access camera is required!");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        handleUpdateProfile(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const showImageOptions = () => {
    if (isSharedDeviceMode) {
      Alert.alert("Return to Parent", "Return to parent mode to edit child avatar details.");
      return;
    }

    Alert.alert(
      "Select Avatar",
      "Choose how you want to select your avatar",
      [
        { text: "Camera", onPress: takePhoto },
        { text: "Photo Library", onPress: pickImage },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeading text="Avatar" back={true} plus={false} />
      <View
        style={{
          justifyContent: "space-between",
          flex: 1,
          paddingVertical: 20,
        }}
      >
        <View style={{ justifyContent: "space-between", flex: 1 }}>
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View style={{ alignItems: "center", paddingBottom: 30 }}>
              <CustomText
                variant="bold"
                style={{ fontSize: FONT_SIZES.title }}
              >
                Hallo,
              </CustomText>
              <CustomText
                variant="semiBold"
                style={{ fontSize: FONT_SIZES.title }}
              >
                {displayName}! 👋
              </CustomText>
            </View>
            <Image
              source={profileImage ? { uri: profileImage } : IMAGES.profile}
              style={{
                height: responsiveWidth(40),
                width: responsiveWidth(40),
                borderRadius: responsiveWidth(20),
                borderWidth: 2,
                borderColor: "#EE4266",
              }}
            />
          </View>
          <View style={{ gap: 10 }}>
            <CustomButton
              fill={true}
              onPress={showImageOptions}
              text={isSharedDeviceMode ? "Return to Parent to Edit" : isSaving ? "Saving..." : "Change Avatar"}
              height={responsiveHeight(7)}
            />
            <CustomButton
              fill={false}
              onPress={() => router.back()}
              text="Go Back"
              height={responsiveHeight(7)}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AvatarScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F6F9",
    justifyContent: "space-between",
    height: responsiveHeight(100),
    width: responsiveWidth(100),
    padding: responsiveWidth(6),
  },
});
