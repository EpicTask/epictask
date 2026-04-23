import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeading from '@/components/headings/ScreenHeading';
import { ThemedText } from '@/components/ThemedText';
import { COLORS } from '@/constants/Colors';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';

export default function ParentTermsAndConditionsScreen() {
  const year = new Date().getFullYear();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeading text="Terms and Conditions" back={true} plus={false} />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

        <View style={styles.card}>
          <ThemedText style={styles.lastUpdated}>Last updated: January 1, {year}</ThemedText>

          <ThemedText style={styles.heading}>1. Acceptance of Terms</ThemedText>
          <ThemedText style={styles.paragraph}>
            By creating an account or using EpicTask, you agree to these Terms and Conditions in full. If you do not agree, please do not use the app. These terms apply to all users, including parents and children using the platform under parental supervision.
          </ThemedText>

          <ThemedText style={styles.heading}>2. Eligibility and Parental Consent</ThemedText>
          <ThemedText style={styles.paragraph}>
            EpicTask is intended for use by families. Parent accounts require users to be 18 years of age or older. Child accounts must be created and managed by a parent or legal guardian. By creating a child account, you confirm you are the parent or legal guardian of that child and consent to their use of the platform.
          </ThemedText>

          <ThemedText style={styles.heading}>3. User Responsibilities</ThemedText>
          <ThemedText style={styles.paragraph}>
            You are responsible for maintaining the confidentiality of your account credentials, including your PIN. You agree not to share your account with others or use the platform for any unlawful purpose. Parents are responsible for supervising their children's use of EpicTask.
          </ThemedText>

          <ThemedText style={styles.heading}>4. Children's Privacy (COPPA)</ThemedText>
          <ThemedText style={styles.paragraph}>
            EpicTask complies with the Children's Online Privacy Protection Act (COPPA). We collect only the minimum personal information necessary to operate the service for child accounts. We do not sell or share children's personal data with third parties for marketing purposes. Parents may request the deletion of their child's data at any time by contacting us.
          </ThemedText>

          <ThemedText style={styles.heading}>5. Digital Rewards and Payments</ThemedText>
          <ThemedText style={styles.paragraph}>
            EpicTask facilitates XRP cryptocurrency rewards for task completion. By enabling payments, you acknowledge that cryptocurrency transactions are irreversible and subject to network fees. EpicTask is not a financial institution and does not guarantee the value of any digital asset. Parents are solely responsible for authorizing and reviewing all payment transactions. All payments require explicit parent approval.
          </ThemedText>

          <ThemedText style={styles.heading}>6. Narrative Learning Content</ThemedText>
          <ThemedText style={styles.paragraph}>
            EpicTask provides AI-generated story content designed for children ages 5–18. Content is filtered by age group, but EpicTask does not guarantee that all content will be appropriate for every child. Parents can review and restrict narrative content through the Narrative Learning settings.
          </ThemedText>

          <ThemedText style={styles.heading}>7. Intellectual Property</ThemedText>
          <ThemedText style={styles.paragraph}>
            All content, branding, and software within EpicTask is the property of Kai Technologies Corp. You may not reproduce, distribute, or create derivative works without our express written permission.
          </ThemedText>

          <ThemedText style={styles.heading}>8. Limitation of Liability</ThemedText>
          <ThemedText style={styles.paragraph}>
            EpicTask and Kai Technologies Corp are not liable for any indirect, incidental, or consequential damages arising from your use of the platform, including losses related to cryptocurrency transactions. Our total liability shall not exceed the amount you paid to us in the twelve months preceding the claim.
          </ThemedText>

          <ThemedText style={styles.heading}>9. Termination</ThemedText>
          <ThemedText style={styles.paragraph}>
            We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or otherwise misuse the platform. You may delete your account at any time through the app settings.
          </ThemedText>

          <ThemedText style={styles.heading}>10. Changes to These Terms</ThemedText>
          <ThemedText style={styles.paragraph}>
            We may update these Terms and Conditions from time to time. We will notify you of significant changes through the app. Continued use of EpicTask after changes are posted constitutes acceptance of the revised terms.
          </ThemedText>

          <ThemedText style={styles.heading}>11. Contact Us</ThemedText>
          <ThemedText style={styles.paragraph}>
            If you have questions about these Terms, please contact us at support@epictask.app.
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
