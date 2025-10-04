import { ICONS, IMAGES } from "@/assets";
import KidRewardsView from "@/components/rewards/KidRewardsView";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS } from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomText from "@/components/CustomText";
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import taskService from "@/api/taskService";

export default function TabTwoScreen() {
  const { user } = useAuth();
  const [kidLeaderboardData, setKidLeaderboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch kid's leaderboard view
      const kidData = await taskService.getKidLeaderboardView(user.uid);
      setKidLeaderboardData(kidData);

    } catch (error) {
      console.error("Failed to fetch kid rewards data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleAchievementPress = (achievement: string) => {
    // Show achievement details or celebration animation
    console.log('Achievement pressed:', achievement);
  };

  if (loading) {
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

  if (!kidLeaderboardData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <CustomText variant="medium" style={styles.errorText}>
            Unable to load rewards data. Please try again.
          </CustomText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KidRewardsView 
        kidData={kidLeaderboardData}
        onAchievementPress={handleAchievementPress}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: responsiveHeight(2),
    fontSize: responsiveFontSize(1.6),
    color: COLORS.grey,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(8),
  },
  errorText: {
    fontSize: responsiveFontSize(1.6),
    color: COLORS.grey,
    textAlign: 'center',
    lineHeight: 24,
  },
});
