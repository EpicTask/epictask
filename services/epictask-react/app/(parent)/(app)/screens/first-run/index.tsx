import React from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomText from "@/components/CustomText";
import { COLORS } from "@/constants/Colors";
import { FONT_SIZES } from "@/constants/FontSize";
import ScreenHeading from "@/components/headings/ScreenHeading";
import AuthButton from "@/components/buttons/AuthButton";
import { router } from "expo-router";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

const SetupChecklistScreen = () => {
  const steps = [
    {
      title: "1. Add Your First Kid",
      description: "Create a managed profile or send an invite code to your teen child.",
      actionText: "Add Kid",
      route: "/(parent)/(app)/screens/add-kid",
      completed: false,
    },
    {
      title: "2. Connect Xumm Wallet",
      description: "Link your XRPL wallet so payouts for completed chores process smoothly.",
      actionText: "Connect Wallet",
      route: "/(parent)/(app)/screens/settings/wallet",
      completed: false,
    },
    {
      title: "3. Assign First Task Template",
      description: "Pick a starter chore (e.g. 'Make Bed', 'Read 15 Mins') for your child.",
      actionText: "Create Task",
      route: "/(parent)/(app)/screens/task/create",
      completed: false,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeading text="Setup Checklist" back={true} plus={false} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ flex: 1, paddingVertical: 16 }}>
          <CustomText
            variant="semiBold"
            style={{ fontSize: FONT_SIZES.display, color: COLORS.purple }}
          >
            Welcome to EpicTask!
          </CustomText>
          <CustomText
            variant="medium"
            style={{ fontSize: FONT_SIZES.small, color: COLORS.grey, marginTop: 4, marginBottom: 20 }}
          >
            Complete these 3 quick setup steps to get your household running.
          </CustomText>

          {steps.map((item, index) => (
            <View key={index} style={styles.card}>
              <CustomText variant="semiBold" style={{ fontSize: FONT_SIZES.medium, color: COLORS.black }}>
                {item.title}
              </CustomText>
              <CustomText variant="medium" style={{ fontSize: FONT_SIZES.small, color: COLORS.grey, marginVertical: 6 }}>
                {item.description}
              </CustomText>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => router.push(item.route as any)}
              >
                <CustomText variant="semiBold" style={{ color: COLORS.white }}>
                  {item.actionText}
                </CustomText>
              </TouchableOpacity>
            </View>
          ))}

          <View style={{ marginTop: 20 }}>
            <AuthButton
              fill={true}
              text="Go to Parent Dashboard"
              height={responsiveHeight(6)}
              onPress={() => router.replace("/(parent)/(app)/(tabs)")}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SetupChecklistScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: responsiveWidth(6),
  },
  card: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.grey,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  actionBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 8,
  },
});
