import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "@/constants/Colors";

type SectionQuery = {
  data: unknown;
  isError: boolean;
  refetch: () => Promise<unknown>;
};

export function SectionSkeleton({
  label,
  height = 140,
}: {
  label: string;
  height?: number;
}) {
  const opacity = useRef(new Animated.Value(1)).current;
  const [reduceMotion, setReduceMotion] = useState(true);
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (active) setReduceMotion(value);
      })
      .catch(() => {});
    const listener = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );
    return () => {
      active = false;
      listener.remove();
    };
  }, []);
  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      return;
    }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity, reduceMotion]);
  return (
    <View
      accessible
      accessibilityLabel={`Loading ${label}`}
      accessibilityState={{ busy: true }}
      style={[styles.skeleton, { minHeight: height }]}
    >
      <Animated.View style={{ opacity, gap: 14 }}>
        <View style={[styles.line, { width: "55%" }]} />
        <View style={styles.line} />
        <View style={[styles.line, { width: "75%" }]} />
      </Animated.View>
    </View>
  );
}

export function QuerySection({
  query,
  label,
  height,
  children,
}: PropsWithChildren<{
  query: SectionQuery;
  label: string;
  height?: number;
}>) {
  const hasData = query.data !== undefined;
  return (
    <View style={{ flexGrow: 1 }}>
      {query.isError && (
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => {
            void query.refetch();
          }}
          style={styles.error}
        >
          <Text style={{ color: COLORS.primary }}>
            {hasData
              ? `Couldn't update ${label}. Showing saved data.`
              : `Couldn't load ${label}.`}{" "}
            Tap to retry.
          </Text>
        </TouchableOpacity>
      )}
      {hasData ? (
        children
      ) : !query.isError ? (
        <SectionSkeleton label={label} height={height} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    padding: 20,
    backgroundColor: "white",
    borderRadius: 16,
    justifyContent: "center",
  },
  line: { height: 16, borderRadius: 6, backgroundColor: "#E1E5EB" },
  error: {
    padding: 12,
    backgroundColor: "#F1ECFA",
    borderRadius: 10,
    marginBottom: 8,
  },
});
