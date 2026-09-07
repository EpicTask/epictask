import { FONT_SIZES } from "@/constants/FontSize";
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import { COLORS } from '@/constants/Colors';
import CustomText from '@/components/CustomText';
import { MaterialIcons, FontAwesome5, AntDesign } from '@expo/vector-icons';
import DebouncedTouchableOpacity from '../buttons/DebouncedTouchableOpacity';
import EarningsJar from './EarningsJar';

interface KidData {
  user_id: string;
  display_name: string;
  currencies: {
    // Settled — money the child actually has.
    xrp_earned: number;
    rlusd_earned: number;
    etask_earned: number;
    // Approved by a parent but not yet signed for on the ledger.
    xrp_pending?: number;
    rlusd_pending?: number;
    etask_pending?: number;
  };
  tasks_completed: number;
  tasks_pending?: number;
  level: number;
  family_rank: number;
  global_rank: number;
  token_score: number;
  achievements: string[];
  next_level_progress: number;
}

interface KidLeaderboardData {
  kid_data: KidData;
  family_position: number;
  family_total_kids: number;
  encouragement_message: string;
  next_milestone: {
    type: string;
    current: number;
    next: number;
    progress: number;
    points_to_next?: number;
  };
  global_context: {
    rank: number;
    message: string;
  };
}

interface Props {
  kidData: KidLeaderboardData;
  childAge?: number;
  progressSummary?: any;
  onAchievementPress?: (achievement: string) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

const KidRewardsView: React.FC<Props> = ({
  kidData,
  childAge,
  progressSummary,
  onAchievementPress,
  refreshing = false,
  onRefresh,
}) => {
  // The API shape is deep, and a partial or error-shaped payload used to crash
  // the whole tab rather than degrade. Read defensively once, up front.
  const kid = kidData?.kid_data ?? ({} as KidData);
  const currencies = kid.currencies ?? {
    xrp_earned: 0,
    rlusd_earned: 0,
    etask_earned: 0,
  };
  const milestone = kidData?.next_milestone ?? {
    type: "level",
    current: kid.level ?? 1,
    next: (kid.level ?? 1) + 1,
    progress: 0,
  };
  const globalContext = kidData?.global_context ?? { rank: 0, message: "" };
  const achievements = kid.achievements ?? [];
  const levelProgress = kid.next_level_progress ?? 0;

  const settledTotal =
    (currencies.xrp_earned ?? 0) +
    (currencies.rlusd_earned ?? 0) +
    (currencies.etask_earned ?? 0);
  const pendingTotal =
    (currencies.xrp_pending ?? 0) +
    (currencies.rlusd_pending ?? 0) +
    (currencies.etask_pending ?? 0);
  const isYoungCohort = !!childAge && childAge >= 5 && childAge <= 7;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const coinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: levelProgress / 100,
      duration: 1500,
      useNativeDriver: false,
    }).start();

    // Coin bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(coinAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(coinAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [levelProgress]);

  const handleLevelPress = () => {
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getLevelIcon = (level: number) => {
    if (level >= 20) return '👑';
    if (level >= 15) return '🏆';
    if (level >= 10) return '⭐';
    if (level >= 5) return '🌟';
    return '🚀';
  };

  const getFamilyPositionEmoji = (position: number) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  };

  const getAchievementIcon = (achievement: string) => {
    if (achievement.includes('First')) return '🎯';
    if (achievement.includes('Master')) return '🎓';
    if (achievement.includes('Champion')) return '🏆';
    if (achievement.includes('Legend')) return '👑';
    if (achievement.includes('Star')) return '⭐';
    if (achievement.includes('Earner')) return '💰';
    if (achievement.includes('Builder')) return '🏗️';
    return '🎖️';
  };

  const coinRotation = coinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const coinScale = coinAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.1, 1],
  });

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
    >
      {/* 5-7 UI Overlay: Earnings Jar */}
      {isYoungCohort ? (
        <View style={styles.jarSection}>
          {/* Settled and pending come from the reward ledger. The old code
              passed progressSummary.total_payouts_pending, which is a *count*
              of pending payout requests, not an amount — so a child with one
              pending 50-eTask story payout was shown "+1 waiting". */}
          <EarningsJar
            totalCoins={settledTotal}
            pendingCoins={pendingTotal}
          />
        </View>
      ) : (
        /* Original Hero Section */
        <View style={styles.heroSection}>
          <View style={styles.avatarContainer}>
            <DebouncedTouchableOpacity onPress={handleLevelPress} activeOpacity={0.8}>
              <Animated.View
                style={[
                  styles.avatarCircle,
                  { transform: [{ scale: bounceAnim }] },
                ]}
              >
                <Text style={styles.levelEmoji}>{getLevelIcon(kid.level ?? 1)}</Text>
              </Animated.View>
            </DebouncedTouchableOpacity>
            <View style={styles.levelBadge}>
              <CustomText variant="bold" style={styles.levelText}>
                {kid.level ?? 1}
              </CustomText>
            </View>
          </View>

          <CustomText variant="bold" style={styles.welcomeText}>
            Hey {kid.display_name || 'Champion'}! 👋
          </CustomText>

          <View style={styles.encouragementCard}>
            <CustomText variant="medium" style={styles.encouragementText}>
              {kidData?.encouragement_message}
            </CustomText>
          </View>
        </View>
      )}

      {/* Earnings Display - Hide if 5-7 (since Jar handles it) */}
      {!isYoungCohort && (
        <View style={styles.earningsSection}>
          <CustomText variant="semiBold" style={styles.sectionTitle}>
            💰 Your Treasure Chest
          </CustomText>
          
          <View style={styles.treasureChest}>
            <Animated.View
              style={[
                styles.coinIcon,
                {
                  transform: [
                    { rotate: coinRotation },
                    { scale: coinScale },
                  ],
                },
              ]}
            >
              <FontAwesome5 name="coins" size={32} color="#FFD700" />
            </Animated.View>
            
            {/* The headline is the balance. This used to be tasks_completed
                under a coin icon in a section titled "Your Treasure Chest",
                which meant the one number a child opens this tab for — how
                much do I have — was not on the screen at all. */}
            <CustomText variant="bold" style={styles.totalValue}>
              {settledTotal.toFixed(2)}
            </CustomText>
            <CustomText variant="medium" style={styles.totalLabel}>
              Yours to keep
            </CustomText>

            {/* Currency Breakdown */}
            <View style={styles.currencyGrid}>
              {(currencies.xrp_earned ?? 0) > 0 && (
                <View style={styles.currencyCard}>
                  <View style={[styles.currencyIcon, { backgroundColor: '#23292F' }]}>
                    <CustomText variant="bold" style={styles.currencySymbol}>XRP</CustomText>
                  </View>
                  <CustomText variant="semiBold" style={styles.currencyAmount}>
                    {(currencies.xrp_earned ?? 0).toFixed(2)}
                  </CustomText>
                </View>
              )}

              {(currencies.rlusd_earned ?? 0) > 0 && (
                <View style={styles.currencyCard}>
                  <View style={[styles.currencyIcon, { backgroundColor: '#1976D2' }]}>
                    <CustomText variant="bold" style={styles.currencySymbol}>RLUSD</CustomText>
                  </View>
                  <CustomText variant="semiBold" style={styles.currencyAmount}>
                    {(currencies.rlusd_earned ?? 0).toFixed(2)}
                  </CustomText>
                </View>
              )}

              {(currencies.etask_earned ?? 0) > 0 && (
                <View style={styles.currencyCard}>
                  <View style={[styles.currencyIcon, { backgroundColor: '#4CAF50' }]}>
                    <CustomText variant="bold" style={styles.currencySymbol}>eTask</CustomText>
                  </View>
                  <CustomText variant="semiBold" style={styles.currencyAmount}>
                    {(currencies.etask_earned ?? 0).toFixed(0)}
                  </CustomText>
                </View>
              )}
            </View>

            {/* Approved but not yet paid. Ages 8-18 previously had no pending
                state at all, so approved-but-unsettled work — the state the app
                spends most of its time in — was invisible to them. */}
            {pendingTotal > 0 && (
              <View style={styles.pendingRow}>
                <MaterialIcons name="schedule" size={18} color="#F57F17" />
                <CustomText variant="medium" style={styles.pendingRowText}>
                  {pendingTotal.toFixed(2)} approved — waiting to arrive
                </CustomText>
              </View>
            )}

            {settledTotal === 0 && pendingTotal === 0 && (
              <View style={styles.emptyChest}>
                <CustomText variant="medium" style={styles.emptyChestText}>
                  Your chest is empty. Finish a task to add your first coins!
                </CustomText>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Progress to Next Level */}
      <View style={styles.progressSection}>
        <CustomText variant="semiBold" style={styles.sectionTitle}>
          🚀 Level Up Progress
        </CustomText>
        
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <CustomText variant="semiBold" style={styles.currentLevel}>
              Level {milestone.current}
            </CustomText>
            <CustomText variant="semiBold" style={styles.nextLevel}>
              Level {milestone.next}
            </CustomText>
          </View>
          
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          
          <CustomText variant="medium" style={styles.progressText}>
            {levelProgress.toFixed(0)}% Complete!
            {milestone.points_to_next
              ? ` ${milestone.points_to_next} points to go! 💪`
              : ' Keep going! 💪'}
          </CustomText>
        </View>
      </View>

      {/* Family Position */}
      <View style={styles.familySection}>
        <CustomText variant="semiBold" style={styles.sectionTitle}>
          👨‍👩‍👧‍👦 Family Ranking
        </CustomText>
        
        <View style={styles.familyCard}>
          <View style={styles.familyPosition}>
            <Text style={styles.positionEmoji}>
              {getFamilyPositionEmoji(kidData?.family_position ?? 0)}
            </Text>
            <CustomText variant="bold" style={styles.positionText}>
              #{kidData?.family_position ?? '-'}
            </CustomText>
            <CustomText variant="medium" style={styles.positionLabel}>
              in your family
            </CustomText>
          </View>
          
          {(kidData?.family_total_kids ?? 0) > 1 && (
            <CustomText variant="medium" style={styles.familyContext}>
              Out of {kidData?.family_total_kids} kids in your family
            </CustomText>
          )}
        </View>
      </View>

      {/* Achievements */}
      {achievements.length > 0 && (
        <View style={styles.achievementsSection}>
          <CustomText variant="semiBold" style={styles.sectionTitle}>
            🏆 Your Achievements
          </CustomText>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.achievementsGrid}>
              {achievements.map((achievement, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.achievementBadge}
                  onPress={() => onAchievementPress?.(achievement)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.achievementIcon}>
                    {getAchievementIcon(achievement)}
                  </Text>
                  <CustomText variant="medium" style={styles.achievementText}>
                    {achievement}
                  </CustomText>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Task Stats */}
      <View style={styles.statsSection}>
        <CustomText variant="semiBold" style={styles.sectionTitle}>
          📊 Your Stats
        </CustomText>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <MaterialIcons name="assignment-turned-in" size={32} color={COLORS.primary} />
            <CustomText variant="bold" style={styles.statNumber}>
              {kid.tasks_completed ?? 0}
            </CustomText>
            <CustomText variant="medium" style={styles.statLabel}>
              Tasks Done
            </CustomText>
          </View>
          
          <View style={styles.statCard}>
            <MaterialIcons name="public" size={32} color="#FF9800" />
            <CustomText variant="bold" style={styles.statNumber}>
              #{globalContext.rank || '-'}
            </CustomText>
            <CustomText variant="medium" style={styles.statLabel}>
              Global Rank
            </CustomText>
          </View>
        </View>
        
        <View style={styles.globalMessage}>
          <CustomText variant="medium" style={styles.globalText}>
            {globalContext.message}
          </CustomText>
        </View>
      </View>

      {/* Motivational Footer */}
      <View style={styles.motivationSection}>
        <View style={styles.motivationCard}>
          <Text style={styles.motivationEmoji}>🌟</Text>
          <CustomText variant="semiBold" style={styles.motivationTitle}>
            Keep Up the Great Work!
          </CustomText>
          <CustomText variant="medium" style={styles.motivationText}>
            Every task you complete makes you stronger and smarter! 
            You're doing amazing! 🎉
          </CustomText>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF',
  },
  jarSection: {
    paddingVertical: responsiveHeight(4),
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    marginBottom: 20,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: responsiveHeight(3),
    paddingHorizontal: responsiveWidth(4),
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: responsiveHeight(2),
  },
  avatarCircle: {
    width: responsiveWidth(25),
    height: responsiveWidth(25),
    borderRadius: responsiveWidth(12.5),
    backgroundColor: '#FFE4B5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  levelEmoji: {
    fontSize: FONT_SIZES.huge,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  levelText: {
    color: '#FFF',
    fontSize: FONT_SIZES.medium,
  },
  welcomeText: {
    fontSize: FONT_SIZES.extraLarge,
    color: '#333',
    marginBottom: responsiveHeight(1),
    textAlign: 'center',
  },
  encouragementCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 16,
    padding: responsiveWidth(4),
    marginHorizontal: responsiveWidth(2),
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  encouragementText: {
    fontSize: FONT_SIZES.extraSmall,
    color: '#2E7D32',
    textAlign: 'center',
    lineHeight: 22,
  },
  earningsSection: {
    paddingHorizontal: responsiveWidth(4),
    marginBottom: responsiveHeight(2),
  },
  sectionTitle: {
    fontSize: FONT_SIZES.medium,
    color: '#333',
    marginBottom: responsiveHeight(1.5),
  },
  treasureChest: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: responsiveWidth(5),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  coinIcon: {
    marginBottom: responsiveHeight(1),
  },
  totalValue: {
    fontSize: FONT_SIZES.title,
    color: COLORS.primary,
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: FONT_SIZES.extraSmall,
    color: '#666',
    marginBottom: responsiveHeight(2),
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: responsiveHeight(1.5),
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    paddingVertical: responsiveHeight(1),
    paddingHorizontal: responsiveWidth(3),
  },
  pendingRowText: {
    fontSize: FONT_SIZES.extraSmall,
    color: '#F57F17',
  },
  emptyChest: {
    marginTop: responsiveHeight(1),
    paddingHorizontal: responsiveWidth(4),
  },
  emptyChestText: {
    fontSize: FONT_SIZES.extraSmall,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  currencyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  currencyCard: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  currencyIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  currencySymbol: {
    color: '#FFF',
    fontSize: FONT_SIZES.extraSmall,
  },
  currencyAmount: {
    fontSize: FONT_SIZES.extraSmall,
    color: '#333',
  },
  progressSection: {
    paddingHorizontal: responsiveWidth(4),
    marginBottom: responsiveHeight(2),
  },
  progressCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: responsiveWidth(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: responsiveHeight(1),
  },
  currentLevel: {
    fontSize: FONT_SIZES.extraSmall,
    color: COLORS.primary,
  },
  nextLevel: {
    fontSize: FONT_SIZES.extraSmall,
    color: '#FF9800',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    marginBottom: responsiveHeight(1),
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 6,
  },
  progressText: {
    fontSize: FONT_SIZES.extraSmall,
    color: '#666',
    textAlign: 'center',
  },
  familySection: {
    paddingHorizontal: responsiveWidth(4),
    marginBottom: responsiveHeight(2),
  },
  familyCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: responsiveWidth(4),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  familyPosition: {
    alignItems: 'center',
    marginBottom: responsiveHeight(1),
  },
  positionEmoji: {
    fontSize: FONT_SIZES.display,
    marginBottom: 8,
  },
  positionText: {
    fontSize: FONT_SIZES.extraLarge,
    color: COLORS.primary,
    marginBottom: 4,
  },
  positionLabel: {
    fontSize: FONT_SIZES.extraSmall,
    color: '#666',
  },
  familyContext: {
    fontSize: FONT_SIZES.extraSmall,
    color: '#888',
    textAlign: 'center',
  },
  achievementsSection: {
    paddingHorizontal: responsiveWidth(4),
    marginBottom: responsiveHeight(2),
  },
  achievementsGrid: {
    flexDirection: 'row',
    paddingHorizontal: responsiveWidth(2),
  },
  achievementBadge: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: responsiveWidth(3),
    marginRight: responsiveWidth(2),
    alignItems: 'center',
    minWidth: responsiveWidth(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementIcon: {
    fontSize: FONT_SIZES.extraLarge,
    marginBottom: 8,
  },
  achievementText: {
    fontSize: FONT_SIZES.extraSmall,
    color: '#333',
    textAlign: 'center',
  },
  statsSection: {
    paddingHorizontal: responsiveWidth(4),
    marginBottom: responsiveHeight(2),
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: responsiveHeight(1.5),
  },
  statCard: {
    backgroundColor: '#FFF',
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
    fontSize: FONT_SIZES.extraLarge,
    color: '#333',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: FONT_SIZES.extraSmall,
    color: '#666',
    textAlign: 'center',
  },
  globalMessage: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: responsiveWidth(3),
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  globalText: {
    fontSize: FONT_SIZES.extraSmall,
    color: '#1565C0',
    textAlign: 'center',
  },
  motivationSection: {
    paddingHorizontal: responsiveWidth(4),
    paddingBottom: responsiveHeight(3),
  },
  motivationCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 20,
    padding: responsiveWidth(5),
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD54F',
  },
  motivationEmoji: {
    fontSize: FONT_SIZES.display,
    marginBottom: responsiveHeight(1),
  },
  motivationTitle: {
    fontSize: FONT_SIZES.medium,
    color: '#F57F17',
    marginBottom: responsiveHeight(1),
    textAlign: 'center',
  },
  motivationText: {
    fontSize: FONT_SIZES.extraSmall,
    color: '#F9A825',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default KidRewardsView;
