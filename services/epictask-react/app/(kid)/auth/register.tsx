import { FONT_SIZES } from "@/constants/FontSize";
import React, { useState, useEffect } from "react";
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
import { StyleSheet, View, ScrollView } from "react-native";
import AuthButton from "@/components/buttons/AuthButton";
import CustomText from "@/components/CustomText";
import authService from "@/api/authService";
import * as Linking from "expo-linking";

const Register = () => {
  const [step, setStep] = useState(1);
  const [inviteCode, setInviteCode] = useState("");
  const [password, setPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>("avatar1");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    // Handle incoming deep link epictask://join?code=XYZ123
    const handleDeepLink = (event: { url: string }) => {
      if (event.url) {
        const parsed = Linking.parse(event.url);
        if (parsed.queryParams?.code) {
          setInviteCode(String(parsed.queryParams.code).toUpperCase());
        }
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    const subscription = Linking.addEventListener("url", handleDeepLink);
    return () => subscription.remove();
  }, []);

  const handleValidateCode = async () => {
    setFormError("");
    const cleanedCode = inviteCode.trim().toUpperCase();
    if (cleanedCode.length < 6) {
      setFormError("Please enter a valid 6-character invite code.");
      return;
    }

    try {
      setLoading(true);
      const res = await authService.validateInviteCode(cleanedCode);
      if (res.success) {
        setStep(2);
      } else {
        setFormError(res.error || "Invalid invite code.");
      }
    } catch (err: any) {
      setFormError(err.message || "Failed to validate invite code.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async () => {
    setFormError("");
    if (pin.length !== 4) {
      setFormError("Please enter a 4-digit PIN.");
      return;
    }

    try {
      setLoading(true);
      const defaultPassword = password || `EpicKid!${inviteCode}`;
      await authService.completeChildRegistration(
        inviteCode.trim().toUpperCase(),
        defaultPassword
      );
      // AuthContext listener routes to kid dashboard
      router.replace("/(kid)/(app)/(tabs)");
    } catch (err: any) {
      setFormError(err.message || "Child registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeading text="Teen Join Profile" back={true} plus={false} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ flex: 1, paddingVertical: 10 }}>
          {formError ? (
            <View style={{ paddingVertical: 8 }}>
              <CustomText
                variant="medium"
                style={{ color: COLORS.red, fontSize: FONT_SIZES.small }}
              >
                {formError}
              </CustomText>
            </View>
          ) : null}

          {step === 1 && (
            <View style={{ gap: responsiveHeight(2) }}>
              <View>
                <CustomText
                  variant="semiBold"
                  style={{ fontSize: FONT_SIZES.display, color: COLORS.purple }}
                >
                  Join Your Parent's Household
                </CustomText>
                <CustomText
                  variant="medium"
                  style={{
                    fontSize: FONT_SIZES.small,
                    color: COLORS.grey,
                    marginTop: 4,
                  }}
                >
                  Scan parent's QR code or enter the 6-character code below.
                </CustomText>
              </View>

              <CustomInput
                label="Parent Invite Code"
                placeholder="e.g. EPIC98"
                value={inviteCode}
                onChangeText={(text) => {
                  setInviteCode(text.toUpperCase());
                  setFormError("");
                }}
              />

              <AuthButton
                fill={true}
                onPress={loading ? () => {} : handleValidateCode}
                text={loading ? "Validating Code..." : "Continue"}
                height={responsiveHeight(6)}
              />
            </View>
          )}

          {step === 2 && (
            <View style={{ gap: responsiveHeight(2) }}>
              <AvatarPicker
                selectedAvatar={selectedAvatar}
                onSelectAvatar={(av) => setSelectedAvatar(av)}
              />
              <CustomButton
                fill={true}
                onPress={() => setStep(3)}
                text="Next: Set Login PIN"
                height={responsiveHeight(6)}
              />
            </View>
          )}

          {step === 3 && (
            <View style={{ gap: responsiveHeight(2) }}>
              <CustomText
                variant="semiBold"
                style={{ fontSize: FONT_SIZES.title, textAlign: "center" }}
              >
                Set Device Unlock PIN
              </CustomText>
              <CustomText
                variant="medium"
                style={{
                  fontSize: FONT_SIZES.small,
                  color: COLORS.grey,
                  textAlign: "center",
                }}
              >
                Choose a 4-digit PIN for quick switching on shared devices.
              </CustomText>

              <PinPad pin={pin} onPinChange={(newPin) => {
                setPin(newPin);
                setFormError("");
              }} />

              <AuthButton
                fill={true}
                onPress={loading ? () => {} : handleCompleteRegistration}
                text={loading ? "Completing Setup..." : "Finish Registration"}
                height={responsiveHeight(6)}
              />
            </View>
          )}
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
});
