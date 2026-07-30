import React, { useState } from "react";
import {
  Modal,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { BlurView } from "expo-blur";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CustomText from "@/components/CustomText";
import { COLORS } from "@/constants/Colors";
import { FONT_SIZES } from "@/constants/FontSize";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import {
  MoneyMoment,
  MoneyMomentChoice,
} from "@/api/narrativeService";

interface MoneyMomentCardProps {
  visible: boolean;
  moment: MoneyMoment;
  onComplete: (choice: MoneyMomentChoice) => void;
}

type Phase = "prompt" | "outcome";

const REWARD_ICON: Record<MoneyMomentChoice["rewardType"], string> = {
  badge: "shield-star",
  sticker: "sticker-emoji",
  coin_animation: "star-four-points",
  collectible: "treasure-chest",
};

const MoneyMomentCard: React.FC<MoneyMomentCardProps> = ({
  visible,
  moment,
  onComplete,
}) => {
  const [phase, setPhase] = useState<Phase>("prompt");
  const [selected, setSelected] = useState<MoneyMomentChoice | null>(null);

  const handleChoice = (choice: MoneyMomentChoice) => {
    setSelected(choice);
    setPhase("outcome");
  };

  const handleContinue = () => {
    if (!selected) return;
    const completedChoice = selected;
    setPhase("prompt");
    setSelected(null);
    onComplete(completedChoice);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} />
        <View style={styles.container}>
          {phase === "prompt" ? (
            <ScrollView
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.conceptPill}>
                <CustomText variant="bold" style={styles.conceptPillText}>
                  {moment.title}
                </CustomText>
              </View>

              <CustomText style={styles.definition}>
                {moment.simpleDefinition}
              </CustomText>

              <View style={styles.scenarioBox}>
                <CustomText style={styles.scenario}>
                  {moment.scenario}
                </CustomText>
              </View>

              <CustomText variant="semiBold" style={styles.choicesHeader}>
                What should they do?
              </CustomText>

              <View style={styles.choices}>
                {moment.choices.map((choice) => (
                  <TouchableOpacity
                    key={choice.id}
                    style={styles.choiceButton}
                    onPress={() => handleChoice(choice)}
                    activeOpacity={0.85}
                    accessibilityLabel={choice.label}
                  >
                    <CustomText variant="bold" style={styles.choiceText}>
                      {choice.label}
                    </CustomText>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          ) : (
            selected && (
              <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.rewardIconWrap}>
                  <MaterialCommunityIcons
                    name={REWARD_ICON[selected.rewardType] as any}
                    size={responsiveHeight(10)}
                    color={COLORS.purple}
                  />
                </View>

                <CustomText style={styles.outcome}>
                  {selected.resultText}
                </CustomText>

                <View style={styles.rewardBadge}>
                  <CustomText variant="bold" style={styles.rewardBadgeText}>
                    You earned: {selected.rewardId.replace(/_/g, " ")}
                  </CustomText>
                </View>

                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={handleContinue}
                  activeOpacity={0.85}
                  accessibilityLabel="Continue the story"
                >
                  <CustomText variant="bold" style={styles.continueText}>
                    Continue
                  </CustomText>
                </TouchableOpacity>
              </ScrollView>
            )
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  container: {
    width: responsiveWidth(90),
    maxHeight: responsiveHeight(85),
    backgroundColor: "white",
    borderRadius: 30,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 20,
  },
  content: {
    alignItems: "center",
    gap: 16,
    paddingVertical: 8,
  },
  conceptPill: {
    backgroundColor: COLORS.light_purple,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  conceptPillText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.purple,
  },
  definition: {
    fontSize: FONT_SIZES.large,
    color: COLORS.black,
    textAlign: "center",
    lineHeight: responsiveHeight(3.5),
  },
  scenarioBox: {
    width: "100%",
    backgroundColor: COLORS.bg,
    borderRadius: 16,
    padding: 16,
  },
  scenario: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.black,
    textAlign: "center",
    lineHeight: responsiveHeight(3),
  },
  choicesHeader: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.grey,
    marginTop: 4,
  },
  choices: {
    width: "100%",
    gap: 12,
  },
  choiceButton: {
    width: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: responsiveHeight(2.2),
    paddingHorizontal: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  choiceText: {
    color: "white",
    fontSize: FONT_SIZES.large,
    textAlign: "center",
  },
  rewardIconWrap: {
    marginTop: 8,
  },
  outcome: {
    fontSize: FONT_SIZES.large,
    color: COLORS.black,
    textAlign: "center",
    lineHeight: responsiveHeight(3.5),
    paddingHorizontal: 8,
  },
  rewardBadge: {
    backgroundColor: "#FFF9C4",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  rewardBadgeText: {
    color: "#B26A00",
    fontSize: FONT_SIZES.medium,
    textTransform: "capitalize",
  },
  continueButton: {
    width: "100%",
    backgroundColor: COLORS.success,
    borderRadius: 16,
    paddingVertical: responsiveHeight(2.2),
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  continueText: {
    color: "white",
    fontSize: FONT_SIZES.large,
  },
});

export default MoneyMomentCard;
