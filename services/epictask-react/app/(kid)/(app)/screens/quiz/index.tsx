import { FONT_SIZES } from "@/constants/FontSize";
import React, { useState } from "react";
import CustomButton from "@/components/buttons/CustomButton";

import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ICONS, IMAGES } from "@/assets";
import { router } from "expo-router";
import { COLORS } from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5, Fontisto, Ionicons } from "@expo/vector-icons";
import CustomText from "@/components/CustomText";

const Option = () => {
  const [check, setSheck] = useState(false);
  return (
    <View
      style={{
        flexDirection: "row",
        paddingHorizontal: 20,
        borderRadius: 20,
        paddingVertical: 20,
        backgroundColor: "#5E60CE1A",
        borderWidth: 1,
        borderColor: COLORS.secondary,
        justifyContent: "space-between",
      }}
    >
      <CustomText variant="semiBold">Hirohsi Yoshida</CustomText>
      <TouchableOpacity
        onPress={() => {
          setSheck(!check);
        }}
      >
        {check ? (
          <FontAwesome5 name="check-circle" size={20} color={COLORS.secondary} />
        ) : (
          <Fontisto name="radio-btn-passive" size={20} color="black" />
        )}
      </TouchableOpacity>
    </View>
  );
};

const Header = ({ serial }: { serial: number }) => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
      }}
    >
      <View>
        <Ionicons
          onPress={() => {
            router.back();
          }}
          name="close"
          size={24}
          color="black"
        />
      </View>
      <View>
        <CustomText
        variant="semiBold"
          style={{
            backgroundColor: COLORS.secondary,
            paddingVertical: 10,
            paddingHorizontal:14,
            borderRadius: 12,
            color: COLORS.white,
          }}
        >
          45
        </CustomText>
      </View>
      <View style={{flexDirection:"row", alignItems:"center", gap:4}}>
        {ICONS.quizInfo}
        <CustomText>{serial} / 4</CustomText>
      </View>
    </View>
  );
};

const Quiz = () => {
  const [step, setStep] = useState(0);
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header serial={step} />
        <View style={{ flex: 1, justifyContent: "space-between", gap: 10 }}>
          <View style={{}}>
            <CustomText
            variant="semiBold"
              style={{
                fontSize: FONT_SIZES.title,
                paddingHorizontal: 20,
                textAlign: "center",
              }}
            >
              Can you name this artist who blends classic Japanese styles with
              modern pop?
            </CustomText>
          </View>
          <Image
            source={IMAGES.explore}
            style={{ height: 200, width: "100%", borderRadius: 20 }}
          />
          <View style={{ paddingVertical: 10, gap: 10 }}>
            <Option />
            <Option />
            <Option />
          </View>
          {step !== 4 && (
            <CustomButton
              fill={true}
              onPress={() => {
                setStep(step + 1);
              }}
              text="Submit Your Answer 🔓"
              height={responsiveHeight(8)}
            />
          )}
          {step == 4 && (
            <CustomButton
              fill={true}
              onPress={() => {
                router.back();
              }}
              text="Finish the Quiz 🔓"
              height={responsiveHeight(8)}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Quiz;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: responsiveWidth(4),
    backgroundColor: "#F1F6F9",
    height: responsiveHeight(100),
    width: responsiveWidth(100),
  },
  container: {
    flex: 1,
  },
});
