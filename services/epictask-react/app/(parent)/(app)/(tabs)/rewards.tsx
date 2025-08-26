import { ICONS, IMAGES } from "@/assets";
import Search from "@/components/search/Search";
import CustomText from "@/components/CustomText";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
  Text,
} from "react-native";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS } from "@/constants/Colors";
import { AntDesign } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import taskService from "@/api/taskService";

// Type definitions
interface UserRewards {
  tokens_earned: number;
  level: number;
  rank: number;
}

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  tokens_earned: number;
  rank: number;
}

interface RewardHistory {
  message: string;
  timestamp: string;
}

interface AchievementData {
  title: string;
  description: string;
}

const RewardHistoryComponent: React.FC<{ history: RewardHistory }> = ({ history }) => (
  <View style={{ gap: 4, width: responsiveWidth(70) }}>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <AntDesign name="checkcircle" size={20} color="#0ECC44" />
      <CustomText style={{ color: "#000", fontSize: responsiveFontSize(1.7) }} variant="medium">
        {history.message}
      </CustomText>
    </View>
    <View style={{ gap: responsiveWidth(2), marginLeft: 28 }}>
      <CustomText style={{ color: COLORS.grey, fontSize: 12 }} variant="medium">
        {new Date(history.timestamp).toLocaleString()}
      </CustomText>
    </View>
  </View>
);

const Achievement: React.FC<{ achievement: AchievementData }> = ({ achievement }) => (
  <View style={styles.achievementContainer}>
    {ICONS.achievement}
    <View style={{ paddingRight: 35 }}>
      <CustomText style={styles.achievementTitle} variant="semiBold">
        {achievement.title}
      </CustomText>
      <CustomText variant="medium" style={styles.achievementDescription}>
        {achievement.description}
      </CustomText>
    </View>
  </View>
);

export default function TabTwoScreen() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<UserRewards | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          setLoading(true);
          const userRewards = await taskService.getUserRewards(user.uid);
          setRewards(userRewards);

          const globalLeaderboard = await taskService.getGlobalLeaderboard();
          setLeaderboard(globalLeaderboard);
        } catch (error) {
          console.error("Failed to fetch rewards data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 50 }}>
        <ImageBackground source={IMAGES.img_bg}>
          <View style={styles.header}>
            <CustomText variant="semiBold" style={{ fontSize: responsiveFontSize(3) }}>
              Kids rewards
            </CustomText>
          </View>
          <View>
            <Search />
          </View>
          <View style={styles.rewardsContainer}>
            <Image source={IMAGES.reward} style={styles.rewardImage} />
            <View style={styles.rewardPointsContainer}>
              <View style={{ gap: 4, alignItems: "center" }}>
                <CustomText style={{ fontWeight: "bold", fontSize: responsiveFontSize(3) }}>
                  My Reward Tokens
                </CustomText>
                <CustomText style={{ fontSize: responsiveFontSize(1.7) }}>
                  Earned Tokens
                </CustomText>
              </View>
              <View style={{ gap: 4, alignItems: "center" }}>
                <CustomText style={{ fontSize: responsiveFontSize(5), fontWeight: "700" }}>
                  {rewards?.tokens_earned || 0}
                </CustomText>
                <CustomText style={{ fontSize: responsiveFontSize(1.7) }}>
                  Level {rewards?.level || 1}
                </CustomText>
              </View>
            </View>
            {/* Achievement component can be dynamic */}
          </View>
        </ImageBackground>
        <View style={{ gap: 10, paddingVertical: 30 }}>
          <View style={styles.historyHeader}>
            <CustomText variant="semiBold" style={{ fontSize: responsiveFontSize(2.5) }}>
              Global Leaderboard
            </CustomText>
            <TouchableOpacity>
              <CustomText variant="medium" style={{ fontSize: responsiveFontSize(1.1) }}>
                View All
              </CustomText>
            </TouchableOpacity>
          </View>
          <View style={{ gap: 12 }}>
            {leaderboard.length > 0 ? (
              leaderboard.map((entry) => (
                <Text key={entry.user_id}>
                  {entry.rank}. {entry.display_name} - {entry.tokens_earned} tokens
                </Text>
              ))
            ) : (
              <Text>Start completing tasks to earn tokens!</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F6F9",
    height: responsiveHeight(100),
    width: responsiveWidth(100),
    padding: responsiveWidth(4),
  },
  header: {
    flexDirection: "row",
    paddingVertical: responsiveWidth(4),
    justifyContent: "center",
  },
  rewardsContainer: {
    paddingVertical: responsiveWidth(2),
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  rewardImage: {
    height: responsiveWidth(25),
    width: responsiveWidth(25),
  },
  rewardPointsContainer: {
    justifyContent: "center",
    alignItems: "center",
    gap: responsiveWidth(4),
  },
  achievementContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    width: responsiveWidth(90),
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 14,
  },
  achievementTitle: {
    color: COLORS.white,
    fontWeight: "500",
    fontSize: responsiveFontSize(2.3),
  },
  achievementDescription: {
    color: COLORS.white,
    fontSize: responsiveFontSize(1.6),
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
