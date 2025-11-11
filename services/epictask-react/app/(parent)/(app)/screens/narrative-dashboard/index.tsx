import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { MaterialIcons } from "@expo/vector-icons";

import CustomText from "@/components/CustomText";
import { COLORS } from "@/constants/Colors";
import { FONT_SIZES } from "@/constants/FontSize";
import { ICONS } from "@/assets";
import narrativeService, {
  KidProgressSummary,
  PendingPayout,
} from "@/api/narrativeService";
import { AuthContext } from "@/context/AuthContext";

const NarrativeDashboard = () => {
  const { user } = useContext(AuthContext);
  const [kidsSummary, setKidsSummary] = useState<KidProgressSummary[]>([]);
  const [pendingPayouts, setPendingPayouts] = useState<PendingPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [summaries, payouts] = await Promise.all([
        narrativeService.getAllKidsProgressSummary(),
        narrativeService.getPendingPayouts(),
      ]);
      setKidsSummary(summaries);
      setPendingPayouts(payouts);
    } catch (error) {
      console.error("Failed to load narrative dashboard:", error);
      Alert.alert("Error", "Failed to load narrative data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleApprovePayout = async (requestId: string) => {
    try {
      await narrativeService.approvePayout(requestId);
      Alert.alert("Success", "Payout approved");
      loadData();
    } catch (error) {
      console.error("Failed to approve payout:", error);
      Alert.alert("Error", "Failed to approve payout");
    }
  };

  const handleRejectPayout = async (requestId: string) => {
    Alert.prompt(
      "Reject Payout",
      "Enter reason for rejection (optional):",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async (reason?: string) => {
            try {
              await narrativeService.rejectPayout(requestId, reason);
              Alert.alert("Success", "Payout rejected");
              loadData();
            } catch (error) {
              console.error("Failed to reject payout:", error);
              Alert.alert("Error", "Failed to reject payout");
            }
          },
        },
      ],
      "plain-text"
    );
  };

  const renderKidSummaryCard = (summary: KidProgressSummary) => (
    <TouchableOpacity
      key={summary.kid_id}
      style={styles.kidCard}
      onPress={() => {
        // Navigate to kid's detailed narrative progress
        router.push({
          pathname: "/screens/kid-profile",
          params: {
            uid: summary.kid_id,
            name: summary.kid_name || "Kid",
          },
        } as any);
      }}
    >
      <View style={styles.kidCardHeader}>
        <CustomText variant="semiBold" style={styles.kidName}>
          {summary.kid_name || "Kid"}
        </CustomText>
        <MaterialIcons name="chevron-right" size={24} color={COLORS.grey} />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <CustomText style={styles.statValue}>
            {summary.stories_started}
          </CustomText>
          <CustomText style={styles.statLabel}>Stories Started</CustomText>
        </View>
        <View style={styles.statItem}>
          <CustomText style={styles.statValue}>
            {summary.stories_completed}
          </CustomText>
          <CustomText style={styles.statLabel}>Completed</CustomText>
        </View>
        <View style={styles.statItem}>
          <CustomText style={styles.statValue}>
            {summary.total_xp_earned}
          </CustomText>
          <CustomText style={styles.statLabel}>XP Earned</CustomText>
        </View>
      </View>

      {summary.current_stories.length > 0 && (
        <View style={styles.currentStoriesSection}>
          <CustomText style={styles.sectionTitle}>
            Current Stories ({summary.current_stories.length})
          </CustomText>
          {summary.current_stories.slice(0, 2).map((story) => (
            <View key={story.story_id} style={styles.storyProgressBar}>
              <CustomText style={styles.storyTitle} numberOfLines={1}>
                {story.title}
              </CustomText>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${
                        story.total > 0
                          ? (story.progress / story.total) * 100
                          : 0
                      }%`,
                    },
                  ]}
                />
              </View>
              <CustomText style={styles.progressText}>
                {story.progress}/{story.total}
              </CustomText>
            </View>
          ))}
        </View>
      )}

      <View style={styles.payoutInfo}>
        <CustomText style={styles.payoutText}>
          💰 {summary.total_payouts} payouts • $
          {summary.total_payout_amount.toFixed(2)}
        </CustomText>
      </View>
    </TouchableOpacity>
  );

  const renderPayoutCard = (payout: PendingPayout) => (
    <View key={payout.request_id} style={styles.payoutCard}>
      <View style={styles.payoutHeader}>
        <View>
          <CustomText variant="semiBold" style={styles.payoutKidName}>
            {payout.kid_name || "Kid"}
          </CustomText>
          <CustomText style={styles.payoutReason}>{payout.reason}</CustomText>
        </View>
        <View style={styles.payoutAmount}>
          <CustomText variant="semiBold" style={styles.amountText}>
            ${payout.amount.toFixed(2)}
          </CustomText>
          <CustomText style={styles.tokenText}>{payout.token}</CustomText>
        </View>
      </View>

      <View style={styles.payoutActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleRejectPayout(payout.request_id)}
        >
          <MaterialIcons name="close" size={20} color={COLORS.white} />
          <CustomText style={styles.actionButtonText}>Reject</CustomText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => handleApprovePayout(payout.request_id)}
        >
          <MaterialIcons name="check" size={20} color={COLORS.white} />
          <CustomText style={styles.actionButtonText}>Approve</CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <CustomText style={styles.loadingText}>
            Loading narrative data...
          </CustomText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          {ICONS.back_arrow}
        </TouchableOpacity>
        <CustomText variant="semiBold" style={styles.headerTitle}>
          Narrative Dashboard
        </CustomText>
        <TouchableOpacity
          onPress={() => router.push("/screens/narrative-settings" as any)}
        >
          <MaterialIcons name="settings" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Pending Payouts Section */}
        {pendingPayouts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <CustomText variant="semiBold" style={styles.sectionHeaderText}>
                Pending Approvals ({pendingPayouts.length})
              </CustomText>
              <MaterialIcons
                name="notification-important"
                size={20}
                color={COLORS.red}
              />
            </View>
            {pendingPayouts.map(renderPayoutCard)}
          </View>
        )}

        {/* Kids Progress Section */}
        <View style={styles.section}>
          <CustomText variant="semiBold" style={styles.sectionHeaderText}>
            Kids Progress
          </CustomText>
          {kidsSummary.length > 0 ? (
            kidsSummary.map(renderKidSummaryCard)
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons
                name="menu-book"
                size={64}
                color={COLORS.grey}
                style={{ opacity: 0.5 }}
              />
              <CustomText style={styles.emptyText}>
                No narrative data yet
              </CustomText>
              <CustomText style={styles.emptySubtext}>
                Kids haven't started any stories
              </CustomText>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
    padding: responsiveWidth(4),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: FONT_SIZES.title,
    flex: 1,
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    color: COLORS.grey,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionHeaderText: {
    fontSize: FONT_SIZES.extraLarge,
  },
  kidCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  kidCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  kidName: {
    fontSize: FONT_SIZES.large,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light_grey,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: FONT_SIZES.extraLarge,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONT_SIZES.small,
    color: COLORS.grey,
    marginTop: 4,
  },
  currentStoriesSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.grey,
    marginBottom: 8,
  },
  storyProgressBar: {
    marginBottom: 8,
  },
  storyTitle: {
    fontSize: FONT_SIZES.small,
    marginBottom: 4,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: COLORS.light_grey,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.grey,
  },
  payoutInfo: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.light_grey,
  },
  payoutText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.grey,
  },
  payoutCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.light_yellow,
  },
  payoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  payoutKidName: {
    fontSize: FONT_SIZES.large,
    marginBottom: 4,
  },
  payoutReason: {
    fontSize: FONT_SIZES.small,
    color: COLORS.grey,
  },
  payoutAmount: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: FONT_SIZES.extraLarge,
    color: COLORS.primary,
  },
  tokenText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.grey,
  },
  payoutActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  rejectButton: {
    backgroundColor: COLORS.red,
  },
  approveButton: {
    backgroundColor: COLORS.success,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: FONT_SIZES.large,
    color: COLORS.grey,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.grey,
    marginTop: 8,
    opacity: 0.7,
  },
});

export default NarrativeDashboard;
