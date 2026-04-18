import { FONT_SIZES } from "@/constants/FontSize";
import React, { useState, useCallback } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { KidTaskModal } from "@/components/modals/KidTaskModal";
import TaskCard from "@/components/cards/kid/TaskCard";
import CustomText from "@/components/CustomText";
import { COLORS } from "@/constants/Colors";
import { responsiveWidth } from "react-native-responsive-dimensions";
import taskService from "@/api/taskService";
import MicroserviceUrls from "@/constants/Microservices";
import { Task } from "@/constants/Interfaces";
import { firestoreService } from "@/api/firestoreService";

const fetchTasks = async (userId: string) => {
  const data = await firestoreService.getTasksForUser(userId);
  if (Array.isArray(data)) {
    return data;
  }
  if (data && Array.isArray(data.tasks)) {
    return data.tasks;
  }
  return [];
};

export default function AllTasksScreen() {
  const { user } = useAuth();
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

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  if (isLoading) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  if (isError) {
    return <Text style={styles.centered}>Error: {error.message}</Text>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={COLORS.primary} />
          </TouchableOpacity>
          <CustomText variant="semiBold" style={styles.title}>
            All My Tasks
          </CustomText>
        </View>
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <TaskCard
              bg={
                index % 3 === 0
                  ? COLORS.light_grey
                  : index % 3 === 1
                  ? COLORS.light_yellow
                  : COLORS.light_purple
              }
              task={item}
              onPress={() => {
                setSelectedTask(item);
                setModalVisible(true);
              }}
              onComplete={async () => {
                try {
                  await taskService.taskCompleted({ task_id: item.task_id });
                  refetch();
                } catch (e) {
                  console.error("Failed to complete task:", e);
                }
              }}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.centered}>You have no tasks!</Text>
          }
        />
      </View>

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
    backgroundColor: "#F1F6F9",
  },
  container: {
    flex: 1,
    padding: responsiveWidth(4),
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    marginTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    fontSize: FONT_SIZES.title,
  },
});
