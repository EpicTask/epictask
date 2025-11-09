import React from "react";
import { Text, StyleProp, TextStyle } from "react-native";
import { FONT_SIZES } from "@/constants/FontSize";

interface CustomTextProps {
  style?: StyleProp<TextStyle>;
  variant?: "regular" | "bold" | "extraBold" | "medium" | "light" | "semiBold";
  size?: "extraSmall" | "small" | "medium" | "large" | "extraLarge" | "title" | "subtitle" | "display" | "huge";
  [key: string]: any;
}

export default function CustomText({
  style,
  variant = "regular",
  size = "medium",
  ...props
}: CustomTextProps) {
  const fontFamily = {
    regular: "MontSerrat_regular",
    bold: "MontSerrat_bold",
    extraBold: "MontSerrat_extraBold",
    medium: "MontSerrat_medium",
    light: "MontSerrat_light",
    semiBold: "MontSerrat_semiBold",
  }[variant];

  const fontSize = FONT_SIZES[size];

  return <Text style={[{ fontFamily, fontSize }, style]} {...props} />;
}
