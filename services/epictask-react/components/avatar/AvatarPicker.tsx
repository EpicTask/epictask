import React from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import { COLORS } from "@/constants/Colors";
import CustomText from "@/components/CustomText";
import { IMAGES } from "@/assets";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";

interface AvatarPickerProps {
  selectedAvatar?: string | null;
  onSelectAvatar: (avatarKey: string) => void;
}

export const AVATAR_OPTIONS = [
  { id: "avatar1", image: IMAGES.profile, label: "Hero" },
  { id: "avatar2", image: IMAGES.profile, label: "Explorer" },
  { id: "avatar3", image: IMAGES.profile, label: "Champion" },
  { id: "avatar4", image: IMAGES.profile, label: "Star" },
];

const AvatarPicker: React.FC<AvatarPickerProps> = ({
  selectedAvatar,
  onSelectAvatar,
}) => {
  return (
    <View style={styles.container}>
      <CustomText variant="semiBold" style={styles.title}>
        Choose Your Avatar
      </CustomText>
      <View style={styles.grid}>
        {AVATAR_OPTIONS.map((item) => {
          const isSelected = selectedAvatar === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.avatarCard,
                isSelected && styles.selectedAvatarCard,
              ]}
              onPress={() => onSelectAvatar(item.id)}
            >
              <Image source={item.image} style={styles.avatarImage} />
              <CustomText
                variant="medium"
                style={[
                  styles.label,
                  isSelected ? styles.selectedLabel : styles.unselectedLabel,
                ]}
              >
                {item.label}
              </CustomText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default AvatarPicker;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: responsiveHeight(2),
  },
  title: {
    fontSize: responsiveFontSize(2.2),
    color: COLORS.primary,
    marginBottom: responsiveHeight(2),
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: responsiveWidth(4),
  },
  avatarCard: {
    padding: responsiveWidth(3),
    borderRadius: responsiveWidth(4),
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.grey,
    alignItems: "center",
    width: responsiveWidth(36),
  },
  selectedAvatarCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.purple,
  },
  avatarImage: {
    width: responsiveWidth(16),
    height: responsiveWidth(16),
    borderRadius: responsiveWidth(8),
    marginBottom: responsiveHeight(1),
  },
  label: {
    fontSize: responsiveFontSize(1.8),
  },
  selectedLabel: {
    color: COLORS.white,
  },
  unselectedLabel: {
    color: COLORS.black,
  },
});
