import React, { useState } from "react";
import CustomText from "@/components/CustomText";
import CustomButton from "@/components/buttons/CustomButton";

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
import { StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthButton from "@/components/buttons/AuthButton";

const Login = () => {
  const CELL_COUNT = 4;
  const [value, setValue] = useState("");
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  return (
    <SafeAreaView style={styles.safeArea}>
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
            <CustomText
              variant="semiBold"
              style={{
                fontSize: responsiveFontSize(4.5),
                color: COLORS.purple,
              }}
            >
              Join Your
            </CustomText>
            <CustomText
              variant="semiBold"
              style={{
                fontSize: responsiveFontSize(4.5),
                padding: 0,
                margin: 0,
              }}
            >
              {" "}
              Parent's
            </CustomText>
            <CustomText
              variant="semiBold"
              style={{ fontSize: responsiveFontSize(4.5) }}
            >
              Account
            </CustomText>
          </View>
        </View>
        <View style={{ gap: responsiveHeight(3), paddingVertical: 16 }}>
          <View style={{ justifyContent: "center" }}>
            <CustomText
              variant="semiBold"
              style={{ fontSize: responsiveFontSize(2) }}
            >
              Enter Parent's Invite Code
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
          <AuthButton
            fill={true}
            onPress={() => {
          router.replace("/(kid)/(app)/(tabs)");
            }}
            text="Login"
            height={responsiveHeight(6)}
          />
        </View>
        <View
          style={{
            flexWrap: "wrap",
            paddingVertical: 30,
            alignItems: "center",
            flexDirection: "row",
            paddingHorizontal: 20,
            justifyContent: "center",
          }}
        >
          <CustomText
            style={{
              color: COLORS.purple,
              fontWeight: "400",
              textDecorationLine: "underline",
              textAlign: "center",
            }}
            variant="semiBold"
          >
            Request an Invite
          </CustomText>
          <CustomText
            style={{
              color: COLORS.purple,
              fontWeight: "400",
              textAlign: "center",
              textDecorationLine: "underline",
              flexWrap: "wrap",
            }}
          >
            (Sends a request to
          </CustomText>
          <CustomText
            style={{
              color: COLORS.purple,
              fontWeight: "400",
              textAlign: "center",
              textDecorationLine: "underline",
              flexWrap: "wrap",
            }}
          >
            parent's email/phone)
          </CustomText>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Login;

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
    width: 72,
    height: 80,
    lineHeight: 78,
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
