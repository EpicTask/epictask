import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { ICONS, IMAGES } from "@/assets";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import ProgressCard from "@/components/cards/ProgressCard";
import { COLORS } from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, Link } from "expo-router";
import TaskCard from "@/components/cards/TaskCard";
import CustomText from "@/components/CustomText";
import { firestoreService } from "@/api/firestoreService";
import HomeIcon from "@/assets/icons/Home";

// Task interface
interface Task {
  id: string;
  title?: string;
  name?: string;
  reward?: number;
  rewardAmount?: number;
  taskId?: string;
  assignedTo?: string;
  status?: string;
  description?: string;
}

const KidProfile = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Extract kid data from parameters with fallbacks
  const kidName = params.name as string || "Unknown";
  const kidLevel = parseInt(params.level as string) || 1;
  const kidStars = parseInt(params.stars as string) || 0;
  const kidCompleted = parseInt(params.completed as string) || 0;
  const kidPending = parseInt(params.pending as string) || 0;
  const kidUid = params.uid as string;
  
  // State for tasks
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Calculate total tasks and progress
  const totalTasks = kidCompleted + kidPending;
  const completedProgress = totalTasks > 0 ? kidCompleted / totalTasks : 0;
  const pendingProgress = totalTasks > 0 ? kidPending / totalTasks : 0;

  // Fetch tasks for the specific kid
  useEffect(() => {
    const fetchKidTasks = async () => {
      if (kidUid) {
        try {
          setLoading(true);
          const result = await firestoreService.getTasksForUser(kidUid);
          if (result.success) {
            setTasks(result.tasks || []);
          }
        } catch (error) {
          console.error("Failed to fetch kid tasks:", error);
          setTasks([]);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchKidTasks();
  }, [kidUid]);
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ flex: 1, gap: 10, backgroundColor: COLORS.bg }}>
        <View style={{}}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 20,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                router.back();
              }}
            >
              {ICONS.back_arrow}
            </TouchableOpacity>
            <CustomText
              variant="semiBold"
              style={{
                flex: 1,
                fontSize: responsiveFontSize(3.5),
                textAlign: "center",
              }}
            >
              Kid Profile
            </CustomText>
          </View>
          <View
            style={{
              borderRadius: 20,
              paddingHorizontal: 10,
              paddingVertical: 16,
              backgroundColor: "white",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{ justifyContent: "center", alignItems: "center", gap: 4 }}
            >
              <Image
                source={IMAGES.profile}
                style={{
                  height: responsiveHeight(14),
                  width: responsiveHeight(14),
                }}
              />
              <View
                style={{
                  gap: 4,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 10,
                }}
              >
                <CustomText
                  variant="semiBold"
                  style={{ fontSize: 16, fontWeight: "500" }}
                >
                  {kidName}
                </CustomText>
                <CustomText
                  variant="medium"
                  style={{ fontSize: 14, color: COLORS.grey }}
                >
                  Level {kidLevel}
                </CustomText>
              </View>
              <View
                style={{
                  gap: 10,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    gap: responsiveWidth(4),
                  }}
                >
                  <ProgressCard
                    text={"Completed"}
                    color={COLORS.purple}
                    row={true}
                    completed={kidCompleted}
                    progress={completedProgress}
                    total={totalTasks}
                  />
                  <ProgressCard
                    text={"Pending"}
                    color={COLORS.grey}
                    row={true}
                    completed={kidPending}
                    progress={pendingProgress}
                    total={totalTasks}
                  />
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    gap: responsiveWidth(4),
                    justifyContent: "space-between",
                  }}
                >
                  <View style={styles.reward}>
                    <CustomText>Reward Points</CustomText>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Image
                        source={IMAGES.reward}
                        style={{
                          height: responsiveHeight(2),
                          width: responsiveHeight(2),
                        }}
                      />
                      <CustomText style={{}}> {kidStars}</CustomText>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flex: 1, paddingVertical: 20, gap: 10 }}>
          {/* Tasks Section Header */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <CustomText variant="semiBold" style={{ fontSize: responsiveFontSize(2.5) }}>
              {kidName}'s Tasks
            </CustomText>
            <Link href="/screens/manage-tasks/assign-task" asChild>
              <TouchableOpacity>
                <HomeIcon fill="black" />
              </TouchableOpacity>
            </Link>
          </View>
          
          {/* Tasks List */}
          {loading ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : tasks.length > 0 ? (
            <FlatList
              showsHorizontalScrollIndicator={false}
              style={{ gap: 10 }}
              data={tasks}
              horizontal
              renderItem={({ item }) => (
                <View style={{ marginHorizontal: 6, width: responsiveWidth(70), height: 180 }}>
                  <TaskCard 
                    name={item.task_title || item.tast_description || "Untitled Task"} 
                    stars={item.reward || item.rewardAmount || 0} 
                    taskData={item}
                    kidName={kidName}
                  />
                </View>
              )}
              keyExtractor={(item) => item.id || item.taskId || Math.random().toString()}
            />
          ) : (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <CustomText style={{ color: COLORS.grey, textAlign: "center" }}>
                No tasks assigned yet.{"\n"}Assign tasks to {kidName} to see them here!
              </CustomText>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default KidProfile;

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
  },
  reward: {
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "white",
    borderColor: "#EAEBEC",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
