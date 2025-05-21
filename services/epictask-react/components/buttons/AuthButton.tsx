import React from "react";

import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

import { COLORS } from "@/constants/Colors";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import CustomText from "../CustomText";

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
    <TouchableOpacity
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
            fontSize: responsiveFontSize(2.25)
          }}
        >
          {text}
        </CustomText>
      </View>
    </TouchableOpacity>
  );
};

export default AuthButton;

const styles = StyleSheet.create({});
