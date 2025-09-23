import { ScrollView, StyleSheet, Text, View, ActivityIndicator, FlatList } from "react-native";
import React, { useState, useEffect, useMemo } from "react";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { SafeAreaView } from "react-native-safe-area-context";
import Search from "@/components/search/Search";
import ProgressCard from "@/components/cards/ProgressCard";
import { COLORS } from "@/constants/Colors";
import TaskCard from "@/components/cards/TaskCard";
import PlusButton from "@/components/PlusButton";
import { router } from "expo-router";
import CustomText from "@/components/CustomText";
import { useAuth } from "@/context/AuthContext";
import { firestoreService } from "@/api/firestoreService";
import { TaskActionModal } from "@/components/modals/TaskActionModal";
import { Task } from "@/constants/Interfaces";


const ManageTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Fetch family tasks (all tasks for children)
  useEffect(() => {
    console.log("Fetching family tasks...");
    const fetchTasks = async () => {
      console.log("User ID:", user?.uid);
      if (user?.uid) {
        try {
          setLoading(true);
          const result = await firestoreService.getTasksForFamily(user.uid);
          console.log("Fetched family tasks:", result);
          if (result.success) {
            // Flatten all tasks from all children into a single array
            const allTasks: Task[] = [];
            Object.values(result.familyTasks || {}).forEach((childData: any) => {
              if (childData.tasks) {
                allTasks.push(...childData.tasks);
              }
            });
            setTasks(allTasks);
          }
        } catch (error) {
          console.error("Failed to fetch family tasks:", error);
          setTasks([]);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user?.uid]);

  // Enhanced filter tasks based on search query
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) {
      return tasks;
    }

    const query = searchQuery.toLowerCase();
    return tasks.filter((task) => {
      const title = (task.task_title || "").toLowerCase();
      const description = (task.task_description || "").toLowerCase();
      const status = (task.status || "").toLowerCase();
      
      // Enhanced search includes title, description, and status
      return title.includes(query) || 
             description.includes(query) || 
             status.includes(query) ||
             (task.rewarded === true && "completed".includes(query)) ||
             (task.marked_completed === true && task.rewarded !== true && "pending".includes(query)) ||
             (task.marked_completed !== true && "in progress".includes(query)) ||
             (task.marked_completed === true && task.rewarded === false && "unrewarded".includes(query));
    });
  }, [tasks, searchQuery]);

  // Calculate metrics from filtered tasks with improved logic
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(task => task.rewarded === true).length;
  const pendingTasks = filteredTasks.filter(task => 
    task.marked_completed === true && task.rewarded !== true && task.rewarded !== false
  ).length;
  const inProgressTasks = filteredTasks.filter(task => 
    task.marked_completed !== true
  ).length;
  const unrewardedTasks = filteredTasks.filter(task => 
    task.marked_completed === true && task.rewarded === false
  ).length;

  // Calculate percentages for better display
  const completedPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const pendingPercentage = totalTasks > 0 ? (pendingTasks / totalTasks) * 100 : 0;
  const inProgressPercentage = totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0;
  const unrewardedPercentage = totalTasks > 0 ? (unrewardedTasks / totalTasks) * 100 : 0;

  // Handle task actions
  const handleTaskView = (task: Task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const handleTaskSave = async (updatedTask: Task) => {
    try {
      // TODO: Implement task update API call
      console.log('Updating task:', updatedTask);
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.task_id === updatedTask.task_id ? updatedTask : task
        )
      );
      
      // Refresh tasks from server
      if (user?.uid) {
        const result = await firestoreService.getTasksForFamily(user.uid);
        if (result.success) {
          const allTasks: Task[] = [];
          Object.values(result.familyTasks || {}).forEach((childData: any) => {
            if (childData.tasks) {
              allTasks.push(...childData.tasks);
            }
          });
          setTasks(allTasks);
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
      console.log('Deleting task:', taskId);
      
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
      if (user?.uid) {
        const result = await firestoreService.getTasksForFamily(user.uid);
        if (result.success) {
          const allTasks: Task[] = [];
          Object.values(result.familyTasks || {}).forEach((childData: any) => {
            if (childData.tasks) {
              allTasks.push(...childData.tasks);
            }
          });
          setTasks(allTasks);
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

  const getChildName = (task: Task) => {
    // TODO: Get actual child name from assigned_to_ids
    return "Child";
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <View style={{flexDirection:'row', alignItems:"center"}}>
          <CustomText style={{flex:1, textAlign:"center", fontSize: responsiveFontSize(3), fontWeight: 500, paddingVertical: 10}}>
            Manage Tasks
          </CustomText>
          <PlusButton onPress={() =>{router.push("/screens/parent/manage-tasks/assign-task" as any)}} />
        </View>
        <View style={{ gap: 10 }}>
          <View>
            <Search 
              placeholder="Search tasks..."
              onSearchChange={setSearchQuery}
              value={searchQuery}
            />
          </View>
          <View style={{ gap: 10 }}>
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                justifyContent: "space-between",
              }}
            >
              <ProgressCard
                text="Completed"
                color="#4CAF50"
                row={true}
                completed={completedTasks}
                progress={completedPercentage / 100}
                total={totalTasks}
              />
              <ProgressCard
                text="Pending"
                color="#FF9800"
                row={true}
                completed={pendingTasks}
                progress={pendingPercentage / 100}
                total={totalTasks}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                justifyContent: "space-between",
              }}
            >
              <ProgressCard
                text="In Progress"
                color={COLORS.purple}
                row={true}
                completed={inProgressTasks}
                progress={inProgressPercentage / 100}
                total={totalTasks}
              />
              <ProgressCard
                text="Unrewarded"
                color={COLORS.red}
                row={true}
                completed={unrewardedTasks}
                progress={unrewardedPercentage / 100}
                total={totalTasks}
              />
            </View>
          </View>
        </View>
        
        {/* Tasks Section */}
        <View style={{ flex: 1, paddingVertical: 20 }}>
          {searchQuery.trim() && (
            <View style={{ marginBottom: 15, padding: 12, backgroundColor: 'white', borderRadius: 8, borderWidth: 1, borderColor: '#EAEBEC' }}>
              <CustomText style={{ fontSize: responsiveFontSize(1.8), color: COLORS.grey, textAlign: 'center' }}>
                {filteredTasks.length} result{filteredTasks.length !== 1 ? 's' : ''} found for "{searchQuery}"
              </CustomText>
              {filteredTasks.length > 0 && (
                <CustomText style={{ fontSize: responsiveFontSize(1.6), color: COLORS.grey, textAlign: 'center', marginTop: 4 }}>
                  {unrewardedTasks > 0 && `${unrewardedTasks} unrewarded • `}
                  {pendingTasks > 0 && `${pendingTasks} pending • `}
                  {completedTasks > 0 && `${completedTasks} completed • `}
                  {inProgressTasks > 0 && `${inProgressTasks} in progress`}
                </CustomText>
              )}
            </View>
          )}
          
          {loading ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", minHeight: 200 }}>
              <ActivityIndicator size="large" color={COLORS.primary || COLORS.purple} />
              <CustomText style={{ marginTop: 10, color: COLORS.grey }}>Loading tasks...</CustomText>
            </View>
          ) : filteredTasks.length > 0 ? (
            <FlatList
              data={filteredTasks}
              keyExtractor={(item) => item.task_id || Math.random().toString()}
              renderItem={({ item }) => (
                <View style={{ marginBottom: 10 }}>
                  <TaskCard 
                    name={item.task_title || item.task_description || "Untitled Task"} 
                    stars={item.reward_amount || 0} 
                    taskData={item}
                    kidName={getChildName(item)}
                    onPress={() => handleTaskView(item)}
                    onReward={() => handleRewardTask(item.task_id)}
                  />
                </View>
              )}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", minHeight: 200 }}>
              <CustomText style={{ color: COLORS.grey, textAlign: "center", fontSize: responsiveFontSize(1.8) }}>
                {searchQuery.trim() 
                  ? `No tasks found matching "${searchQuery}"`
                  : "No tasks created yet.\nCreate your first task to get started!"
                }
              </CustomText>
            </View>
          )}
        </View>

        {/* Task Action Modal */}
        <TaskActionModal
          visible={modalVisible}
          task={selectedTask}
          kidName={selectedTask ? getChildName(selectedTask) : ""}
          onClose={closeModal}
          onSave={handleTaskSave}
          onDelete={handleTaskDelete}
          onReward={handleRewardTask}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ManageTasks;

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
});
