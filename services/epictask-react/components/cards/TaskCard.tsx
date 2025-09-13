import React from "react";
import CustomText from "../CustomText";
import CustomButton from "../buttons/CustomButton";

import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

import { ICONS, IMAGES } from "@/assets";
import { COLORS } from "@/constants/Colors";
import { View, Image, StyleSheet } from "react-native";
import { router } from "expo-router";


interface TaskCardProps {
  name: string;
  stars: number;
  taskData?: any;
  kidName?: string;
  onPress?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ name, stars, taskData, kidName, onPress }) => {
  return (
    <View style={styles.card}>
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <CustomText variant="semiBold" style={styles.name}>{name}</CustomText>
          </View>
          <View style={styles.levelContainer}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
              <Image
                source={IMAGES.reward}
                style={{
                  height: responsiveHeight(2),
                  width: responsiveHeight(2),
                }}
              />
              <CustomText variant="medium" style={styles.starsText}>{stars}</CustomText>
            </View>
          </View>
        </View>
        <View style={styles.statsContainer}>
          <View style={{ flexDirection: "row", gap: 2, alignItems: "center" }}>
            <Image source={IMAGES.bhalu} style={{ width: 20, height: 20 }} />
            <CustomText variant="medium" style={styles.statText}>{kidName}</CustomText>
            <View
              style={{
                width: 4,
                height: 4,
                backgroundColor: COLORS.grey,
                marginHorizontal: 6,
                borderRadius: responsiveWidth(100),
              }}
            />
            <CustomText variant="medium" style={styles.statText}>{new Date(taskData.expiration_date).toDateString()}</CustomText>
          </View>
          <View style={styles.statRow}>
            {ICONS.progress}
            {taskData.rewarded ? (
              <CustomText variant="semiBold" style={[styles.statText, { color: COLORS.green }]}>
                Completed
              </CustomText>
            ):  (
            <CustomText variant="medium" style={[styles.statText, { color: "black" }]}>
              In Progress
            </CustomText>
            )}
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            width: "100%",
            justifyContent: "space-between",
            borderTopColor: "#00000010",
            borderTopWidth: 1,
            paddingTop: 10,
          }}
        >
          <View style={{ flex: 1 }}>
            <CustomButton
              onPress={onPress!}
              text="MODIFY"
              fill={false}
            />
          </View>
          <View style={{ flex: 1 }}>
            <CustomButton
              onPress={() => {
                router.push("/screens/task" as any);
              }}
              text="VIEW"
              fill={true}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    overflow: "hidden",
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flex: 1,
  },
  avatar: {
    width: responsiveHeight(6),
    height: responsiveHeight(6),
    borderRadius: 30,
    marginBottom: 5,
  },
  name: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },
  levelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 10,
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 20,
    borderColor: "#00000010",
  },
  levelText: {
    fontSize: 14,
    color: "#6B7280",
    marginRight: 5,
  },
  starsText: {
    fontSize: 12,
    color: "#6B7280",
  },
  statsContainer: {
    alignItems: "flex-start",
    gap: 6,
    width: "100%",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    gap: 10,
  },
  icon: {
    fontSize: 16,
    marginRight: 5,
  },
  statText: {
    fontSize: 11,
    color: "#6B7280",
  },
});

export default TaskCard;
