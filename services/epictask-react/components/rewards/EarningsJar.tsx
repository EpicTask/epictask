import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import CustomText from '@/components/CustomText';
import { COLORS } from '@/constants/Colors';

interface EarningsJarProps {
  totalCoins: number;
  pendingCoins?: number;
}

const EarningsJar: React.FC<EarningsJarProps> = ({ totalCoins, pendingCoins = 0 }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;

  // Whole coins only. This badge is the 5-7 cohort's entire view of their
  // money, and the source value is a weighted float — a six-year-old was being
  // shown "12.75 coins". Rounded down so the jar never overstates.
  const coins = Math.max(0, Math.floor(totalCoins || 0));
  const pending = Math.max(0, Math.floor(pendingCoins || 0));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.jarContainer, { transform: [{ translateY: floatAnim }] }]}>
        <View style={styles.jar}>
          <MaterialCommunityIcons name="piggy-bank" size={responsiveHeight(20)} color="#FFB74D" />
          <View style={styles.coinCountBadge}>
            <Text style={styles.coinCountText}>{coins}</Text>
          </View>
        </View>
        <CustomText variant="bold" style={styles.label}>My Coins</CustomText>
      </Animated.View>

      {pending > 0 && (
        <View style={styles.pendingSection}>
          <View style={styles.pendingBadge}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="white" />
            <Text style={styles.pendingText}>+{pending} waiting for Mom/Dad</Text>
          </View>
        </View>
      )}

      {pending === 0 && pendingCoins > 0 && (
        <View style={styles.pendingSection}>
          <View style={styles.pendingBadge}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="white" />
            <Text style={styles.pendingText}>Almost a coin on the way!</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  jarContainer: {
    alignItems: 'center',
  },
  jar: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinCountBadge: {
    position: 'absolute',
    backgroundColor: '#FFD54F',
    borderRadius: 30,
    minWidth: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'white',
    bottom: 10,
    right: -10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  coinCountText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F57C00',
  },
  label: {
    fontSize: 28,
    color: '#333',
    marginTop: 10,
  },
  pendingSection: {
    marginTop: 20,
  },
  pendingBadge: {
    backgroundColor: COLORS.primary || '#EE4266',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pendingText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default EarningsJar;
