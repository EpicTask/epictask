import React from "react";
import * as Progress from "react-native-progress";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "@/constants/Colors";
import CustomText from "../CustomText";
import { responsiveWidth } from "react-native-responsive-dimensions";

interface ProgressCardProps {
  progress: number;
  completed: number;
  total: number;
  color?: string;
  kid?: boolean;
  row?: boolean;
  text?: string;
  tab?: boolean;
}

const ProgressCard: React.FC<ProgressCardProps> = ({
  progress,
  completed,
  kid,
  total,
  tab,
  color,
  row,
  text = "Completed",
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          width: "48%",
          flexDirection: row ? "row" : "column",
          gap: row ? 10 : 0,
          paddingHorizontal: row ? 14 : 20,
          paddingVertical: row ? 10 : 20,
          borderRadius: row ? 14 : 28,
        },
      ]}
    >
      <Progress.Circle
        size={row ? 50 : 120}
        progress={progress}
        thickness={row ? 3 : 8}
        color={color}
        unfilledColor="#E5E7EB"
        borderWidth={0}
        showsText={true}
        formatText={() => `${Math.round(progress * 100)}%`}
        textStyle={{
          fontSize: row ? 12 : 24,
          fontWeight: "semibold",
          color: tab ? color : "#000",
        }}
      />
      <View
        style={{
          alignItems: row ? "flex-start" : "center",
          justifyContent: "center",
          gap: 4,
        }}
      >
        <CustomText
          variant="semiBold"
          style={[styles.completedText, { fontSize: row ? 10 : 14 }]}
        >
          {text}
        </CustomText>
        <Text
          style={styles.fractionText}
        >{`${completed}/${total}`}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderColor: "#EAEBEC",
    borderRadius: 28,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  percentageText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  completedText: {
    marginTop: 10,
    fontWeight: "semibold",
    fontSize: 16,
    color: COLORS.grey,
  },
  fractionText: {
    fontSize: 16,
    color: "#000",
    fontWeight:"500"
  },
});

export default ProgressCard;
