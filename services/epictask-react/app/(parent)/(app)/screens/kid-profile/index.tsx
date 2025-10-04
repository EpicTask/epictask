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
import PlusButton from "@/components/PlusButton";
import { TaskActionModal } from "@/components/modals/TaskActionModal";
import { Task } from "@/constants/Interfaces";


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
  
  // State for tasks and modal
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Calculate real-time metrics from actual task data
  // Completed: Tasks that have been rewarded
  // Pending: Tasks that have been marked complete but not yet rewarded
  const completedTasks = tasks.filter(task => 
    task.rewarded === true
  ).length;
  const pendingTasks = tasks.filter(task => 
    task.marked_completed === true && task.rewarded !== true
  ).length;
  const totalTasks = tasks.length;
  const totalRewardPoints = tasks
    .filter(task => task.rewarded === true)
    .reduce((sum, task) => sum + (task.reward_amount || task.reward || 0), 0);
  
  // Calculate progress percentages
  const completedProgress = totalTasks > 0 ? completedTasks / totalTasks : 0;
  const pendingProgress = totalTasks > 0 ? pendingTasks / totalTasks : 0;

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

  // Handle task actions
  const handleTaskView = (task: Task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const handleTaskSave = async (updatedTask: Task) => {
    try {
      // TODO: Implement task update API call
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.task_id === updatedTask.task_id ? updatedTask : task
        )
      );
      
      // Refresh tasks from server
      if (kidUid) {
        const result = await firestoreService.getTasksForUser(kidUid);
        if (result.success) {
          setTasks(result.tasks || []);
        }
      }
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      // TODO: Implement task delete API call
      
      // Update local state
      setTasks(prevTasks => prevTasks.filter(task => task.task_id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleRewardTask = async (taskId: string) => {
    try {
      await firestoreService.rewardTask(taskId);
      // Refresh tasks from server
      if (kidUid) {
        const result = await firestoreService.getTasksForUser(kidUid);
        if (result.success) {
          setTasks(result.tasks || []);
        }
      }
      closeModal();
    } catch (error) {
      console.error('Error rewarding task:', error);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedTask(null);
  };
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
              {kidName} Profile
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
                    completed={completedTasks}
                    progress={completedProgress}
                    total={totalTasks}
                  />
                  <ProgressCard
                    text={"Pending"}
                    color={COLORS.grey}
                    row={true}
                    completed={pendingTasks}
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
                      <CustomText style={{}}> {totalRewardPoints}</CustomText>
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
            <PlusButton onPress={() =>{router.push("/screens/manage-tasks/assign-task" as any)}} />
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
                    name={item.task_title || item.task_description || "Untitled Task"} 
                    stars={item.reward_amount || 0} 
                    taskData={item}
                    kidName={kidName}
                    onPress={() => handleTaskView(item)}
                    onReward={() => handleRewardTask(item.task_id)}
                  />
                </View>
              )}
              keyExtractor={(item) => item.task_id || Math.random().toString()}
            />
          ) : (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <CustomText style={{ color: COLORS.grey, textAlign: "center" }}>
                No tasks assigned yet.{"\n"}Assign tasks to {kidName} to see them here!
              </CustomText>
            </View>
          )}
        </View>

        {/* Task Action Modal */}
        <TaskActionModal
          visible={modalVisible}
          task={selectedTask}
          kidName={kidName}
          onClose={closeModal}
          onSave={handleTaskSave}
          onDelete={handleTaskDelete}
          onReward={handleRewardTask}
        />
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
