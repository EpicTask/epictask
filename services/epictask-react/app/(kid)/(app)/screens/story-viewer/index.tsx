import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { COLORS } from "@/constants/Colors";
import { FONT_SIZES } from "@/constants/FontSize";
import CustomText from "@/components/CustomText";
import ANEErrorScreen from "@/components/common/ANEErrorScreen";
import narrativeService, {
  Node,
  StoryProgress,
  Story,
  MoneyMoment,
} from "@/api/narrativeService";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import * as Progress from "react-native-progress";
import MoneyMomentCard from "@/components/story/MoneyMomentCard";

export default function StoryViewerScreen() {
  const { effectiveUserId } = useAuth();
  const params = useLocalSearchParams();
  const storyId = params.storyId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [currentNode, setCurrentNode] = useState<Node | null>(null);
  const [progress, setProgress] = useState<StoryProgress | null>(null);
  const [advancing, setAdvancing] = useState(false);
  const [xpAnimation, setXpAnimation] = useState<number | null>(null);
  const [activeMoneyMoment, setActiveMoneyMoment] = useState<MoneyMoment | null>(
    null
  );

  // Pending Money Moment for the current node, if one is attached and the
  // child hasn't already completed it. Null when nothing to show.
  const pendingMoneyMoment = (() => {
    const moment = currentNode?.metadata?.money_moment;
    if (!moment) return null;
    const completed = progress?.completed_money_moment_ids ?? [];
    if (completed.includes(moment.id)) return null;
    return moment;
  })();

  useEffect(() => {
    setActiveMoneyMoment(pendingMoneyMoment);
  }, [pendingMoneyMoment?.id]);

  const handleMoneyMomentComplete = async () => {
    const moment = activeMoneyMoment;
    setActiveMoneyMoment(null);
    if (!moment || !effectiveUserId) return;

    // Optimistically mark as completed so the overlay doesn't reappear if
    // the network call is slow. The backend call is idempotent.
    setProgress((prev) =>
      prev
        ? {
            ...prev,
            completed_money_moment_ids: [
              ...(prev.completed_money_moment_ids ?? []),
              moment.id,
            ],
          }
        : prev
    );

    await narrativeService.completeMoneyMoment(
      effectiveUserId,
      storyId,
      moment.id
    );
  };

  useEffect(() => {
    loadStoryData();
  }, [effectiveUserId, storyId]);

  const loadStoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load story details
      const storyData = await narrativeService.getStory(storyId);
      setStory(storyData);

      const progressList = await narrativeService.getProgress(
        effectiveUserId || "",
        storyId
      );
      const currentProgress =
        progressList.find((p) => p.status === "in_progress") ??
        progressList[0];

      if (currentProgress) {
        setProgress(currentProgress);
        const node = await narrativeService.getNode(
          storyId,
          currentProgress.current_node
        );
        setCurrentNode(node);
      } else {
        // Start new story
        const { node, progress: newProgress } =
          await narrativeService.startStory(effectiveUserId || "", storyId);
        setCurrentNode(node);
        setProgress(newProgress);
      }
    } catch (error) {
      console.error("Failed to load story:", error);
      setError("Failed to load story. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = async (
    optionId: string | undefined,
    choiceIndex: number
  ) => {
    if (!currentNode || !progress || advancing) return;

    try {
      setAdvancing(true);

      const response = await narrativeService.advanceProgress({
        user_id: effectiveUserId || "",
        story_id: storyId,
        current_node_id: currentNode.node_id,
        ...(optionId
          ? { selected_option_id: optionId }
          : { choice_index: choiceIndex }),
      });

      // Show XP animation
      if (response.xp_earned > 0) {
        setXpAnimation(response.xp_earned);
        setTimeout(() => setXpAnimation(null), 2000);
      }

      // Update progress
      setProgress(response.progress);

      if (response.story_completed) {
        // Story completed
        Alert.alert(
          "🎉 Story Complete!",
          `Congratulations! You've earned ${response.progress.total_xp} XP!`,
          [
            {
              text: "Continue",
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        // Move to next node
        setCurrentNode(response.next_node);
      }
    } catch (error) {
      console.error("Failed to advance progress:", error);
      Alert.alert("Error", "Failed to continue story. Please try again.");
    } finally {
      setAdvancing(false);
    }
  };

  const handleExit = () => {
    Alert.alert(
      "Exit Story",
      "Are you sure you want to exit? Your progress will be saved.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Exit",
          onPress: () => router.back(),
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" style={styles.centered} />
      </SafeAreaView>
    );
  }

  if (error || !story || !currentNode || !progress) {
    return (
      <ANEErrorScreen
        title="Story Load Failed"
        message={error || "We couldn't load this story. This might be a connection issue with our story service."}
        onRetry={loadStoryData}
        onGoBack={() => router.back()}
      />
    );
  }

  const progressPercent =
    progress.completed_nodes.length / story.total_nodes;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
          <Text style={styles.exitButtonText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <CustomText variant="semiBold" style={styles.storyTitle}>
            {story.title}
          </CustomText>
          <View style={styles.progressContainer}>
            <Progress.Bar
              progress={progressPercent}
              width={responsiveWidth(60)}
              height={8}
              color={COLORS.primary}
              unfilledColor="#E5E7EB"
              borderWidth={0}
              borderRadius={4}
            />
            <Text style={styles.progressText}>
              {Math.round(progressPercent * 100)}%
            </Text>
          </View>
        </View>
      </View>

      {/* XP Animation */}
      {xpAnimation && (
        <View style={styles.xpAnimation}>
          <Text style={styles.xpAnimationText}>+{xpAnimation} XP! 🌟</Text>
        </View>
      )}

      {/* Node Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.nodeContainer}>
          {/* Prompt */}
          <View style={styles.promptContainer}>
            <CustomText style={styles.prompt}>{currentNode.prompt}</CustomText>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            <CustomText variant="semiBold" style={styles.optionsTitle}>
              What will you do?
            </CustomText>
            {currentNode.options.map((option, index) => (
              <TouchableOpacity
                key={option.option_id ?? option.leads_to ?? index}
                style={[
                  styles.optionButton,
                  advancing && styles.optionButtonDisabled,
                ]}
                onPress={() => handleOptionSelect(option.option_id, index)}
                disabled={advancing}
                activeOpacity={0.7}
              >
                <View style={styles.optionNumber}>
                  <Text style={styles.optionNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.optionText}>{option.text}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Node Info */}
          {(currentNode.xp_reward ?? 0) > 0 && (
            <View style={styles.nodeInfo}>
              <Text style={styles.nodeInfoText}>
                ⭐ {currentNode.xp_reward} XP for this choice
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      {advancing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading next part...</Text>
        </View>
      )}

      {/* Money Moment Overlay */}
      {activeMoneyMoment && (
        <MoneyMomentCard
          visible
          moment={activeMoneyMoment}
          onComplete={handleMoneyMomentComplete}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  exitButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.light_grey,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  exitButtonText: {
    fontSize: 20,
    color: COLORS.grey,
    fontWeight: "600",
  },
  headerContent: {
    flex: 1,
  },
  storyTitle: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.black,
    marginBottom: 6,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.grey,
    fontWeight: "600",
  },
  xpAnimation: {
    position: "absolute",
    top: 100,
    alignSelf: "center",
    backgroundColor: COLORS.success,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  xpAnimationText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: responsiveWidth(4),
  },
  nodeContainer: {
    gap: 24,
  },
  promptContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  prompt: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.black,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionsTitle: {
    fontSize: FONT_SIZES.subtitle,
    color: COLORS.black,
    marginBottom: 4,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionButtonDisabled: {
    opacity: 0.5,
  },
  optionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  optionNumberText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  optionText: {
    flex: 1,
    fontSize: FONT_SIZES.medium,
    color: COLORS.black,
    lineHeight: 20,
  },
  nodeInfo: {
    backgroundColor: COLORS.light_purple,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  nodeInfoText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.primary,
    fontWeight: "600",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    fontSize: FONT_SIZES.medium,
    marginTop: 12,
    fontWeight: "600",
  },
});
