import { FONT_SIZES } from "@/constants/FontSize";
import React, { useState } from "react";
import CustomButton from "@/components/buttons/CustomButton";
import ScreenHeading from "@/components/headings/ScreenHeading";

import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

import { router } from "expo-router";
import { Alert, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import { MaterialIcons } from "@expo/vector-icons";
import CustomText from "@/components/CustomText";
import { COLORS } from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";
import authService from "@/api/authService";

const CELL_COUNT = 4;

const PinField = ({
  title,
  value,
  onChange,
  editable = true,
}: {
  title: string;
  value: string;
  onChange: (v: string) => void;
  editable?: boolean;
}) => {
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue: onChange,
  });

  return (
    <View>
      <CustomText
        variant="semiBold"
        style={{ fontSize: FONT_SIZES.medium, color: COLORS.black }}
      >
        {title}
      </CustomText>
      <CodeField
        ref={ref}
        {...props}
        value={value}
        onChangeText={onChange}
        cellCount={CELL_COUNT}
        rootStyle={styles.codeFieldRoot}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        InputComponent={TextInput}
        secureTextEntry
        editable={editable}
        renderCell={({ index, symbol, isFocused }) => (
          <View
            key={index}
            style={[styles.cell, isFocused && styles.focusCell]}
            onLayout={getCellOnLayoutHandler(index)}
          >
            <CustomText variant="semiBold" style={styles.cellText}>
              {symbol ? "●" : isFocused ? <Cursor /> : ""}
            </CustomText>
          </View>
        )}
      />
    </View>
  );
};

/**
 * Teen self-service PIN change.
 *
 * A parent viewing a managed child's profile can't change the PIN here — they
 * own it, and resetting it lives in Settings → Kid Profiles on their side. That
 * keeps "who can change this PIN" unambiguous.
 */
const ChangePIN = () => {
  const { effectiveUserId, isSharedDeviceMode } = useAuth();

  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");

    if (currentPin.length !== 4) {
      setError("Enter your current PIN.");
      return;
    }
    if (newPin.length !== 4) {
      setError("Your new PIN needs 4 digits.");
      return;
    }
    if (/^(\d)\1{3}$/.test(newPin)) {
      setError("Pick a PIN that isn't the same digit four times.");
      return;
    }
    if (newPin !== confirmPin) {
      setError("The two new PINs don't match.");
      return;
    }
    if (newPin === currentPin) {
      setError("That's already your PIN — pick a different one.");
      return;
    }
    if (!effectiveUserId) {
      setError("You've been signed out. Please sign in again.");
      return;
    }

    try {
      setSaving(true);

      const check = await authService.verifyChildPIN(effectiveUserId, currentPin);
      if (!check?.success) {
        setError("That current PIN isn't right.");
        setCurrentPin("");
        return;
      }

      await authService.setChildPin(effectiveUserId, newPin);
      Alert.alert("PIN updated", "Use your new PIN next time you sign in.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      setError(e?.message || "Couldn't update your PIN. Please try again.");
      setCurrentPin("");
    } finally {
      setSaving(false);
    }
  };

  if (isSharedDeviceMode) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeading text="Change Your PIN" plus={false} back={true} />
        <View style={styles.blockedContainer}>
          <MaterialIcons name="lock-outline" size={40} color={COLORS.grey} />
          <CustomText variant="semiBold" style={styles.blockedTitle}>
            Your parent sets this PIN
          </CustomText>
          <CustomText style={styles.blockedBody}>
            Ask them to open Settings → Kid Profiles on their account to change it.
          </CustomText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeading text="Change Your PIN" plus={false} back={true} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: 28, paddingVertical: 24 }}>
          {error ? (
            <View style={styles.errorBanner}>
              <MaterialIcons name="error-outline" size={18} color={COLORS.red} />
              <CustomText variant="medium" style={styles.errorBannerText}>
                {error}
              </CustomText>
            </View>
          ) : null}

          <PinField
            title="Current PIN"
            value={currentPin}
            onChange={(v) => {
              setCurrentPin(v);
              setError("");
            }}
            editable={!saving}
          />
          <PinField
            title="New PIN"
            value={newPin}
            onChange={(v) => {
              setNewPin(v);
              setError("");
            }}
            editable={!saving}
          />
          <PinField
            title="Confirm New PIN"
            value={confirmPin}
            onChange={(v) => {
              setConfirmPin(v);
              setError("");
            }}
            editable={!saving}
          />
        </View>
      </ScrollView>

      <View style={{ paddingBottom: responsiveHeight(2) }}>
        <CustomButton
          fill={true}
          onPress={handleSave}
          text={saving ? "Saving..." : "Save New PIN"}
          height={responsiveHeight(7)}
          disabled={saving}
        />
      </View>
    </SafeAreaView>
  );
};

export default ChangePIN;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: responsiveWidth(6),
  },
  codeFieldRoot: {
    marginTop: 14,
    justifyContent: "space-between",
    width: responsiveWidth(62),
  },
  cell: {
    width: responsiveWidth(13),
    height: responsiveWidth(13),
    borderWidth: 2,
    borderColor: "#E0E0E0",
    backgroundColor: COLORS.white,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  focusCell: {
    borderColor: COLORS.primary,
    backgroundColor: "#f3f4f6",
  },
  cellText: {
    fontSize: FONT_SIZES.large,
    color: COLORS.primary,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FDECEC",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  errorBannerText: {
    flex: 1,
    color: COLORS.red,
    fontSize: FONT_SIZES.small,
  },
  blockedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: responsiveWidth(6),
  },
  blockedTitle: {
    fontSize: FONT_SIZES.large,
    color: COLORS.black,
    textAlign: "center",
  },
  blockedBody: {
    fontSize: FONT_SIZES.small,
    color: COLORS.grey,
    textAlign: "center",
    lineHeight: 20,
  },
});
