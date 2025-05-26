import React, { ReactNode } from "react";

import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

import { router } from "expo-router";
import { ICONS, IMAGES } from "@/assets";
import { COLORS } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CustomText from "@/components/CustomText";

const ProfileCard = () => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.white,
        borderRadius: 25,
        justifyContent: "space-between",
        paddingVertical: 20,
        paddingHorizontal: 20,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Image
          source={IMAGES.profile}
          style={{ width: responsiveWidth(10), height: responsiveWidth(10) }}
        />
        <CustomText
          variant="semiBold"
          style={{ fontWeight: "500", fontSize: responsiveFontSize(2.5) }}
        >
          Joshua Smith
        </CustomText>
      </View>
      <TouchableOpacity
        onPress={() => {
          router.push("/screens/settings/personal-info" as any);
        }}
      >
        {ICONS.edit}
      </TouchableOpacity>
    </View>
  );
};

const SettingButton = ({
  text,
  onPress,
  icon,
}: {
  text: String;
  onPress?: () => void;
  icon: ReactNode;
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 20,
          paddingHorizontal: 6,
          borderBottomWidth: 1,
          borderBottomColor: "#00000010",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          {icon}
          <Text
            style={{ fontWeight: "500", fontSize: responsiveFontSize(2.3) }}
          >
            {text}
          </Text>
        </View>
        <MaterialIcons name="keyboard-arrow-right" size={20} color="black" />
      </View>
    </TouchableOpacity>
  );
};

const SettingsScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ flexDirection: "row", justifyContent: "center" }}>
        <Text style={{ fontSize: responsiveFontSize(3), fontWeight: "500" }}>
          Settings
        </Text>
      </View>
      <View style={{ paddingVertical: 20, gap: 20 }}>
        <View>
          <ProfileCard />
        </View>
        <View
          style={{
            backgroundColor: COLORS.white,
            borderRadius: 40,
            paddingVertical: 20,
            paddingHorizontal: 20,
          }}
        >
          <SettingButton
            icon={ICONS.SETTINGS.kid_face}
            text={"Kid profiles"}
            onPress={() => {
              router.push("/screens/settings/kid-profiles" as any);
            }}
          />
          <SettingButton
            icon={ICONS.SETTINGS.wallet}
            text={"Wallet"}
            onPress={() => {
              router.push("/screens/settings/wallet" as any);
            }}
          />
          <SettingButton
            icon={ICONS.SETTINGS.lock}
            text={"Password"}
            onPress={() => {
              router.push("/screens/settings/update-password" as any);
            }}
          />
          <SettingButton
            icon={ICONS.SETTINGS.bell}
            text={"Notifications"}
            onPress={() => {
              router.push("/screens/settings/notifications" as any);
            }}
          />
          <Text
            style={{
              paddingVertical: 20,
              fontSize: responsiveFontSize(2),
              fontWeight: "500",
              color: COLORS.grey,
            }}
          >
            Help & Support
          </Text>
          <SettingButton
            icon={ICONS.SETTINGS.get_help}
            text={"Get Help"}
            onPress={() => {}}
          />
          <SettingButton
            icon={ICONS.SETTINGS.user}
            text={"Terms and Conditions"}
            onPress={() => {}}
          />
          <SettingButton
            icon={ICONS.SETTINGS.terms}
            text={"Who We Are"}
            onPress={() => {}}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F6F9",
    height: responsiveHeight(100),
    width: responsiveWidth(100),
    padding: responsiveWidth(4),
  },
});

export default SettingsScreen;
