import { FONT_SIZES } from "@/constants/FontSize";
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import { COLORS } from '@/constants/Colors';
import CustomText from '@/components/CustomText';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';

interface ChildReward {
  user_id: string;
  display_name: string;
  currencies: {
    xrp_earned: number;
    rlusd_earned: number;
    etask_earned: number;
  };
  tasks_completed: number;
  level: number;
  family_rank: number;
  global_rank: number;
  token_score: number;
  achievements: string[];
  next_level_progress: number;
}

interface FamilyLeaderboardData {
  family_id: string;
  parent_id: string;
  children: ChildReward[];
  family_total_tokens: number;
  family_total_tasks: number;
  family_global_rank: number;
}

interface Props {
  familyData: FamilyLeaderboardData;
  onChildPress?: (childId: string) => void;
}

const FamilyLeaderboardCard: React.FC<Props> = ({ familyData, onChildPress }) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <MaterialIcons name="emoji-events" size={24} color="#FFD700" />;
      case 2:
        return <MaterialIcons name="emoji-events" size={22} color="#C0C0C0" />;
      case 3:
        return <MaterialIcons name="emoji-events" size={20} color="#CD7F32" />;
      default:
        return (
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>{rank}</Text>
          </View>
        );
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (amount === 0) return '';
    return `${amount.toFixed(2)} ${currency}`;
  };

  const getProgressBarColor = (progress: number) => {
    if (progress >= 80) return '#4CAF50';
    if (progress >= 50) return '#FF9800';
    return '#2196F3';
  };

  return (
    <View style={styles.container}>
      {/* Family Summary Header */}
      <View style={styles.familySummary}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <CustomText variant="semiBold" style={styles.summaryValue}>
              {familyData.family_total_tasks}
            </CustomText>
            <CustomText variant="medium" style={styles.summaryLabel}>
              Total Tasks Completed
            </CustomText>
          </View>
          <View style={styles.summaryItem}>
            <CustomText variant="semiBold" style={styles.summaryValue}>
              {familyData.children.length}
            </CustomText>
            <CustomText variant="medium" style={styles.summaryLabel}>
              Active Children
            </CustomText>
          </View>
          <View style={styles.summaryItem}>
            <CustomText variant="semiBold" style={styles.summaryValue}>
              #{familyData.family_global_rank}
            </CustomText>
            <CustomText variant="medium" style={styles.summaryLabel}>
              Family Rank
            </CustomText>
          </View>
        </View>
      </View>

      {/* Children Leaderboard */}
      <View style={styles.leaderboardHeader}>
        <CustomText variant="semiBold" style={styles.headerTitle}>
          Family Leaderboard
        </CustomText>
        <CustomText variant="medium" style={styles.headerSubtitle}>
          {familyData.children.length} children
        </CustomText>
      </View>

      <ScrollView style={styles.childrenList} showsVerticalScrollIndicator={false}>
        {familyData.children.map((child, index) => (
          <TouchableOpacity
            key={child.user_id}
            style={[
              styles.childCard,
              index === 0 && styles.topChildCard,
            ]}
            onPress={() => onChildPress?.(child.user_id)}
            activeOpacity={0.7}
          >
            <View style={styles.childHeader}>
              <View style={styles.rankContainer}>
                {getRankIcon(child.family_rank)}
              </View>
              <View style={styles.childInfo}>
                <CustomText variant="semiBold" style={styles.childName}>
                  {child.display_name || `Child ${index + 1}`}
                </CustomText>
                <CustomText variant="medium" style={styles.childLevel}>
                  Level {child.level} • Global #{child.global_rank}
                </CustomText>
              </View>
              <View style={styles.childStats}>
                <CustomText variant="semiBold" style={styles.totalValue}>
                  {child.token_score.toFixed(1)} tokens
                </CustomText>
                <CustomText variant="medium" style={styles.tasksCount}>
                  {child.tasks_completed} tasks
                </CustomText>
              </View>
            </View>

            {/* Currency Breakdown */}
            <View style={styles.currencyBreakdown}>
              {child.currencies.xrp_earned > 0 && (
                <View style={styles.currencyItem}>
                  <View style={[styles.currencyDot, { backgroundColor: '#23292F' }]} />
                  <CustomText variant="medium" style={styles.currencyText}>
                    {formatCurrency(child.currencies.xrp_earned, 'XRP')}
                  </CustomText>
                </View>
              )}
              {child.currencies.rlusd_earned > 0 && (
                <View style={styles.currencyItem}>
                  <View style={[styles.currencyDot, { backgroundColor: '#1976D2' }]} />
                  <CustomText variant="medium" style={styles.currencyText}>
                    {formatCurrency(child.currencies.rlusd_earned, 'RLUSD')}
                  </CustomText>
                </View>
              )}
              {child.currencies.etask_earned > 0 && (
                <View style={styles.currencyItem}>
                  <View style={[styles.currencyDot, { backgroundColor: '#4CAF50' }]} />
                  <CustomText variant="medium" style={styles.currencyText}>
                    {formatCurrency(child.currencies.etask_earned, 'eTask')}
                  </CustomText>
                </View>
              )}
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${child.next_level_progress}%`,
                      backgroundColor: getProgressBarColor(child.next_level_progress),
                    },
                  ]}
                />
              </View>
              <CustomText variant="medium" style={styles.progressText}>
                {child.next_level_progress.toFixed(0)}% to Level {child.level + 1}
              </CustomText>
            </View>

            {/* Achievements */}
            {child.achievements.length > 0 && (
              <View style={styles.achievementsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {child.achievements.slice(0, 3).map((achievement, idx) => (
                    <View key={idx} style={styles.achievementBadge}>
                      <CustomText variant="medium" style={styles.achievementText}>
                        {achievement}
                      </CustomText>
                    </View>
                  ))}
                  {child.achievements.length > 3 && (
                    <View style={styles.achievementBadge}>
                      <CustomText variant="medium" style={styles.achievementText}>
                        +{child.achievements.length - 3} more
                      </CustomText>
                    </View>
                  )}
                </ScrollView>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {familyData.children.length === 0 && (
        <View style={styles.emptyState}>
          <AntDesign name="team" size={48} color={COLORS.grey} />
          <CustomText variant="medium" style={styles.emptyText}>
            No children linked to your account yet
          </CustomText>
          <CustomText variant="medium" style={styles.emptySubtext}>
            Add children to see their progress here
          </CustomText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: responsiveWidth(4),
    marginVertical: responsiveHeight(1),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  familySummary: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: responsiveWidth(4),
    marginBottom: responsiveHeight(2),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: FONT_SIZES.large,
    color: COLORS.primary,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.extraSmall,
    color: COLORS.grey,
    textAlign: 'center',
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveHeight(1.5),
  },
  headerTitle: {
    fontSize: FONT_SIZES.medium,
    color: '#000',
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.extraSmall,
    color: COLORS.grey,
  },
  childrenList: {
    maxHeight: responsiveHeight(40),
  },
  childCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: responsiveWidth(3),
    marginBottom: responsiveHeight(1),
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  topChildCard: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveHeight(1),
  },
  rankContainer: {
    width: responsiveWidth(10),
    alignItems: 'center',
  },
  rankBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.extraSmall,
    fontWeight: 'bold',
  },
  childInfo: {
    flex: 1,
    marginLeft: responsiveWidth(3),
  },
  childName: {
    fontSize: FONT_SIZES.medium,
    color: '#000',
    marginBottom: 2,
  },
  childLevel: {
    fontSize: FONT_SIZES.extraSmall,
    color: COLORS.grey,
  },
  childStats: {
    alignItems: 'flex-end',
  },
  totalValue: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.primary,
    marginBottom: 2,
  },
  tasksCount: {
    fontSize: FONT_SIZES.extraSmall,
    color: COLORS.grey,
  },
  currencyBreakdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: responsiveHeight(1),
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: responsiveWidth(4),
    marginBottom: 4,
  },
  currencyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  currencyText: {
    fontSize: FONT_SIZES.extraSmall,
    color: '#666',
  },
  progressContainer: {
    marginBottom: responsiveHeight(1),
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: FONT_SIZES.extraSmall,
    color: COLORS.grey,
    textAlign: 'right',
  },
  achievementsContainer: {
    marginTop: responsiveHeight(0.5),
  },
  achievementBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
  },
  achievementText: {
    fontSize: FONT_SIZES.extraSmall,
    color: COLORS.white,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: responsiveHeight(4),
  },
  emptyText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.grey,
    marginTop: responsiveHeight(1),
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: FONT_SIZES.extraSmall,
    color: COLORS.grey,
    marginTop: responsiveHeight(0.5),
    textAlign: 'center',
  },
});

export default FamilyLeaderboardCard;
