import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { COLORS } from "@/constants/Colors";
import { FONT_SIZES } from "@/constants/FontSize";
import CustomText from "@/components/CustomText";
import Heading from "@/components/headings/Heading";
import { narrativeService, KidNarrativeProgress } from "@/api/narrativeService";
import {
  responsiveWidth,
  responsiveHeight,
} from "react-native-responsive-dimensions";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ChildProgressScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const kidId = params.kidId as string;
  const kidName = params.kidName as string;

  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<KidNarrativeProgress | null>(null);

  useEffect(() => {
    fetchProgress();
  }, [kidId]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const data = await narrativeService.getKidNarrativeProgress(kidId);
      // getKidNarrativeProgress returns an array, but this screen seems to expect a single object
      // or at least we should handle it.
      if (Array.isArray(data) && data.length > 0) {
        setProgress(data[0]);
      } else if (!Array.isArray(data)) {
        setProgress(data);
      }
    } catch (error) {
      console.log("Failed to fetch kid progress:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetStory = () => {
    Alert.alert(
      "Reset Progress",
      "Are you sure you want to reset this story? This will clear current progress but keep earned rewards.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            // Admin logic for reset
            console.log("Reset story pressed");
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.black}
          />
        </TouchableOpacity>
        <CustomText variant="bold" style={styles.headerTitle}>
          {kidName}'s Progress
        </CustomText>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {progress ? (
          <>
            {/* Current Story Card */}
            <View style={styles.section}>
              <Heading title="Active Story" />
              <View style={styles.card}>
                <View style={styles.storyHeader}>
                  <MaterialCommunityIcons
                    name="book-open-variant"
                    size={32}
                    color={COLORS.primary}
                  />
                  <View style={styles.storyInfo}>
                    <CustomText variant="bold" style={styles.storyTitle}>
                      {progress.story_title || "The Broken Toy"}
                    </CustomText>
                    <CustomText style={styles.storyDetail}>
                      Started:{" "}
                      {new Date(
                        progress.last_activity_at || Date.now(),
                      ).toLocaleDateString()}
                    </CustomText>
                  </View>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <CustomText variant="semiBold">Progress</CustomText>
                    <CustomText>
                      {Math.round((progress.current_story_progress || 0) * 100)}
                      %
                    </CustomText>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${(progress.current_story_progress || 0) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Earning History */}
            <View style={styles.section}>
              <Heading title="Earning History" />
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <CustomText style={styles.statLabel}>Total XP</CustomText>
                  <CustomText variant="bold" style={styles.statValue}>
                    {progress.total_xp_earned}
                  </CustomText>
                </View>
                <View style={styles.statCard}>
                  <CustomText style={styles.statLabel}>Rewards</CustomText>
                  <CustomText variant="bold" style={styles.statValue}>
                    {progress.total_payout_amount} eTask
                  </CustomText>
                </View>
              </View>
            </View>

            {/* Beta Settings */}
            <View style={styles.section}>
              <Heading title="Beta Settings" />
              <TouchableOpacity
                style={styles.dangerButton}
                onPress={handleResetStory}
              >
                <MaterialCommunityIcons
                  name="refresh"
                  size={20}
                  color="white"
                />
                <Text style={styles.dangerButtonText}>Reset Current Story</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="emoticon-neutral-outline"
              size={64}
              color={COLORS.grey}
            />
            <CustomText style={styles.emptyText}>
              No narrative progress yet.
            </CustomText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 10,
  },
  storyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 15,
  },
  storyInfo: {
    flex: 1,
  },
  storyTitle: {
    fontSize: 18,
    color: COLORS.black,
  },
  storyDetail: {
    fontSize: 12,
    color: COLORS.grey,
  },
  progressContainer: {
    gap: 10,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressBarBg: {
    height: 12,
    backgroundColor: "#eee",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 15,
    marginTop: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.grey,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    color: COLORS.primary,
  },
  dangerButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 15,
    marginTop: 10,
    gap: 10,
  },
  dangerButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 100,
    gap: 20,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.grey,
  },
});
