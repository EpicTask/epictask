import { FONT_SIZES } from "@/constants/FontSize";
import React, { useState, useCallback } from "react";
import CustomText from "@/components/CustomText";
import ScreenHeading from "@/components/headings/ScreenHeading";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useFocusEffect } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { firestoreService } from "@/api/firestoreService";
import taskService from "@/api/taskService";
import { COLORS } from "@/constants/Colors";
import * as Progress from "react-native-progress";

interface Rewards {
  tokens_earned: number;
  pending: number;
  level: number;
  rank: number;
  // Percent toward the next level, computed server-side from the same score as
  // the level itself. The screen used to derive this from a hardcoded
  // TOKENS_PER_LEVEL = 1000, which no longer matches the level curve.
  levelProgress: number;
  pointsToNext: number;
}

interface RewardedTask {
  id: string;
  task_title?: string;
  reward_amount?: number;
  timestamp?: any;
}

export default function KidWalletScreen() {
  const { effectiveUserId } = useAuth();

  const [rewards, setRewards] = useState<Rewards | null>(null);
  const [recentActivity, setRecentActivity] = useState<RewardedTask[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!effectiveUserId) return;
    setLoading(true);
    try {
      // Reads the reward projection through the backend rather than the old
      // firestoreService.getUserRewards, which queried the orphaned
      // `paid_tasks` collection via an undefined collection-name key and threw
      // on every call.
      const [rewardsData, tasks] = await Promise.all([
        taskService.getKidLeaderboardView(effectiveUserId),
        firestoreService.getRecentTasks(effectiveUserId, 10, 30),
      ]);

      const kid = (rewardsData as any)?.kid_data ?? {};
      const currencies = kid.currencies ?? {};
      setRewards({
        tokens_earned:
          (currencies.xrp_earned ?? 0) +
          (currencies.rlusd_earned ?? 0) +
          (currencies.etask_earned ?? 0),
        pending:
          (currencies.xrp_pending ?? 0) +
          (currencies.rlusd_pending ?? 0) +
          (currencies.etask_pending ?? 0),
        level: kid.level ?? 1,
        rank: kid.global_rank ?? 0,
        levelProgress: kid.next_level_progress ?? 0,
        pointsToNext: (rewardsData as any)?.next_milestone?.points_to_next ?? 0,
      });
      const rewarded = (tasks as RewardedTask[]).filter(
        (t: any) => t.rewarded === true || t.status === "completed"
      );
      setRecentActivity(rewarded);
    } catch (e) {
      console.log("Failed to load wallet data", e);
    } finally {
      setLoading(false);
    }
  }, [effectiveUserId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // All derived server-side now, so the level badge and the bar cannot disagree.
  const progressToNext = (rewards?.levelProgress ?? 0) / 100;
  const tokensToNext = rewards?.pointsToNext ?? 0;
  const nextLevel = (rewards?.level ?? 1) + 1;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeading text="My Rewards" back={true} plus={false} />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Token Showcase Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroIconRow}>
              <MaterialIcons name="star" size={32} color="#FFD700" />
              <MaterialIcons name="star" size={20} color="#FFD700" style={{ marginTop: 10 }} />
              <MaterialIcons name="star" size={26} color="#FFD700" style={{ marginTop: 4 }} />
            </View>
            <CustomText variant="bold" style={styles.tokenCount}>
              {(rewards?.tokens_earned ?? 0).toLocaleString()}
            </CustomText>
            <CustomText variant="regular" style={styles.tokenLabel}>
              tokens earned
            </CustomText>
            {(rewards?.rank ?? 0) > 0 && (
              <View style={styles.rankBadge}>
                <CustomText variant="semiBold" style={styles.rankText}>
                  Rank #{rewards!.rank}
                </CustomText>
              </View>
            )}
          </View>

          {/* Level Progress Card */}
          <View style={styles.card}>
            <View style={styles.levelRow}>
              <View style={styles.levelBadge}>
                <CustomText variant="bold" style={styles.levelNumber}>
                  {rewards?.level ?? 1}
                </CustomText>
              </View>
              <View style={{ flex: 1 }}>
                <CustomText variant="semiBold" style={styles.levelTitle}>
                  Level {rewards?.level ?? 1}
                </CustomText>
                <CustomText variant="regular" style={styles.levelCaption}>
                  {tokensToNext} tokens to Level {nextLevel}
                </CustomText>
              </View>
            </View>

            <View style={{ marginTop: 14 }}>
              <Progress.Bar
                progress={progressToNext}
                width={null}
                height={10}
                color={COLORS.secondary}
                unfilledColor="#EEF2FF"
                borderWidth={0}
                borderRadius={6}
              />
            </View>
            <View style={styles.progressLabels}>
              <CustomText variant="regular" style={styles.progressCaption}>
                {(rewards?.levelProgress ?? 0).toFixed(0)}%
              </CustomText>
              <CustomText variant="regular" style={styles.progressCaption}>
                Level {nextLevel}
              </CustomText>
            </View>
          </View>

          {/* Recent Rewards */}
          <View style={{ marginTop: 8 }}>
            <CustomText variant="bold" style={styles.sectionHeading}>
              Recent Rewards
            </CustomText>
            {recentActivity.length === 0 ? (
              <View style={styles.emptyState}>
                <CustomText variant="regular" style={styles.emptyText}>
                  Complete tasks to earn tokens!
                </CustomText>
              </View>
            ) : (
              recentActivity.map((task) => (
                <View key={task.id} style={styles.activityRow}>
                  <View style={styles.trophyIcon}>
                    <MaterialIcons name="emoji-events" size={22} color="#FFD700" />
                  </View>
                  <View style={styles.activityInfo}>
                    <CustomText variant="semiBold" style={styles.activityTitle}>
                      {task.task_title || "Task completed"}
                    </CustomText>
                  </View>
                  <View style={styles.rewardPill}>
                    <CustomText variant="bold" style={styles.rewardPillText}>
                      +{task.reward_amount ?? 0}
                    </CustomText>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F6F9",
    paddingHorizontal: responsiveWidth(4),
    paddingTop: responsiveHeight(2),
  },
  scroll: {
    paddingVertical: 20,
    paddingBottom: 60,
    gap: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heroIconRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    marginBottom: 12,
  },
  tokenCount: {
    fontSize: FONT_SIZES.display,
    color: "#fff",
    lineHeight: FONT_SIZES.display * 1.1,
  },
  tokenLabel: {
    fontSize: FONT_SIZES.medium,
    color: "rgba(255,255,255,0.75)",
    marginTop: 4,
  },
  rankBadge: {
    marginTop: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  rankText: {
    color: "#fff",
    fontSize: FONT_SIZES.small,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  levelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  levelBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  levelNumber: {
    fontSize: FONT_SIZES.large,
    color: COLORS.primary,
  },
  levelTitle: {
    fontSize: FONT_SIZES.large,
    color: "#333",
  },
  levelCaption: {
    fontSize: FONT_SIZES.small,
    color: COLORS.grey,
    marginTop: 2,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  progressCaption: {
    fontSize: FONT_SIZES.small,
    color: COLORS.grey,
  },
  sectionHeading: {
    fontSize: FONT_SIZES.subtitle,
    marginBottom: 12,
  },
  emptyState: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyText: {
    color: COLORS.grey,
    fontSize: FONT_SIZES.medium,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  trophyIcon: {
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: FONT_SIZES.medium,
    color: "#333",
  },
  rewardPill: {
    backgroundColor: "#EEF2FF",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  rewardPillText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.medium,
  },
});
