import { FONT_SIZES } from "@/constants/FontSize";
import React, { useState } from "react";
import CustomText from "@/components/CustomText";
import CustomButton from "@/components/buttons/CustomButton";
import AvatarPicker from "@/components/avatar/AvatarPicker";
import PinPad from "@/components/pin/PinPad";

import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

import { router } from "expo-router";
import { COLORS } from "@/constants/Colors";
import { StyleSheet, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthButton from "@/components/buttons/AuthButton";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>("avatar1");
  const [pin, setPin] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const { switchToChildContext } = useAuth();

  const handlePinSubmit = async () => {
    setFormError("");
    if (pin.length !== 4) {
      setFormError("Please enter your 4-digit PIN.");
      return;
    }

    try {
      setLoading(true);
      // For shared device mode, verify PIN and enter child context
      const res = await switchToChildContext("child-profile-id", pin);
      if (res.success) {
        router.replace("/(kid)/(app)/(tabs)");
      } else {
        setFormError("Incorrect PIN. Please try again.");
      }
    } catch (err: any) {
      setFormError(err.message || "Login failed. Please check your PIN.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ flex: 1, paddingVertical: 10 }}>
          <View>
            <CustomText
              variant="semiBold"
              style={{
                fontSize: FONT_SIZES.display,
                color: COLORS.purple,
              }}
            >
              Welcome Back!
            </CustomText>
            <CustomText
              variant="medium"
              style={{
                fontSize: FONT_SIZES.small,
                color: COLORS.grey,
                marginTop: 4,
              }}
            >
              Select your profile avatar and enter your PIN to sign in.
            </CustomText>
          </View>

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
            <View style={{ gap: responsiveHeight(2), marginTop: responsiveHeight(2) }}>
              <AvatarPicker
                selectedAvatar={selectedAvatar}
                onSelectAvatar={(av) => {
                  setSelectedAvatar(av);
                  setFormError("");
                }}
              />
              <AuthButton
                fill={true}
                onPress={() => setStep(2)}
                text="Next: Enter PIN"
                height={responsiveHeight(6)}
              />
              <CustomButton
                fill={false}
                onPress={() => router.replace("/")}
                text="Choose Role"
                height={responsiveHeight(6)}
              />
            </View>
          )}

          {step === 2 && (
            <View style={{ gap: responsiveHeight(2), marginTop: responsiveHeight(2) }}>
              <CustomText
                variant="semiBold"
                style={{ fontSize: FONT_SIZES.title, textAlign: "center" }}
              >
                Enter Your PIN
              </CustomText>

              <PinPad
                pin={pin}
                onPinChange={(newPin) => {
                  setPin(newPin);
                  setFormError("");
                }}
              />

              <AuthButton
                fill={true}
                onPress={loading ? () => {} : handlePinSubmit}
                text={loading ? "Verifying PIN..." : "Sign In"}
                height={responsiveHeight(6)}
              />

              <CustomButton
                fill={false}
                onPress={() => setStep(1)}
                text="Back to Avatars"
                height={responsiveHeight(6)}
              />
            </View>
          )}
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
});
