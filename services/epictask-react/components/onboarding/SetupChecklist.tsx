import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import CustomText from "@/components/CustomText";
import { COLORS } from "@/constants/Colors";
import { FONT_SIZES } from "@/constants/FontSize";
import { router } from "expo-router";

export const SetupChecklist = () => {
  const steps = [
    {
      id: "kid",
      title: "1. Add Your First Kid",
      description: "Create a child profile (managed for <13 or teen invite code).",
      route: "/(parent)/(app)/screens/add-kid",
      actionText: "Add Kid",
    },
    {
      id: "wallet",
      title: "2. Connect Xumm Wallet",
      description: "Link your XRPL wallet to fund task rewards for completed chores.",
      route: "/(parent)/(app)/screens/settings/wallet",
      actionText: "Connect Wallet",
    },
    {
      id: "task",
      title: "3. Assign First Task",
      description: "Create a starter task like 'Make Bed' or 'Read 15 Minutes'.",
      route: "/(parent)/(app)/screens/task/create",
      actionText: "Create Task",
    },
  ];

  return (
    <View style={styles.container}>
      <CustomText variant="bold" style={styles.headerTitle}>
        Parent Onboarding Checklist
      </CustomText>
      <CustomText variant="medium" style={styles.headerSubtitle}>
        Complete these 3 steps to start earning and managing family tasks.
      </CustomText>

      {steps.map((step) => (
        <View key={step.id} style={styles.card}>
          <CustomText variant="semiBold" style={styles.cardTitle}>
            {step.title}
          </CustomText>
          <CustomText variant="medium" style={styles.cardDesc}>
            {step.description}
          </CustomText>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => router.push(step.route as any)}
          >
            <CustomText variant="semiBold" style={{ color: COLORS.white }}>
              {step.actionText}
            </CustomText>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

export default SetupChecklist;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.grey,
  },
  headerTitle: {
    fontSize: FONT_SIZES.large,
    color: COLORS.primary,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.small,
    color: COLORS.grey,
    marginBottom: 12,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.grey,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.black,
  },
  cardDesc: {
    fontSize: FONT_SIZES.small,
    color: COLORS.grey,
    marginVertical: 4,
  },
  btn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 6,
  },
});
