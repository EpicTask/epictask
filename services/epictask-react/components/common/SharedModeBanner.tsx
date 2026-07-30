import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { COLORS } from '@/constants/Colors';
import { FONT_SIZES } from '@/constants/FontSize';
import { IMAGES } from '@/assets';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import CustomText from '@/components/CustomText';
import { router } from 'expo-router';

const SharedModeBanner = () => {
  const { activeChildContext, exitSharedDeviceMode } = useAuth();

  if (!activeChildContext) return null;

  const handleExit = () => {
    exitSharedDeviceMode();
    router.replace('/(parent)/(app)/(tabs)' as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.userInfo}>
          <Image
            source={activeChildContext.childImageUrl ? { uri: activeChildContext.childImageUrl } : IMAGES.profile}
            style={styles.avatar}
          />
          <CustomText variant="semiBold" style={styles.text}>
            Viewing as {activeChildContext.childName || 'Child'}
          </CustomText>
        </View>
        <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
          <CustomText variant="bold" style={styles.exitText}>
            Exit
          </CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'white',
  },
  text: {
    color: 'white',
    fontSize: FONT_SIZES.medium,
  },
  exitButton: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  exitText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.small,
  },
});

export default SharedModeBanner;
