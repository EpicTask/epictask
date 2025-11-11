import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { COLORS } from "@/constants/Colors";
import { FONT_SIZES } from "@/constants/FontSize";
import CustomText from "@/components/CustomText";
import StoryCard from "@/components/cards/kid/StoryCard";
import ANEErrorScreen from "@/components/common/ANEErrorScreen";
import narrativeService, {
  Story,
  StoryProgress,
} from "@/api/narrativeService";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

export default function StoriesScreen() {
  const { user } = useAuth();

  // Fetch stories
  const {
    data: stories = [],
    isLoading: storiesLoading,
    isError: storiesError,
    error: storiesErrorObj,
    refetch: refetchStories,
  } = useQuery({
    queryKey: ["stories", user?.uid],
    queryFn: () => narrativeService.getStories(user?.uid),
    enabled: !!user,
  });

  // Fetch progress for all stories
  const {
    data: progressList = [],
    isLoading: progressLoading,
    refetch: refetchProgress,
  } = useQuery({
    queryKey: ["storyProgress", user?.uid],
    queryFn: () => narrativeService.getProgress(user?.uid),
    enabled: !!user,
  });

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchStories(), refetchProgress()]);
    setRefreshing(false);
  }, [refetchStories, refetchProgress]);

  // Create a map of story progress by story_id for quick lookup
  const progressMap = React.useMemo(() => {
    const map: Record<string, StoryProgress> = {};
    progressList.forEach((progress: StoryProgress) => {
      map[progress.story_id] = progress;
    });
    return map;
  }, [progressList]);

  // Categorize stories
  const inProgressStories = stories.filter(
    (story: Story) =>
      progressMap[story.id]?.status === "in_progress"
  );
  const completedStories = stories.filter(
    (story: Story) =>
      progressMap[story.id]?.status === "completed"
  );
  const newStories = stories.filter(
    (story: Story) => !progressMap[story.id]
  );

  const handleStoryPress = (story: Story) => {
    const progress = progressMap[story.id];
    if (progress) {
      // Continue story
      router.push({
        pathname: "../screens/story-viewer",
        params: {
          storyId: story.id,
          progressId: progress.id,
        },
      });
    } else {
      // Start new story
      router.push({
        pathname: "../screens/story-viewer",
        params: {
          storyId: story.id,
        },
      });
    }
  };

  const getCardColor = (index: number) => {
    const colors = [COLORS.light_purple, COLORS.light_green, COLORS.light_yellow];
    return colors[index % colors.length];
  };

  if (storiesLoading || progressLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" style={styles.centered} />
      </SafeAreaView>
    );
  }

  if (storiesError) {
    return (
      <ANEErrorScreen
        title="Stories Unavailable"
        message="We're having trouble loading your learning stories. This might be a connection issue with our story service."
        onRetry={() => refetchStories()}
        showGoBack={false}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <CustomText variant="semiBold" style={styles.headerTitle}>
            📚 Learning Stories
          </CustomText>
          <CustomText style={styles.headerSubtitle}>
            Choose your adventure and earn rewards!
          </CustomText>
        </View>

        {/* In Progress Section */}
        {inProgressStories.length > 0 && (
          <View style={styles.section}>
            <CustomText variant="semiBold" style={styles.sectionTitle}>
              Continue Your Adventure
            </CustomText>
            {inProgressStories.map((story: Story, index: number) => (
              <StoryCard
                key={story.id}
                story={story}
                progress={progressMap[story.id]}
                onPress={() => handleStoryPress(story)}
                bg={getCardColor(index)}
              />
            ))}
          </View>
        )}

        {/* New Stories Section */}
        {newStories.length > 0 && (
          <View style={styles.section}>
            <CustomText variant="semiBold" style={styles.sectionTitle}>
              New Adventures
            </CustomText>
            {newStories.map((story: Story, index: number) => (
              <StoryCard
                key={story.id}
                story={story}
                onPress={() => handleStoryPress(story)}
                bg={getCardColor(index)}
              />
            ))}
          </View>
        )}

        {/* Completed Section */}
        {completedStories.length > 0 && (
          <View style={styles.section}>
            <CustomText variant="semiBold" style={styles.sectionTitle}>
              Completed ✨
            </CustomText>
            {completedStories.map((story: Story, index: number) => (
              <StoryCard
                key={story.id}
                story={story}
                progress={progressMap[story.id]}
                onPress={() => handleStoryPress(story)}
                bg={getCardColor(index)}
              />
            ))}
          </View>
        )}

        {/* Empty State */}
        {stories.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📚</Text>
            <CustomText variant="semiBold" style={styles.emptyStateTitle}>
              No Stories Yet
            </CustomText>
            <Text style={styles.emptyStateText}>
              New learning adventures will appear here soon!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: responsiveWidth(4),
  },
  container: {
    flex: 1,
    marginBottom: 70,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: FONT_SIZES.display,
    color: COLORS.black,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.grey,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.subtitle,
    color: COLORS.black,
    marginBottom: 12,
  },
  errorText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.grey,
    textAlign: "center",
  },
  retryText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.primary,
    marginTop: 10,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: FONT_SIZES.title,
    color: COLORS.black,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.grey,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
