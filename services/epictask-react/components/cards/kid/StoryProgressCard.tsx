import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { COLORS } from "@/constants/Colors";
import { FONT_SIZES } from "@/constants/FontSize";
import CustomText from "@/components/CustomText";
import { responsiveWidth } from "react-native-responsive-dimensions";
import * as Progress from "react-native-progress";
import KidArrowIcon from "@/assets/icons/KidArrow";
import { ICONS } from "@/assets";

interface StoryProgressCardProps {
  inProgressCount: number;
  completedCount: number;
  totalXpEarned: number;
  onPress: () => void;
}

export default function StoryProgressCard({
  inProgressCount,
  completedCount,
  totalXpEarned,
  onPress,
}: StoryProgressCardProps) {
  const totalStories = inProgressCount + completedCount;
  const progress = totalStories > 0 ? completedCount / totalStories : 0;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={styles.container}>
        <View>{ICONS.kidCard}</View>
        <View style={styles.overlay}>
          <CustomText variant="semiBold" style={styles.title}>
            📚 Learning
          </CustomText>
          
          {totalStories > 0 ? (
            <>
              <Progress.Circle
                size={40}
                progress={progress}
                thickness={3}
                color={COLORS.primary}
                unfilledColor="#E5E7EB"
                borderWidth={0}
                showsText={true}
                formatText={() => `${Math.round(progress * 100)}%`}
                textStyle={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: COLORS.primary,
                }}
              />
              
              <View style={styles.statsContainer}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{inProgressCount}</Text>
                  <Text style={styles.statLabel}>In Progress</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{completedCount}</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
              </View>

              {totalXpEarned > 0 && (
                <View style={styles.xpContainer}>
                  <Text style={styles.xpText}>⭐ {totalXpEarned} XP earned</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Start your first lesson!</Text>
              <Text style={styles.emptyIcon}>📖</Text>
            </View>
          )}
        </View>
        <View style={styles.arrow}>
          <KidArrowIcon fill={COLORS.secondary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: responsiveWidth(44),
    height: 165,
    position: "relative",
  },
  overlay: {
    position: "absolute",
    width: 160,
    paddingTop: 10,
    gap: 6,
    paddingLeft: 10,
  },
  title: {
    fontSize: FONT_SIZES.small,
    color: COLORS.black,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  stat: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
  },
  statLabel: {
    fontSize: 9,
    color: COLORS.grey,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.grey,
    opacity: 0.3,
  },
  xpContainer: {
    marginTop: 4,
  },
  xpText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: "600",
  },
  arrow: {
    position: "absolute",
    bottom: 6,
    right: 0,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 10,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 11,
    color: COLORS.grey,
    textAlign: "center",
  },
});
