import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeading from '@/components/headings/ScreenHeading';
import { ThemedText } from '@/components/ThemedText';
import { COLORS } from '@/constants/Colors';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { Ionicons } from '@expo/vector-icons';
import { userService } from '@/api/userService';

const KID_TIPS = [
  {
    title: "How do I finish a task?",
    body: "Tap on a task on your home screen, take a picture of what you did (if your parent asked for one), and tap 'Done'!",
    icon: "checkmark-circle"
  },
  {
    title: "When do I get my rewards?",
    body: "After you finish a task, your parent needs to check it. Once they say it looks good, you get your points!",
    icon: "star"
  },
  {
    title: "How do I get real money?",
    body: "Save up your points! When you have enough, you can go to the Wallet screen and ask your parent to trade points for money.",
    icon: "wallet"
  }
];

export default function KidGetHelpScreen() {
  const [askingParent, setAskingParent] = useState(false);

  const handleAskParent = async () => {
    // Prevent multiple taps
    if (askingParent) return;

    setAskingParent(true);
    
    try {
      await userService.askParentForHelp();
      Alert.alert(
        "Message Sent!", 
        "Your parent has been notified that you need help. They will check on you soon!",
        [{ text: "Awesome!" }]
      );
    } catch (error: any) {
      Alert.alert(
        "Oops!", 
        error.message || "We couldn't send the message to your parent right now. Please try again later.",
        [{ text: "Okay" }]
      );
    } finally {
      setAskingParent(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeading text="Get Help" back={true} plus={false} />
      
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Main Action Banner */}
        <TouchableOpacity 
          style={styles.askParentCard} 
          onPress={handleAskParent}
          activeOpacity={0.8}
        >
          <View style={styles.askParentContent}>
            {askingParent ? (
              <ActivityIndicator color={COLORS.white} size="large" />
            ) : (
              <>
                <View style={styles.askIconCircle}>
                  <Ionicons name="hand-right" size={32} color={COLORS.primary} />
                </View>
                <ThemedText style={styles.askParentTitle}>I Need Help!</ThemedText>
                <ThemedText style={styles.askParentSub}>Tap here to send a message to your parent</ThemedText>
              </>
            )}
          </View>
        </TouchableOpacity>

        {/* Mini FAQs / Tips */}
        <View style={styles.tipsSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Quick Tips</ThemedText>
          
          {KID_TIPS.map((tip, index) => (
            <View key={index} style={styles.tipCard}>
              <View style={styles.tipIconContainer}>
                <Ionicons name={tip.icon as any} size={28} color={COLORS.secondary} />
              </View>
              <View style={styles.tipTextContainer}>
                <ThemedText style={styles.tipTitle}>{tip.title}</ThemedText>
                <ThemedText style={styles.tipBody}>{tip.body}</ThemedText>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FBFC", // Slightly softer blue for kids
    paddingHorizontal: responsiveWidth(4),
    paddingTop: responsiveHeight(2),
  },
  scrollContainer: {
    paddingVertical: 20,
    paddingBottom: 40,
  },
  askParentCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 30,
  },
  askParentContent: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
  },
  askIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  askParentTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  askParentSub: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    textAlign: 'center',
  },
  tipsSection: {
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#333',
    marginBottom: 15,
    fontWeight: 'bold',
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    alignItems: 'flex-start',
  },
  tipIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF4E5', // Soft orange/yellow background for icon
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  tipTextContainer: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  tipBody: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  }
});
