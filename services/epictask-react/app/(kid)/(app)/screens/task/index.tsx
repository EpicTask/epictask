import { FlatList, StyleSheet, View } from "react-native";
import React from "react";
import ScreenHeading from "@/components/headings/ScreenHeading";

import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { SafeAreaView } from "react-native-safe-area-context";
import TaskCard from "@/components/cards/kid/TaskCard";
import { COLORS } from "@/constants/Colors";

const TaskScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeading text="Task" back={true} plus={false} />
      <View>
        <FlatList
          style={{ gap: 4 }}
          data={[...new Array(14)]}
          showsVerticalScrollIndicator={false}
          renderItem={() => {
            return (
              <View style={{ padding: 4, flex: 1 }}>
                <TaskCard
                  name="Prepare for you breakfast"
                  stars={20}
                  bg={COLORS.light_yellow}
                />
              </View>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default TaskScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F6F9",
    height: responsiveHeight(100),
    width: responsiveWidth(100),
    padding: responsiveWidth(4),
  },
});
