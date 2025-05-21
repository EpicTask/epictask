import React from "react";
import HomeIcon from "@/assets/icons/tab-bar/Home";
import TaskIcon from "@/assets/icons/tab-bar/Task";
import RewardIcon from "@/assets/icons/tab-bar/Reward";
import SettingIcon from "@/assets/icons/tab-bar/Setting";
import TabBarBackground from "@/components/ui/TabBarBackground";

import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { COLORS } from "@/constants/Colors";
import { HapticTab } from "@/components/HapticTab";


export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute"
          },
          default: {},
          android: {
            position: "absolute",
            borderWidth: 1,
            borderColor: "#E9E9E9",
            backgroundColor: "white",
            height: 70,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30
          },
        }),
        tabBarItemStyle: {
          marginTop:10
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <HomeIcon stroke={color} />,
        }}
      />
      <Tabs.Screen
        name="task"
        options={{
          title: "Task",
          tabBarIcon: ({ color }) => <TaskIcon fill={color} />,
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: "Rewards",
          tabBarIcon: ({ color }) => <RewardIcon fill={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <SettingIcon fill={color} />,
        }}
      />
    </Tabs>
  );
}
