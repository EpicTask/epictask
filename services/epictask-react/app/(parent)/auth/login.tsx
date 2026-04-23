import { FONT_SIZES } from "@/constants/FontSize";
import React, { useState } from "react";

import SafeArea from "@/components/SafeArea";
import AuthButton from "@/components/buttons/AuthButton";
import CustomInput from "@/components/custom-input/CustomInput";

import { router } from "expo-router";
import { COLORS } from "@/constants/Colors";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import CustomText from "@/components/CustomText";
import { useAuth } from "@/context/AuthContext";
import DebouncedTouchableOpacity from "@/components/buttons/DebouncedTouchableOpacity";
import authService from "@/api/authService";
import { ICONS } from "@/assets";

const Login = () => {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const { login, loading, error } = useAuth();

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (error) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'Login failed');
    }
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      Alert.alert('Reset Password', 'Enter your email address above, then tap Forgot Password.');
      return;
    }
    Alert.alert(
      'Reset Password',
      `Send a password reset link to ${email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            try {
              await authService.resetPassword(email.trim());
              Alert.alert('Email Sent', 'Check your inbox for a password reset link.');
            } catch (e) {
              Alert.alert('Error', e instanceof Error ? e.message : 'Failed to send reset email');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeArea>
      <ScrollView showsVerticalScrollIndicator={false} style={{flex:1}}>
        <View style={{ flex: 1, flexDirection: "column", gap: 4 }}>
          <View style={{ paddingVertical: 12 }}>
            <CustomText
              variant="semiBold"
              style={{
                color: COLORS.primary,
                fontSize: FONT_SIZES.display,
              }}
            >
              Welcome!
            </CustomText>
            {/* <CustomText
              variant="semiBold"
              style={{ fontSize: FONT_SIZES.display, top: -14 }}
            >
              Back!
            </CustomText> */}
          </View>
          <View style={{paddingVertical: 12}}>
            {/* <CustomText
              variant="semiBold"
              style={{ fontSize: FONT_SIZES.subtitle }}
            >
              Login Now
            </CustomText> */}
          </View>
          <View style={{}}>
            <CustomInput
              placeholder="Enter email.."
              label="Your Email"
              value={email}
              onChangeText={setEmail}
            />
            <CustomInput
              label="Password"
              placeholder="Enter password..."
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
            />
            <View style={{paddingVertical: 12}}></View>
            <View style={{ paddingTop: 28 }}>
              <AuthButton
                fill={true}
                onPress={loading ? () => {} : handleLogin}
                text={loading ? "Logging in..." : "Login"}
              />
            </View>
          </View>
          <View
            style={{
              gap: 16,
              paddingVertical: 16,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <TouchableOpacity onPress={handleForgotPassword}>
                <CustomText
                  variant="medium"
                  style={{
                    textDecorationLine: "underline",
                    color: COLORS.grey,
                  }}
                >
                  Forgot Password?
                </CustomText>
              </TouchableOpacity>
            </View>
            <DebouncedTouchableOpacity
              style={{ flexDirection: "row", gap: 4 }}
              onPress={() => {
                router.push("/auth/register" as any);
              }}
            >
              <CustomText
                variant="medium"
                style={{ color: COLORS.primary, fontWeight: "400" }}
              >
                New Here?
              </CustomText>
              {ICONS.SPLASH.arrow}
              <CustomText
                variant="semiBold"
                style={{ color: COLORS.primary, fontWeight: "500" }}
              >
                SignUp
              </CustomText>
            </DebouncedTouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeArea>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
