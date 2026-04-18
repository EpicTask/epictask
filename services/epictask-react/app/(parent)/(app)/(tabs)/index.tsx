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
import React, { useEffect, useState, useCallback } from "react";
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
  const { user } = useAuth();
  const [taskSummary, setTaskSummary] = useState<TaskSummary>({ completed: 0, in_progress: 0, total: 0 });
  const [recentTasks, setRecentTasks] = useState<RecentTask[]>([]);
  const [pendingPayouts, setPendingPayouts] = useState<PendingPayout[]>([]);
  const [kidsWithTaskData, setKidsWithTaskData] = useState<Kid[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
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

  const fetchData = useCallback(async (isRefresh = false) => {
    if (user) {
      try {
        if (!isRefresh) setLoading(true);
        const summary = (await firestoreService.getTaskSummary(
          user.uid
        )) as TaskSummary;
        setTaskSummary(summary || { completed: 0, in_progress: 0, total: 0 });

        const tasks = (await firestoreService.getRecentTasks(
          user.uid
        )) as RecentTask[];
        setRecentTasks(Array.isArray(tasks) ? tasks : []);

        // Fetch pending narrative payouts
        try {
            const payouts = await narrativeService.getPendingPayouts(user.uid);
            setPendingPayouts(Array.isArray(payouts) ? payouts : []);
        } catch (e) {
            console.log("Failed to fetch pending payouts", e);
            setPendingPayouts([]);
        }

        // Fetch unread notifications count
        try {
            const notifications = await notificationService.getNotifications(20, true);
            setUnreadNotifications(Array.isArray(notifications) ? notifications.length : 0);
        } catch (e) {
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
        setKidsWithTaskData(kidsWithTaskSummary);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        if (!isRefresh) setLoading(false);
      }
    }
  }, [user, children]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh notifications when screen comes into focus
  useFocusEffect(
    useCallback(() => {
        if (user) {
            notificationService.getNotifications(20, true)
                .then(notifications => setUnreadNotifications(notifications.length))
                .catch(e => console.log("Failed to refresh notifications count", e));
        }
    }, [user])
  );

  const onRefresh = useCallback(async () => {
    const now = Date.now();
    if (now - lastRefreshTime < REFRESH_COOLDOWN) {
      return; // Skip if cooling down
    }
    
    setRefreshing(true);
    setLastRefreshTime(now);

    if (refreshFamilyTasks) {
      await refreshFamilyTasks();
    }
    await fetchData(true);
    setRefreshing(false);
  }, [fetchData, refreshFamilyTasks, lastRefreshTime]);

  // Handler functions for child switching
  const handleChildSwitchPress = () => {
    setChildSelectionModalVisible(true);
  };

  const handleChildSelected = (child: Kid) => {
    setChildSelectionModalVisible(false);
    setSelectedChildForPIN(child);
    setChildPINModalVisible(true);
  };

  const handleChildPINSuccess = (child: Kid) => {
    setChildPINModalVisible(false);
    setSelectedChildForPIN(null);
    // Navigate to child interface
    // For now, we'll show an alert - this would be replaced with actual navigation
    Alert.alert(
      'Success!',
      `Switched to ${child.displayName}'s account. This would normally navigate to the child interface.`
    );
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
            <Link href="/(parent)/(app)/screens/profile-display" asChild>
              <Pressable>
                <Image
                  source={user?.imageUrl ? { uri: user.imageUrl } : IMAGES.profile}
                  style={styles.profileImage}
                />
              </Pressable>
            </Link>
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
                      style={[styles.payoutButton, styles.approveButton]}
                      onPress={async () => {
                        try {
                          await narrativeService.approvePayout(payout.request_id);
                          setPendingPayouts(prev => prev.filter(p => p.request_id !== payout.request_id));
                        } catch (e) {
                          console.error("Failed to approve payout", e);
                        }
                      }}
                    >
                      <Text style={styles.payoutButtonText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.payoutButton, styles.rejectButton]}
                      onPress={async () => {
                        try {
                          await narrativeService.rejectPayout(payout.request_id, "Rejected by parent");
                          setPendingPayouts(prev => prev.filter(p => p.request_id !== payout.request_id));
                        } catch (e) {
                          console.error("Failed to reject payout", e);
                        }
                      }}
                    >
                      <Text style={styles.payoutButtonText}>Reject</Text>
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
                  onReward={async () => {
                    try {
                      // Optimistic
                      setRecentTasks(prev => prev.map(t => 
                        t.task_id === task.task_id ? { ...t, rewarded: true, marked_completed: true, status: 'completed' } : t
                      ));
                      await firestoreService.rewardTask(task.task_id);

                      // Milestone 2.1: Post-Approval Payout Hook
                      if (task.assigned_to_ids && task.assigned_to_ids.length > 0) {
                        try {
                          // Fetch kid's active story progress to get current node
                          const kidId = task.assigned_to_ids[0];
                          const progress = await narrativeService.getProgress(kidId);
                          
                          // If there's active progress, create a payout request
                          if (progress && progress.length > 0) {
                            const activeStory = progress.find(p => p.status === 'in_progress') || progress[0];
                            
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
                      console.error("Error rewarding task", e);
                      setRecentTasks([...recentTasks]);
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
    payoutButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    },
    });