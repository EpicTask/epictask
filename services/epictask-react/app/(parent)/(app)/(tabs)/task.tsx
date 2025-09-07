import React from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";

import Search from "@/components/search/Search";
import TaskCard from "@/components/cards/TaskCard";
import ProgressCard from "@/components/cards/ProgressCard";
import ScreenHeading from "@/components/headings/ScreenHeading";
import { COLORS } from "@/constants/Colors";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import apiClient from "@/api/apiClient";
import MicroserviceUrls from "@/constants/Microservices";

const fetchTasks = async () => {
  const { data } = await apiClient.get(
    `${MicroserviceUrls.taskManagement}/tasks?user_id=parent_user_id`
  ); // Replace with actual user_id
  if (Array.isArray(data)) {
    return data;
  }
  if (data && Array.isArray(data.tasks)) {
    return data.tasks;
  }
  // Return an empty array if the response is not in the expected format.
  return [];
};

const ManageTasks = () => {
  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
  });

  if (isLoading) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  if (isError) {
    return <Text style={styles.centered}>Error: {error.message}</Text>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ marginBottom: 50 }}
      >
        <View style={{ paddingVertical: 4 }}>
          <ScreenHeading
            back={false}
            plus={true}
            plusPress={() => {
              router.push("/screens/manage-tasks/assign-task" as any);
            }}
            text="Manage Tasks"
          />
        </View>
        <View style={{ gap: 14 }}>
          <View>
            <Search />
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
                color={COLORS.purple}
                row={true}
                completed={
                  tasks.filter((task) => task.status === "completed").length
                }
                progress={
                  tasks.length > 0
                    ? tasks.filter((task) => task.status === "completed")
                        .length / tasks.length
                    : 0
                }
                total={tasks.length}
              />
              <ProgressCard
                text="In Progress"
                color={COLORS.grey}
                row={true}
                completed={
                  tasks.filter((task) => task.status === "in_progress").length
                }
                progress={
                  tasks.length > 0
                    ? tasks.filter((task) => task.status === "in_progress")
                        .length / tasks.length
                    : 0
                }
                total={tasks.length}
              />
            </View>
            <View style={{ flexDirection: "row" }}>
              <ProgressCard
                text="Overdue"
                color={"#AB0A0A"}
                row={true}
                completed={
                  tasks.filter((task) => task.status === "overdue").length
                }
                progress={
                  tasks.length > 0
                    ? tasks.filter((task) => task.status === "overdue").length /
                      tasks.length
                    : 0
                }
                total={tasks.length}
              />
            </View>
          </View>
        </View>
        <View style={{ gap: 10, flex: 1, paddingVertical: 10 }}>
          {tasks.map((task, index) => (
            <TaskCard
              key={index}
              name={task.task_title}
              stars={task.reward_amount}
            />
          ))}
        </View>
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
