import React from "react";
import Divider from "@/components/Divider/Divider";
import CustomButton from "@/components/buttons/CustomButton";
import CustomInput from "@/components/custom-input/CustomInput";

import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

import { IMAGES } from "@/assets";
import { router } from "expo-router";
import { COLORS } from "@/constants/Colors";
import { Image, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomText from "@/components/CustomText";
import AuthButton from "@/components/buttons/AuthButton";

const CreateProfile = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={{
          paddingVertical: 20,
        }}
      >
        <CustomText
          variant="semiBold"
          style={{
            fontSize: responsiveFontSize(3.5),
          }}
        >
          Create Your Profile
        </CustomText>
        <CustomText
          variant="medium"
          style={{ color: COLORS.grey, fontSize: responsiveFontSize(1.7) }}
        >
          You can setup your profile details
        </CustomText>
      </View>
      <View style={{ gap: 10 }}>
        <View style={{ paddingVertical: 10 }}>
          <Image
            source={IMAGES.upload_profile}
            style={{ width: responsiveWidth(30), height: responsiveWidth(30) }}
          />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <CustomText variant="medium" style={{ }}>
            Personal Information
          </CustomText>
          <Divider />
        </View>
        <View style={{ gap: 14 }}>
          <CustomInput label="Name" placeholder="Your Name" value={""} onChangeText={() => {}} />
          <CustomInput
            label="Phone Number"
            placeholder="+92"
            value={""}
            onChangeText={() => {}}
          />
        </View>
        <View style={{ paddingVertical: 30 }}>
          <AuthButton
            fill={true}
            onPress={() => {
          router.replace("/(app)/(tabs)" as any);
            }}
            text="Complete"
            height={responsiveHeight(6)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CreateProfile;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F6F9",
    height: responsiveHeight(100),
    width: responsiveWidth(100),
    padding: responsiveWidth(4),
  },
});
