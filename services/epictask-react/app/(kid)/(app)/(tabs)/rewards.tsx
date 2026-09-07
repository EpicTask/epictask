import { FONT_SIZES } from "@/constants/FontSize";
import KidRewardsView from "@/components/rewards/KidRewardsView";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS } from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomText from "@/components/CustomText";
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import taskService from "@/api/taskService";
import narrativeService from "@/api/narrativeService";

export default function TabTwoScreen() {
  const { effectiveUserId, childAge } = useAuth();
  const [kidLeaderboardData, setKidLeaderboardData] = useState<any>(null);
  const [progressSummary, setProgressSummary] = useState<any>(null);
  // Distinct from `refreshing`: only the first load may replace the screen
  // with a spinner. A pull-to-refresh must leave the current numbers on screen.
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  const fetchData = useCallback(async () => {
    if (!effectiveUserId) return;

    // allSettled, not all: the rewards ledger and the narrative summary come
    // from different services. A narrative hiccup used to reject the whole
    // batch and blank the screen even though the rewards call had succeeded.
    const [rewards, summary] = await Promise.allSettled([
      taskService.getKidLeaderboardView(effectiveUserId),
      narrativeService.getKidProgressSummary(effectiveUserId),
    ]);

    if (rewards.status === "fulfilled") {
      setKidLeaderboardData(rewards.value);
      setLoadFailed(false);
    } else {
      console.log("Failed to fetch kid rewards:", rewards.reason);
      setLoadFailed(true);
    }

    // Story progress is supplementary — losing it must not hide the rewards.
    if (summary.status === "fulfilled") {
      setProgressSummary(summary.value);
    } else {
      console.log("Failed to fetch story progress:", summary.reason);
    }

    setInitialLoading(false);
    setRefreshing(false);
  }, [effectiveUserId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleAchievementPress = (achievement: string) => {
    // Reserved for a celebration animation; intentionally inert for now.
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <CustomText variant="medium" style={styles.loadingText}>
            Loading your rewards...
          </CustomText>
        </View>
      </SafeAreaView>
    );
  }

  // Only a dead end if we have nothing to show. If a refresh fails we keep the
  // last good data on screen rather than throwing it away.
  if (!kidLeaderboardData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <CustomText variant="medium" style={styles.errorText}>
            {loadFailed
              ? "We couldn't load your rewards just now."
              : "No rewards yet — complete a task to get started!"}
          </CustomText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={onRefresh}
            accessibilityRole="button"
            accessibilityLabel="Try loading rewards again"
          >
            <CustomText variant="semiBold" style={styles.retryText}>
              Try Again
            </CustomText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KidRewardsView
        kidData={kidLeaderboardData}
        childAge={childAge}
        progressSummary={progressSummary}
        onAchievementPress={handleAchievementPress}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F6F9",
    height: responsiveHeight(100),
    width: responsiveWidth(100),
    padding: responsiveWidth(4),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: responsiveHeight(2),
    fontSize: FONT_SIZES.extraSmall,
    color: COLORS.grey,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: responsiveWidth(8),
  },
  errorText: {
    fontSize: FONT_SIZES.extraSmall,
    color: COLORS.grey,
    textAlign: "center",
    lineHeight: 24,
  },
  retryButton: {
    marginTop: responsiveHeight(2.5),
    paddingVertical: responsiveHeight(1.4),
    paddingHorizontal: responsiveWidth(8),
    borderRadius: 24,
    backgroundColor: COLORS.primary,
  },
  retryText: {
    color: "#FFF",
    fontSize: FONT_SIZES.extraSmall,
  },
});
