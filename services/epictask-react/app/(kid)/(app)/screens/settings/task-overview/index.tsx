import React from "react";
import ProgressCard from "@/components/cards/ProgressCard";
import CustomButton from "@/components/buttons/CustomButton";
import ScreenHeading from "@/components/headings/ScreenHeading";

import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

import { router } from "expo-router";
import { COLORS } from "@/constants/Colors";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


const TaskOverview = () => {

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeading back={true} plus={false} text="Task Overview" />
      <View style={{ gap: 10, paddingTop: 30, justifyContent: "space-between", flex: 1 }}>
        <View style={{ gap: 14, alignItems:"center" }}>
          <ProgressCard text="Completed" kid={true} completed={4} progress={0.7} total={10} color={COLORS.purple}  />
          <ProgressCard text="In Progress" kid={true} completed={2} progress={0.2} total={10} color={COLORS.grey}  />
        </View>
        <View style={{ paddingVertical: 30 }}>
          <CustomButton
            fill={true}
            onPress={() => {
              router.back();
            }}
            text="Back"
            height={responsiveHeight(8)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TaskOverview;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F6F9",
    height: responsiveHeight(100),
    width: responsiveWidth(100),
    padding: responsiveWidth(4),
  },
});
