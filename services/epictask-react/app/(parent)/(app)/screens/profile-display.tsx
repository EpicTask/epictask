import { FONT_SIZES } from "@/constants/FontSize";
import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { AuthContext } from '@/context/AuthContext';
import CustomText from '@/components/CustomText';
import SafeArea from '@/components/SafeArea';
import AuthButton from '@/components/buttons/AuthButton';
import { COLORS } from '@/constants/Colors';
import { ICONS, IMAGES } from '@/assets';
import { router, useFocusEffect } from 'expo-router';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import { Timestamp } from 'firebase/firestore';

const ProfileDisplayScreen = () => {
  const { user } = useContext(AuthContext);
  const [currentUser, setCurrentUser] = useState(user);

  // Update local user state when the context user changes
  useFocusEffect(
    React.useCallback(() => {
      setCurrentUser(user);
    }, [user])
  );

  const formatDate = (dateParam: Timestamp) => {
    if (!dateParam || typeof dateParam.toDate !== 'function') {return 'Not available';}
    const date = dateParam.toDate();
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const ProfileDetailItem = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.detailItem}>
      <CustomText variant="medium" style={styles.detailLabel}>
        {label}
      </CustomText>
      <CustomText variant="regular" style={styles.detailValue}>
        {value}
      </CustomText>
    </View>
  );

  return (
    <SafeArea>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            {ICONS.back_arrow}
          </TouchableOpacity>
          <CustomText
            variant="semiBold"
            style={styles.headerTitle}
          >
            Profile
          </CustomText>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileImageContainer}>
            <Image
              source={currentUser?.imageUrl ? { uri: currentUser.imageUrl } : IMAGES.profile}
              style={styles.profileImage}
            />
          </View>
          
          <View style={styles.profileInfo}>
            <CustomText variant="semiBold" style={styles.profileName}>
              {currentUser?.displayName || 'User Name'}
            </CustomText>
            <CustomText variant="regular" style={styles.profileRole}>
              Parent Account
            </CustomText>
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.section}>
          <CustomText variant="semiBold" style={styles.sectionTitle}>
            Account Details
          </CustomText>
          <View style={styles.card}>
            <ProfileDetailItem 
              label="Full Name" 
              value={currentUser?.displayName || 'Not provided'} 
            />
            <View style={styles.separator} />
            <ProfileDetailItem 
              label="Email Address" 
              value={currentUser?.email || 'Not provided'} 
            />
            <View style={styles.separator} />
            <ProfileDetailItem 
              label="Account Type" 
              value={currentUser?.role || 'Not specified'} 
            />
            <View style={styles.separator} />
            <ProfileDetailItem 
              label="Member Since" 
              value={formatDate(currentUser?.dateCreated ? currentUser.dateCreated : '')} 
            />
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.buttonContainer}>
          <AuthButton
            fill={true}
            text="Edit Profile"
            height={responsiveHeight(6)}
            onPress={() => router.push('/(parent)/(app)/screens/profile' as any)}
          />
        </View>
      </ScrollView>
    </SafeArea>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    marginBottom: responsiveHeight(5),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: responsiveHeight(2),
    marginBottom: responsiveHeight(2),
  },
  backButton: {
    paddingVertical: 10,
    marginRight: responsiveWidth(4),
  },
  headerTitle: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.title,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 25,
    paddingVertical: responsiveHeight(3),
    paddingHorizontal: responsiveWidth(5),
    alignItems: 'center',
    marginBottom: responsiveHeight(3),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileImageContainer: {
    marginBottom: responsiveHeight(2),
  },
  profileImage: {
    width: responsiveWidth(25),
    height: responsiveWidth(25),
    borderRadius: responsiveWidth(12.5),
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: FONT_SIZES.subtitle,
    color: COLORS.black,
    marginBottom: responsiveHeight(0.5),
  },
  profileRole: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.grey,
  },
  section: {
    marginBottom: responsiveHeight(3),
  },
  sectionTitle: {
    fontSize: FONT_SIZES.extraLarge,
    color: COLORS.black,
    marginBottom: responsiveHeight(1.5),
    fontWeight: '600',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingVertical: responsiveHeight(2),
    paddingHorizontal: responsiveWidth(5),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  detailItem: {
    paddingVertical: responsiveHeight(1.5),
  },
  detailLabel: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.grey,
    marginBottom: responsiveHeight(0.5),
  },
  detailValue: {
    fontSize: FONT_SIZES.large,
    color: COLORS.black,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#00000010',
    marginVertical: responsiveHeight(0.5),
  },
  buttonContainer: {
    marginTop: responsiveHeight(2),
    marginBottom: responsiveHeight(3),
  },
});

export default ProfileDisplayScreen;
