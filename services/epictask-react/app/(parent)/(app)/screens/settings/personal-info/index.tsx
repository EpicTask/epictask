import React, { useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import CustomButton from "@/components/buttons/CustomButton";
import CustomInput from "@/components/custom-input/CustomInput";

import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { ICONS, IMAGES } from "@/assets";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AuthButton from "@/components/buttons/AuthButton";

const PersonalInformation = () => {

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [file, setFile] = useState<any>(null);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result?.assets && result.assets.length > 0) {
        setFile(result.assets[0]);
      } else if (result.canceled) {
      }
    } catch (err) {
      console.error("Document pick error: ", err);
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
            fontSize: responsiveFontSize(3),
            fontWeight: "500",
          }}
        >
          Personal Information
        </Text>
      </View>
      <View style={{ gap: 10 }}>
        <View style={{ paddingVertical: 10 }}>
          <TouchableOpacity onPress={pickDocument}>
            <Image
              source={file ?? IMAGES.upload_profile }
              style={{
                width: responsiveWidth(30),
                borderRadius: 100,
                height: responsiveWidth(30),
              }}
            />
          </TouchableOpacity>
        </View>
        <View>
          <Text style={{ fontWeight: "500" }}>Personal Information</Text>
        </View>
        <View style={{ gap: 14 }}>
          <CustomInput
            label="Full Name"
            placeholder="Your Name"
            value={name}
            onChangeText={setName}
          />
          <CustomInput
            label="Enter Phone"
            placeholder="+92"
            value={phone}
            onChangeText={setPhone}
          />
        </View>
        <View style={{ paddingVertical: 30 }}>
          <AuthButton
            fill={true}
            onPress={() => {
              router.back();
            }}
            text="Update"
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
