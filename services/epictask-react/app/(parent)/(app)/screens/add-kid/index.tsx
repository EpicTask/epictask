import { Image, StyleSheet, Text, TextInput, View, Alert, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import ScreenHeading from "@/components/headings/ScreenHeading";
import {
  responsiveFontSize,
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

const AddKid = () => {
  const CELL_COUNT = 4;
  const [step, setStep] = useState(1);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedAge, setSelectedAge] = useState("");
  const [selectedGradeLevel, setSelectedGradeLevel] = useState("");

  // Age options: 4-18 years
  const ageOptions = ["4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18"];
  
  // Grade level options: TK-12
  const gradeLevelOptions = ["TK", "K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateStep1 = () => {
    if (!fullName.trim()) {
      Alert.alert("Validation Error", "Please enter the child's full name.");
      return false;
    }
    if (!email.trim()) {
      Alert.alert("Validation Error", "Please enter the child's email address.");
      return false;
    }
    if (!validateEmail(email)) {
      Alert.alert("Validation Error", "Please enter a valid email address.");
      return false;
    }
    if (!selectedAge) {
      Alert.alert("Validation Error", "Please select the child's age.");
      return false;
    }
    if (!selectedGradeLevel) {
      Alert.alert("Validation Error", "Please select the child's grade level.");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (value.length !== 4) {
      Alert.alert("Validation Error", "Please enter a 4-digit PIN.");
      return false;
    }
    return true;
  };

  // Simple hash function for PIN (temporary - will be properly hashed in backend)
  const hashPin = (pin: string): string => {
    let hash = 0;
    for (let i = 0; i < pin.length; i++) {
      const char = pin.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString();
  };

  // Handle form submission
  const handleAddKid = async () => {
    if (!validateStep3()) return;
    
    if (!user?.uid) {
      Alert.alert("Error", "User not authenticated. Please log in again.");
      return;
    }

    try {
      setLoading(true);

      // Hash the PIN (simple hash for now)
      const pinHash = hashPin(value);

      // Create pending invite
      const childData = {
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        age: selectedAge,
        gradeLevel: selectedGradeLevel,
        pinHash: pinHash,
        image: null // For now, we'll handle image upload later
      };

      const result = await authService.createPendingInvite(user.uid, childData);

      if (result.success) {
        Alert.alert(
          "Invitation Sent!",
          `An invitation has been sent to ${email}. Your child can complete their registration by clicking the link in their email.`,
          [
            {
              text: "OK",
              onPress: () => router.back()
            }
          ]
        );
      } else {
        throw new Error("Failed to create invitation");
      }
    } catch (error: any) {
      console.error("Add kid error:", error);
      Alert.alert(
        "Error",
        error?.message || "Failed to create child invitation. Please try again."
      );
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
        {step === 1 && (
          <View style={{ justifyContent: "space-between", flex: 1 }}>
            <View style={{ gap: 10 }}>
              <CustomInput
                label="Full Name"
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter full name"
              />
              <CustomInput
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter child's email address"
              />
              <CustomDropdown
                label="Age"
                value={selectedAge}
                options={ageOptions}
                onSelect={setSelectedAge}
                placeholder="Select age (4-18)"
              />
              <CustomDropdown
                label="Grade Level"
                value={selectedGradeLevel}
                options={gradeLevelOptions}
                onSelect={setSelectedGradeLevel}
                placeholder="Select grade level (TK-12)"
              />
            </View>
            <CustomButton
              fill={true}
              onPress={() => {
                if (validateStep1()) {
                  setStep(step + 1);
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
              <Image
                source={IMAGES.profile}
                style={{
                  height: responsiveWidth(20),
                  width: responsiveWidth(20),
                }}
              />
            </View>
            <CustomButton
              fill={true}
              onPress={() => setStep(step + 1)}
              text="Next"
              height={responsiveHeight(7)}
            />
          </View>
        )}
        {step === 3 && (
          <View style={{ gap: responsiveHeight(20) }}>
            <View style={{ justifyContent: "center" }}>
              <CustomText
                variant="semiBold"
                style={{ fontSize: responsiveFontSize(3) }}
              >
                Create Login PIN
              </CustomText>
              <CodeField
                ref={ref}
                {...props}
                value={value}
                onChangeText={setValue}
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
                <ActivityIndicator size="small" color="#EE4266" />
              </View>
            )}
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
    backgroundColor: "#F1F6F9",
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
    borderWidth: 0,
    borderColor: "#00000010",
    backgroundColor: "#fff",
    textAlign: "center",
    borderRadius: 8,
    marginHorizontal: 1,
  },
  focusCell: {
    color: "white",
    backgroundColor: "#EE4266",
  },
});
