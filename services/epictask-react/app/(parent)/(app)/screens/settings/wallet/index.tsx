import { FONT_SIZES } from "@/constants/FontSize";
import React, { useState, useCallback } from "react";
import CustomText from "@/components/CustomText";
import ScreenHeading from "@/components/headings/ScreenHeading";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useFocusEffect } from "expo-router";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import {
  useXummAuth,
  isXummWalletConnected,
  XummUserToken,
} from "@/hooks/useXummAuth";
import { XummQrModal } from "@/components/modals/XummQrModal";
import { firestoreService } from "@/api/firestoreService";
import { COLORS } from "@/constants/Colors";
import { ICONS } from "@/assets";

const abbreviateAddress = (address: string) =>
  address.length > 12
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : address;

interface Rewards {
  tokens_earned: number;
  level: number;
  rank: number;
}

interface RewardedTask {
  id: string;
  task_title?: string;
  reward_amount?: number;
  timestamp?: any;
  assigned_to_ids?: string[];
}

export default function ParentWalletScreen() {
  const { user } = useAuth();
  const { connectWallet, sendPayment, showQrModal, qrUrl, closeModal, isConnecting } =
    useXummAuth();

  const walletConnected = isXummWalletConnected(
    user?.userToken as XummUserToken | undefined
  );
  const walletAddress: string = user?.wallet_address || "";

  const [rewards, setRewards] = useState<Rewards | null>(null);
  const [recentActivity, setRecentActivity] = useState<RewardedTask[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const [rewardsData, tasks] = await Promise.all([
        firestoreService.getUserRewards(user.uid),
        firestoreService.getRecentTasks(user.uid, 10, 30),
      ]);
      setRewards(rewardsData);
      const rewarded = (tasks as RewardedTask[]).filter(
        (t: any) => t.rewarded === true || t.status === "completed"
      );
      setRecentActivity(rewarded);
    } catch (e) {
      console.error("Failed to load wallet data", e);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useFocusEffect(loadData);

  const handleConnect = () => {
    connectWallet(user!.uid, user?.userToken as XummUserToken | undefined);
  };

  const handleSend = () => {
    Alert.alert(
      "Send Payment",
      "Task rewards are sent automatically when you approve tasks on the Home screen. To send a manual payment, use the Xumm app directly."
    );
  };

  const handleRequest = () => {
    if (!walletAddress) {
      Alert.alert("No Wallet", "Connect your Xumm wallet to get your address.");
      return;
    }
    Alert.alert("Your Wallet Address", walletAddress);
  };

  const tokensToNextLevel = rewards
    ? 1000 - (rewards.tokens_earned % 1000)
    : 1000;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeading text="Wallet" back={true} plus={false} />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Xumm Connection Card */}
          <View style={styles.card}>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: walletConnected ? COLORS.success : COLORS.grey },
                ]}
              />
              <CustomText
                variant="semiBold"
                style={[
                  styles.statusLabel,
                  { color: walletConnected ? COLORS.success : COLORS.grey },
                ]}
              >
                {walletConnected ? "Xumm Connected" : "Wallet Not Connected"}
              </CustomText>
            </View>

            {walletAddress ? (
              <CustomText variant="regular" style={styles.addressText}>
                {abbreviateAddress(walletAddress)}
              </CustomText>
            ) : null}

            {!walletConnected && (
              <TouchableOpacity
                style={styles.connectButton}
                onPress={handleConnect}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name="wallet-plus"
                      size={18}
                      color="#fff"
                    />
                    <CustomText variant="semiBold" style={styles.connectButtonText}>
                      Connect Xumm Wallet
                    </CustomText>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Rewards Summary Card */}
          {rewards && (
            <View style={styles.card}>
              <CustomText variant="regular" style={styles.sectionLabel}>
                EpicTask Rewards
              </CustomText>
              <View style={styles.rewardsRow}>
                <View style={styles.rewardStat}>
                  <CustomText variant="bold" style={styles.rewardBig}>
                    {rewards.tokens_earned.toLocaleString()}
                  </CustomText>
                  <CustomText variant="regular" style={styles.rewardCaption}>
                    tokens distributed
                  </CustomText>
                </View>
                <View style={styles.rewardDivider} />
                <View style={styles.rewardStat}>
                  <CustomText variant="bold" style={styles.rewardBig}>
                    {rewards.level}
                  </CustomText>
                  <CustomText variant="regular" style={styles.rewardCaption}>
                    level
                  </CustomText>
                </View>
                {rewards.rank > 0 && (
                  <>
                    <View style={styles.rewardDivider} />
                    <View style={styles.rewardStat}>
                      <CustomText variant="bold" style={styles.rewardBig}>
                        #{rewards.rank}
                      </CustomText>
                      <CustomText variant="regular" style={styles.rewardCaption}>
                        rank
                      </CustomText>
                    </View>
                  </>
                )}
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={[styles.card, styles.actionsCard]}>
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionItem} onPress={handleSend}>
                <View style={styles.actionIcon}>
                  {ICONS.SETTINGS.WALLET.upload}
                </View>
                <CustomText variant="medium" style={styles.actionLabel}>
                  Send
                </CustomText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionItem} onPress={handleRequest}>
                <View style={styles.actionIcon}>
                  {ICONS.SETTINGS.WALLET.download}
                </View>
                <CustomText variant="medium" style={styles.actionLabel}>
                  Receive
                </CustomText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Activity */}
          <View style={{ marginTop: 8 }}>
            <CustomText variant="bold" style={styles.sectionHeading}>
              Recent Activity
            </CustomText>
            {recentActivity.length === 0 ? (
              <View style={styles.emptyState}>
                <CustomText variant="regular" style={styles.emptyText}>
                  Rewarded tasks will appear here.
                </CustomText>
              </View>
            ) : (
              recentActivity.map((task) => (
                <View key={task.id} style={styles.activityRow}>
                  <View style={styles.activityIcon}>
                    <MaterialIcons name="check-circle" size={20} color={COLORS.success} />
                  </View>
                  <View style={styles.activityInfo}>
                    <CustomText variant="semiBold" style={styles.activityTitle}>
                      {task.task_title || "Task"}
                    </CustomText>
                  </View>
                  <CustomText variant="semiBold" style={styles.activityAmount}>
                    +{task.reward_amount ?? 0} XRP
                  </CustomText>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}

      <XummQrModal visible={showQrModal} qrUrl={qrUrl} onClose={closeModal} />
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
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  actionsCard: {
    paddingVertical: 16,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusLabel: {
    fontSize: FONT_SIZES.medium,
  },
  addressText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.grey,
    fontFamily: "monospace",
    marginBottom: 4,
  },
  connectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  connectButtonText: {
    color: "#fff",
    fontSize: FONT_SIZES.medium,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.small,
    color: COLORS.grey,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  rewardsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  rewardStat: {
    alignItems: "center",
    gap: 4,
  },
  rewardBig: {
    fontSize: FONT_SIZES.display,
    color: COLORS.primary,
  },
  rewardCaption: {
    fontSize: FONT_SIZES.small,
    color: COLORS.grey,
  },
  rewardDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#00000010",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  actionItem: {
    alignItems: "center",
    gap: 6,
  },
  actionIcon: {
    backgroundColor: "#F6F6F6",
    borderRadius: 100,
    padding: 14,
  },
  actionLabel: {
    fontSize: FONT_SIZES.small,
    color: "#444",
  },
  sectionHeading: {
    fontSize: FONT_SIZES.subtitle,
    marginBottom: 12,
  },
  emptyState: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
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
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  activityIcon: {
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: FONT_SIZES.medium,
    color: "#333",
  },
  activityAmount: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.success,
  },
});
