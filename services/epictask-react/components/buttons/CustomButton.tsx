import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { COLORS } from "@/constants/Colors";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import CustomText from "../CustomText";

const CustomButton = ({
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
          backgroundColor: fill ? COLORS.secondary : "transparent",
          borderWidth: 1,
          borderColor: COLORS.secondary,
          flex: 1,
          height: height,
          paddingHorizontal: 20,
          paddingVertical: 15,
          borderRadius: responsiveWidth(100),
        }}
      >
        <CustomText
          variant="semiBold"
          style={{
            fontSize: responsiveFontSize(1.7),
            color: fill ? "white" : COLORS.secondary,
            textAlign: "center",
            flex: 1,
            textAlignVertical: "center",
          }}
        >
          {text}
        </CustomText>
      </View>
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({});
