import { FONT_SIZES } from "@/constants/FontSize";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import TaskCard from "@/components/cards/kid/TaskCard";
import CustomText from "@/components/CustomText";
import { COLORS } from "@/constants/Colors";
import { responsiveWidth } from "react-native-responsive-dimensions";
import userApiClient from "@/api/userService";
import MicroserviceUrls from "@/constants/Microservices";
import { Task } from "@/constants/Interfaces";

const fetchTasks = async (userId: string) => {
  const { data } = await userApiClient.get(
    `${MicroserviceUrls.taskManagement}/tasks?user_id=${userId}`
  );
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
  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["allTasks", user?.uid],
    queryFn: () => fetchTasks(user?.uid),
    enabled: !!user,
  });

  if (isLoading) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  if (isError) {
    return <Text style={styles.centered}>Error: {error.message}</Text>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <CustomText variant="semiBold" style={styles.title}>
          All My Tasks
        </CustomText>
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <TaskCard
              bg={
                index % 3 === 0
                  ? COLORS.light_purple
                  : index % 3 === 1
                  ? COLORS.light_green
                  : COLORS.light_yellow
              }
              task={item}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.centered}>You have no tasks!</Text>
          }
        />
      </View>
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
  title: {
    fontSize: FONT_SIZES.title,
    marginBottom: 20,
  },
});
