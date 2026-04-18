import { FONT_SIZES } from "@/constants/FontSize";
import React, { useState, useCallback, useEffect } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
  Pressable
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { router, Link, useFocusEffect } from "expo-router";
import { KidTaskModal } from "@/components/modals/KidTaskModal";
import * as Progress from "react-native-progress";
import { useAuth } from "@/context/AuthContext";

import TaskCard from "@/components/cards/kid/TaskCard";
import Heading from "@/components/headings/Heading";
import CustomText from "@/components/CustomText";
import KidArrowIcon from "@/assets/icons/KidArrow";
import { ICONS, IMAGES } from "@/assets";
import { COLORS } from "@/constants/Colors";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import taskService from "@/api/taskService";
import { firestoreService } from "@/api/firestoreService";
import { notificationService } from "@/api/notificationService";
import MicroserviceUrls from "@/constants/Microservices";
import { Task } from "@/constants/Interfaces";
import DebouncedTouchableOpacity from "@/components/buttons/DebouncedTouchableOpacity";
import StoryProgressCard from "@/components/cards/kid/StoryProgressCard";
import ActiveStoryCard from "@/components/cards/kid/ActiveStoryCard";
import narrativeService, { StoryProgress, Story } from "@/api/narrativeService";

const fetchTasks = async (userId: string) => {
  const data = await firestoreService.getTasksForUser(userId);
  if (Array.isArray(data)) {
    return data;
  }
  if (data && Array.isArray(data.tasks)) {
    return data.tasks;
  }
  // Return an empty array if the response is not in the expected format.
  return [];
};

export default function HomeScreen() {
  const { user } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["allTasks", user?.uid],
    queryFn: () => fetchTasks(user?.uid),
    enabled: !!user,
  });

  // Fetch story progress
  const {
    data: storyProgress = [],
    isLoading: storyProgressLoading,
    refetch: refetchStoryProgress,
  } = useQuery({
    queryKey: ["homeStoryProgress", user?.uid],
    queryFn: () => narrativeService.getProgress(user?.uid),
    enabled: !!user,
  });

  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const REFRESH_COOLDOWN = 5000; // 5 seconds cooldown

  // Fetch notifications count
  const fetchNotificationCount = useCallback(async () => {
    if (user) {
        try {
            const notifications = await notificationService.getNotifications(20, true);
            setUnreadNotifications(notifications.length);
        } catch (e) {
            console.log("Failed to fetch notifications count", e);
        }
    }
  }, [user]);

  useEffect(() => {
    fetchNotificationCount();
  }, [fetchNotificationCount]);

  // Refresh tasks, story progress, and notifications when screen comes into focus
  useFocusEffect(
    useCallback(() => {
        refetch();
        refetchStoryProgress();
        fetchNotificationCount();
    }, [refetch, refetchStoryProgress, fetchNotificationCount])
  );

  const onRefresh = useCallback(async () => {
    const now = Date.now();
    if (now - lastRefreshTime < REFRESH_COOLDOWN) {
      return; // Skip if cooling down
    }

    setRefreshing(true);
    setLastRefreshTime(now);
    await Promise.all([refetch(), refetchStoryProgress(), fetchNotificationCount()]);
    setRefreshing(false);
  }, [refetch, refetchStoryProgress, fetchNotificationCount, lastRefreshTime]);

  // Derive activeProgress before any early returns so hooks stay stable
  const activeProgress = storyProgress.find(
    (p: StoryProgress) => p.status === "in_progress"
  );

  // Fetch active node to check for task gates — must be above early returns
  const {
    data: activeNode = null,
  } = useQuery({
    queryKey: ["activeStoryNode", user?.uid, activeProgress?.story_id, activeProgress?.current_node_id],
    queryFn: () => activeProgress ? narrativeService.getNode(activeProgress.story_id, activeProgress.current_node_id) : null,
    enabled: !!activeProgress,
  });

  if (isLoading) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text>Oops! We couldn't load your tasks.</Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Text style={{ color: COLORS.primary, marginTop: 10 }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const completedTasks = tasks.filter(
    (task: Task) => task.status === "completed"
  ).length;
  const progress = tasks.length > 0 ? completedTasks / tasks.length : 0;

  // Calculate story stats
  const inProgressStories = storyProgress.filter(
    (p: StoryProgress) => p.status === "in_progress"
  ).length;
  const completedStories = storyProgress.filter(
    (p: StoryProgress) => p.status === "completed"
  ).length;
  const totalStoryXp = storyProgress.reduce(
    (sum: number, p: StoryProgress) => sum + p.total_xp,
    0
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{ gap: 10 }}>
          {/* Header */}
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View style={{ flex: 1 }}>
              <CustomText
                variant="semiBold"
                style={{ fontSize: FONT_SIZES.display }}
              >
                Hello,
              </CustomText>
              <CustomText
                variant="semiBold"
                style={{ fontSize: FONT_SIZES.title, fontWeight: "500" }}
              >
                {user?.displayName || "New User"}! 👋
              </CustomText>
              <CustomText style={{ paddingRight: 40, color: COLORS.grey }}>
                Ready for some fun tasks and rewards today?
              </CustomText>
            </View>
            <View>
              <Link href="../screens/notification-screen" asChild>
                <TouchableOpacity>
                    <View
                    style={{
                        padding: 14,
                        backgroundColor: "white",
                        borderRadius: responsiveWidth(100),
                        position: 'relative',
                    }}
                    >
                    {ICONS.SETTINGS.bell}
                    {unreadNotifications > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                                {unreadNotifications > 9 ? '9+' : unreadNotifications}
                            </Text>
                        </View>
                    )}
                    </View>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          {/* Progress Cards */}
          <View style={{ paddingVertical: 10 }}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {/* Tasks Progress */}
              <View style={{ width: responsiveWidth(44), height: 165 }}>
                <View>{ICONS.kidCard}</View>
                <View style={styles.cardOverlay}>
                  <CustomText variant="semiBold">
                    You have {tasks.length} tasks today!
                  </CustomText>
                  <Progress.Circle
                    size={40}
                    progress={progress}
                    thickness={3}
                    color={COLORS.purple}
                    unfilledColor="#E5E7EB"
                    borderWidth={0}
                    showsText={true}
                    formatText={() => `${Math.round(progress * 100)}%`}
                    textStyle={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: COLORS.purple,
                    }}
                  />
                  <View>
                    <CustomText
                      variant="semiBold"
                      style={[styles.completedText, { fontSize: 10 }]}
                    >
                      Completed
                    </CustomText>
                    <Text
                      style={styles.fractionText}
                    >{`${completedTasks}/${tasks.length}`}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.arrow}
                  onPress={() => router.push("../screens/all-tasks")}
                >
                  {ICONS.kidArrow}
                </TouchableOpacity>
              </View>

              {/* Story Progress */}
              <StoryProgressCard
                inProgressCount={inProgressStories}
                completedCount={completedStories}
                totalXpEarned={totalStoryXp}
                onPress={() => router.push("./stories")}
              />
            </View>
          </View>

          {/* Active Story / Adventure Section */}
          <View style={{ paddingVertical: 5 }}>
            <Heading title="Your Adventure" />
            <ActiveStoryCard
              title={activeProgress?.story_id === 'broken-toy-5-7' ? "The Broken Toy" : 
                     activeProgress?.story_id === 'cookie-jar-5-7' ? "The Cookie Jar" :
                     activeProgress ? "Current Story" : "Start a New Story!"}
              progress={activeProgress ? (activeProgress.completed_nodes.length / 3) : 0} // Assuming 3 nodes for seeded stories
              isNew={!activeProgress}
              onPress={() => {
                if (activeProgress) {
                  router.push({
                    pathname: "../screens/story",
                    params: { storyId: activeProgress.story_id }
                  });
                } else {
                  router.push("./stories");
                }
              }}
            />
          </View>

          {/* Upcoming Tasks */}
          <View style={{ gap: 10, paddingVertical: 6 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 4,
              }}
            >
              <CustomText
                style={{
                  fontSize: FONT_SIZES.subtitle,
                  color: COLORS.black,
                  fontWeight: "500",
                }}
                variant="semiBold"
              >
                Upcoming Tasks
              </CustomText>
              <DebouncedTouchableOpacity
                onPress={() => router.push("../screens/all-tasks")}
              >
                <CustomText
                  style={{
                    fontSize: FONT_SIZES.medium,
                    color: COLORS.grey,
                    fontWeight: "400",
                  }}
                >
                  See All
                </CustomText>
              </DebouncedTouchableOpacity>
            </View>
            {tasks.length > 0 ? (
              tasks.map((task: Task, index: number) => (
                <TaskCard
                  bg={
                    index % 3 === 0
                      ? COLORS.light_grey
                      : index % 3 === 1
                      ? COLORS.light_yellow
                      : COLORS.light_purple
                  }
                  key={index}
                  task={task}
                  isStoryTask={activeNode?.task_gate === task.task_title}
                  onPress={() => {
                    setSelectedTask(task);
                    setModalVisible(true);
                  }}
                  onComplete={async () => {
                    try {
                      await taskService.taskCompleted({ task_id: task.task_id });
                      refetch();
                    } catch (e) {
                      console.error("Failed to complete task:", e);
                    }
                  }}
                />
              ))
            ) : (
              <View style={styles.centered}>
                <Text>No tasks for today. Great job!</Text>
                <TouchableOpacity
                  style={styles.createTaskButton}
                  onPress={() => {
                    /* Handle create task */
                  }}
                >
                  <Text style={styles.createTaskButtonText}>
                    Create Your Own Task
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <KidTaskModal
        visible={modalVisible}
        task={selectedTask}
        onClose={() => {
          setModalVisible(false);
          setSelectedTask(null);
        }}
        onRefresh={refetch}
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cardOverlay: {
    position: "absolute",
    width: 160,
    paddingTop: 10,
    gap: 4,
    paddingLeft: 10,
  },
  completedText: {
    marginTop: 10,
    fontWeight: "600",
    fontSize: 16,
    color: COLORS.grey,
  },
  fractionText: {
    fontSize: 14,
    color: "#000",
  },
  arrow: {
    position: "absolute",
    bottom: 6,
    right: 0,
  },
  createTaskButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  createTaskButtonText: {
    color: "white",
    fontWeight: "bold",
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
});