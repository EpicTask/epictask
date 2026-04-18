import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeading from '@/components/headings/ScreenHeading';
import { ThemedText } from '@/components/ThemedText';
import { COLORS } from '@/constants/Colors';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';

export default function ParentWhoWeAreScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeading text="Who We Are" back={true} plus={false} />
      
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        <View style={styles.card}>
          <ThemedText style={styles.heading}>Welcome to EpicTask</ThemedText>
          <ThemedText style={styles.paragraph}>
            EpicTask is an innovative platform designed to bridge the gap between financial literacy, gamification, and family collaboration. We believe that learning essential life skills like responsibility, budgeting, and goal-setting should be engaging, rewarding, and fun.
          </ThemedText>
          
          <ThemedText style={styles.heading}>Our Mission</ThemedText>
          <ThemedText style={styles.paragraph}>
            Our mission is to empower the next generation with practical money management skills while helping parents build positive habits within the household. By combining real-world tasks with interactive narratives and tangible rewards, we transform everyday chores into epic adventures.
          </ThemedText>

          <ThemedText style={styles.heading}>Why We Built This</ThemedText>
          <ThemedText style={styles.paragraph}>
            We built EpicTask because traditional methods of teaching financial literacy often fall short. Children learn best through experience and play. Our unique integration of a dynamic narrative engine and real-world value systems ensures that kids aren't just completing tasks—they are earning, managing, and understanding the value of their efforts.
          </ThemedText>
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>© {new Date().getFullYear()} EpicTask.</ThemedText>
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
    backgroundColor: "#F1F6F9",
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
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
    marginTop: 10,
  },
  paragraph: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginBottom: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    color: COLORS.grey,
    fontSize: 14,
  }
});