import { Image, StyleSheet, Text, TextInput, View } from "react-native";
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
import DateInput from "@/components/DateInput";
// import RNDateTimePicker from "@react-native-community/datetimepicker";

const AddKid = () => {
  const CELL_COUNT = 4;
  const [step, setStep] = useState(1);
  const [value, setValue] = useState("");
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  const [time, setTime] = useState(new Date());

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
                label="Full Email"
                value={"John Kanic"}
                onChangeText={() => {}}
              />
              <DateInput title="Age / Date of Birth" />
              <CustomInput
                label="Grade of Learning Level"
                value={"Select grade of learning"}
                onChangeText={() => {}}
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
              onPress={() => router.back()}
              text="Add Kid"
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
