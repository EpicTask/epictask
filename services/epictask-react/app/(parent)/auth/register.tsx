import { FONT_SIZES } from "@/constants/FontSize";
import React, { useState } from "react";

import SafeArea from "@/components/SafeArea";
import AuthButton from "@/components/buttons/AuthButton";
import CustomInput from "@/components/custom-input/CustomInput";

import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { responsiveHeight } from "react-native-responsive-dimensions";

import { ICONS } from "@/assets";
import { router } from "expo-router";
import { COLORS } from "@/constants/Colors";
import CustomText from "@/components/CustomText";
import { useAuth } from "@/context/AuthContext";

const Register = () => {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");
  const { register, loading } = useAuth();

  const validateEmail = (text: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(text);
  };

  const handleRegister = async () => {
    setFormError("");
    if (!email.trim() || !password.trim()) {
      setFormError("Please fill in both email and password");
      return;
    }

    if (!validateEmail(email.trim())) {
      setFormError("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long");
      return;
    }

    try {
      // Default display name derived from email local-part if not set yet
      const defaultName = email.split("@")[0] || "Parent";
      await register(email.trim(), password, defaultName, "parent");
      // AuthContext and _layout.tsx handle navigation
    } catch (err: any) {
      setFormError(err instanceof Error ? err.message : "Registration failed");
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
                  fontSize: FONT_SIZES.display,
                }}
              >
                Create an
              </CustomText>
              <CustomText
                variant="semiBold"
                style={{ fontSize: FONT_SIZES.display, top: -14 }}
              >
                Account
              </CustomText>
            </View>
          </View>
          <View>
            <CustomText
              variant="medium"
              style={{
                fontSize: FONT_SIZES.small,
                color: COLORS.grey,
                top: -14,
              }}
            >
              Enter your email and password to continue
            </CustomText>
          </View>

          {formError ? (
            <View style={{ paddingVertical: 8 }}>
              <CustomText variant="medium" style={{ color: COLORS.red, fontSize: FONT_SIZES.small }}>
                {formError}
              </CustomText>
            </View>
          ) : null}

          <View style={{ paddingVertical: 10 }}>
            <CustomInput
              label="Your Email"
              placeholder="Enter Your Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setFormError("");
              }}
            />
            <CustomInput
              label="Password"
              placeholder="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setFormError("");
              }}
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
                paddingVertical: responsiveHeight(1),
              }}
            >
              <CustomText
                style={{
                  color: COLORS.grey,
                  fontSize: FONT_SIZES.small,
                  textAlign: "center",
                }}
              >
                By continuing you agree to our Terms & Conditions and Privacy Policy.
              </CustomText>
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
                  fontSize: FONT_SIZES.small,
                }}
              >
                Already have an account?
              </CustomText>
              {ICONS.SPLASH.arrow}
              <CustomText variant="semiBold" style={{ color: COLORS.primary }}>
                Login
              </CustomText>
            </TouchableOpacity>
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
});
