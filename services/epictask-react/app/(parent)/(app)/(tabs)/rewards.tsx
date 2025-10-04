import { ICONS, IMAGES } from "@/assets";
import Search from "@/components/search/Search";
import CustomText from "@/components/CustomText";
import FamilyLeaderboardCard from "@/components/rewards/FamilyLeaderboardCard";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
  Text,
  RefreshControl,
} from "react-native";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS } from "@/constants/Colors";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { firestoreService } from "@/api/firestoreService";
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
  const [familyLeaderboard, setFamilyLeaderboard] = useState<any>(null);
  const [globalLeaderboard, setGlobalLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch family leaderboard
      const familyData = await taskService.getFamilyLeaderboard(user.uid);
      setFamilyLeaderboard(familyData);

      // Fetch enhanced global leaderboard
      const globalData = await taskService.getEnhancedGlobalLeaderboard(50);
      setGlobalLeaderboard(globalData.leaderboard || []);

    } catch (error) {
      console.error("Failed to fetch rewards data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleChildPress = (childId: string) => {
    // Navigate to child detail view or show modal
    console.log('Child pressed:', childId);
  };

  const handleViewAllGlobal = () => {
    // Navigate to full global leaderboard
    console.log('View all global leaderboard');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <CustomText variant="medium" style={styles.loadingText}>
            Loading rewards data...
          </CustomText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <ImageBackground source={IMAGES.img_bg} style={styles.headerBackground}>
          <View style={styles.header}>
            <CustomText variant="semiBold" style={styles.headerTitle}>
              Family Rewards Dashboard
            </CustomText>
            <CustomText variant="medium" style={styles.headerSubtitle}>
              Track your children's progress and achievements
            </CustomText>
          </View>
        </ImageBackground>

        {/* Family Overview Stats */}
        {familyLeaderboard && (
          <View style={styles.overviewSection}>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <MaterialIcons name="family-restroom" size={32} color={COLORS.primary} />
                <CustomText variant="bold" style={styles.statNumber}>
                  {familyLeaderboard.children?.length || 0}
                </CustomText>
                <CustomText variant="medium" style={styles.statLabel}>
                  Children
                </CustomText>
              </View>
              
              <View style={styles.statCard}>
                <MaterialIcons name="stars" size={32} color="#4CAF50" />
                <CustomText variant="bold" style={styles.statNumber}>
                  {familyLeaderboard.family_total_tasks || 0}
                </CustomText>
                <CustomText variant="medium" style={styles.statLabel}>
                  Tasks Done
                </CustomText>
              </View>
              
              <View style={styles.statCard}>
                <MaterialIcons name="emoji-events" size={32} color="#FF9800" />
                <CustomText variant="bold" style={styles.statNumber}>
                  #{familyLeaderboard.family_global_rank || 0}
                </CustomText>
                <CustomText variant="medium" style={styles.statLabel}>
                  Family Rank
                </CustomText>
              </View>
            </View>
          </View>
        )}

        {/* Family Leaderboard */}
        {familyLeaderboard && (
          <FamilyLeaderboardCard 
            familyData={familyLeaderboard}
            onChildPress={handleChildPress}
          />
        )}

        {/* Global Leaderboard Preview */}
        <View style={styles.globalSection}>
          <View style={styles.sectionHeader}>
            <CustomText variant="semiBold" style={styles.sectionTitle}>
              🌍 Global Leaderboard
            </CustomText>
            <TouchableOpacity onPress={handleViewAllGlobal}>
              <CustomText variant="medium" style={styles.viewAllButton}>
                View All
              </CustomText>
            </TouchableOpacity>
          </View>
          
          <View style={styles.globalLeaderboardCard}>
            {globalLeaderboard.length > 0 ? (
              globalLeaderboard.slice(0, 5).map((entry, index) => (
                <View key={entry.user_id} style={styles.globalEntry}>
                  <View style={styles.globalRank}>
                    <CustomText variant="semiBold" style={styles.rankNumber}>
                      #{index + 1}
                    </CustomText>
                  </View>
                  <View style={styles.globalInfo}>
                    <CustomText variant="medium" style={styles.globalName}>
                      {entry.display_name || `User ${index + 1}`}
                    </CustomText>
                    <View style={styles.tokenDisplay}>
                      {entry.xrp_earned > 0 && (
                        <CustomText variant="medium" style={styles.tokenAmount}>
                          {entry.xrp_earned} XRP
                        </CustomText>
                      )}
                      {entry.rlusd_earned > 0 && (
                        <CustomText variant="medium" style={styles.tokenAmount}>
                          {entry.rlusd_earned} RLUSD
                        </CustomText>
                      )}
                      {entry.etask_earned > 0 && (
                        <CustomText variant="medium" style={styles.tokenAmount}>
                          {entry.etask_earned} eTask
                        </CustomText>
                      )}
                      <CustomText variant="medium" style={styles.taskCount}>
                        • {entry.tasks_completed} tasks
                      </CustomText>
                    </View>
                  </View>
                  <View style={styles.globalLevel}>
                    <CustomText variant="semiBold" style={styles.levelBadge}>
                      L{entry.level}
                    </CustomText>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyGlobal}>
                <MaterialIcons name="leaderboard" size={48} color={COLORS.grey} />
                <CustomText variant="medium" style={styles.emptyText}>
                  Global leaderboard will appear here
                </CustomText>
              </View>
            )}
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <CustomText variant="semiBold" style={styles.sectionTitle}>
            💡 Parent Tips
          </CustomText>
          <View style={styles.tipsCard}>
            <View style={styles.tip}>
              <Text style={styles.tipEmoji}>🎯</Text>
              <CustomText variant="medium" style={styles.tipText}>
                Set clear, achievable goals for your children to keep them motivated
              </CustomText>
            </View>
            <View style={styles.tip}>
              <Text style={styles.tipEmoji}>🏆</Text>
              <CustomText variant="medium" style={styles.tipText}>
                Celebrate achievements to build confidence and encourage progress
              </CustomText>
            </View>
            <View style={styles.tip}>
              <Text style={styles.tipEmoji}>📊</Text>
              <CustomText variant="medium" style={styles.tipText}>
                Review progress regularly and adjust task difficulty as needed
              </CustomText>
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: responsiveHeight(2),
    fontSize: responsiveFontSize(1.6),
    color: COLORS.grey,
  },
  scrollView: {
    marginBottom: 50,
  },
  headerBackground: {
    paddingBottom: responsiveHeight(2),
  },
  header: {
    alignItems: "center",
    paddingVertical: responsiveWidth(4),
    paddingHorizontal: responsiveWidth(4),
  },
  headerTitle: {
    fontSize: responsiveFontSize(2.8),
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: responsiveFontSize(1.5),
    color: COLORS.grey,
    textAlign: 'center',
  },
  overviewSection: {
    paddingHorizontal: responsiveWidth(4),
    marginBottom: responsiveHeight(2),
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: responsiveWidth(4),
    alignItems: 'center',
    flex: 1,
    marginHorizontal: responsiveWidth(1),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statNumber: {
    fontSize: responsiveFontSize(2.2),
    color: '#333',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: responsiveFontSize(1.3),
    color: COLORS.grey,
    textAlign: 'center',
  },
  currencySection: {
    paddingHorizontal: responsiveWidth(4),
    marginBottom: responsiveHeight(2),
  },
  sectionTitle: {
    fontSize: responsiveFontSize(2),
    color: '#333',
    marginBottom: responsiveHeight(1.5),
  },
  currencyRatesCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: responsiveWidth(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  currencyRate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  currencyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  currencyRateText: {
    fontSize: responsiveFontSize(1.5),
    color: '#333',
  },
  globalSection: {
    paddingHorizontal: responsiveWidth(4),
    marginBottom: responsiveHeight(2),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveHeight(1.5),
  },
  viewAllButton: {
    fontSize: responsiveFontSize(1.4),
    color: COLORS.primary,
  },
  globalLeaderboardCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: responsiveWidth(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  globalEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  globalRank: {
    width: responsiveWidth(12),
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: responsiveFontSize(1.6),
    color: COLORS.primary,
  },
  globalInfo: {
    flex: 1,
    marginLeft: responsiveWidth(3),
  },
  globalName: {
    fontSize: responsiveFontSize(1.6),
    color: '#333',
    marginBottom: 4,
  },
  globalStats: {
    fontSize: responsiveFontSize(1.3),
    color: COLORS.grey,
  },
  globalLevel: {
    alignItems: 'center',
  },
  levelBadge: {
    fontSize: responsiveFontSize(1.4),
    color: COLORS.primary,
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emptyGlobal: {
    alignItems: 'center',
    paddingVertical: responsiveHeight(4),
  },
  emptyText: {
    fontSize: responsiveFontSize(1.6),
    color: COLORS.grey,
    marginTop: responsiveHeight(1),
    textAlign: 'center',
  },
  tipsSection: {
    paddingHorizontal: responsiveWidth(4),
    marginBottom: responsiveHeight(3),
  },
  tipsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: responsiveWidth(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: responsiveHeight(2),
  },
  tipEmoji: {
    fontSize: responsiveFontSize(2),
    marginRight: responsiveWidth(3),
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: responsiveFontSize(1.5),
    color: '#333',
    lineHeight: 22,
  },
  // Legacy styles (keeping for compatibility)
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
  tokenDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  tokenAmount: {
    fontSize: responsiveFontSize(1.2),
    color: COLORS.primary,
    marginRight: 8,
    fontWeight: '600',
  },
  taskCount: {
    fontSize: responsiveFontSize(1.3),
    color: COLORS.grey,
  },
});
