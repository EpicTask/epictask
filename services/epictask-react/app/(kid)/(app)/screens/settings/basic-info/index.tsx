import React, { useState, useEffect } from "react";
import CustomButton from "@/components/buttons/CustomButton";
import ScreenHeading from "@/components/headings/ScreenHeading";
import CustomInput from "@/components/custom-input/CustomInput";
import CustomDropdown from "@/components/custom-dropdown/CustomDropdown";
import DateInput from "@/components/DateInput";
import { useAuth } from "@/context/AuthContext";
import { Alert, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { router } from "expo-router";

const GRADE_LEVELS = [
  "Pre-K",
  "Kindergarten",
  "1st Grade",
  "2nd Grade",
  "3rd Grade",
  "4th Grade",
  "5th Grade",
  "6th Grade",
  "7th Grade",
  "8th Grade",
  "9th Grade",
  "10th Grade",
  "11th Grade",
  "12th Grade",
];

const BasicInfo = () => {
  const { user, updateProfile, loading } = useAuth();
  
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [level, setLevel] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.displayName || "");
      setDob(user.dob || user.age || ""); // Handle both if existing
      setLevel(user.grade_level || user.gradeLevel || "");
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateProfile({
        displayName: name,
        dob: dob,
        grade_level: level,
      });
      Alert.alert("Success", "Basic info updated successfully");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeading back={true} plus={false} text="Basic Info" />
      <View style={{ gap: 10, justifyContent: "space-between", flex: 1 }}>
        <View style={{ gap: 14 }}>
          <CustomInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Full name"
          />
          <DateInput
            title="Date of Birth"
            value={dob}
            onDateChange={setDob}
          />
          <CustomDropdown
            label="Grade or Learning Level"
            placeholder="Select Grade or Learning Level" 
            value={level}
            options={GRADE_LEVELS}
            onSelect={setLevel}
          />
        </View>
        <View style={{ paddingVertical: 30, gap: 10 }}>
          <CustomButton
            fill={true}
            onPress={handleSave}
            text={isSaving ? "Saving..." : "Save"}
            height={responsiveHeight(8)}
          />
          <CustomButton
            fill={false}
            onPress={() => router.back()}
            text="Cancel"
            height={responsiveHeight(8)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default BasicInfo;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F6F9",
    height: responsiveHeight(100),
    width: responsiveWidth(100),
    padding: responsiveWidth(4),
  },
});
