import React from "react";
import CustomButton from "../../buttons/CustomButton";

import { IMAGES } from "@/assets";
import { Fontisto, Ionicons } from "@expo/vector-icons";
import { View, Text, Image, StyleSheet } from "react-native";
import { responsiveHeight } from "react-native-responsive-dimensions";
import CustomText from "@/components/CustomText";

import { Task } from "@/constants/Interfaces";
import { COLORS } from "@/constants/Colors";

interface KidsCardProps {
  task: Task;
  onPress?: () => void;
  onComplete?: () => void;
  bg?: string;
  isStoryTask?: boolean;
}

const TaskCard: React.FC<KidsCardProps> = ({ task, onPress, onComplete, bg, isStoryTask }) => {
  const { task_title, reward_amount, expiration_date, notes } = task || {};
  const accentColor = bg || COLORS.primary;
  return (
    <View style={styles.card}>
      <View style={[styles.accent, { backgroundColor: accentColor }]} />
      {isStoryTask && (
        <View style={styles.storyBadge}>
          <Ionicons name="star" size={12} color="white" />
          <Text style={styles.storyBadgeText}>STORY TASK</Text>
        </View>
      )}
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <CustomText variant="semiBold" style={styles.name}>
              {task_title}
            </CustomText>
          </View>
          <View style={[styles.levelContainer, { borderColor: accentColor }]}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={IMAGES.reward}
                style={{
                  height: responsiveHeight(2),
                  width: responsiveHeight(2),
                }}
              />
              <CustomText style={styles.starsText}> {reward_amount}</CustomText>
            </View>
          </View>
        </View>
        <View style={styles.statsContainer}>
          <View
            style={{
              flexDirection: "row",
              gap: 6,
              alignItems: "center",
            }}
          >
            <Ionicons name="calendar-outline" size={12} color={accentColor} />
            <CustomText style={styles.statText}>
              {expiration_date
                ? new Date(expiration_date*1000).toLocaleDateString()
                : "No due date"}
            </CustomText>
          </View>
          <Fontisto name="link" size={16} color={accentColor} />
        </View>
        {notes && (
          <View>
            <Text style={styles.notesTitle}>Notes from Parent:</Text>
            <Text style={styles.notesText}>{notes}</Text>
          </View>
        )}
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
            marginTop: 10,
          }}
        >
          <View style={{ flex: 1 }}>
            <CustomButton
              height={responsiveHeight(6)}
              onPress={onPress ? onPress : () => {}}
              text="VIEW"
              fill={false}
            />
          </View>
          {task && !task.marked_completed && !task.rewarded && onComplete && (
            <View style={{ flex: 1 }}>
              <CustomButton
                height={responsiveHeight(6)}
                onPress={onComplete}
                text="COMPLETE"
                fill={true}
              />
            </View>
          )}
          {task && task.marked_completed && !task.rewarded && (
            <View style={{ flex: 1 }}>
              <CustomButton
                height={responsiveHeight(6)}
                onPress={() => {}}
                text="PENDING"
                fill={true}
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    position: "relative",
    overflow: "hidden",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flex: 1,
    marginBottom: 15,
  },
  accent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
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
    gap: 10,
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
    fontSize: 14,
    color: "#6B7280",
  },
  statsContainer: {
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexDirection: "row",
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
    fontSize: 12,
    color: "#6B7280",
  },
  notesTitle: {
    fontWeight: "bold",
    marginTop: 10,
  },
  notesText: {
    color: "#6B7280",
  },
  storyBadge: {
    position: 'absolute',
    top: 0,
    right: 20,
    backgroundColor: COLORS.secondary || '#FFC107',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 10,
  },
  storyBadgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
  },
});

export default TaskCard;
