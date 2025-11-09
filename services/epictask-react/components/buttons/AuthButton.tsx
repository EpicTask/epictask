import { FONT_SIZES } from "@/constants/FontSize";
import React from "react";

import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

import { COLORS } from "@/constants/Colors";
import { StyleSheet, View } from "react-native";
import CustomText from "../CustomText";
import DebouncedTouchableOpacity from "./DebouncedTouchableOpacity";

const AuthButton = ({
  text,
  fill,
  onPress,
  height = responsiveHeight(6),
}: {
  text: string;
  fill: boolean;
  onPress: () => void;
  height?: number;
}) => {
  return (
    <DebouncedTouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
      }}
    >
      <View
        style={{
          backgroundColor: fill ? COLORS.secondary : "white",
          borderWidth: 1,
          borderColor: COLORS.secondary,
          flex: 1,
          height: height,
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: responsiveWidth(100),
        }}
      >
        <CustomText
          variant="semiBold"
          style={{
            color: fill ? "black" : COLORS.secondary,
            textAlign: "center",
            flex: 1,
            textAlignVertical: "center",
            fontSize: FONT_SIZES.large
          }}
        >
          {text}
        </CustomText>
      </View>
    </DebouncedTouchableOpacity>
  );
};

export default AuthButton;

const styles = StyleSheet.create({});
