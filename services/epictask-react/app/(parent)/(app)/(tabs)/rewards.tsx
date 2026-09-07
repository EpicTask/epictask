import { FONT_SIZES } from "@/constants/FontSize";
import { IMAGES } from "@/assets";
import CustomText from "@/components/CustomText";
import FamilyLeaderboardCard from "@/components/rewards/FamilyLeaderboardCard";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
  Text,
  RefreshControl,
} from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import taskService from "@/api/taskService";
import { useRouter } from "expo-router";

export default function TabTwoScreen() {
  const { user } = useAuth();
  const [familyLeaderboard, setFamilyLeaderboard] = useState<any>(null);
  const [globalLeaderboard, setGlobalLeaderboard] = useState<any[]>([]);
  // Only the first load may replace the screen with a spinner; a refresh has
  // to leave the current numbers visible.
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    if (!user) return;

    // Independent calls: losing the global leaderboard must not hide the
    // family's own progress, which is the point of the screen.
    const [family, global] = await Promise.allSettled([
      taskService.getFamilyLeaderboard(user.uid),
      taskService.getEnhancedGlobalLeaderboard(50),
    ]);

    if (family.status === "fulfilled") {
      setFamilyLeaderboard(family.value);
      setLoadFailed(false);
    } else {
      console.log("Failed to fetch family leaderboard:", family.reason);
      setLoadFailed(true);
    }

    if (global.status === "fulfilled") {
      setGlobalLeaderboard(global.value?.leaderboard || []);
    } else {
      console.log("Failed to fetch global leaderboard:", global.reason);
    }

    setInitialLoading(false);
    setRefreshing(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleChildPress = (childId: string) => {
    router.push({
      pathname: "/(parent)/(app)/screens/kid-profile",
      params: { childId },
    });
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <CustomText variant="medium" style={styles.loadingText}>
            Loading rewards data...
          </CustomText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <ImageBackground source={IMAGES.img_bg} style={styles.headerBackground}>
          <View style={styles.header}>
            <CustomText variant="semiBold" style={styles.headerTitle}>
              Family Rewards Dashboard
            </CustomText>
            <CustomText variant="medium" style={styles.headerSubtitle}>
              Track your children's progress and achievements
            </CustomText>
          </View>
        </ImageBackground>

        {/* Family Overview Stats */}
        {familyLeaderboard && (
          <View style={styles.overviewSection}>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <MaterialIcons
                  name="family-restroom"
                  size={32}
                  color={COLORS.primary}
                />
                <CustomText variant="bold" style={styles.statNumber}>
                  {familyLeaderboard.children?.length || 0}
                </CustomText>
                <CustomText variant="medium" style={styles.statLabel}>
                  Children
                </CustomText>
              </View>

              <View style={styles.statCard}>
                <MaterialIcons name="stars" size={32} color="#4CAF50" />
                <CustomText variant="bold" style={styles.statNumber}>
                  {familyLeaderboard.family_total_tasks || 0}
                </CustomText>
                <CustomText variant="medium" style={styles.statLabel}>
                  Tasks Done
                </CustomText>
              </View>

              {/* Was "#{family_global_rank}". That value is now 0 meaning
                  unranked (a real family ranking needs a family-level
                  aggregate that does not exist), and rendering it produced a
                  literal "#0". Awaiting-payment is a number a parent can
                  actually act on. */}
              <View style={styles.statCard}>
                <MaterialIcons name="schedule" size={32} color="#FF9800" />
                <CustomText variant="bold" style={styles.statNumber}>
                  {(familyLeaderboard.children || []).reduce(
                    (sum: number, child: any) =>
                      sum + (child.tasks_pending || 0),
                    0,
                  )}
                </CustomText>
                <CustomText variant="medium" style={styles.statLabel}>
                  Awaiting Payment
                </CustomText>
              </View>
            </View>
          </View>
        )}

        {/* Nothing to show and the call failed — say so instead of
            rendering an empty shell with tips under it. */}
        {!familyLeaderboard && loadFailed && (
          <View style={styles.errorCard}>
            <MaterialIcons name="cloud-off" size={40} color={COLORS.grey} />
            <CustomText variant="medium" style={styles.errorText}>
              {"We couldn't load your family's rewards."}
            </CustomText>
            <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
              <CustomText variant="semiBold" style={styles.retryText}>
                Try Again
              </CustomText>
            </TouchableOpacity>
          </View>
        )}

        {/* Family Leaderboard */}
        {familyLeaderboard && (
          <FamilyLeaderboardCard
            familyData={familyLeaderboard}
            onChildPress={handleChildPress}
          />
        )}

        {/* Global Leaderboard Preview */}
        <View style={styles.globalSection}>
          <View style={styles.sectionHeader}>
            <CustomText variant="semiBold" style={styles.sectionTitle}>
              🌍 Global Leaderboard
            </CustomText>
          </View>

          <View style={styles.globalLeaderboardCard}>
            {globalLeaderboard.length > 0 ? (
              globalLeaderboard.slice(0, 5).map((entry, index) => (
                <View key={entry.user_id} style={styles.globalEntry}>
                  <View style={styles.globalRank}>
                    <CustomText variant="semiBold" style={styles.rankNumber}>
                      #{entry.rank ?? index + 1}
                    </CustomText>
                  </View>
                  <View style={styles.globalInfo}>
                    <CustomText variant="medium" style={styles.globalName}>
                      {entry.display_name || `User ${index + 1}`}
                    </CustomText>
                    <View style={styles.tokenDisplay}>
                      {entry.xrp_earned > 0 && (
                        <CustomText variant="medium" style={styles.tokenAmount}>
                          {entry.xrp_earned} XRP
                        </CustomText>
                      )}
                      {entry.rlusd_earned > 0 && (
                        <CustomText variant="medium" style={styles.tokenAmount}>
                          {entry.rlusd_earned} RLUSD
                        </CustomText>
                      )}
                      {entry.etask_earned > 0 && (
                        <CustomText variant="medium" style={styles.tokenAmount}>
                          {entry.etask_earned} eTask
                        </CustomText>
                      )}
                      <CustomText variant="medium" style={styles.taskCount}>
                        • {entry.tasks_completed} tasks
                      </CustomText>
                    </View>
                  </View>
                  <View style={styles.globalLevel}>
                    <CustomText variant="semiBold" style={styles.levelBadge}>
                      L{entry.level}
                    </CustomText>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyGlobal}>
                <MaterialIcons
                  name="leaderboard"
                  size={48}
                  color={COLORS.grey}
                />
                <CustomText variant="medium" style={styles.emptyText}>
                  Global leaderboard will appear here
                </CustomText>
              </View>
            )}
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <CustomText variant="semiBold" style={styles.sectionTitle}>
            💡 Parent Tips
          </CustomText>
          <View style={styles.tipsCard}>
            <View style={styles.tip}>
              <Text style={styles.tipEmoji}>🎯</Text>
              <CustomText variant="medium" style={styles.tipText}>
                Set clear, achievable goals for your children to keep them
                motivated
              </CustomText>
            </View>
            <View style={styles.tip}>
              <Text style={styles.tipEmoji}>🏆</Text>
              <CustomText variant="medium" style={styles.tipText}>
                Celebrate achievements to build confidence and encourage
                progress
              </CustomText>
            </View>
            <View style={styles.tip}>
              <Text style={styles.tipEmoji}>📊</Text>
              <CustomText variant="medium" style={styles.tipText}>
                Review progress regularly and adjust task difficulty as needed
              </CustomText>
            </View>
          </View>
        </View>
      </ScrollView>
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
  },
  scrollView: {
    marginBottom: 50,
  },
  headerBackground: {
    paddingBottom: responsiveHeight(2),
  },
  header: {
    alignItems: "center",
    paddingVertical: responsiveWidth(4),
    paddingHorizontal: responsiveWidth(4),
  },
  headerTitle: {
    fontSize: FONT_SIZES.subtitle,
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.extraSmall,
    color: COLORS.grey,
    textAlign: "center",
  },
  overviewSection: {
    paddingHorizontal: responsiveWidth(4),
    marginBottom: responsiveHeight(2),
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: responsiveWidth(4),
    alignItems: "center",
    flex: 1,
    marginHorizontal: responsiveWidth(1),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statNumber: {
    fontSize: FONT_SIZES.large,
    color: "#333",
    marginVertical: 8,
  },
  statLabel: {
    fontSize: FONT_SIZES.extraSmall,
    color: COLORS.grey,
    textAlign: "center",
  },
  currencySection: {
    paddingHorizontal: responsiveWidth(4),
    marginBottom: responsiveHeight(2),
  },
  sectionTitle: {
    fontSize: FONT_SIZES.medium,
    color: "#333",
    marginBottom: responsiveHeight(1.5),
  },
  currencyRatesCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: responsiveWidth(4),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  currencyRate: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  currencyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  currencyRateText: {
    fontSize: FONT_SIZES.extraSmall,
    color: "#333",
  },
  globalSection: {
    paddingHorizontal: responsiveWidth(4),
    marginBottom: responsiveHeight(2),
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: responsiveHeight(1.5),
  },
  globalLeaderboardCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: responsiveWidth(4),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  globalEntry: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  globalRank: {
    width: responsiveWidth(12),
    alignItems: "center",
  },
  rankNumber: {
    fontSize: FONT_SIZES.extraSmall,
    color: COLORS.primary,
  },
  globalInfo: {
    flex: 1,
    marginLeft: responsiveWidth(3),
  },
  globalName: {
    fontSize: FONT_SIZES.extraSmall,
    color: "#333",
    marginBottom: 4,
  },
  globalStats: {
    fontSize: FONT_SIZES.extraSmall,
    color: COLORS.grey,
  },
  globalLevel: {
    alignItems: "center",
  },
  levelBadge: {
    fontSize: FONT_SIZES.extraSmall,
    color: COLORS.primary,
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emptyGlobal: {
    alignItems: "center",
    paddingVertical: responsiveHeight(4),
  },
  emptyText: {
    fontSize: FONT_SIZES.extraSmall,
    color: COLORS.grey,
    marginTop: responsiveHeight(1),
    textAlign: "center",
  },
  errorCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginHorizontal: responsiveWidth(4),
    marginBottom: responsiveHeight(2),
    paddingVertical: responsiveHeight(4),
    alignItems: "center",
  },
  errorText: {
    fontSize: FONT_SIZES.extraSmall,
    color: COLORS.grey,
    marginTop: responsiveHeight(1),
    textAlign: "center",
  },
  retryButton: {
    marginTop: responsiveHeight(2),
    paddingVertical: responsiveHeight(1.2),
    paddingHorizontal: responsiveWidth(7),
    borderRadius: 24,
    backgroundColor: COLORS.primary,
  },
  retryText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.extraSmall,
  },
  tipsSection: {
    paddingHorizontal: responsiveWidth(4),
    marginBottom: responsiveHeight(3),
  },
  tipsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: responsiveWidth(4),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  tip: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: responsiveHeight(2),
  },
  tipEmoji: {
    fontSize: FONT_SIZES.medium,
    marginRight: responsiveWidth(3),
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: FONT_SIZES.extraSmall,
    color: "#333",
    lineHeight: 22,
  },
  // Legacy styles (keeping for compatibility)
  rewardsContainer: {
    paddingVertical: responsiveWidth(2),
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  rewardImage: {
    height: responsiveWidth(25),
    width: responsiveWidth(25),
  },
  rewardPointsContainer: {
    justifyContent: "center",
    alignItems: "center",
    gap: responsiveWidth(4),
  },
  achievementContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    width: responsiveWidth(90),
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 14,
  },
  achievementTitle: {
    color: COLORS.white,
    fontWeight: "500",
    fontSize: FONT_SIZES.large,
  },
  achievementDescription: {
    color: COLORS.white,
    fontSize: FONT_SIZES.extraSmall,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tokenDisplay: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  tokenAmount: {
    fontSize: FONT_SIZES.extraSmall,
    color: COLORS.primary,
    marginRight: 8,
    fontWeight: "600",
  },
  taskCount: {
    fontSize: FONT_SIZES.extraSmall,
    color: COLORS.grey,
  },
});
