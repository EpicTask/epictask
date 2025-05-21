import React from "react";

import { COLORS } from "@/constants/Colors";
import { View, Animated, StyleSheet, useWindowDimensions } from "react-native";


interface PaginatorProps {
  data: Array<any>;
  scrollX: Animated.Value;
}

const Paginator: React.FC<PaginatorProps> = ({ data, scrollX }) => {
  const { width } = useWindowDimensions();

  return (
    <View style={styles.container}>
      {data.map((_, i) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [6, 30, 6],
          extrapolate: "clamp",
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: "clamp",
        });

        return (
          <Animated.View
            style={[styles.dot, { width: dotWidth, opacity }]}
            key={i.toString()}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    height: 6,
    borderRadius: 5,
    backgroundColor: COLORS.secondary,
    marginHorizontal: 6,
  },
});

export default Paginator;
