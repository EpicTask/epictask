import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeading from '@/components/headings/ScreenHeading';
import { Collapsible } from '@/components/Collapsible';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { COLORS } from '@/constants/Colors';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { Ionicons } from '@expo/vector-icons';

const PARENT_FAQS = [
  {
    question: "How do recurring tasks work?",
    answer: "When creating a task, you can select specific days of the week. The task will automatically reappear on the kid's dashboard on those days."
  },
  {
    question: "How do I approve a completed task?",
    answer: "Go to your 'Manage Tasks' tab. Tasks waiting for approval will appear there. You can review the photo proof (if required) and tap 'Approve' to release the rewards."
  },
  {
    question: "How does the XRPL integration work?",
    answer: "EpicTask uses the XRP Ledger to securely process real-value payouts. When your child earns enough points, they can request a payout, which will be processed via your connected XUMM wallet."
  },
  {
    question: "How do I add another child?",
    answer: "Go to your Profile settings and tap 'Add Kid'. You will generate an invite code that your child can use to link their account during their registration."
  }
];

export default function ParentGetHelpScreen() {
  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@epictask.app?subject=EpicTask%20Parent%20Support').catch(() => {
      Alert.alert('Error', 'Unable to open email client. Please email us at support@epictask.app');
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeading text="Get Help" back={true} plus={false} />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Frequently Asked Questions</ThemedText>
          <View style={styles.card}>
            {PARENT_FAQS.map((faq, index) => (
              <View key={index} style={[styles.faqItem, index === PARENT_FAQS.length - 1 && styles.lastFaqItem]}>
                <Collapsible title={faq.question}>
                  <ThemedText style={styles.answerText}>{faq.answer}</ThemedText>
                </Collapsible>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Contact Us</ThemedText>
          
          <TouchableOpacity style={styles.contactButton} onPress={handleEmailSupport}>
            <View style={styles.contactIconContainer}>
              <Ionicons name="mail-outline" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.contactTextContainer}>
              <ThemedText style={styles.contactButtonTitle}>Email Support</ThemedText>
              <ThemedText style={styles.contactButtonSub}>Response time: 24-48 hours</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.grey} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>EpicTask App Version 1.0.0</ThemedText>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F6F9",
    paddingHorizontal: responsiveWidth(4),
    paddingTop: responsiveHeight(2),
  },
  scrollContainer: {
    paddingVertical: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    marginBottom: 10,
    fontSize: 18,
    color: '#333',
    marginLeft: 5,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  faqItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  lastFaqItem: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  answerText: {
    color: '#666',
    lineHeight: 22,
    marginTop: 5,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F6F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactButtonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  contactButtonSub: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#999',
    fontSize: 12,
  }
});
