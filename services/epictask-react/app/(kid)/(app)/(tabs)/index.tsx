import { FONT_SIZES } from "@/constants/FontSize";
import React, { useState, useCallback } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Query, useQuery } from "@tanstack/react-query";
import { router, Link } from "expo-router";
import { KidTaskModal } from "@/components/modals/KidTaskModal";
import * as Progress from "react-native-progress";
import { useAuth } from "@/context/AuthContext";

import TaskCard from "@/components/cards/kid/TaskCard";
import Heading from "@/components/headings/Heading";
import CustomText from "@/components/CustomText";
import { ICONS, IMAGES } from "@/assets";
import { COLORS } from "@/constants/Colors";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import taskService from "@/api/taskService";
import { Task } from "@/constants/Interfaces";
import DebouncedTouchableOpacity from "@/components/buttons/DebouncedTouchableOpacity";
import StoryProgressCard from "@/components/cards/kid/StoryProgressCard";
import ActiveStoryCard from "@/components/cards/kid/ActiveStoryCard";
import narrativeService, { StoryProgress } from "@/api/narrativeService";

import {
  tasksQuery,
  progressQuery,
  notificationsQuery,
} from "@/api/homeQueries";
import { useScreenRefresh } from "@/hooks/useScreenRefresh";
import { QuerySection } from "@/components/common/QuerySection";

export default function HomeScreen() {
  const { user, effectiveUserId } = useAuth();
  return <KidHomeScreen key={`${user?.uid}:${effectiveUserId}`} />;
}

function KidHomeScreen() {
  const { user, effectiveUserId } = useAuth();
  const uid = effectiveUserId || "";
  const accountId = user?.uid || "";
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const taskResult = useQuery(tasksQuery(uid));
  const storyResult = useQuery(progressQuery(uid));
  const notifications = useQuery(notificationsQuery(accountId));
  const tasks = taskResult.data || [];
  const storyProgress = storyResult.data || [];
  const unreadNotifications = notifications.data || 0;
  const matchesScreen = useCallback(
    ({ queryKey: key }: Query) =>
      (!!uid &&
        key[1] === uid &&
        ["allTasks", "storyProgress", "activeStoryNode"].includes(
          String(key[0]),
        )) ||
      (!!accountId && key[0] === "notifications" && key[1] === accountId),
    [uid, accountId],
  );
  const { refreshing, onRefresh } = useScreenRefresh(matchesScreen);

  // Derive activeProgress before any early returns so hooks stay stable
  const activeProgress = storyProgress.find(
    (p: StoryProgress) => p.status === "in_progress",
  );

  // Fetch active node to check for task gates — must be above early returns
  const { data: activeNode = null } = useQuery({
    queryKey: [
      "activeStoryNode",
      effectiveUserId,
      activeProgress?.story_id,
      activeProgress?.current_node,
    ],
    queryFn: () =>
      activeProgress
        ? narrativeService.getNode(
            activeProgress.story_id,
            activeProgress.current_node,
          )
        : null,
    enabled: !!activeProgress,
    staleTime: 60_000,
  });

  const completedTasks = tasks.filter(
    (task: Task) => task.status === "completed",
  ).length;
  const progress = tasks.length > 0 ? completedTasks / tasks.length : 0;

  // Calculate story stats
  const inProgressStories = storyProgress.filter(
    (p: StoryProgress) => p.status === "in_progress",
  ).length;
  const completedStories = storyProgress.filter(
    (p: StoryProgress) => p.status === "completed",
  ).length;
  const totalStoryXp = storyProgress.reduce(
    (sum: number, p: StoryProgress) => sum + p.total_xp,
    0,
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
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <View style={{ flex: 1, gap: 10 }}>
              <Image
                source={
                  user?.imageUrl ? { uri: user.imageUrl } : IMAGES.profile
                }
                style={styles.profileImage}
              />
              <View>
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
            </View>
            <View>
              <Link href="../screens/notification-screen" asChild>
                <TouchableOpacity>
                  <View
                    style={{
                      padding: 14,
                      backgroundColor: "white",
                      borderRadius: responsiveWidth(100),
                      position: "relative",
                    }}
                  >
                    {ICONS.SETTINGS.bell}
                    {unreadNotifications > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                          {unreadNotifications > 9 ? "9+" : unreadNotifications}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          {notifications.isError && (
            <QuerySection query={notifications} label="notifications" />
          )}
          {/* Progress Cards */}
          <View style={{ paddingVertical: 10 }}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {/* Tasks Progress */}
              <View style={{ width: responsiveWidth(44) }}>
                <QuerySection
                  query={taskResult}
                  label="task progress"
                  height={165}
                >
                  <View style={{ width: responsiveWidth(44), height: 165 }}>
                    <View>{ICONS.kidCard}</View>
                    <View style={styles.cardOverlay}>
                      <CustomText
                        variant="semiBold"
                        style={styles.progressTitle}
                      >
                        ✅ Today&apos;s Tasks
                      </CustomText>
                      <View style={styles.progressSummaryRow}>
                        <Progress.Circle
                          size={48}
                          progress={progress}
                          thickness={3}
                          color={COLORS.purple}
                          unfilledColor="#E5E7EB"
                          borderWidth={0}
                          showsText={true}
                          formatText={() => `${Math.round(progress * 100)}%`}
                          textStyle={styles.progressPercent}
                        />
                        <View style={styles.progressSummaryText}>
                          <CustomText
                            variant="semiBold"
                            style={styles.progressStatus}
                          >
                            {tasks.length > 0 && completedTasks === tasks.length
                              ? "All done!"
                              : "Keep going!"}
                          </CustomText>
                          <Text style={styles.progressDetail}>
                            {tasks.length > 0 && completedTasks === tasks.length
                              ? "Ready for a new challenge"
                              : `${completedTasks} of ${tasks.length} complete`}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.arrow}
                      onPress={() => router.push("../screens/all-tasks")}
                    >
                      {ICONS.kidArrow}
                    </TouchableOpacity>
                  </View>
                </QuerySection>
              </View>
              {/* Story Progress */}
              <View style={{ flex: 1 }}>
                <QuerySection
                  query={storyResult}
                  label="story progress"
                  height={165}
                >
                  <StoryProgressCard
                    inProgressCount={inProgressStories}
                    completedCount={completedStories}
                    totalXpEarned={totalStoryXp}
                    onPress={() => router.push("./stories")}
                  />
                </QuerySection>
              </View>
            </View>
          </View>

          {/* Active Story / Adventure Section */}
          <View style={{ paddingVertical: 5 }}>
            <Heading title="Your Lesson" />
            <QuerySection query={storyResult} label="your lesson">
              <ActiveStoryCard
                title={
                  activeProgress?.story_id === "broken-toy-5-7"
                    ? "The Broken Toy"
                    : activeProgress?.story_id === "cookie-jar-5-7"
                    ? "The Cookie Jar"
                    : activeProgress
                    ? "Current Lesson"
                    : "Start a New Lesson!"
                }
                progress={
                  activeProgress ? activeProgress.completed_nodes.length / 3 : 0
                } // Assuming 3 nodes for seeded stories
                isNew={!activeProgress}
                onPress={() => {
                  if (activeProgress) {
                    router.push({
                      pathname: "../screens/story",
                      params: { storyId: activeProgress.story_id },
                    });
                  } else {
                    router.push("./stories");
                  }
                }}
              />
            </QuerySection>
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
            <QuerySection
              query={taskResult}
              label="upcoming tasks"
              height={180}
            >
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
                    key={task.task_id}
                    task={task}
                    isStoryTask={activeNode?.task_gate === task.task_title}
                    onPress={() => {
                      setSelectedTask(task);
                      setModalVisible(true);
                    }}
                    onComplete={async () => {
                      try {
                        await taskService.taskCompleted({
                          task_id: task.task_id,
                          completed_by_id: effectiveUserId || user?.uid || "",
                        });
                      } catch (e) {
                        console.log("Failed to complete task:", e);
                      }
                    }}
                  />
                ))
              ) : (
                <View style={styles.centered}>
                  <Text>No tasks for today. Great job!</Text>
                </View>
              )}
            </QuerySection>
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
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  profileImage: {
    height: responsiveHeight(8),
    width: responsiveHeight(8),
    borderRadius: responsiveHeight(4),
  },
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
    width: 155,
    paddingTop: 10,
    paddingLeft: 10,
  },
  progressTitle: {
    fontSize: 12,
    color: COLORS.black,
  },
  progressSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.purple,
  },
  progressSummaryText: {
    flex: 1,
    gap: 2,
  },
  progressStatus: {
    fontSize: 12,
    color: COLORS.black,
  },
  progressDetail: {
    fontSize: 9,
    color: COLORS.grey,
  },
  arrow: {
    position: "absolute",
    bottom: 6,
    right: 0,
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
});
