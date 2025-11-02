import React from "react";
import Divider from "../Divider/Divider";

import { IMAGES } from "@/assets";
import { useRouter } from "expo-router";
import { COLORS } from "@/constants/Colors";
import { responsiveHeight } from "react-native-responsive-dimensions";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { View, Text, Image, StyleSheet } from "react-native";
import DebouncedTouchableOpacity from "../buttons/DebouncedTouchableOpacity";
import CustomText from "../CustomText";

interface KidsCardProps {
  name: string;
  level: number;
  stars: number;
  completed: number;
  pending: number;
  uid?: string;
}

const KidsCard: React.FC<KidsCardProps> = ({
  name,
  level,
  stars,
  completed,
  pending,
  uid,
}) => {
  const router = useRouter();
  return (
    <DebouncedTouchableOpacity
      style={{ flex: 1 }}
      onPress={() => {
        const params = new URLSearchParams({
          name: name,
          level: level.toString(),
          stars: stars.toString(),
          completed: completed.toString(),
          pending: pending.toString(),
          ...(uid && { uid: uid })
        });
        router.push(`/screens/kid-profile?${params.toString()}` as any);
      }}
    >
      <View style={styles.card}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Image source={IMAGES.profile} style={styles.avatar} />
          <CustomText variant="semiBold" style={styles.name}>{name}</CustomText>
        </View>
        <View style={styles.levelContainer}>
          <CustomText variant="medium" style={styles.levelText}>Level {level}</CustomText>
          <View style={{height: 4, width: 4, borderRadius: 100, backgroundColor:COLORS.grey}} />
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
        <Divider />
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <AntDesign name="check-circle" size={14} color="#929292" />
            <CustomText variant="medium" style={styles.statText}>{completed} Completed</CustomText>
          </View>
          <View style={styles.statRow}>
            <MaterialCommunityIcons name="clock" size={18} color="#D2CDCC" />
            <CustomText variant="medium" style={styles.statText}>{pending} Pending</CustomText>
          </View>
        </View>
      </View>
    </DebouncedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    flex: 1,
  },
  avatar: {
    width: responsiveHeight(5),
    height: responsiveHeight(5),
    borderRadius: 30,
    marginBottom: 8,
  },
  name: {
    fontSize: 12,
    fontWeight: "500",
    color: "#000",
  },
  levelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  levelText: {
    fontSize: 12,
    color: COLORS.grey,
    marginRight: 5,
  },
  starsText: {
    fontSize: 12,
    color: COLORS.grey,
  },
  statsContainer: {
    alignItems: "flex-start",
    width: "100%",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
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

export default KidsCard;
