import { FONT_SIZES } from "@/constants/FontSize";
import {
  Image,
  StyleSheet,
  TextInput,
  View,
  ActivityIndicator,
  Share,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import ScreenHeading from "@/components/headings/ScreenHeading";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "@/components/buttons/CustomButton";
import { IMAGES } from "@/assets";

import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import { router } from "expo-router";
import CustomText from "@/components/CustomText";
import CustomInput from "@/components/custom-input/CustomInput";
import CustomDropdown from "@/components/custom-dropdown/CustomDropdown";
import { useAuth } from "@/context/AuthContext";
import authService from "@/api/authService";
import { COLORS } from "@/constants/Colors";
import * as Clipboard from "expo-clipboard";

export const gradeFromAge = (ageStr: string): string => {
  const age = parseInt(ageStr, 10);
  if (isNaN(age)) return "K";
  if (age <= 4) return "TK";
  if (age === 5) return "K";
  if (age >= 18) return "12";
  return (age - 5).toString();
};

const AddKid = () => {
  const CELL_COUNT = 4;
  const [step, setStep] = useState(1);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  // Form state
  const [fullName, setFullName] = useState("");
  const [selectedAge, setSelectedAge] = useState("");
  const [selectedGradeLevel, setSelectedGradeLevel] = useState("");

  // Age options: 4-18 years
  const ageOptions = [
    "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18"
  ];

  // Grade level options: TK-12
  const gradeLevelOptions = [
    "TK", "K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"
  ];

  const handleAgeChange = (age: string) => {
    setSelectedAge(age);
    const derived = gradeFromAge(age);
    setSelectedGradeLevel(derived);
    setFormError("");
  };

  const isUnder13 = selectedAge ? parseInt(selectedAge, 10) < 13 : true;

  const validateStep1 = () => {
    setFormError("");
    if (!fullName.trim()) {
      setFormError("Please enter the child's full name.");
      return false;
    }
    if (!selectedAge) {
      setFormError("Please select the child's age.");
      return false;
    }
    if (!selectedGradeLevel) {
      setFormError("Please select the child's grade level.");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    setFormError("");
    if (value.length !== 4) {
      setFormError("Please enter a 4-digit PIN.");
      return false;
    }
    return true;
  };

  const handleCopyCode = async () => {
    if (generatedCode) {
      await Clipboard.setStringAsync(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareCode = async () => {
    if (generatedCode) {
      try {
        await Share.share({
          message: `Join our EpicTask family account! Your invite code is: ${generatedCode}`,
        });
      } catch (e) {
        console.error("Share error:", e);
      }
    }
  };

  // Handle form submission
  const handleAddKid = async () => {
    if (!validateStep3()) return;

    if (!user?.uid) {
      setFormError("User not authenticated. Please log in again.");
      return;
    }

    try {
      setLoading(true);
      setFormError("");

      const childAgeInt = parseInt(selectedAge, 10);

      // Create pending invite or managed profile
      const childData = {
        name: fullName.trim(),
        age: selectedAge,
        gradeLevel: selectedGradeLevel,
        pinHash: value, // Server handles secure PIN hashing
        image: null,
        parental_consent: new Date().toISOString(),
      };

      const result = await authService.createPendingInvite(user.uid, childData);

      if (result.success && result.inviteCode) {
        const inviteCode = result.inviteCode;
        setGeneratedCode(inviteCode);
        if (childAgeInt < 13) {
          // For managed profiles under 13, setup is complete immediately
          setStep(4);
        } else {
          // Teen invite account (13-18)
          setStep(4);
        }
      } else {
        setFormError("Failed to create child profile. Please try again.");
      }
    } catch (error: any) {
      console.error("Add kid error:", error);
      setFormError(error?.message || "Failed to create child profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeading text="Kid Profile" back={true} plus={false} />
      <View
        style={{
          justifyContent: "space-between",
          flex: 1,
          paddingVertical: 20,
        }}
      >
        {formError ? (
          <View style={{ paddingVertical: 8 }}>
            <CustomText variant="medium" style={{ color: COLORS.red, fontSize: FONT_SIZES.small }}>
              {formError}
            </CustomText>
          </View>
        ) : null}

        {step === 1 && (
          <View style={{ justifyContent: "space-between", flex: 1 }}>
            <View style={{ gap: 10 }}>
              <CustomInput
                label="First & Last Name"
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  setFormError("");
                }}
                placeholder="Enter child's name"
                capitalizeFirstLetter={true}
              />
              <CustomDropdown
                label="Age"
                value={selectedAge}
                options={ageOptions}
                onSelect={handleAgeChange}
                placeholder="Select age (4-18)"
              />
              <CustomDropdown
                label="Grade Level (Auto-derived)"
                value={selectedGradeLevel}
                options={gradeLevelOptions}
                onSelect={(grade) => {
                  setSelectedGradeLevel(grade);
                  setFormError("");
                }}
                placeholder="Select grade level (TK-12)"
              />
              <CustomText variant="medium" style={{ fontSize: FONT_SIZES.small, color: COLORS.grey, marginTop: 4 }}>
                {isUnder13
                  ? "Child is under 13 — managed profile created directly (no email required)."
                  : "Teen (13-18) — an invite code & QR code will be generated to pair their device."}
              </CustomText>
            </View>
            <CustomButton
              fill={true}
              onPress={() => {
                if (validateStep1()) {
                  setStep(2);
                }
              }}
              text="Next"
              height={responsiveHeight(7)}
            />
          </View>
        )}

        {step === 2 && (
          <View style={{ justifyContent: "space-between", flex: 1 }}>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                paddingVertical: 20,
              }}
            >
              <CustomText variant="semiBold" style={{ fontSize: FONT_SIZES.title, marginBottom: 12 }}>
                Child Profile Avatar
              </CustomText>
              <Image
                source={IMAGES.profile}
                style={{
                  height: responsiveWidth(24),
                  width: responsiveWidth(24),
                  borderRadius: responsiveWidth(12),
                }}
              />
            </View>
            <CustomButton
              fill={true}
              onPress={() => setStep(3)}
              text="Next"
              height={responsiveHeight(7)}
            />
          </View>
        )}

        {step === 3 && (
          <View style={{ gap: responsiveHeight(10) }}>
            <View style={{ justifyContent: "center" }}>
              <CustomText
                variant="semiBold"
                style={{ fontSize: FONT_SIZES.title }}
              >
                Create Login PIN
              </CustomText>
              <CustomText
                variant="medium"
                style={{ fontSize: FONT_SIZES.small, color: COLORS.grey, marginTop: 4 }}
              >
                Set a 4-digit PIN for device unlocking.
              </CustomText>
              <CodeField
                ref={ref}
                {...props}
                value={value}
                onChangeText={(val) => {
                  setValue(val);
                  setFormError("");
                }}
                cellCount={CELL_COUNT}
                rootStyle={styles.codeFieldRoot}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                InputComponent={TextInput}
                testID="my-code-input"
                renderCell={({ index, symbol, isFocused }) => (
                  <CustomText
                    key={index}
                    style={[styles.cell, isFocused && styles.focusCell]}
                    onLayout={getCellOnLayoutHandler(index)}
                  >
                    {symbol || (isFocused ? <Cursor /> : null)}
                  </CustomText>
                )}
              />
            </View>
            <CustomButton
              fill={true}
              onPress={loading ? () => {} : handleAddKid}
              text={loading ? "Creating..." : "Add Kid"}
              height={responsiveHeight(7)}
            />
            {loading && (
              <View style={{ alignItems: "center", marginTop: 10 }}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            )}
          </View>
        )}

        {step === 4 && (
          <View style={{ justifyContent: "space-between", flex: 1, paddingVertical: 10 }}>
            <View style={{ alignItems: "center", gap: 16 }}>
              <CustomText variant="semiBold" style={{ fontSize: FONT_SIZES.title, color: COLORS.primary }}>
                Child Profile Created!
              </CustomText>
              <CustomText variant="medium" style={{ textAlign: "center", color: COLORS.grey }}>
                {isUnder13
                  ? `Managed profile for ${fullName} is ready on this device.`
                  : `Share this single-use invite code with ${fullName} to link their teen account.`}
              </CustomText>

              <View style={styles.codeContainer}>
                <CustomText variant="bold" style={styles.codeText}>
                  {generatedCode}
                </CustomText>
              </View>

              <View style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
                <TouchableOpacity style={styles.actionBtn} onPress={handleCopyCode}>
                  <CustomText variant="medium" style={{ color: COLORS.white }}>
                    {copied ? "Copied!" : "Copy Code"}
                  </CustomText>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.primary }]} onPress={handleShareCode}>
                  <CustomText variant="medium" style={{ color: COLORS.white }}>
                    Share Code
                  </CustomText>
                </TouchableOpacity>
              </View>
            </View>

            <CustomButton
              fill={true}
              onPress={() => router.back()}
              text="Done"
              height={responsiveHeight(7)}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default AddKid;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: "space-between",
    height: responsiveHeight(100),
    width: responsiveWidth(100),
    padding: responsiveWidth(6),
  },
  codeFieldRoot: { marginTop: 20, justifyContent: "space-between" },
  cell: {
    width: 70,
    height: 70,
    lineHeight: 68,
    fontSize: 24,
    borderWidth: 1,
    borderColor: COLORS.grey,
    backgroundColor: COLORS.white,
    textAlign: "center",
    borderRadius: 8,
    marginHorizontal: 1,
  },
  focusCell: {
    color: COLORS.white,
    backgroundColor: COLORS.primary,
  },
  codeContainer: {
    backgroundColor: COLORS.grey,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginVertical: 10,
  },
  codeText: {
    fontSize: 28,
    letterSpacing: 4,
    color: COLORS.black,
  },
  actionBtn: {
    backgroundColor: COLORS.grey,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});
