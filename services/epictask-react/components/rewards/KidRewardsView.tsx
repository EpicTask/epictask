import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
} from 'react-native';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import { COLORS } from '@/constants/Colors';
import CustomText from '@/components/CustomText';
import { MaterialIcons, FontAwesome5, AntDesign } from '@expo/vector-icons';

interface KidData {
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
  };
  global_context: {
    rank: number;
    message: string;
  };
}

interface Props {
  kidData: KidLeaderboardData;
  onAchievementPress?: (achievement: string) => void;
}

const KidRewardsView: React.FC<Props> = ({ kidData, onAchievementPress }) => {
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const coinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: kidData.kid_data.next_level_progress / 100,
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
  }, [kidData.kid_data.next_level_progress]);

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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section with Avatar and Level */}
      <View style={styles.heroSection}>
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={handleLevelPress} activeOpacity={0.8}>
            <Animated.View
              style={[
                styles.avatarCircle,
                { transform: [{ scale: bounceAnim }] },
              ]}
            >
              <Text style={styles.levelEmoji}>{getLevelIcon(kidData.kid_data.level)}</Text>
            </Animated.View>
          </TouchableOpacity>
          <View style={styles.levelBadge}>
            <CustomText variant="bold" style={styles.levelText}>
              {kidData.kid_data.level}
            </CustomText>
          </View>
        </View>

        <CustomText variant="bold" style={styles.welcomeText}>
          Hey {kidData.kid_data.display_name || 'Champion'}! 👋
        </CustomText>

        <View style={styles.encouragementCard}>
          <CustomText variant="medium" style={styles.encouragementText}>
            {kidData.encouragement_message}
          </CustomText>
        </View>
      </View>

      {/* Earnings Display */}
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
          
          <CustomText variant="bold" style={styles.totalValue}>
            {kidData.kid_data.tasks_completed}
          </CustomText>
          <CustomText variant="medium" style={styles.totalLabel}>
            Tasks Completed
          </CustomText>

          {/* Currency Breakdown */}
          <View style={styles.currencyGrid}>
            {kidData.kid_data.currencies.xrp_earned > 0 && (
              <View style={styles.currencyCard}>
                <View style={[styles.currencyIcon, { backgroundColor: '#23292F' }]}>
                  <CustomText variant="bold" style={styles.currencySymbol}>XRP</CustomText>
                </View>
                <CustomText variant="semiBold" style={styles.currencyAmount}>
                  {kidData.kid_data.currencies.xrp_earned.toFixed(2)}
                </CustomText>
              </View>
            )}
            
            {kidData.kid_data.currencies.rlusd_earned > 0 && (
              <View style={styles.currencyCard}>
                <View style={[styles.currencyIcon, { backgroundColor: '#1976D2' }]}>
                  <CustomText variant="bold" style={styles.currencySymbol}>RLUSD</CustomText>
                </View>
                <CustomText variant="semiBold" style={styles.currencyAmount}>
                  {kidData.kid_data.currencies.rlusd_earned.toFixed(2)}
                </CustomText>
              </View>
            )}
            
            {kidData.kid_data.currencies.etask_earned > 0 && (
              <View style={styles.currencyCard}>
                <View style={[styles.currencyIcon, { backgroundColor: '#4CAF50' }]}>
                  <CustomText variant="bold" style={styles.currencySymbol}>eTask</CustomText>
                </View>
                <CustomText variant="semiBold" style={styles.currencyAmount}>
                  {kidData.kid_data.currencies.etask_earned.toFixed(0)}
                </CustomText>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Progress to Next Level */}
      <View style={styles.progressSection}>
        <CustomText variant="semiBold" style={styles.sectionTitle}>
          🚀 Level Up Progress
        </CustomText>
        
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <CustomText variant="semiBold" style={styles.currentLevel}>
              Level {kidData.next_milestone.current}
            </CustomText>
            <CustomText variant="semiBold" style={styles.nextLevel}>
              Level {kidData.next_milestone.next}
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
            {kidData.kid_data.next_level_progress.toFixed(0)}% Complete! 
            Keep going! 💪
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
              {getFamilyPositionEmoji(kidData.family_position)}
            </Text>
            <CustomText variant="bold" style={styles.positionText}>
              #{kidData.family_position}
            </CustomText>
            <CustomText variant="medium" style={styles.positionLabel}>
              in your family
            </CustomText>
          </View>
          
          {kidData.family_total_kids > 1 && (
            <CustomText variant="medium" style={styles.familyContext}>
              Out of {kidData.family_total_kids} kids in your family
            </CustomText>
          )}
        </View>
      </View>

      {/* Achievements */}
      {kidData.kid_data.achievements.length > 0 && (
        <View style={styles.achievementsSection}>
          <CustomText variant="semiBold" style={styles.sectionTitle}>
            🏆 Your Achievements
          </CustomText>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.achievementsGrid}>
              {kidData.kid_data.achievements.map((achievement, index) => (
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
              {kidData.kid_data.tasks_completed}
            </CustomText>
            <CustomText variant="medium" style={styles.statLabel}>
              Tasks Done
            </CustomText>
          </View>
          
          <View style={styles.statCard}>
            <MaterialIcons name="public" size={32} color="#FF9800" />
            <CustomText variant="bold" style={styles.statNumber}>
              #{kidData.global_context.rank}
            </CustomText>
            <CustomText variant="medium" style={styles.statLabel}>
              Global Rank
            </CustomText>
          </View>
        </View>
        
        <View style={styles.globalMessage}>
          <CustomText variant="medium" style={styles.globalText}>
            {kidData.global_context.message}
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
    fontSize: responsiveFontSize(6),
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
    fontSize: responsiveFontSize(1.8),
  },
  welcomeText: {
    fontSize: responsiveFontSize(2.5),
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
    fontSize: responsiveFontSize(1.6),
    color: '#2E7D32',
    textAlign: 'center',
    lineHeight: 22,
  },
  earningsSection: {
    paddingHorizontal: responsiveWidth(4),
    marginBottom: responsiveHeight(2),
  },
  sectionTitle: {
    fontSize: responsiveFontSize(2),
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
    fontSize: responsiveFontSize(3.5),
    color: COLORS.primary,
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: responsiveFontSize(1.4),
    color: '#666',
    marginBottom: responsiveHeight(2),
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
    fontSize: responsiveFontSize(1),
  },
  currencyAmount: {
    fontSize: responsiveFontSize(1.4),
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
    fontSize: responsiveFontSize(1.6),
    color: COLORS.primary,
  },
  nextLevel: {
    fontSize: responsiveFontSize(1.6),
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
    fontSize: responsiveFontSize(1.4),
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
    fontSize: responsiveFontSize(4),
    marginBottom: 8,
  },
  positionText: {
    fontSize: responsiveFontSize(2.5),
    color: COLORS.primary,
    marginBottom: 4,
  },
  positionLabel: {
    fontSize: responsiveFontSize(1.4),
    color: '#666',
  },
  familyContext: {
    fontSize: responsiveFontSize(1.3),
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
    fontSize: responsiveFontSize(2.5),
    marginBottom: 8,
  },
  achievementText: {
    fontSize: responsiveFontSize(1.2),
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
    fontSize: responsiveFontSize(2.5),
    color: '#333',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: responsiveFontSize(1.3),
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
    fontSize: responsiveFontSize(1.4),
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
    fontSize: responsiveFontSize(4),
    marginBottom: responsiveHeight(1),
  },
  motivationTitle: {
    fontSize: responsiveFontSize(2),
    color: '#F57F17',
    marginBottom: responsiveHeight(1),
    textAlign: 'center',
  },
  motivationText: {
    fontSize: responsiveFontSize(1.5),
    color: '#F9A825',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default KidRewardsView;
