import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import ScreenHeading from "@/components/headings/ScreenHeading";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/Colors";
import CustomInput from "@/components/custom-input/CustomInput";
import CustomButton from "@/components/buttons/CustomButton";
import { router } from "expo-router";
import CustomText from "@/components/CustomText";

const UpdatePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeading text="Update Password" plus={false} back={true} />
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <View>
          <View style={{ paddingVertical: 20, gap: 6 }}>
            <CustomText
              variant="semiBold"
              style={{ fontSize: responsiveFontSize(3.6) }}
            >
              Reset Password
            </CustomText>
            <Text style={{ color: COLORS.grey, paddingRight: 40 }}>
              Set a new password to secure your account and keep it unique.
            </Text>
          </View>
          <View style={{ gap: 14, paddingVertical: 10 }}>
            <CustomInput
              secureTextEntry={true}
              value={currentPassword}
              label="Current password"
              placeholder="Current password"
              onChangeText={setCurrentPassword}
            />
            <CustomInput
              label="Password"
              value={password}
              placeholder="Password"
              secureTextEntry={true}
              onChangeText={setPassword}
            />
            <CustomInput
              secureTextEntry={true}
              value={confirmPassword}
              label="Confirm password"
              placeholder="Confirm Password"
              onChangeText={setConfirmPassword}
            />
          </View>
        </View>
        <CustomButton
          fill={true}
          onPress={() => {
            router.back();
          }}
          text="Confirm"
          height={responsiveHeight(8)}
        />
      </View>
    </SafeAreaView>
  );
};

export default UpdatePassword;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F6F9",
    height: responsiveHeight(100),
    width: responsiveWidth(100),
    padding: responsiveWidth(4),
  },
});
