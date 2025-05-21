import React, { useState } from "react";
import CustomButton from "@/components/buttons/CustomButton";
import ScreenHeading from "@/components/headings/ScreenHeading";

import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

import { router } from "expo-router";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import CustomText from "@/components/CustomText";

const PinComponent = ({ title }: { title: string }) => {
  const CELL_COUNT = 4;
  const [value, setValue] = useState("");
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  return (
    <View style={{ gap: responsiveHeight(10) }}>
      <View style={{ justifyContent: "center" }}>
        <CustomText variant="semiBold" style={{ fontSize: responsiveFontSize(2.5), fontWeight: "500" }}>
          {title}
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
            variant="semiBold"
              key={index}
              style={[styles.cell, isFocused && styles.focusCell]}
              onLayout={getCellOnLayoutHandler(index)}
            >
              {symbol || (isFocused ? <Cursor /> : null)}
            </CustomText>
          )}
        />
      </View>
    </View>
  );
};

const ChangePIN = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeading text="Change Your PIN" plus={false} back={true} />
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <View style={{ gap: 30, paddingVertical: 30 }}>
          <PinComponent title="Enter Current PIN" />
          <View style={{ paddingVertical: 10, gap: 24 }}>
            <PinComponent title="New PIN" />
            <PinComponent title="Confirm New PIN" />
          </View>
        </View>
        <CustomButton
          fill={true}
          onPress={() => {
            router.back();
          }}
          text="Change PIN"
          height={responsiveHeight(8)}
        />
      </View>
    </SafeAreaView>
  );
};

export default ChangePIN;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F6F9",
    justifyContent: "space-between",
    height: responsiveHeight(100),
    width: responsiveWidth(100),
    padding: responsiveWidth(6),
  },
  codeFieldRoot: { marginTop: 10, justifyContent: "space-between" },
  cell: {
    width: 72,
    height: 80,
    lineHeight: 78,
    fontSize: 24,
    borderWidth: 0,
    borderColor: "#00000010",
    backgroundColor: "#fff",
    textAlign: "center",
    borderRadius: 14,
    marginHorizontal: 1,
  },
  focusCell: {
    color: "white",
    backgroundColor: "#EE4266",
  },
});
