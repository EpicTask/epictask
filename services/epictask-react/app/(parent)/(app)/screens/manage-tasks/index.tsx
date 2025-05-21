import { ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
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

const ManageTasks = () => {
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
                completed={4}
                progress={0.8}
                total={10}
              />
              <ProgressCard
                color={COLORS.purple}
                row={true}
                completed={4}
                progress={0.8}
                total={10}
              />
            </View>
            <View style={{ flexDirection: "row" }}>
              <ProgressCard
                color={COLORS.purple}
                row={true}
                completed={4}
                progress={0.8}
                total={10}
              />
            </View>
          </View>
        </View>
        <View style={{ gap: 10, flex: 1, paddingVertical: 10 }}>
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
