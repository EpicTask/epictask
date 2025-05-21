import React from "react";
import Search from "@/components/search/Search";
import TaskCard from "@/components/cards/TaskCard";
import ProgressCard from "@/components/cards/ProgressCard";
import ScreenHeading from "@/components/headings/ScreenHeading";

import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

import { router } from "expo-router";
import { COLORS } from "@/constants/Colors";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ManageTasks = () => {
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
                completed={7}
                progress={0.7}
                total={10}
              />
              <ProgressCard
                text="In Progress"
                color={COLORS.grey}
                row={true}
                completed={2}
                progress={0.2}
                total={10}
              />
            </View>
            <View style={{ flexDirection: "row" }}>
              <ProgressCard
                text="Overdue"
                color={"#AB0A0A"}
                row={true}
                completed={5}
                progress={0.5}
                total={10}
              />
            </View>
          </View>
        </View>
        <View style={{ gap: 10, flex: 1, paddingVertical: 10 }}>
          <TaskCard name="Prepare your breakfast" stars={55} />
          <TaskCard name="Prepare your breakfast" stars={55} />
          <TaskCard name="Prepare your breakfast" stars={55} />
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
  container: {
    flex: 1,
  },
});
