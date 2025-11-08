import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import * as Progress from "react-native-progress";

import TaskCard from "@/components/cards/kid/TaskCard";
import CustomText from "@/components/CustomText";
import KidArrowIcon from "@/assets/icons/KidArrow";
import { ICONS, IMAGES } from "@/assets";
import { COLORS } from "@/constants/Colors";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import userApiClient from "@/api/userService";
import MicroserviceUrls from "@/constants/Microservices";
import { Task } from "@/constants/Interfaces";
import DebouncedTouchableOpacity from "@/components/buttons/DebouncedTouchableOpacity";

const fetchTasks = async () => {
  const { data } = await userApiClient.get(
    `${MicroserviceUrls.taskManagement}/tasks?user_id=kid_user_id`
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

export default function HomeScreen() {
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

  const completedTasks = tasks.filter(
    (task: Task) => task.status === "completed"
  ).length;
  const progress = tasks.length > 0 ? completedTasks / tasks.length : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={{ gap: 10 }}>
          {/* Header */}
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View style={{ flex: 1 }}>
              <CustomText
                variant="semiBold"
                style={{ fontSize: responsiveFontSize(4) }}
              >
                Hello,
              </CustomText>
              <CustomText
                variant="semiBold"
                style={{ fontSize: responsiveFontSize(3.7), fontWeight: "500" }}
              >
                Kai Kai! 👋
              </CustomText>
              <CustomText style={{ paddingRight: 40, color: COLORS.grey }}>
                Ready for some fun tasks and rewards today?
              </CustomText>
            </View>
            <View>
              <View
                style={{
                  padding: 14,
                  backgroundColor: "white",
                  borderRadius: responsiveWidth(100),
                }}
              >
                {ICONS.SETTINGS.bell}
              </View>
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
                <TouchableOpacity style={styles.arrow}>
                  {ICONS.kidArrow}
                </TouchableOpacity>
              </View>

              {/* Earnings */}
              <View style={{ width: responsiveWidth(44), height: 165 }}>
                <View>{ICONS.kidCard}</View>
                <View style={[styles.cardOverlay, { gap: 20 }]}>
                  <CustomText variant="semiBold">You've Earned!</CustomText>
                  <View>
                    <Image
                      source={IMAGES.reward}
                      style={{ width: 50, height: 50 }}
                    />
                    <CustomText
                      variant="semiBold"
                      style={[styles.completedText, { fontSize: 14 }]}
                    >
                      {tasks.reduce(
                        (acc: number, task: Task) => acc + (task.reward_amount || 0),
                        0
                      )}{" "}
                      Stars!
                    </CustomText>
                  </View>
                </View>
                <TouchableOpacity style={styles.arrow}>
                  <KidArrowIcon fill={COLORS.secondary} />
                </TouchableOpacity>
              </View>
            </View>
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
                  fontSize: responsiveFontSize(2.7),
                  color: COLORS.black,
                  fontWeight: "500",
                }}
                variant="semiBold"
              >
                Upcoming Tasks
              </CustomText>
              <DebouncedTouchableOpacity
                onPress={() => router.push("/screens/task")}
              >
                <CustomText
                  style={{
                    fontSize: responsiveFontSize(2),
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
                      ? COLORS.light_purple
                      : index % 3 === 1
                      ? COLORS.light_green
                      : COLORS.light_yellow
                  }
                  key={index}
                  name={task.task_title || "Task Title"}
                  stars={task.reward_amount || 0}
                />
              ))
            ) : (
              <Text>No tasks for today. Great job!</Text>
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
});
