import React, { useState } from "react";
import CustomButton from "@/components/buttons/CustomButton";
import ScreenHeading from "@/components/headings/ScreenHeading";
import CustomInput from "@/components/custom-input/CustomInput";

import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


const BasicInfo = () => {

  const [age, setAge] = useState("");
  const [level, setLevel] = useState("");
  const [name, setName] = useState("");

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
          <CustomInput
            label="Age / Date of Birth"
            value={age}
            onChangeText={setAge}
            placeholder="2/23/2025"
          />
          <CustomInput
            label="Grade or Learning Level"
            placeholder="Selecte Grade or Learning Level" 
            value={level}
            onChangeText={setLevel}
          />
        </View>
        <View style={{ paddingVertical: 30 }}>
          <CustomButton
            fill={true}
            onPress={() => {
              router.back();
            }}
            text="Back"
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
