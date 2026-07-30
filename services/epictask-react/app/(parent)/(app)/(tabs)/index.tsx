import HomeIcon from "@/assets/icons/Home";
import KidsCard from "@/components/cards/KidsCard";
import TaskCard from "@/components/cards/TaskCard";
import Heading from "@/components/headings/Heading";
import ProgressCard from "@/components/cards/ProgressCard";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import PlusButton from "@/components/PlusButton";
import { router } from "expo-router";
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
import { Link, useFocusEffect } from "expo-router";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { firestoreService } from "@/api/firestoreService";
import authService from "@/api/authService";
import taskService from "@/api/taskService";
import { narrativeService, PendingPayout } from "@/api/narrativeService";
import { notificationService } from "@/api/notificationService";
import ChildSelectionModal from "@/components/modals/ChildSelectionModal";
import ChildPINModal from "@/components/modals/ChildPINModal";
import { useFamilyTasks } from "@/hooks/useTaskManagement";
import CustomText from "@/components/CustomText";
import { MaterialIcons } from "@expo/vector-icons";
import { useXummAuth, isXummWalletConnected, XummUserToken } from "@/hooks/useXummAuth";
import { XummQrModal } from "@/components/modals/XummQrModal";

// Type definitions
interface TaskSummary {
  completed: number;
  in_progress: number;
  total: number;
}

interface RecentTask {
  task_id: string;
  task_title: string;
  reward_amount: number;
  assigned_to_ids?: string[];
  status?: string;
  story_id?: string;
  node_id?: string;
}

interface Kid {
  uid: string;
  displayName: string;
  age: number;
  grade_level: string;
  device_sharing_enabled?: boolean;
  level?: number;
  tokens_earned?: number;
  tasks_completed?: number;
  tasks_pending?: number;
}

export default function HomeScreen() {
  const { user, enterSharedDeviceMode } = useAuth();
  const { connectWallet, showQrModal, qrUrl, closeModal, isConnecting } = useXummAuth();
  const walletConnected = isXummWalletConnected(user?.userToken as XummUserToken | undefined);

  const handleWalletPress = () => {
    if (walletConnected) {
      Alert.alert("Wallet Connected", "Your Xumm wallet is securely connected.");
    } else {
      connectWallet(user!.uid, user?.userToken as XummUserToken | undefined);
    }
  };

  const [taskSummary, setTaskSummary] = useState<TaskSummary>({ completed: 0, in_progress: 0, total: 0 });
  const [recentTasks, setRecentTasks] = useState<RecentTask[]>([]);
  const [pendingPayouts, setPendingPayouts] = useState<PendingPayout[]>([]);
  const [kidsWithTaskData, setKidsWithTaskData] = useState<Kid[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payoutLoading, setPayoutLoading] = useState<Record<string, boolean>>({});
  const [rewardingTaskId, setRewardingTaskId] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const requestIdRef = useRef(0);
  const currentUserIdRef = useRef<string | undefined>(user?.uid);
  const REFRESH_COOLDOWN = 5000; // 5 seconds cooldown

  // Child switching modals
  const [childSelectionModalVisible, setChildSelectionModalVisible] = useState(false);
  const [childPINModalVisible, setChildPINModalVisible] = useState(false);
  const [selectedChildForPIN, setSelectedChildForPIN] = useState<Kid | null>(null);

  const {
    familyTasks,
    children,
    loading: familyTasksLoading,
    error: familyTasksError,
    refreshFamilyTasks,
  } = useFamilyTasks(user?.uid, { realTime: true });

  useEffect(() => {
    currentUserIdRef.current = user?.uid;
    requestIdRef.current += 1;

    if (!user?.uid) {
      setTaskSummary({ completed: 0, in_progress: 0, total: 0 });
      setRecentTasks([]);
      setPendingPayouts([]);
      setKidsWithTaskData([]);
      setUnreadNotifications(0);
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.uid]);

  const fetchData = useCallback(async (isRefresh = false) => {
    const userId = user?.uid;
    const requestId = ++requestIdRef.current;
    const isCurrentRequest = () =>
      requestId === requestIdRef.current && currentUserIdRef.current === userId;

    if (!userId) {
      return;
    }

    try {
      if (!isRefresh) setLoading(true);
      const summary = (await firestoreService.getTaskSummary(
        userId
      )) as TaskSummary;
      if (!isCurrentRequest()) return;
      setTaskSummary(summary || { completed: 0, in_progress: 0, total: 0 });

      const tasks = (await firestoreService.getRecentTasks(
        userId
      )) as RecentTask[];
      if (!isCurrentRequest()) return;
      setRecentTasks(Array.isArray(tasks) ? tasks : []);

      // Fetch pending narrative payouts
      try {
        const payouts = await narrativeService.getPendingPayouts(userId);
        if (!isCurrentRequest()) return;
        setPendingPayouts(Array.isArray(payouts) ? payouts : []);
      } catch (e) {
        if (!isCurrentRequest()) return;
        console.log("Failed to fetch pending payouts", e);
        setPendingPayouts([]);
      }

      // Fetch unread notifications count
      try {
        const notifications = await notificationService.getNotifications(20, true);
        if (!isCurrentRequest()) return;
        setUnreadNotifications(Array.isArray(notifications) ? notifications.length : 0);
      } catch (e) {
        if (!isCurrentRequest()) return;
        console.log("Failed to fetch notifications count", e);
      }

      const safeChildren = Array.isArray(children) ? children : [];
      const kidsWithTaskSummary = await Promise.all(
        safeChildren.map(async (kid: Kid) => {
          try {
            const kidTaskSummary =
              (await firestoreService.getKidTaskSummary(
                kid.uid
              )) as TaskSummary;
            return {
              ...kid,
              tasks_completed: kidTaskSummary?.completed || 0,
              tasks_pending: kidTaskSummary?.in_progress || 0,
            };
          } catch (err) {
            console.log(`Failed to fetch summary for kid ${kid.uid}`, err);
            return {
              ...kid,
              tasks_completed: 0,
              tasks_pending: 0,
            }
          }
        })
      );
      if (!isCurrentRequest()) return;
      setKidsWithTaskData(kidsWithTaskSummary);
    } catch (error) {
      if (!isCurrentRequest()) return;
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      if (!isRefresh && isCurrentRequest()) setLoading(false);
    }
  }, [user, children]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh notifications when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const userId = user?.uid;
      let active = true;

      if (userId) {
        notificationService.getNotifications(20, true)
          .then(notifications => {
            if (active && currentUserIdRef.current === userId) {
              setUnreadNotifications(Array.isArray(notifications) ? notifications.length : 0);
            }
          })
          .catch(e => {
            if (active && currentUserIdRef.current === userId) {
              console.log("Failed to refresh notifications count", e);
            }
          });
      }

      return () => {
        active = false;
      };
    }, [user?.uid])
  );

  const onRefresh = useCallback(async () => {
    const now = Date.now();
    if (now - lastRefreshTime < REFRESH_COOLDOWN) {
      return; // Skip if cooling down
    }
    
    setRefreshing(true);
    setLastRefreshTime(now);

    const userId = user?.uid;
    try {
      if (refreshFamilyTasks) {
        await refreshFamilyTasks();
      }
      await fetchData(true);
    } finally {
      if (currentUserIdRef.current === userId) {
        setRefreshing(false);
      }
    }
  }, [fetchData, refreshFamilyTasks, lastRefreshTime, user?.uid]);

  // Handler functions for child switching
  const handleChildSwitchPress = () => {
    setChildSelectionModalVisible(true);
  };

  const handleChildSelected = (child: Kid) => {
    setChildSelectionModalVisible(false);
    setSelectedChildForPIN(child);
    setChildPINModalVisible(true);
  };

  const handleChildPINSuccess = async (child: Kid) => {
    setChildPINModalVisible(false);
    setSelectedChildForPIN(null);
    await enterSharedDeviceMode();
    router.replace('/(kid)/(app)/(tabs)' as any);
  };

  const handleChildModalClose = () => {
    setChildSelectionModalVisible(false);
    setChildPINModalVisible(false);
    setSelectedChildForPIN(null);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

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
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <TouchableOpacity 
                onPress={handleWalletPress}
                style={[
                  styles.notificationIcon, 
                  { 
                    backgroundColor: walletConnected ? COLORS.success : "white",
                    borderColor: walletConnected ? COLORS.success : "#ccc",
                    borderWidth: 1,
                    padding: 10
                  }
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
                                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                              </Text>
                          </View>
                      )}
                  </Pressable>
                </Link>
              </View>
            </View>
          </View>

          {/* Tasks Overview */}
          <View style={{ gap: 10 }}>
            <Heading title="Tasks Overview" />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <ProgressCard
                tab={true}
                progress={(taskSummary?.total || 0) > 0 ? (taskSummary?.completed || 0) / (taskSummary?.total || 1) : 0}
                completed={taskSummary?.completed || 0}
                total={taskSummary?.total || 0}
                text="Completed"
                color={COLORS.purple}
              />
              <ProgressCard
                tab={true}
                progress={(taskSummary?.total || 0) > 0 ? (taskSummary?.in_progress || 0) / (taskSummary?.total || 1) : 0}
                completed={taskSummary?.in_progress || 0}
                text="In Progress"
                total={taskSummary?.total || 0}
                color={COLORS.grey}
              />
            </View>
          </View>

          {/* Kids Profiles */}
          <View style={{ gap: 10 }}>
            <Heading title="Kids Profiles" icon={
              <PlusButton onPress={() =>{router.push("/screens/add-kid" as any)}}/>} />
            {kidsWithTaskData.length > 0 ? (
              <>
                <View style={{ flexDirection: "row", gap: 10, flex: 1 }}>
                  {kidsWithTaskData.map((kid) => (
                    <KidsCard
                      key={kid.uid}
                      name={kid.displayName}
                      level={kid.level || 1}
                      stars={kid.tokens_earned || 0}
                      completed={kid.tasks_completed || 0}
                      pending={kid.tasks_pending || 0}
                      uid={kid.uid}
                    />
                  ))}
                </View>
                
                {/* Child Switching Button */}
                {kidsWithTaskData.some(kid => authService.canSwitchToChild(kid.age)) && (
                  <TouchableOpacity
                    style={styles.childSwitchButton}
                    onPress={handleChildSwitchPress}
                  >
                    <Text style={styles.childSwitchButtonText}>
                      Switch to Child Account
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <Text>No kids linked yet. Link your first child to get started!</Text>
            )}
          </View>

          {/* Pending Narrative Rewards */}
          {pendingPayouts.length > 0 && (
            <View style={{ gap: 10 }}>
              <Heading title="Pending Rewards" />
              {pendingPayouts.map((payout) => (
                <View key={payout.request_id} style={styles.payoutCard}>
                  <View style={styles.payoutInfo}>
                    <CustomText variant="semiBold" style={styles.payoutTitle}>
                      {payout.kid_name || "Child"} earned {payout.amount} tokens
                    </CustomText>
                    <CustomText style={styles.payoutDetail}>
                      For completing "{payout.story_id}"
                    </CustomText>
                  </View>
                  <View style={styles.payoutActions}>
                    <TouchableOpacity
                      style={[styles.payoutButton, styles.approveButton, payoutLoading[payout.request_id] && styles.buttonDisabled]}
                      disabled={!!payoutLoading[payout.request_id]}
                      onPress={async () => {
                        setPayoutLoading(prev => ({ ...prev, [payout.request_id]: true }));
                        try {
                          await narrativeService.approvePayout(payout.request_id);
                          setPendingPayouts(prev => prev.filter(p => p.request_id !== payout.request_id));
                        } catch (e) {
                          Alert.alert('Error', 'Failed to approve reward. Please try again.');
                        } finally {
                          setPayoutLoading(prev => ({ ...prev, [payout.request_id]: false }));
                        }
                      }}
                    >
                      {payoutLoading[payout.request_id]
                        ? <ActivityIndicator size="small" color="#fff" />
                        : <Text style={styles.payoutButtonText}>Approve</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.payoutButton, styles.rejectButton, payoutLoading[payout.request_id] && styles.buttonDisabled]}
                      disabled={!!payoutLoading[payout.request_id]}
                      onPress={async () => {
                        setPayoutLoading(prev => ({ ...prev, [payout.request_id]: true }));
                        try {
                          await narrativeService.rejectPayout(payout.request_id, "Rejected by parent");
                          setPendingPayouts(prev => prev.filter(p => p.request_id !== payout.request_id));
                        } catch (e) {
                          Alert.alert('Error', 'Failed to reject reward. Please try again.');
                        } finally {
                          setPayoutLoading(prev => ({ ...prev, [payout.request_id]: false }));
                        }
                      }}
                    >
                      {payoutLoading[payout.request_id]
                        ? <ActivityIndicator size="small" color="#fff" />
                        : <Text style={styles.payoutButtonText}>Reject</Text>}
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Recent Tasks */}
          <View style={{ gap: 10, paddingVertical: 20 }}>
            <Heading
              title="Recent tasks"
              icon={
            <PlusButton onPress={() =>{router.push("/screens/manage-tasks/assign-task" as any)}} />
              }
            />
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
                    const snapshot = [...recentTasks];
                    try {
                      setRecentTasks(prev => prev.map(t =>
                        t.task_id === task.task_id ? { ...t, rewarded: true, marked_completed: true, status: 'completed' } : t
                      ));
                      await firestoreService.rewardTask(task.task_id);

                      if (task.assigned_to_ids && task.assigned_to_ids.length > 0) {
                        try {
                          const kidId = task.assigned_to_ids[0];
                          const progress = await narrativeService.getProgress(kidId);
                          if (progress && progress.length > 0) {
                            const activeStory = progress.find((p: any) => p.status === 'in_progress') || progress[0];
                            await narrativeService.createPayout({
                              kid_id: kidId,
                              story_id: activeStory.story_id,
                              node_id: activeStory.current_node,
                              token_amount: task.reward_amount,
                              task_id: task.task_id,
                            });
                          }
                        } catch (payoutError) {
                          console.error("Failed to create narrative payout:", payoutError);
                        }
                      }
                    } catch (e) {
                      setRecentTasks(snapshot);
                      Alert.alert('Error', 'Failed to reward task. Please try again.');
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

      <XummQrModal 
        visible={showQrModal} 
        qrUrl={qrUrl} 
        onClose={closeModal} 
      />
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
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  childSwitchButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: responsiveHeight(1.5),
    paddingHorizontal: responsiveWidth(4),
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  childSwitchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    },
    payoutCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
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
    flexDirection: 'row',
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
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    },
    });
