import { StyleSheet, Text } from "react-native";
import React from "react";
import { COLORS } from "@/constants/Colors";
import { responsiveWidth } from "react-native-responsive-dimensions";
import DebouncedTouchableOpacity from "./buttons/DebouncedTouchableOpacity";

const PlusButton = ({ onPress }: { onPress?: () => void }) => {
  return (
    <DebouncedTouchableOpacity
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
    </DebouncedTouchableOpacity>
  );
};

export default PlusButton;

const styles = StyleSheet.create({});
