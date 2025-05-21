import { StyleSheet, Text, TouchableOpacity } from "react-native";
import React from "react";
import { COLORS } from "@/constants/Colors";
import { responsiveWidth } from "react-native-responsive-dimensions";

const PlusButton = ({ onPress }: { onPress?: () => void }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: 30,
        height: 30,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.secondary,
        borderRadius: responsiveWidth(100),
      }}
    >
      <Text
        style={{
          color: "white",
          fontSize: 20,
          bottom: 1,
          textAlignVertical: "center",
          textAlign: "center",
        }}
      >
        +
      </Text>
    </TouchableOpacity>
  );
};

export default PlusButton;

const styles = StyleSheet.create({});
