import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, TouchableOpacity } from "react-native";
import { COLORS } from "@/constants/Colors";
import { FONT_SIZES } from "@/constants/FontSize";
import CustomText from "@/components/CustomText";
import { responsiveWidth } from "react-native-responsive-dimensions";

interface PayoutBannerProps {
  amount: number;
  status: "pending" | "approved" | "completed" | "rejected";
  onDismiss?: () => void;
  visible: boolean;
}

export default function PayoutBanner({
  amount,
  status,
  onDismiss,
  visible,
}: PayoutBannerProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after 5 seconds for completed/approved
      if (status === "completed" || status === "approved") {
        setTimeout(() => {
          handleDismiss();
        }, 5000);
      }
    }
  }, [visible]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  };

  if (!visible) return null;

  const getStatusConfig = () => {
    switch (status) {
      case "completed":
        return {
          icon: "✅",
          title: "Payout Completed!",
          message: `You've received ${amount} eTask tokens!`,
          bgColor: COLORS.success,
        };
      case "approved":
        return {
          icon: "👍",
          title: "Payout Approved!",
          message: `Your ${amount} eTask tokens are on the way!`,
          bgColor: COLORS.primary,
        };
      case "pending":
        return {
          icon: "⏳",
          title: "Payout Pending",
          message: `Your ${amount} eTask tokens request is being reviewed`,
          bgColor: "#FFA500",
        };
      case "rejected":
        return {
          icon: "❌",
          title: "Payout Not Available",
          message: "Ask your parent for help with this payout",
          bgColor: COLORS.red,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          backgroundColor: config.bgColor,
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>{config.icon}</Text>
        <View style={styles.textContainer}>
          <CustomText variant="semiBold" style={styles.title}>
            {config.title}
          </CustomText>
          <Text style={styles.message}>{config.message}</Text>
        </View>
      </View>
      {onDismiss && (
        <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingVertical: 16,
    paddingHorizontal: responsiveWidth(4),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.medium,
    color: "white",
    marginBottom: 2,
  },
  message: {
    fontSize: FONT_SIZES.small,
    color: "white",
    opacity: 0.9,
  },
  closeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
