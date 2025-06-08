import React, { useEffect, useRef } from "react";
import * as Progress from "react-native-progress";
import { View, Text, StyleSheet, Animated } from "react-native";
import { COLORS } from "@/constants/Colors";
import CustomText from "../CustomText";

const AnimatedProgressCircle = Animated.createAnimatedComponent(Progress.Circle);
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
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 1000, // Animation duration in milliseconds
      useNativeDriver: false, // 'false' because 'progress' prop is not a native prop for Progress.Circle
    }).start();
  }, [progress, animatedProgress]);

  // Interpolate the animated value to format text dynamically
  const animatedText = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'] // Placeholder, will be overridden by formatText
  });
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
      <AnimatedProgressCircle
        size={row ? 50 : 120}
        progress={animatedProgress} // Use the animated value here
        thickness={row ? 3 : 8}
        color={color}
        unfilledColor="#E5E7EB"
        borderWidth={0}
        showsText={true}
        formatText={(progressValue) => {
          return `${Math.round(progressValue * 100)}%`;
        }}
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
