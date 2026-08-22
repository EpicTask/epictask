import { FONT_SIZES } from "@/constants/FontSize";
import React, { useState } from "react";
import CustomText from "@/components/CustomText";
import CustomButton from "@/components/buttons/CustomButton";
import CustomInput from "@/components/custom-input/CustomInput";

import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

import { router } from "expo-router";
import { COLORS } from "@/constants/Colors";
import { Alert, StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import AuthButton from "@/components/buttons/AuthButton";
import { useAuth } from "@/context/AuthContext";
import authService from "@/api/authService";
import { TEEN_MIN_AGE } from "@/constants/AgePolicy";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Sign-in for teens (13+), who have their own email/password account.
 *
 * Under-13s never reach this screen with credentials of their own — they have
 * a managed profile the parent opens with a PIN — so the screen points them at
 * that path instead of leaving them stuck.
 */
const Login = () => {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearErrors = () => {
    setFormError("");
    setFieldErrors({});
  };

  const handleLogin = async () => {
    const errors: Record<string, string> = {};
    if (!EMAIL_RE.test(email.trim())) errors.email = "Enter a valid email address.";
    if (!password) errors.password = "Enter your password.";

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      setLoading(true);
      setFormError("");
      // On success the auth-state listener loads the profile and the root
      // layout routes to the kid dashboard.
      await login(email.trim().toLowerCase(), password);
    } catch (err: any) {
      setFormError(err?.message || "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!EMAIL_RE.test(email.trim())) {
      setFieldErrors({ email: "Enter your email above, then tap Forgot password." });
      return;
    }
    Alert.alert(
      "Reset Password",
      `Send a password reset link to ${email.trim().toLowerCase()}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: async () => {
            try {
              await authService.resetPassword(email.trim().toLowerCase());
              Alert.alert(
                "Check your email",
                "We sent you a link to reset your password."
              );
            } catch (e) {
              Alert.alert(
                "Error",
                e instanceof Error ? e.message : "Failed to send reset email"
              );
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={{ flex: 1, paddingVertical: 10 }}>
          <View>
            <CustomText variant="semiBold" style={styles.heading}>
              Welcome Back!
            </CustomText>
            <CustomText variant="medium" style={styles.subheading}>
              Sign in with the email and password you set up.
            </CustomText>
          </View>

          {formError ? (
            <View style={styles.errorBanner}>
              <MaterialIcons name="error-outline" size={18} color={COLORS.red} />
              <CustomText variant="medium" style={styles.errorBannerText}>
                {formError}
              </CustomText>
            </View>
          ) : null}

          <CustomInput
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              clearErrors();
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            error={fieldErrors.email}
          />

          <CustomInput
            label="Password"
            placeholder="Your password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              clearErrors();
            }}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="current-password"
            textContentType="password"
            error={fieldErrors.password}
          />

          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotRow}>
            <CustomText variant="medium" style={styles.forgotText}>
              Forgot password?
            </CustomText>
          </TouchableOpacity>

          <View style={{ gap: responsiveHeight(1.5), marginTop: responsiveHeight(1) }}>
            <AuthButton
              fill={true}
              onPress={loading ? () => {} : handleLogin}
              text={loading ? "Signing in..." : "Sign In"}
              height={responsiveHeight(6)}
            />
            <CustomButton
              fill={false}
              onPress={() => router.push("/(kid)/auth/register" as any)}
              text="I have an invite code"
              height={responsiveHeight(6)}
            />
          </View>

          <View style={styles.infoCard}>
            <MaterialIcons name="family-restroom" size={22} color={COLORS.primary} />
            <View style={{ flex: 1 }}>
              <CustomText variant="semiBold" style={styles.infoTitle}>
                Under {TEEN_MIN_AGE}?
              </CustomText>
              <CustomText style={styles.infoBody}>
                You don't have your own login. Ask your parent to sign in and tap
                "Switch to Kid Profile" — then type your PIN.
              </CustomText>
            </View>
          </View>

          <CustomButton
            fill={false}
            onPress={() => router.replace("/")}
            text="Choose a different role"
            height={responsiveHeight(6)}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: responsiveWidth(6),
  },
  heading: {
    fontSize: FONT_SIZES.display,
    color: COLORS.purple,
  },
  subheading: {
    fontSize: FONT_SIZES.small,
    color: COLORS.grey,
    marginTop: 4,
    lineHeight: 20,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FDECEC",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: responsiveHeight(2),
  },
  errorBannerText: {
    flex: 1,
    color: COLORS.red,
    fontSize: FONT_SIZES.small,
  },
  forgotRow: {
    alignSelf: "flex-end",
    marginTop: 12,
    marginBottom: responsiveHeight(2),
  },
  forgotText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.primary,
  },
  infoCard: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    backgroundColor: COLORS.light_purple,
    borderRadius: 12,
    padding: 14,
    marginVertical: responsiveHeight(3),
  },
  infoTitle: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.primary,
  },
  infoBody: {
    fontSize: FONT_SIZES.small,
    color: COLORS.black,
    marginTop: 2,
    lineHeight: 20,
  },
});
