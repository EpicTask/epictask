import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { COLORS } from "@/constants/Colors";
import { FONT_SIZES } from "@/constants/FontSize";
import CustomText from "@/components/CustomText";
import { responsiveWidth, responsiveHeight } from "react-native-responsive-dimensions";
import { IMAGES } from "@/assets";

interface ActiveStoryCardProps {
  title: string;
  progress: number; // 0 to 1
  onPress: () => void;
  isNew?: boolean;
}

export default function ActiveStoryCard({
  title,
  progress,
  onPress,
  isNew = false,
}: ActiveStoryCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.card}>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image 
            source={IMAGES.story_img_1} 
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{isNew ? "NEW!" : "CONTINUE"}</Text>
          </View>
        </View>
        
        <View style={styles.content}>
          <CustomText variant="bold" style={styles.title}>
            {title}
          </CustomText>
          
          <View style={styles.progressRow}>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
          </View>
          
          <View style={styles.button}>
            <CustomText variant="bold" style={styles.buttonText}>
              {isNew ? "Start Adventure" : "Keep Going!"}
            </CustomText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  container: {
    flexDirection: 'row',
    height: responsiveHeight(18),
  },
  imageContainer: {
    width: '35%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: COLORS.secondary || '#FFC107',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    color: COLORS.black,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary || '#EE4266',
  },
  progressText: {
    fontSize: 12,
    color: COLORS.grey,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: COLORS.primary || '#EE4266',
    paddingVertical: 8,
    borderRadius: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
  },
});
