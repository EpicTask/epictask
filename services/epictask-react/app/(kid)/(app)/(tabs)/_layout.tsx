import React from "react";
import HomeIcon from "@/assets/icons/tab-bar/Home";
import TaskIcon from "@/assets/icons/tab-bar/Task";
import RewardIcon from "@/assets/icons/tab-bar/Reward";
import TabBarBackground from "@/components/ui/TabBarBackground";

import { Tabs } from "expo-router";
import { Image, Platform } from "react-native";
import { COLORS } from "@/constants/Colors";
import { HapticTab } from "@/components/HapticTab";
import { IMAGES } from "@/assets";
import { responsiveWidth } from "react-native-responsive-dimensions";
import ExploreIcon from "@/assets/icons/tab-bar/Explore";

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
            position: "absolute",
          },
          default: {},
          android: {
            position: "absolute",
            borderWidth: 1,
            borderColor: "#E9E9E9",
            backgroundColor: "white",
            height: 70,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
          },
        }),
        tabBarItemStyle: {
          marginTop: 10,
        },
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
        name="rewards"
        options={{
          title: "Rewards",
          tabBarIcon: ({ color }) => <RewardIcon fill={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => <ExploreIcon stroke={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: () => (
            <Image
              source={IMAGES.profile}
              style={{ height: responsiveWidth(8), width: responsiveWidth(8) }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
