import { ICONS, IMAGES } from "@/assets";
import Search from "@/components/search/Search";
import CustomText from "@/components/CustomText";

import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  ImageBackground,
} from "react-native";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

import { COLORS } from "@/constants/Colors";
import { AntDesign } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";

const RewardHistoryComponent = () => {
  return (
    <View style={{ gap: 4, width: responsiveWidth(70) }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <AntDesign name="checkcircle" size={20} color="#0ECC44" />
        <CustomText
          style={{ color: "#000", fontSize: responsiveFontSize(1.7) }}
          variant="medium"
        >
          The child has completed their assigned tasks and received rewards.
        </CustomText>
      </View>
      <View style={{ gap: responsiveWidth(2), marginLeft: 28 }}>
        <CustomText
          style={{ color: COLORS.grey, fontSize: 12 }}
          variant="medium"
        >
          April 3rd at 6:35 PM
        </CustomText>
      </View>
    </View>
  );
};

const Achievement = () => {
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: COLORS.primary,
        borderRadius: 25,
        width: responsiveWidth(90),
        paddingVertical: 14,
        paddingHorizontal: 20,
        alignItems: "center",
        gap: 14,
      }}
    >
      {ICONS.achievement}
      <View style={{ paddingRight: 35 }}>
        <CustomText
          style={{
            color: COLORS.white,
            fontWeight: "500",
            fontSize: responsiveFontSize(2.3),
          }}
          variant="semiBold"
        >
          Achievements
        </CustomText>
        <CustomText
          variant="medium"
          style={{ color: COLORS.white, fontSize: responsiveFontSize(1.6) }}
        >
          You get Prepare Your Breakfast Completion Task points - 300pts
        </CustomText>
      </View>
    </View>
  );
};

export default function TabTwoScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ marginBottom: 50 }}
      >
        <ImageBackground source={IMAGES.img_bg} style={{}}>
          <View
            style={{
              flexDirection: "row",
              paddingVertical: responsiveWidth(4),
              justifyContent: "center",
            }}
          >
            <CustomText
              variant="semiBold"
              style={{ fontSize: responsiveFontSize(3) }}
            >
              Kids rewards
            </CustomText>
          </View>
          <View>
            <Search />
          </View>
          <View
            style={{
              paddingVertical: responsiveWidth(2),
              justifyContent: "center",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Image
              source={IMAGES.reward}
              style={{
                height: responsiveWidth(25),
                width: responsiveWidth(25),
              }}
            />
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                gap: responsiveWidth(4),
              }}
            >
              <View style={{ gap: 4, alignItems: "center" }}>
                <CustomText
                  style={{
                    fontWeight: "bold",
                    fontSize: responsiveFontSize(3),
                  }}
                >
                  My Reward Points
                </CustomText>
                <CustomText style={{ fontSize: responsiveFontSize(1.7) }}>
                  Earned Points
                </CustomText>
              </View>
              <View style={{ gap: 4, alignItems: "center" }}>
                <CustomText
                  style={{ fontSize: responsiveFontSize(5), fontWeight: "700" }}
                >
                  3222
                </CustomText>
                <CustomText style={{ fontSize: responsiveFontSize(1.7) }}>
                  Level 1
                </CustomText>
              </View>
            </View>
            <Achievement />
          </View>
        </ImageBackground>
        <View style={{ gap: 10, paddingVertical: 30 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <CustomText
              variant="semiBold"
              style={{ fontSize: responsiveFontSize(2.5) }}
            >
              Child Reward History
            </CustomText>
            <TouchableOpacity>
              <CustomText
                variant="medium"
                style={{ fontSize: responsiveFontSize(1.1) }}
              >
                View All Rewards
              </CustomText>
            </TouchableOpacity>
          </View>
          <View style={{ gap: 12 }}>
            <RewardHistoryComponent />
            <RewardHistoryComponent />
            <RewardHistoryComponent />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F6F9",
    height: responsiveHeight(100),
    width: responsiveWidth(100),
    padding: responsiveWidth(4),
  },
});
