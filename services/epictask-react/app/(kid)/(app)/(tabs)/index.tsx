import Heading from "@/components/headings/Heading";
import TaskCard from "@/components/cards/kid/TaskCard";
import ProgressCard from "@/components/cards/ProgressCard";
import * as Progress from "react-native-progress";

import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

import { ICONS, IMAGES } from "@/assets";
import { COLORS } from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import CustomText from "@/components/CustomText";
import KidArrowIcon from "@/assets/icons/KidArrow";
import React from "react";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={{ gap: 10 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 1 }}>
              <CustomText
                variant="semiBold"
                style={{ fontSize: responsiveFontSize(4) }}
              >
                Hello,
              </CustomText>
              <CustomText
                variant="semiBold"
                style={{ fontSize: responsiveFontSize(3.7), fontWeight: "500" }}
              >
                Kai Kai! 👋
              </CustomText>
              <CustomText style={{ paddingRight: 40, color: COLORS.grey }}>
                Ready for some fun tasks and rewards today?
              </CustomText>
            </View>
            <View style={{}}>
              <View
                style={{
                  padding: 14,
                  backgroundColor: "white",
                  borderRadius: responsiveWidth(100),
                }}
              >
                {ICONS.SETTINGS.bell}
              </View>
            </View>
          </View>
          <View style={{ paddingVertical: 10 }}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ width: responsiveWidth(44), height: 165 }}>
                <View style={{}}>{ICONS.kidCard}</View>
                <View
                  style={{
                    position: "absolute",
                    width: 160,
                    paddingTop: 10,
                    gap: 4,
                    paddingLeft: 10,
                  }}
                >
                  <CustomText style={{}} variant="semiBold">
                    You have 3 tasks today!
                  </CustomText>
                  <View>
                    <Progress.Circle
                      size={40}
                      progress={0.7}
                      thickness={3}
                      color={COLORS.purple}
                      unfilledColor="#E5E7EB"
                      borderWidth={0}
                      showsText={true}
                      formatText={() => `${Math.round(0.7 * 100)}%`}
                      textStyle={{
                        fontSize: 12,
                        fontWeight: "semibold",
                        color: COLORS.purple,
                      }}
                    />
                    <View
                      style={{
                        gap: 4,
                      }}
                    >
                      <CustomText
                        variant="semiBold"
                        style={[styles.completedText, { fontSize: 10 }]}
                      >
                        Completed
                      </CustomText>
                      <Text style={styles.fractionText}>{`${7}/${10}`}</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={{ position: "absolute", bottom: 6, right: 0 }}
                >
                  {ICONS.kidArrow}
                </TouchableOpacity>
              </View>
              <View style={{ width: responsiveWidth(44), height: 165 }}>
                <View style={{}}>{ICONS.kidCard}</View>
                <View
                  style={{
                    position: "absolute",
                    gap: 20,
                    width: 160,
                    paddingTop: 10,
                    paddingLeft: 10,
                  }}
                >
                  <CustomText style={{}} variant="semiBold">
                    You've Earned!
                  </CustomText>
                  <View>
                    <Image
                      source={IMAGES.reward}
                      style={{ width: 50, height: 50 }}
                    />
                    <View
                      style={{
                        justifyContent: "center",
                        gap: 4,
                      }}
                    >
                      <CustomText
                        variant="semiBold"
                        style={[styles.completedText, { fontSize: 14 }]}
                      >
                        150 Stars!
                      </CustomText>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={{ position: "absolute", bottom: 6, right: 0 }}
                >
                  <KidArrowIcon fill={COLORS.secondary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={{ gap: 10, paddingVertical: 6 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 4,
              }}
            >
              <CustomText
                style={{
                  fontSize: responsiveFontSize(2.7),
                  color: COLORS.black,
                  fontWeight: "500",
                }}
                variant="semiBold"
              >
                Upcoming Tasks
              </CustomText>
              <TouchableOpacity
                onPress={() => {
                  router.push("/screens/task");
                }}
              >
                <CustomText
                  style={{
                    fontSize: responsiveFontSize(2),
                    color: COLORS.grey,
                    fontWeight: "400",
                  }}
                >
                  See All
                </CustomText>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}></View>
            {Array(1)
              .fill(0)
              .map((_, index) => (
                <TaskCard
                  bg={COLORS.light_purple}
                  key={index}
                  name="Prepare your breakfast"
                  stars={55}
                />
              ))}
            <TaskCard
              bg={COLORS.light_green}
              name="Prepare your breakfast"
              stars={55}
            />
            <TaskCard
              bg={COLORS.light_yellow}
              name="Prepare your breakfast"
              stars={55}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
    marginBottom: 50,
  },
  container1: {
    backgroundColor: "white",
    borderColor: "#EAEBEC",
    borderRadius: 28,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  percentageText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  completedText: {
    marginTop: 10,
    fontWeight: "semibold",
    fontSize: 16,
    color: COLORS.grey,
  },
  fractionText: {
    fontSize: 14,
    color: "#000",
  },
});
