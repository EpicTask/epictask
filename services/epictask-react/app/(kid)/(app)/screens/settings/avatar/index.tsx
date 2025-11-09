import { FONT_SIZES } from "@/constants/FontSize";
import React from "react";
import CustomText from "@/components/CustomText";
import CustomButton from "@/components/buttons/CustomButton";
import ScreenHeading from "@/components/headings/ScreenHeading";

import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

import { IMAGES } from "@/assets";
import { Image, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

const AddKid = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeading text="Avatar" back={true} plus={false} />
      <View
        style={{
          justifyContent: "space-between",
          flex: 1,
          paddingVertical: 20,
        }}
      >
        <View style={{ justifyContent: "space-between", flex: 1 }}>
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View style={{ alignItems: "center", paddingBottom: 30 }}>
              <CustomText
                variant="bold"
                style={{ fontSize: FONT_SIZES.title }}
              >
                Hallo,
              </CustomText>
              <CustomText
                variant="semiBold"
                style={{ fontSize: FONT_SIZES.title }}
              >
                John Kanic! 👋
              </CustomText>
            </View>
            <Image
              source={IMAGES.profile}
              style={{
                height: responsiveWidth(40),
                width: responsiveWidth(40),
              }}
            />
          </View>
          <CustomButton
            fill={true}
            onPress={() => {router.back()}}
            text="Change"
            height={responsiveHeight(7)}
          />
        </View>
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
