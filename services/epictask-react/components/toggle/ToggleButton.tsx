import { COLORS } from '@/constants/Colors';
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';

interface ToggleButtonProps {
  onToggle?: (isOn: boolean) => void; 
}

const ToggleButton = ({ onToggle }: ToggleButtonProps) => {
  const [isOn, setIsOn] = useState(false);
  const slideAnim = useState(new Animated.Value(0))[0]; 
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOn ? 1 : 0, 
      duration: 200, 
      useNativeDriver: true,
    }).start();
  }, [isOn, slideAnim]);

  const handleToggle = () => {
    setIsOn((prev) => {
      const newState = !prev;
      if (onToggle) {
        onToggle(newState); 
      }
      return newState;
    });
  };

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  return (
    <TouchableOpacity onPress={handleToggle} style={styles.container}>
      <View style={[styles.track, isOn ? styles.trackOn : styles.trackOff]}>
        <Animated.View style={[styles.dot, { transform: [{ translateX }] }]} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  track: {
    width: 48,
    height: 24, 
    borderRadius: 12,
    justifyContent: 'center',
    padding: 2,
  },
  trackOff: {
    backgroundColor: '#808080',
  },
  trackOn: {
    backgroundColor: COLORS.primary,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
});

export default ToggleButton;
