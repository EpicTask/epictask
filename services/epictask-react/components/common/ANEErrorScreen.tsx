import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/Colors";
import { FONT_SIZES } from "@/constants/FontSize";
import CustomText from "@/components/CustomText";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

interface ANEErrorScreenProps {
  onRetry?: () => void;
  onGoBack?: () => void;
  title?: string;
  message?: string;
  showRetry?: boolean;
  showGoBack?: boolean;
}

export default function ANEErrorScreen({
  onRetry,
  onGoBack,
  title = "Connection Error",
  message = "We're having trouble connecting to the story service. Please check your internet connection and try again.",
  showRetry = true,
  showGoBack = true,
}: ANEErrorScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Error Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.errorIcon}>📚</Text>
          <View style={styles.disconnectBadge}>
            <Text style={styles.disconnectIcon}>⚠️</Text>
          </View>
        </View>

        {/* Error Message */}
        <View style={styles.messageContainer}>
          <CustomText variant="semiBold" style={styles.title}>
            {title}
          </CustomText>
          <Text style={styles.message}>{message}</Text>
        </View>

        {/* Troubleshooting Tips */}
        <View style={styles.tipsContainer}>
          <CustomText variant="semiBold" style={styles.tipsTitle}>
            What you can try:
          </CustomText>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>
                Check your internet connection
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>
                Make sure you're connected to WiFi or mobile data
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>Try again in a few moments</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {showRetry && onRetry && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={onRetry}
              activeOpacity={0.7}
            >
              <Text style={styles.retryButtonText}>🔄 Try Again</Text>
            </TouchableOpacity>
          )}
          {showGoBack && onGoBack && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={onGoBack}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>← Go Back</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Support Message */}
        <View style={styles.supportContainer}>
          <Text style={styles.supportText}>
            If this problem continues, please contact support
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: responsiveWidth(6),
    paddingVertical: responsiveHeight(4),
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    position: "relative",
    marginBottom: 24,
  },
  errorIcon: {
    fontSize: 80,
    opacity: 0.5,
  },
  disconnectBadge: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  disconnectIcon: {
    fontSize: 24,
  },
  messageContainer: {
    alignItems: "center",
    marginBottom: 32,
    paddingHorizontal: responsiveWidth(4),
  },
  title: {
    fontSize: FONT_SIZES.title,
    color: COLORS.black,
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.grey,
    textAlign: "center",
    lineHeight: 22,
  },
  tipsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    width: "100%",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tipsTitle: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.black,
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  tipBullet: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.primary,
    marginRight: 8,
    fontWeight: "bold",
  },
  tipText: {
    flex: 1,
    fontSize: FONT_SIZES.small,
    color: COLORS.grey,
    lineHeight: 20,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
  },
  backButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.light_grey,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
  },
  supportContainer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.light_grey,
    width: "100%",
  },
  supportText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.grey,
    textAlign: "center",
    fontStyle: "italic",
  },
});
