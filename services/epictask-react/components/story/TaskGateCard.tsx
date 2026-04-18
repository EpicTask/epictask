import React from "react";
import { View, Image, StyleSheet } from "react-native";
import CustomText from "../CustomText";
import { COLORS } from "@/constants/Colors";
import { IMAGES } from "@/assets";
import { responsiveHeight } from "react-native-responsive-dimensions";

interface TaskGateCardProps {
  name: string;
  stars: number;
}

const TaskGateCard: React.FC<TaskGateCardProps> = ({ name, stars }) => {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <CustomText variant="bold" style={styles.name}>
          {name}
        </CustomText>
        <View style={styles.rewardContainer}>
          <Image
            source={IMAGES.reward}
            style={styles.rewardIcon}
          />
          <CustomText variant="bold" style={styles.starsText}>
            {stars}
          </CustomText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    color: COLORS.black,
    flex: 1,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  rewardIcon: {
    height: 20,
    width: 20,
  },
  starsText: {
    fontSize: 16,
    color: '#FBC02D',
  },
});

export default TaskGateCard;
