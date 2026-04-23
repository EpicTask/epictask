import { FONT_SIZES } from "@/constants/FontSize";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
  loading = false,
  disabled = false,
}: {
  text: string;
  fill: boolean;
  onPress: () => void;
  height?: number;
  loading?: boolean;
  disabled?: boolean;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={{
        flexDirection: "row",
        opacity: disabled || loading ? 0.5 : 1,
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
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {loading ? (
          <ActivityIndicator size="small" color={fill ? "white" : COLORS.secondary} />
        ) : (
          <CustomText
            variant="semiBold"
            style={{
              fontSize: FONT_SIZES.small,
              color: fill ? "white" : COLORS.secondary,
              textAlign: "center",
              flex: 1,
              textAlignVertical: "center",
            }}
          >
            {text}
          </CustomText>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({});
