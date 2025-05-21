import React from "react";
import CustomButton from "../..//buttons/CustomButton";

import { IMAGES } from "@/assets";
import { Fontisto, Ionicons } from "@expo/vector-icons";
import { View, Text, Image, StyleSheet } from "react-native";
import { responsiveHeight } from "react-native-responsive-dimensions";
import CustomText from "@/components/CustomText";

interface KidsCardProps {
  name: string;
  stars: number;
  onPress?: () => void;
  bg?: string;
}

const TaskCard: React.FC<KidsCardProps> = ({ name, stars, onPress, bg }) => {
  return (
    <View style={[styles.card, { backgroundColor: bg }]}>
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <CustomText variant="semiBold" style={styles.name}>{name}</CustomText>
          </View>
          <View style={styles.levelContainer}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={IMAGES.reward}
                style={{
                  height: responsiveHeight(2),
                  width: responsiveHeight(2),
                }}
              />
              <CustomText style={styles.starsText}> {stars}</CustomText>
            </View>
          </View>
        </View>
        <View style={styles.statsContainer}>
          <View
            style={{
              flexDirection: "row",
              gap: 6,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Ionicons name="calendar-outline" size={12} color="black" />
            <CustomText style={styles.statText}>Today 08:30 AM - 10:30 AM</CustomText>
          </View>
          <Fontisto name="link" size={16} color="black" />
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            width: "100%",
            justifyContent: "space-between",
            borderTopColor: "#00000010",
            borderTopWidth: 1,
            paddingTop: 10,
          }}
        >
          <View style={{ flex: 1 }}>
            <CustomButton
              height={responsiveHeight(6)}
              onPress={onPress!}
              text="VIEW"
              fill={false}
            />
          </View>
          <View style={{ flex: 1 }}>
            <CustomButton
              height={responsiveHeight(6)}
              onPress={onPress!}
              text="COMPLETE"
              fill={true}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    overflow: "hidden",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flex: 1,
  },
  avatar: {
    width: responsiveHeight(6),
    height: responsiveHeight(6),
    borderRadius: 30,
    marginBottom: 5,
  },
  name: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },
  levelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 20,
    borderColor: "#00000010",
  },
  levelText: {
    fontSize: 14,
    color: "#6B7280",
    marginRight: 5,
  },
  starsText: {
    fontSize: 14,
    color: "#6B7280",
  },
  statsContainer: {
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexDirection: "row",
    gap: 6,
    width: "100%",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    gap: 10,
  },
  icon: {
    fontSize: 16,
    marginRight: 5,
  },
  statText: {
    fontSize: 12,
    color: "#6B7280",
  },
});

export default TaskCard;
