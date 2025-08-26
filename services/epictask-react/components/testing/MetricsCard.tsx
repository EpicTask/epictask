import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/Colors';
import { responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';

interface MetricsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  color?: string;
  icon?: string;
  onPress?: () => void;
  loading?: boolean;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    percentage: number;
  };
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  subtitle,
  color = COLORS.primary,
  icon,
  onPress,
  loading = false,
  trend,
}) => {
  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up': return '#44AA44';
      case 'down': return '#FF4444';
      default: return COLORS.grey;
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  const CardContent = () => (
    <View style={[styles.container, { borderLeftColor: color }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={styles.title}>{title}</Text>
        </View>
        {trend && (
          <View style={[styles.trendContainer, { backgroundColor: getTrendColor(trend.direction) }]}>
            <Text style={styles.trendIcon}>{getTrendIcon(trend.direction)}</Text>
            <Text style={styles.trendText}>{trend.percentage}%</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.value, { color }]}>
          {loading ? '...' : value}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.touchable}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
};

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
    minWidth: '45%',
  },
  container: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: responsiveFontSize(2),
    marginRight: 8,
  },
  title: {
    fontSize: responsiveFontSize(1.6),
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  trendIcon: {
    fontSize: responsiveFontSize(1.2),
    color: 'white',
  },
  trendText: {
    fontSize: responsiveFontSize(1.2),
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  value: {
    fontSize: responsiveFontSize(2.8),
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: responsiveFontSize(1.4),
    color: '#999',
    lineHeight: 18,
  },
});

export default MetricsCard;
