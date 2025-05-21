import React from "react";
import { Text, StyleProp, TextStyle } from "react-native";

interface CustomTextProps {
  style?: StyleProp<TextStyle>;
  variant?: "regular" | "bold" | "extraBold" | "medium" | "light" | "semiBold";
  [key: string]: any;
}

export default function CustomText({ style, variant = "regular", ...props }: CustomTextProps) {
  const fontFamily = {
    regular: "MontSerrat_regular",
    bold: "MontSerrat_bold",
    extraBold: "MontSerrat_extraBold",
    medium: "MontSerrat_medium",
    light: "MontSerrat_light",
    semiBold: "MontSerrat_semiBold",
  }[variant];

  return <Text style={[{ fontFamily }, style]} {...props} />;
}