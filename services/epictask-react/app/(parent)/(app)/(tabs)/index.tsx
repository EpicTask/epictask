import KidsCard from "@/components/cards/KidsCard";
import TaskCard from "@/components/cards/TaskCard";
import Heading from "@/components/headings/Heading";
import ProgressCard from "@/components/cards/ProgressCard";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import PlusButton from "@/components/PlusButton";
import { router, Link } from "expo-router";
import { ICONS, IMAGES } from "@/assets";
import { COLORS } from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import React, { useState, useCallback } from "react";
import {
  Query,
  UseQueryResult,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  childrenQuery,
  summaryQuery,
  recentQuery,
  rewardsQuery,
  payoutsQuery,
  notificationsQuery,
  kidSummaryQuery,
  homeKeys,
  HomeKid,
  FamilyRewards,
} from "@/api/homeQueries";
import { useScreenRefresh } from "@/hooks/useScreenRefresh";
import { QuerySection } from "@/components/common/QuerySection";
import { useAuth } from "@/context/AuthContext";
import SetupChecklist from "@/components/onboarding/SetupChecklist";
import taskService from "@/api/taskService";
import { narrativeService, PendingPayout } from "@/api/narrativeService";
import ChildSelectionModal from "@/components/modals/ChildSelectionModal";
import ChildPINModal from "@/components/modals/ChildPINModal";
import { deviceSharingAllowed } from "@/constants/AgePolicy";
import CustomText from "@/components/CustomText";
import { MaterialIcons } from "@expo/vector-icons";
import {
  useXummAuth,
  isXummWalletConnected,
  XummUserToken,
} from "@/hooks/useXummAuth";
import { XummQrModal } from "@/components/modals/XummQrModal";

interface RecentTask {
  task_id: string;
  task_title: string;
  reward_amount: number;
  assigned_to_ids?: string[];
  status?: string;
  story_id?: string;
  node_id?: string;
}

function KidProfileCard({
  kid,
  parentId,
  rewards,
}: {
  kid: HomeKid;
  parentId: string;
  rewards: UseQueryResult<FamilyRewards, Error>;
}) {
  const summary = useQuery(kidSummaryQuery(parentId, kid.uid));
  const earned = rewards.data?.children?.find(
    (child) => child.user_id === kid.uid,
  );
  return (
    <View style={{ flex: 1 }}>
      {(!summary.data || !rewards.data) && (
        <CustomText variant="semiBold">{kid.displayName}</CustomText>
      )}
      <QuerySection query={summary} label={`${kid.displayName}'s tasks`}>
        <QuerySection query={rewards} label={`${kid.displayName}'s earnings`}>
          <KidsCard
            name={kid.displayName}
            uid={kid.uid}
            level={earned?.level ?? 1}
            stars={earned?.token_score ?? 0}
            completed={summary.data?.completed ?? 0}
            pending={summary.data?.in_progress ?? 0}
          />
        </QuerySection>
      </QuerySection>
    </View>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();
  return <ParentHomeScreen key={user?.uid || "signed-out"} />;
}

function ParentHomeScreen() {
  const { user } = useAuth();
  const { connectWallet, showQrModal, qrUrl, closeModal } = useXummAuth();
  const walletConnected = isXummWalletConnected(
    user?.userToken as XummUserToken | undefined,
  );

  const handleWalletPress = () => {
    if (walletConnected) {
      Alert.alert(
        "Wallet Connected",
        "Your Xumm wallet is securely connected.",
      );
    } else {
      connectWallet(user!.uid, user?.userToken as XummUserToken | undefined);
    }
  };

  const uid = user?.uid || "";
  const client = useQueryClient();
  const summary = useQuery(summaryQuery(uid));
  const recent = useQuery(recentQuery(uid));
  const payouts = useQuery(payoutsQuery(uid));
  const rewards = useQuery(rewardsQuery(uid));
  const childrenResult = useQuery(childrenQuery(uid));
  const notifications = useQuery(notificationsQuery(uid));
  const taskSummary = summary.data;
  const recentTasks: RecentTask[] = recent.data || [];
  const pendingPayouts = payouts.data || [];
  const children = childrenResult.data || [];
  const unreadNotifications = notifications.data || 0;
  const [payoutLoading, setPayoutLoading] = useState<Record<string, boolean>>(
    {},
  );
  const [rewardingTaskId, setRewardingTaskId] = useState<string | null>(null);
  const [childSelectionModalVisible, setChildSelectionModalVisible] =
    useState(false);
  const [childPINModalVisible, setChildPINModalVisible] = useState(false);
  const [selectedChildForPIN, setSelectedChildForPIN] =
    useState<HomeKid | null>(null);
  const matchesScreen = useCallback(
    ({ queryKey: key }: Query) =>
      !!uid &&
      key[1] === uid &&
      ["home", "linkedChildren", "notifications"].includes(String(key[0])),
    [uid],
  );
  const { refreshing, onRefresh } = useScreenRefresh(matchesScreen);

  const removePayout = (requestId: string) => {
    // Returning undefined after logout leaves an absent query absent.
    client.setQueryData(
      homeKeys.payouts(uid),
      (previous: PendingPayout[] | undefined) =>
        previous?.filter((payout) => payout.request_id !== requestId),
    );
  };

  // Handler functions for child switching
  const switchableKids = children.filter(
    (kid) =>
      deviceSharingAllowed(kid.age) && kid.device_sharing_enabled !== false,
  );

  const handleChildSwitchPress = () => {
    // With a single shared profile there is nothing to choose — go straight to
    // the PIN, which is the only step that actually gates access.
    if (switchableKids.length === 1) {
      setSelectedChildForPIN(switchableKids[0]);
      setChildPINModalVisible(true);
      return;
    }
    setChildSelectionModalVisible(true);
  };

  const handleChildSelected = (child: HomeKid) => {
    setChildSelectionModalVisible(false);
    setSelectedChildForPIN(child);
    setChildPINModalVisible(true);
  };

  // The PIN modal already put the app into shared mode via AuthContext, so all
  // that's left is to land on the kid dashboard.
  const handleChildPINSuccess = (_child: HomeKid) => {
    setChildPINModalVisible(false);
    setSelectedChildForPIN(null);
    router.replace("/(kid)/(app)/(tabs)" as any);
  };

  const handleChildModalClose = () => {
    setChildSelectionModalVisible(false);
    setChildPINModalVisible(false);
    setSelectedChildForPIN(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{ gap: 20 }}>
          {/* Header */}
          <View style={styles.header}>
            <Image
              source={user?.imageUrl ? { uri: user.imageUrl } : IMAGES.profile}
              style={styles.profileImage}
            />
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <TouchableOpacity
                onPress={handleWalletPress}
                style={[
                  styles.notificationIcon,
                  {
                    backgroundColor: walletConnected ? COLORS.success : "white",
                    borderColor: walletConnected ? COLORS.success : "#ccc",
                    borderWidth: 1,
                    padding: 10,
                  },
                ]}
              >
                <MaterialIcons
                  name="account-balance-wallet"
                  size={22}
                  color={walletConnected ? "white" : "black"}
                />
              </TouchableOpacity>
              <View style={styles.notificationIcon}>
                <Link href="/screens/notification-screen" asChild>
                  <Pressable>
                    {ICONS.SETTINGS.bell}
                    {unreadNotifications > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                          {unreadNotifications > 9 ? "9+" : unreadNotifications}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                </Link>
              </View>
            </View>
          </View>

          {notifications.isError && (
            <QuerySection query={notifications} label="notifications" />
          )}
          {/* Tasks Overview */}
          <View style={{ gap: 10 }}>
            <Heading title="Tasks Overview" />
            <QuerySection query={summary} label="task overview">
              <View style={{ flexDirection: "row", gap: 10 }}>
                <ProgressCard
                  tab={true}
                  progress={
                    (taskSummary?.total || 0) > 0
                      ? (taskSummary?.completed || 0) /
                        (taskSummary?.total || 1)
                      : 0
                  }
                  completed={taskSummary?.completed || 0}
                  total={taskSummary?.total || 0}
                  text="Completed"
                  color={COLORS.purple}
                />
                <ProgressCard
                  tab={true}
                  progress={
                    (taskSummary?.total || 0) > 0
                      ? (taskSummary?.in_progress || 0) /
                        (taskSummary?.total || 1)
                      : 0
                  }
                  completed={taskSummary?.in_progress || 0}
                  text="In Progress"
                  total={taskSummary?.total || 0}
                  color={COLORS.grey}
                />
              </View>
            </QuerySection>
          </View>

          {/* Kids Profiles */}
          <View style={{ gap: 10 }}>
            <Heading
              title="Kids Profiles"
              icon={
                <PlusButton
                  onPress={() => {
                    router.push("/screens/add-kid" as any);
                  }}
                />
              }
            />
            <QuerySection query={childrenResult} label="kids profiles">
              {children.length > 0 ? (
                <>
                  <View style={{ flexDirection: "row", gap: 10, flex: 1 }}>
                    {children.map((kid) => (
                      <KidProfileCard
                        key={kid.uid}
                        kid={kid}
                        parentId={uid}
                        rewards={rewards}
                      />
                    ))}
                  </View>

                  {/* Child Switching Button — only shown when at least one kid
                    actually has a shared profile on this device. */}
                  {switchableKids.length > 0 && (
                    <TouchableOpacity
                      style={styles.childSwitchButton}
                      onPress={handleChildSwitchPress}
                      accessibilityRole="button"
                    >
                      <MaterialIcons
                        name="switch-account"
                        size={18}
                        color="#fff"
                      />
                      <Text style={styles.childSwitchButtonText}>
                        {switchableKids.length === 1
                          ? `Switch to ${
                              switchableKids[0].displayName.split(" ")[0]
                            }'s Profile`
                          : "Switch to Kid Profile"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <View>
                  <Text>
                    No kids linked yet. Link your first child to get started!
                  </Text>
                  <SetupChecklist />
                </View>
              )}
            </QuerySection>
          </View>

          {/* Pending Narrative Rewards */}
          <QuerySection query={payouts} label="pending rewards" height={90}>
            {pendingPayouts.length > 0 && (
              <View style={{ gap: 10 }}>
                <Heading title="Pending Rewards" />
                {pendingPayouts.map((payout) => (
                  <View key={payout.request_id} style={styles.payoutCard}>
                    <View style={styles.payoutInfo}>
                      <CustomText variant="semiBold" style={styles.payoutTitle}>
                        {payout.kid_name || "Child"} earned {payout.amount}{" "}
                        tokens
                      </CustomText>
                      <CustomText style={styles.payoutDetail}>
                        For completing &quot;{payout.story_id}&quot;
                      </CustomText>
                    </View>
                    <View style={styles.payoutActions}>
                      <TouchableOpacity
                        style={[
                          styles.payoutButton,
                          styles.approveButton,
                          payoutLoading[payout.request_id] &&
                            styles.buttonDisabled,
                        ]}
                        disabled={!!payoutLoading[payout.request_id]}
                        onPress={async () => {
                          setPayoutLoading((prev) => ({
                            ...prev,
                            [payout.request_id]: true,
                          }));
                          try {
                            await narrativeService.approvePayout(
                              payout.request_id,
                            );
                            removePayout(payout.request_id);
                          } catch (e) {
                            Alert.alert(
                              "Error",
                              "Failed to approve reward. Please try again.",
                            );
                          } finally {
                            setPayoutLoading((prev) => ({
                              ...prev,
                              [payout.request_id]: false,
                            }));
                          }
                        }}
                      >
                        {payoutLoading[payout.request_id] ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.payoutButtonText}>Approve</Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.payoutButton,
                          styles.rejectButton,
                          payoutLoading[payout.request_id] &&
                            styles.buttonDisabled,
                        ]}
                        disabled={!!payoutLoading[payout.request_id]}
                        onPress={async () => {
                          setPayoutLoading((prev) => ({
                            ...prev,
                            [payout.request_id]: true,
                          }));
                          try {
                            await narrativeService.rejectPayout(
                              payout.request_id,
                              "Rejected by parent",
                            );
                            removePayout(payout.request_id);
                          } catch (e) {
                            Alert.alert(
                              "Error",
                              "Failed to reject reward. Please try again.",
                            );
                          } finally {
                            setPayoutLoading((prev) => ({
                              ...prev,
                              [payout.request_id]: false,
                            }));
                          }
                        }}
                      >
                        {payoutLoading[payout.request_id] ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.payoutButtonText}>Reject</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </QuerySection>

          {/* Recent Tasks */}
          <View style={{ gap: 10, paddingVertical: 20 }}>
            <Heading
              title="Recent tasks"
              icon={
                <PlusButton
                  onPress={() => {
                    router.push("/screens/manage-tasks/assign-task" as any);
                  }}
                />
              }
            />
            <QuerySection query={recent} label="recent tasks">
              {recentTasks.length > 0 ? (
                recentTasks.map((task) => (
                  <TaskCard
                    key={task.task_id}
                    name={task.task_title}
                    stars={task.reward_amount}
                    taskData={task}
                    isRewarding={rewardingTaskId === task.task_id}
                    onReward={async () => {
                      if (rewardingTaskId) return;
                      setRewardingTaskId(task.task_id);
                      try {
                        // Backend owns the reward write (credit + XRPL payment
                        // + notifications) behind one authorised call.
                        await taskService.taskRewarded({
                          task_id: task.task_id,
                          user_id: user.uid,
                        });

                        if (
                          task.assigned_to_ids &&
                          task.assigned_to_ids.length > 0
                        ) {
                          try {
                            const kidId = task.assigned_to_ids[0];
                            const progress = await narrativeService.getProgress(
                              kidId,
                            );
                            if (progress && progress.length > 0) {
                              const activeStory =
                                progress.find(
                                  (p: any) => p.status === "in_progress",
                                ) || progress[0];
                              await narrativeService.createPayout({
                                kid_id: kidId,
                                story_id: activeStory.story_id,
                                node_id: activeStory.current_node,
                                token_amount: task.reward_amount,
                                task_id: task.task_id,
                              });
                            }
                          } catch (payoutError) {
                            console.log(
                              "Failed to create narrative payout:",
                              payoutError,
                            );
                          }
                        }
                      } catch (e) {
                        Alert.alert(
                          "Error",
                          "Failed to reward task. Please try again.",
                        );
                      } finally {
                        setRewardingTaskId(null);
                      }
                    }}
                    isParentView={true}
                  />
                ))
              ) : (
                <Text>No recent activity. Create tasks to see them here!</Text>
              )}
            </QuerySection>
          </View>
        </View>
      </ScrollView>

      {/* Child Selection and PIN Modals */}
      <ChildSelectionModal
        visible={childSelectionModalVisible}
        onClose={handleChildModalClose}
        onChildSelected={handleChildSelected}
      />

      <ChildPINModal
        visible={childPINModalVisible}
        child={selectedChildForPIN}
        onClose={handleChildModalClose}
        onSuccess={handleChildPINSuccess}
      />

      <XummQrModal visible={showQrModal} qrUrl={qrUrl} onClose={closeModal} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: responsiveWidth(4),
    backgroundColor: "#F1F6F9",
    height: responsiveHeight(100),
    width: responsiveWidth(100),
  },
  container: {
    flex: 1,
    marginBottom: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileImage: {
    height: responsiveHeight(8),
    width: responsiveHeight(8),
    borderRadius: responsiveHeight(4),
  },
  notificationIcon: {
    padding: 14,
    backgroundColor: "white",
    borderRadius: responsiveWidth(100),
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  childSwitchButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: responsiveHeight(1.5),
    paddingHorizontal: responsiveWidth(4),
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
  },
  childSwitchButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  payoutCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 10,
  },
  payoutInfo: {
    flex: 1,
  },
  payoutTitle: {
    fontSize: 14,
    color: COLORS.black,
  },
  payoutDetail: {
    fontSize: 12,
    color: COLORS.grey,
    marginTop: 2,
  },
  payoutActions: {
    flexDirection: "row",
    gap: 8,
  },
  payoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  approveButton: {
    backgroundColor: COLORS.primary,
  },
  rejectButton: {
    backgroundColor: COLORS.grey,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  payoutButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});
