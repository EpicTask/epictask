import React, { useState } from "react";
import CustomButton from "@/components/buttons/CustomButton";
import ScreenHeading from "@/components/headings/ScreenHeading";

import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";

import { router } from "expo-router";
import { COLORS } from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text, TextInput, View } from "react-native";
import AuthButton from "@/components/buttons/AuthButton";

const Register = () => {

  const CELL_COUNT = 4;
  const [value, setValue] = useState("");
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeading text="Kid Profile" back={true} plus={false} />
      <View
        style={{
          flex: 1,
          paddingVertical: 20,
        }}
      >
        <View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Text
              style={{ fontSize: responsiveFontSize(5), fontWeight:"500", color: COLORS.purple }}
            >
              Join Your
            </Text>
            <Text style={{ fontSize: responsiveFontSize(5), fontWeight:"600", }}> Parent's</Text>
            <Text style={{ fontSize: responsiveFontSize(5), fontWeight:"600", }}> Account</Text>
          </View>
        </View>
        <View style={{ gap: responsiveHeight(4), paddingVertical:20 }}>
          <View style={{ justifyContent: "center" }}>
            <Text style={{ fontSize: responsiveFontSize(2), fontWeight:"500" }}>
              Enter Parent's Invite Code
            </Text>
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
                <Text
                  key={index}
                  style={[styles.cell, isFocused && styles.focusCell]}
                  onLayout={getCellOnLayoutHandler(index)}
                >
                  {symbol || (isFocused ? <Cursor /> : null)}
                </Text>
              )}
            />
          </View>
          <AuthButton
            fill={true}
            onPress={() => router.back()}
            text="Register"
            height={responsiveHeight(6)}
          />
        </View>
        <View
          style={{
            flexWrap: "wrap",
            paddingVertical:30,
            alignItems: "center",
            flexDirection: "row",
            paddingHorizontal: 20,
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: COLORS.purple,
              fontWeight: "400",
              textAlign: "center",
            }}
          >
            Request an Invite (Sends a request to parent's email/phone)
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Register;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F6F9",
    justifyContent: "space-between",
    height: responsiveHeight(100),
    width: responsiveWidth(100),
    padding: responsiveWidth(6),
  },
  codeFieldRoot: { marginTop: 10, justifyContent: "flex-start" },
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
    marginHorizontal: "auto",
  },
  focusCell: {
    color: "white",
    backgroundColor: "#EE4266",
  },
});
