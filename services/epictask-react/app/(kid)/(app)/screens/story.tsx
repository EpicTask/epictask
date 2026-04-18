import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { COLORS } from "@/constants/Colors";
import StoryNodeCard from "@/components/story/StoryNodeCard";
import TaskGateOverlay from "@/components/story/TaskGateOverlay";
import { narrativeService, Node, StoryProgress, Story } from "@/api/narrativeService";
import { taskService } from "@/api/taskService";
import { responsiveWidth, responsiveHeight } from "react-native-responsive-dimensions";

export default function StoryScreen() {
  const { user, childAge } = useAuth();
  const params = useLocalSearchParams();
  const storyId = params.storyId as string;

  const [loading, setLoading] = useState(true);
  const [story, setStory] = useState<Story | null>(null);
  const [currentNode, setCurrentNode] = useState<Node | null>(null);
  const [progress, setProgress] = useState<StoryProgress | null>(null);
  const [advancing, setAdvancing] = useState(false);
  const [taskGateVisible, setTaskGateVisible] = useState(false);
  const [gateTask, setGateTask] = useState<{name: string, reward: number} | null>(null);

  useEffect(() => {
    loadStoryData();
  }, [storyId]);

  const loadStoryData = async () => {
    try {
      setLoading(true);
      
      const storyData = await narrativeService.getStory(storyId);
      setStory(storyData);

      const progressList = await narrativeService.getProgress(user?.uid, storyId);
      let currentProgress = progressList.find(p => p.status === 'in_progress');
      
      if (!currentProgress) {
        const startResult = await narrativeService.startStory(user?.uid, storyId);
        currentProgress = startResult.progress;
        setCurrentNode(startResult.node);
      } else {
        const node = await narrativeService.getNode(storyId, currentProgress.current_node);
        setCurrentNode(node);
      }
      
      setProgress(currentProgress);
      
      // Check if current node has a task gate
      if (currentProgress.current_node) {
          const node = await narrativeService.getNode(storyId, currentProgress.current_node);
          if (node.task_gate) {
              await checkTaskGate(node.task_gate);
          }
      }

    } catch (error) {
      console.error("Failed to load story:", error);
      Alert.alert("Error", "Failed to load story. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checkTaskGate = async (taskGate: string) => {
      try {
          // This is a simplified check. In a real app, you'd check if the kid
          // has completed a task matching this gate category.
          // For now, we'll assume the gate is active if it exists.
          setGateTask({ name: taskGate, reward: 5 });
          setTaskGateVisible(true);
          
          // You would call your task service here to see if the gate is satisfied
          // const isSatisfied = await taskService.checkGate(user.uid, taskGate);
          // if (isSatisfied) setTaskGateVisible(false);
      } catch (error) {
          console.error("Task gate check failed:", error);
      }
  };

  const handleChoice = async (optionId: string) => {
    if (!currentNode || !progress || advancing) return;

    try {
      setAdvancing(true);

      const response = await narrativeService.advanceProgress({
        user_id: user?.uid,
        story_id: storyId,
        current_node_id: currentNode.node_id,
        selected_option_id: optionId,
      });

      if (response.story_completed) {
        Alert.alert(
          "🎉 Story Complete!",
          "Great job! You finished the story!",
          [{ text: "OK", onPress: () => router.back() }]
        );
      } else {
        setCurrentNode(response.next_node);
        setProgress(response.progress);
        
        // Check for new task gate
        if (response.next_node.task_gate) {
            await checkTaskGate(response.next_node.task_gate);
        }
      }
    } catch (error) {
      console.error("Failed to advance story:", error);
      Alert.alert("Error", "Failed to continue. Please try again.");
    } finally {
      setAdvancing(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (!story || !currentNode) return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
      </View>

      <StoryNodeCard 
        node={currentNode} 
        onChoice={handleChoice} 
        disabled={advancing}
      />

      {gateTask && (
          <TaskGateOverlay 
            visible={taskGateVisible}
            taskName={gateTask.name}
            taskReward={gateTask.reward}
          />
      )}

      {advancing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
  },
  backButton: {
      padding: 10,
  },
  backButtonText: {
      fontSize: 18,
      color: COLORS.primary || '#EE4266',
      fontWeight: 'bold',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
});
