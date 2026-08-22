import { FONT_SIZES } from "@/constants/FontSize";
import React, { useEffect, useMemo, useState } from "react";
import CustomButton from "@/components/buttons/CustomButton";
import ScreenHeading from "@/components/headings/ScreenHeading";
import CustomInput from "@/components/custom-input/CustomInput";
import AvatarPicker from "@/components/avatar/AvatarPicker";
import PinPad from "@/components/pin/PinPad";

import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

import { router } from "expo-router";
import { COLORS } from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View, ScrollView, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AuthButton from "@/components/buttons/AuthButton";
import CustomText from "@/components/CustomText";
import authService from "@/api/authService";
import * as Linking from "expo-linking";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const MIN_PASSWORD_LENGTH = 8;

type Invite = {
  code: string;
  child_name: string;
  age: number;
  grade_level: string;
  parent_name?: string;
  child_email_masked?: string;
  expires_at?: string;
};

const STEPS = ["code", "account", "avatar", "pin"] as const;
type Step = (typeof STEPS)[number];

const Register = () => {
  const [stepIndex, setStepIndex] = useState(0);
  const step: Step = STEPS[stepIndex];

  const [inviteCode, setInviteCode] = useState("");
  const [invite, setInvite] = useState<Invite | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>("avatar1");
  const [pin, setPin] = useState("");

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const firstName = useMemo(
    () => (invite?.child_name || "").split(" ")[0] || "there",
    [invite]
  );

  useEffect(() => {
    // Handle incoming deep link epictask://join?code=XYZ123
    const handleDeepLink = (event: { url: string }) => {
      if (!event.url) return;
      const parsed = Linking.parse(event.url);
      if (parsed.queryParams?.code) {
        setInviteCode(String(parsed.queryParams.code).toUpperCase());
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    const subscription = Linking.addEventListener("url", handleDeepLink);
    return () => subscription.remove();
  }, []);

  const clearErrors = () => {
    setFormError("");
    setFieldErrors({});
  };

  const handleValidateCode = async () => {
    clearErrors();
    const cleanedCode = inviteCode.trim().toUpperCase();
    if (cleanedCode.length < 6) {
      setFieldErrors({ code: "Invite codes are 6 characters." });
      return;
    }

    try {
      setLoading(true);
      const res = await authService.previewChildInvite(cleanedCode);
      if (res.success && res.invite) {
        setInvite(res.invite);
        setInviteCode(cleanedCode);
        setStepIndex(1);
      } else {
        setFieldErrors({ code: res.error || "That code isn't valid." });
      }
    } catch (err: any) {
      setFormError(err?.message || "Couldn't check that code. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccountNext = () => {
    const errors: Record<string, string> = {};

    if (!EMAIL_RE.test(email.trim())) {
      errors.email = "Enter a valid email address.";
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    if (confirmPassword !== password) {
      errors.confirmPassword = "Passwords don't match.";
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    clearErrors();
    setStepIndex(2);
  };

  const handleFinish = async () => {
    clearErrors();
    if (pin.length !== 4) {
      setFormError("Pick a 4-digit PIN.");
      return;
    }
    if (/^(\d)\1{3}$/.test(pin)) {
      setFormError("Pick a PIN that isn't the same digit four times.");
      return;
    }

    try {
      setLoading(true);
      await authService.redeemChildInvite({
        code: inviteCode,
        email: email.trim().toLowerCase(),
        password,
        pin,
        avatarKey: selectedAvatar,
      });
      // The auth-state listener loads the profile; go straight to the app.
      router.replace("/(kid)/(app)/(tabs)");
    } catch (err: any) {
      const message = err?.message || "Signup failed. Please try again.";
      setFormError(message);
      // A mismatched email is fixable — send them back to the field rather
      // than leaving them stuck on the PIN screen.
      if (/email/i.test(message)) {
        setStepIndex(1);
        setFieldErrors({ email: message });
      }
    } finally {
      setLoading(false);
    }
  };

  const renderCodeStep = () => (
    <View style={{ gap: responsiveHeight(2) }}>
      <View>
        <CustomText variant="semiBold" style={styles.heading}>
          Join Your Parent's Household
        </CustomText>
        <CustomText variant="medium" style={styles.subheading}>
          Enter the 6-character code your parent gave you.
        </CustomText>
      </View>

      <CustomInput
        label="Invite Code"
        placeholder="e.g. K7M2QP"
        value={inviteCode}
        autoCapitalize="characters"
        autoCorrect={false}
        onChangeText={(text) => {
          setInviteCode(text.toUpperCase());
          clearErrors();
        }}
        error={fieldErrors.code}
      />

      <AuthButton
        fill={true}
        onPress={loading ? () => {} : handleValidateCode}
        text={loading ? "Checking..." : "Continue"}
        height={responsiveHeight(6)}
      />

      <CustomText style={styles.footnote}>
        Under 13? You don't need a code — ask your parent to open your profile
        from their account.
      </CustomText>
    </View>
  );

  const renderAccountStep = () => (
    <View style={{ gap: responsiveHeight(1) }}>
      <View style={styles.inviteCard}>
        <MaterialIcons name="verified-user" size={22} color={COLORS.primary} />
        <View style={{ flex: 1 }}>
          <CustomText variant="semiBold" style={styles.inviteCardTitle}>
            Hi {firstName}!
          </CustomText>
          <CustomText style={styles.inviteCardBody}>
            {invite?.parent_name || "Your parent"} set this up for you
            {invite?.age ? ` — age ${invite.age}, grade ${invite.grade_level}` : ""}.
          </CustomText>
        </View>
      </View>

      <CustomText variant="semiBold" style={styles.stepTitle}>
        Create your login
      </CustomText>

      <CustomInput
        label="Email"
        placeholder={invite?.child_email_masked || "you@example.com"}
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
        helperText={
          invite?.child_email_masked
            ? `Has to match the address on your invite (${invite.child_email_masked}).`
            : undefined
        }
      />

      <CustomInput
        label="Password"
        placeholder="At least 8 characters"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          clearErrors();
        }}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        error={fieldErrors.password}
      />

      <CustomInput
        label="Confirm Password"
        placeholder="Type it again"
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
          clearErrors();
        }}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        error={fieldErrors.confirmPassword}
      />

      <View style={{ marginTop: responsiveHeight(2), gap: responsiveHeight(1.5) }}>
        <AuthButton
          fill={true}
          onPress={handleAccountNext}
          text="Next: Pick Your Avatar"
          height={responsiveHeight(6)}
        />
        <CustomButton
          fill={false}
          onPress={() => setStepIndex(0)}
          text="Back"
          height={responsiveHeight(6)}
        />
      </View>
    </View>
  );

  const renderAvatarStep = () => (
    <View style={{ gap: responsiveHeight(2) }}>
      <AvatarPicker
        selectedAvatar={selectedAvatar}
        onSelectAvatar={(av) => setSelectedAvatar(av)}
      />
      <AuthButton
        fill={true}
        onPress={() => setStepIndex(3)}
        text="Next: Set Your PIN"
        height={responsiveHeight(6)}
      />
      <CustomButton
        fill={false}
        onPress={() => setStepIndex(1)}
        text="Back"
        height={responsiveHeight(6)}
      />
    </View>
  );

  const renderPinStep = () => (
    <View style={{ gap: responsiveHeight(2) }}>
      <CustomText variant="semiBold" style={[styles.stepTitle, { textAlign: "center" }]}>
        Set your PIN
      </CustomText>
      <CustomText style={[styles.subheading, { textAlign: "center" }]}>
        A quick 4-digit code for getting back in on your own device.
      </CustomText>

      <PinPad
        pin={pin}
        onPinChange={(newPin) => {
          setPin(newPin);
          setFormError("");
        }}
      />

      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <CustomText style={styles.subheading}>Creating your account...</CustomText>
        </View>
      ) : null}

      <AuthButton
        fill={true}
        onPress={loading ? () => {} : handleFinish}
        text={loading ? "Setting up..." : "Finish Sign Up"}
        height={responsiveHeight(6)}
      />
      <CustomButton
        fill={false}
        onPress={loading ? () => {} : () => setStepIndex(2)}
        text="Back"
        height={responsiveHeight(6)}
        disabled={loading}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeading text="Teen Sign Up" back={true} plus={false} />

      <View style={styles.progressRow}>
        {STEPS.map((s, i) => (
          <View
            key={s}
            style={[styles.progressPip, i <= stepIndex && styles.progressPipActive]}
          />
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={{ flex: 1, paddingVertical: 14 }}>
          {formError ? (
            <View style={styles.errorBanner}>
              <MaterialIcons name="error-outline" size={18} color={COLORS.red} />
              <CustomText variant="medium" style={styles.errorBannerText}>
                {formError}
              </CustomText>
            </View>
          ) : null}

          {step === "code" && renderCodeStep()}
          {step === "account" && renderAccountStep()}
          {step === "avatar" && renderAvatarStep()}
          {step === "pin" && renderPinStep()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Register;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: responsiveWidth(6),
  },
  progressRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
  },
  progressPip: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.light_grey,
  },
  progressPipActive: {
    backgroundColor: COLORS.primary,
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
  stepTitle: {
    fontSize: FONT_SIZES.title,
    color: COLORS.black,
    marginTop: responsiveHeight(1),
  },
  footnote: {
    fontSize: 12,
    color: COLORS.grey,
    textAlign: "center",
    lineHeight: 18,
    marginTop: responsiveHeight(1),
  },
  inviteCard: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    backgroundColor: COLORS.light_purple,
    borderRadius: 12,
    padding: 14,
  },
  inviteCardTitle: {
    fontSize: FONT_SIZES.large,
    color: COLORS.primary,
  },
  inviteCardBody: {
    fontSize: FONT_SIZES.small,
    color: COLORS.black,
    marginTop: 2,
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
    marginBottom: 10,
  },
  errorBannerText: {
    flex: 1,
    color: COLORS.red,
    fontSize: FONT_SIZES.small,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});
