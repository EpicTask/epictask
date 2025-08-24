import React, { useState } from "react";

import SafeArea from "@/components/SafeArea";
import Divider from "@/components/Divider/Divider";
import AuthButton from "@/components/buttons/AuthButton";
import CustomInput from "@/components/custom-input/CustomInput";

import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import {
  responsiveFontSize,
  responsiveHeight,
} from "react-native-responsive-dimensions";

import { ICONS } from "@/assets";
import { router } from "expo-router";
import { COLORS } from "@/constants/Colors";
import { Fontisto } from "@expo/vector-icons";
import CustomText from "@/components/CustomText";
import { useAuth } from "@/context/AuthContext";

const Register = () => {
  const [radio, toggleRadio] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const { register, loading, error } = useAuth();

  const handleRegister = async () => {
    // Validation
    if (!email || !password || !confirmPassword || !displayName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!radio) {
      Alert.alert('Error', 'Please agree to the Terms & Conditions');
      return;
    }

    try {
      await register(email, password, displayName, 'parent');
      // Navigation will be handled automatically by the AuthContext and _layout.tsx
    } catch (error) {
      Alert.alert('Registration Failed', error instanceof Error ? error.message : 'Registration failed');
    }
  };

  return (
    <SafeArea>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ flex: 1, flexDirection: "column" }}>
          <View>
            <TouchableOpacity
              style={{ paddingVertical: 10 }}
              onPress={() => {
                router.back();
              }}
            >
              {ICONS.back_arrow}
            </TouchableOpacity>
            <View style={{ paddingTop: 10 }}>
              <CustomText
                variant="semiBold"
                style={{
                  color: COLORS.primary,
                  fontSize: responsiveFontSize(4.5),
                }}
              >
                Create an
              </CustomText>
              <CustomText
                variant="semiBold"
                style={{ fontSize: responsiveFontSize(4.5), top: -14 }}
              >
                Account
              </CustomText>
            </View>
          </View>
          <View style={{}}>
            <CustomText
              variant="medium"
              style={{
                fontSize: responsiveFontSize(1.7),
                color: COLORS.grey,
                top: -14,
              }}
            >
              Enter your email and password to continue
            </CustomText>
          </View>
          <View style={{}}>
            <CustomInput
              label="Full Name"
              placeholder="Enter Your Full Name"
              value={displayName}
              onChangeText={setDisplayName}
            />
            <CustomInput
              label="Your Email"
              placeholder="Enter Your Email"
              value={email}
              onChangeText={setEmail}
            />
            <CustomInput
              label="Password"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
            />
            <CustomInput
              label="Confirm Password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={true}
            />
          </View>
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              gap: 10,
              paddingVertical: 10,
            }}
          >
            <View
              style={{
                alignItems: "center",
                width: "100%",
                paddingVertical: responsiveHeight(2),
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  toggleRadio(!radio);
                }}
                style={{ flexDirection: "row", gap: 6, alignItems: "center" }}
              >
                {radio ? (
                  <Fontisto name="radio-btn-active" size={14} color="black" />
                ) : (
                  <Fontisto name="radio-btn-passive" size={14} color="black" />
                )}
                <CustomText
                  style={{
                    color: COLORS.black,
                    fontSize: responsiveFontSize(1.75),
                  }}
                >
                  Yes, I agree to the Terms & Conditioins
                </CustomText>
              </TouchableOpacity>
            </View>
            <View style={{ width: "100%", paddingVertical: 10 }}>
              <AuthButton
                fill={true}
                text={loading ? "Creating Account..." : "Sign Up"}
                height={responsiveHeight(6)}
                onPress={loading ? () => {} : handleRegister}
              />
            </View>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                gap: 4,
                paddingBottom: responsiveHeight(5),
              }}
              onPress={() => {
                router.back();
              }}
            >
              <CustomText
                variant="medium"
                style={{
                  color: COLORS.primary,
                  fontSize: responsiveFontSize(1.7),
                }}
              >
                Already have an account?
              </CustomText>
              {ICONS.SPLASH.arrow}
              <CustomText variant="semiBold" style={{ color: COLORS.primary }}>
                Login
              </CustomText>
            </TouchableOpacity>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 20,
                width: "90%",
              }}
            >
              <Divider />
              <CustomText variant="medium" style={{ color: COLORS.grey }}>
                Or Signup With
              </CustomText>
              <Divider />
            </View>
            <View
              style={{
                gap: 10,
                width: "100%",
                paddingVertical: 10,
                alignItems: "center",
              }}
            >
              <TouchableOpacity style={styles.sso}>
                {ICONS.google}
                <CustomText>Google</CustomText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sso}>
                {ICONS.apple}
                <CustomText>Apple</CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeArea>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sso: {
    backgroundColor: COLORS.white,
    gap: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    width: "90%",
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 30,
  },
});
