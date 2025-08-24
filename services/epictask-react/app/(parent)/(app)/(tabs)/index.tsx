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
  TouchableOpacity,
  View,
} from "react-native";
import { Link, router } from "expo-router";
import React from "react";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={{ gap: 20 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Link href="/(parent)/(app)/screens/profile-display" asChild>
              <Pressable>
                <Image
                  source={IMAGES.profile}
                  style={{
                    height: responsiveHeight(8),
                    width: responsiveHeight(8),
                  }}
                />
              </Pressable>
            </Link>
            <View
              style={{
                padding: 14,
                backgroundColor: "white",
                borderRadius: responsiveWidth(100),
              }}
            >
              <Link href="/screens/notification-screen" asChild>
                <Pressable>{ICONS.SETTINGS.bell}</Pressable>
              </Link>
            </View>
          </View>
          <View style={{ gap: 10 }}>
            <Heading title="Tasks Overview" />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <ProgressCard
                tab={true}
                progress={0.7}
                completed={7}
                total={10}
                text="Completed"
                color={COLORS.purple}
              />
              <ProgressCard
                tab={true}
                progress={0.2}
                completed={2}
                text="In Progress"
                total={10}
                color={COLORS.grey}
              />
            </View>
          </View>
          <View style={{ gap: 10 }}>
            <Heading title="Kids Profiles" icon={<HomeIcon fill="black" />} />
            <View style={{ flexDirection: "row", gap: 10, flex: 1 }}>
              <KidsCard
                name="Wisteria"
                level={1}
                stars={55}
                completed={9}
                pending={2}
              />
              <KidsCard
                name="Wisteria"
                level={1}
                stars={55}
                completed={9}
                pending={2}
              />
            </View>
          </View>
          <View style={{ gap: 10, paddingVertical: 20 }}>
            <Heading
              title="Recent tasks"
              icon={
                <Link href="/screens/manage-tasks/assign-task" asChild>
                  <Pressable>
                    <HomeIcon fill="black" />
                  </Pressable>
                </Link>
              }
            />

            <View style={{ flexDirection: "row", gap: 10 }}></View>
            {Array(3)
              .fill(0)
              .map((_, index) => (
                <TaskCard
                  key={index}
                  name="Prepare your breakfast"
                  stars={55}
                />
              ))}
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
});
