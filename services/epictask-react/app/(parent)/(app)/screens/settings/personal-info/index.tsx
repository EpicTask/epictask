import { FONT_SIZES } from "@/constants/FontSize";
import React, { useState, useContext, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { AuthContext } from "@/context/AuthContext";
import storageService from "@/api/storageService";
import CustomInput from "@/components/custom-input/CustomInput";

import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { ICONS, IMAGES } from "@/assets";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import AuthButton from "@/components/buttons/AuthButton";

const PersonalInformation = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [name, setName] = useState(user?.displayName || "");
  const [profileImage, setProfileImage] = useState(user?.imageUrl || user?.photoURL || null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.displayName || "");
      setProfileImage(user.imageUrl || user.photoURL || null);
    }
  }, [user]);

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
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    try {
      setIsUpdating(true);
      const updateData: any = {
        displayName: name.trim(),
      };
      
      if (profileImage && profileImage !== (user?.imageUrl || user?.photoURL)) {
        // Upload image to Firebase Storage
        const storagePath = `avatars/${user.uid}_${Date.now()}.jpg`;
        const downloadURL = await storageService.uploadImage(profileImage, storagePath);
        updateData.imageUrl = downloadURL;
      }

      await updateProfile(updateData);
      Alert.alert("Success", "Personal information updated successfully");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 20,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
        >
          {ICONS.back_arrow}
        </TouchableOpacity>
        <Text
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: FONT_SIZES.title,
            fontWeight: "500",
          }}
        >
          Personal Information
        </Text>
      </View>
      <View style={{ gap: 10 }}>
        <View style={{ paddingVertical: 10, alignItems: "center" }}>
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={profileImage ? { uri: profileImage } : IMAGES.profile }
              style={{
                width: responsiveWidth(30),
                borderRadius: responsiveWidth(15),
                height: responsiveWidth(30),
                borderWidth: 2,
                borderColor: "#EE4266",
              }}
            />
            <View style={{ position: "absolute", bottom: 0, right: responsiveWidth(35), backgroundColor: 'white', borderRadius: 15, padding: 5 }}>
                {ICONS.edit}
            </View>
          </TouchableOpacity>
        </View>
        <View>
          <Text style={{ fontWeight: "500", fontSize: FONT_SIZES.large }}>Account Details</Text>
        </View>
        <View style={{ gap: 14 }}>
          <CustomInput
            label="Full Name"
            placeholder="Your Name"
            value={name}
            onChangeText={setName}
          />
          <CustomInput
            label="Email"
            placeholder="Your Email"
            value={user?.email || ""}
            onChangeText={() => {}} // Email usually not editable here
          />
        </View>
        <View style={{ paddingVertical: 30 }}>
          <AuthButton
            fill={true}
            onPress={handleUpdate}
            text={isUpdating ? "Updating..." : "Update"}
            height={responsiveHeight(6)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PersonalInformation;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F6F9",
    height: responsiveHeight(100),
    width: responsiveWidth(100),
    padding: responsiveWidth(4),
  },
});
