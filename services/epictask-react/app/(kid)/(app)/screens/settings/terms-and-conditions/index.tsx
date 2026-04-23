import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeading from '@/components/headings/ScreenHeading';
import { ThemedText } from '@/components/ThemedText';
import { COLORS } from '@/constants/Colors';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';

export default function KidTermsAndConditionsScreen() {
  const year = new Date().getFullYear();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeading text="Terms and Conditions" back={true} plus={false} />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

        <View style={styles.card}>
          <ThemedText style={styles.lastUpdated}>Last updated: January 1, {year}</ThemedText>

          <ThemedText style={styles.heading}>1. Acceptance of Terms</ThemedText>
          <ThemedText style={styles.paragraph}>
            By using EpicTask, you agree to these Terms and Conditions. EpicTask is designed for children ages 5–18 and is managed by a parent or legal guardian. If you have questions about these terms, ask your parent or guardian.
          </ThemedText>

          <ThemedText style={styles.heading}>2. Your Account</ThemedText>
          <ThemedText style={styles.paragraph}>
            Your EpicTask account was created and is managed by your parent or guardian. Keep your PIN private and do not share it with others. Your parent is responsible for your use of the app.
          </ThemedText>

          <ThemedText style={styles.heading}>3. Tasks and Rewards</ThemedText>
          <ThemedText style={styles.paragraph}>
            Tasks are assigned to you by your parent. Completing tasks earns you rewards in the form of digital tokens or XRP cryptocurrency. All rewards must be approved by your parent before they are sent. EpicTask does not guarantee the value of any digital reward.
          </ThemedText>

          <ThemedText style={styles.heading}>4. Story Content</ThemedText>
          <ThemedText style={styles.paragraph}>
            EpicTask includes interactive stories designed to help you learn. Story content is chosen based on your age group. Your parent can adjust what stories are available to you through their settings.
          </ThemedText>

          <ThemedText style={styles.heading}>5. Your Privacy</ThemedText>
          <ThemedText style={styles.paragraph}>
            We take your privacy seriously. EpicTask follows children's privacy laws (COPPA) and only collects information needed to run the app. We do not share your personal information with advertisers. Your parent can ask us to delete your data at any time.
          </ThemedText>

          <ThemedText style={styles.heading}>6. Acceptable Use</ThemedText>
          <ThemedText style={styles.paragraph}>
            Use EpicTask fairly and honestly. Do not try to cheat to earn rewards, and do not use the app for anything your parent hasn't approved. We may suspend accounts that misuse the platform.
          </ThemedText>

          <ThemedText style={styles.heading}>7. Contact Us</ThemedText>
          <ThemedText style={styles.paragraph}>
            If you or your parent have questions about these Terms, please contact us at support@epictask.app.
          </ThemedText>
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>© {year} EpicTask.</ThemedText>
          <ThemedText style={styles.footerText}>Owned and operated by Kai Technologies Corp.</ThemedText>
          <ThemedText style={styles.footerText}>All rights reserved.</ThemedText>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F1F6F9',
    paddingHorizontal: responsiveWidth(4),
    paddingTop: responsiveHeight(2),
  },
  scrollContainer: {
    paddingVertical: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 30,
  },
  lastUpdated: {
    fontSize: 13,
    color: COLORS.grey,
    marginBottom: 20,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
    marginTop: 16,
  },
  paragraph: {
    fontSize: 15,
    color: '#444',
    lineHeight: 23,
    marginBottom: 12,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    color: COLORS.grey,
    fontSize: 14,
  },
});
