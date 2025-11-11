import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { COLORS } from "@/constants/Colors";
import { FONT_SIZES } from "@/constants/FontSize";
import CustomText from "@/components/CustomText";
import {
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import * as Progress from "react-native-progress";
import { Story, StoryProgress } from "@/api/narrativeService";

interface StoryCardProps {
  story: Story;
  progress?: StoryProgress;
  onPress: () => void;
  bg?: string;
}

export default function StoryCard({
  story,
  progress,
  onPress,
  bg = COLORS.light_purple,
}: StoryCardProps) {
  const progressPercent = progress
    ? progress.completed_node_ids.length / story.total_nodes
    : 0;
  const isCompleted = progress?.status === "completed";
  const isInProgress = progress?.status === "in_progress";

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.card, { backgroundColor: bg }]}>
        {/* Thumbnail Section */}
        <View style={styles.thumbnailContainer}>
          {story.thumbnail_url ? (
            <Image
              source={{ uri: story.thumbnail_url }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
              <Text style={styles.placeholderText}>📖</Text>
            </View>
          )}
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedBadgeText}>✓</Text>
            </View>
          )}
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          <View style={styles.header}>
            <CustomText
              variant="semiBold"
              style={styles.title}
              numberOfLines={2}
            >
              {story.title}
            </CustomText>
            {isInProgress && (
              <View style={styles.inProgressBadge}>
                <Text style={styles.inProgressText}>In Progress</Text>
              </View>
            )}
          </View>

          <CustomText style={styles.description} numberOfLines={2}>
            {story.description}
          </CustomText>

          {/* Tags */}
          <View style={styles.tagsContainer}>
            {story.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statIcon}>⏱️</Text>
              <Text style={styles.statText}>
                {story.estimated_duration_minutes} min
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statIcon}>⭐</Text>
              <Text style={styles.statText}>{story.total_xp} XP</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statIcon}>📄</Text>
              <Text style={styles.statText}>{story.total_nodes} nodes</Text>
            </View>
          </View>

          {/* Progress Bar */}
          {isInProgress && (
            <View style={styles.progressContainer}>
              <Progress.Bar
                progress={progressPercent}
                width={null}
                height={8}
                color={COLORS.primary}
                unfilledColor="#E5E7EB"
                borderWidth={0}
                borderRadius={4}
              />
              <Text style={styles.progressText}>
                {Math.round(progressPercent * 100)}% Complete
              </Text>
            </View>
          )}

          {isCompleted && (
            <View style={styles.completedContainer}>
              <Text style={styles.completedText}>
                ✨ Completed! Earned {progress?.total_xp_earned || 0} XP
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnailContainer: {
    position: "relative",
    marginRight: 12,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  placeholderThumbnail: {
    backgroundColor: COLORS.light_grey,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 32,
  },
  completedBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: COLORS.success,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  completedBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  title: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.black,
    flex: 1,
    marginRight: 8,
  },
  inProgressBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  inProgressText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  description: {
    fontSize: FONT_SIZES.small,
    color: COLORS.grey,
    marginBottom: 6,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 6,
    gap: 4,
  },
  tag: {
    backgroundColor: "rgba(255,255,255,0.5)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    color: COLORS.grey,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 6,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statIcon: {
    fontSize: 12,
  },
  statText: {
    fontSize: 11,
    color: COLORS.grey,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressText: {
    fontSize: 10,
    color: COLORS.grey,
    marginTop: 4,
    textAlign: "right",
  },
  completedContainer: {
    marginTop: 4,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    padding: 6,
    borderRadius: 8,
  },
  completedText: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: "600",
    textAlign: "center",
  },
});
