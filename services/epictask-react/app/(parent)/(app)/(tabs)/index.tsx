import HomeIcon from "@/assets/icons/Home";
import KidsCard from "@/components/cards/KidsCard";
import TaskCard from "@/components/cards/TaskCard";
import Heading from "@/components/headings/Heading";
import ProgressCard from "@/components/cards/ProgressCard";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
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
} from "react-native";
import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import taskService from "@/api/taskService";
import authService from "@/api/authService";

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
}

interface Kid {
  uid: string;
  displayName: string;
  level?: number;
  tokens_earned?: number;
  tasks_completed?: number;
  tasks_pending?: number;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [taskSummary, setTaskSummary] = useState<TaskSummary>({ completed: 0, in_progress: 0, total: 0 });
  const [recentTasks, setRecentTasks] = useState<RecentTask[]>([]);
  const [kids, setKids] = useState<Kid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          setLoading(true);
          const summary = await taskService.getTaskSummary(user.uid);
          setTaskSummary(summary);

          const tasks = await taskService.getRecentTasks(user.uid);
          setRecentTasks(tasks);

          const linkedKids = await authService.getLinkedChildren(user.uid);
          setKids(linkedKids.children || []);
        } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={{ gap: 20 }}>
          {/* Header */}
          <View style={styles.header}>
            <Link href="/(parent)/(app)/screens/profile-display" asChild>
              <Pressable>
                <Image
                  source={user?.photoURL ? { uri: user.photoURL } : IMAGES.profile}
                  style={styles.profileImage}
                />
              </Pressable>
            </Link>
            <View style={styles.notificationIcon}>
              <Link href="/screens/notification-screen" asChild>
                <Pressable>{ICONS.SETTINGS.bell}</Pressable>
              </Link>
            </View>
          </View>

          {/* Tasks Overview */}
          <View style={{ gap: 10 }}>
            <Heading title="Tasks Overview" />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <ProgressCard
                tab={true}
                progress={taskSummary.total > 0 ? taskSummary.completed / taskSummary.total : 0}
                completed={taskSummary.completed}
                total={taskSummary.total}
                text="Completed"
                color={COLORS.purple}
              />
              <ProgressCard
                tab={true}
                progress={taskSummary.total > 0 ? taskSummary.in_progress / taskSummary.total : 0}
                completed={taskSummary.in_progress}
                text="In Progress"
                total={taskSummary.total}
                color={COLORS.grey}
              />
            </View>
          </View>

          {/* Kids Profiles */}
          <View style={{ gap: 10 }}>
            <Heading title="Kids Profiles" icon={<HomeIcon fill="black" />} />
            {kids.length > 0 ? (
              <View style={{ flexDirection: "row", gap: 10, flex: 1 }}>
                {kids.map((kid) => (
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
            ) : (
              <Text>No kids linked yet. Link your first child to get started!</Text>
            )}
          </View>

          {/* Recent Tasks */}
          <View style={{ gap: 10, paddingVertical: 20 }}>
            <Heading
              title="Recent tasks"
              icon={
            <Link href="/screens/manage-tasks/assign-task" asChild>
              <TouchableOpacity>
                <HomeIcon fill="black" />
              </TouchableOpacity>
            </Link>
              }
            />
            {recentTasks.length > 0 ? (
              recentTasks.map((task) => (
                <TaskCard
                  key={task.task_id}
                  name={task.task_title}
                  stars={task.reward_amount}
                />
              ))
            ) : (
              <Text>No recent activity. Create tasks to see them here!</Text>
            )}
          </View>
        </View>
      </ScrollView>
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
  },
});
