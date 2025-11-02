import React from "react";
import CustomText from "@/components/CustomText";

import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

import { IMAGES } from "@/assets";
import { router } from "expo-router";
import { COLORS } from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import DebouncedTouchableOpacity from "@/components/buttons/DebouncedTouchableOpacity";

const Screen3 = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ flex: 1 }}>
          <View
            style={{
              width: responsiveWidth(100),
              height: responsiveHeight(100),
              backgroundColor: COLORS.primary,
            }}
          >
            <Image
              source={IMAGES.onboarding_parent_1}
              style={{
                width: responsiveWidth(100),
                height: responsiveHeight(100),
              }}
            />
          </View>
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: -responsiveWidth(25),
              backgroundColor: "white",
              width: responsiveWidth(150),
              height: responsiveHeight(40),
              borderTopRightRadius: 400,
              borderTopLeftRadius: 400,
            }}
          >
            <View
              style={{
                position: "relative",
                justifyContent: "center",
                alignItems: "center",
                paddingTop: 30,
                paddingHorizontal: responsiveWidth(10),
              }}
            >
              <View style={{ width: responsiveWidth(70), gap: 10 }}>
                <View style={{ alignItems: "center" }}>
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      backgroundColor: "#000",
                      borderRadius: 100,
                    }}
                  />
                </View>
                <CustomText
                  variant="semiBold"
                  style={{
                    fontSize: responsiveFontSize(3.3),
                    textAlign: "center",
                    paddingHorizontal: 20,
                  }}
                >
                  Assign Tasks
                </CustomText>
                <CustomText
                  style={{
                    textAlign: "center",
                    color: COLORS.grey,
                    fontSize: responsiveFontSize(1.6),
                  }}
                  variant="medium"
                >
                  Create tasks to teach responsibility and money habits.
                </CustomText>
                <View
                  style={{
                    paddingVertical: 14,
                    justifyContent: "space-between",
                    flexDirection: "row",
                    alignItems: "center",
                    width: responsiveWidth(80),
                    paddingHorizontal: 20,
                  }}
                >
                  <DebouncedTouchableOpacity
                    onPress={() => {
                      router.push("/(parent)/auth/login");
                    }}
                  >
                    <Text
                      style={{
                        color: COLORS.secondary,
                        fontSize: responsiveFontSize(2),
                        fontWeight: "500",
                      }}
                    >
                      Skip
                    </Text>
                  </DebouncedTouchableOpacity>
                  <DebouncedTouchableOpacity
                    onPress={() => {
                      router.push("/(parent)/auth/login");
                    }}
                  >
                    <Text
                      style={{
                        color: COLORS.white,
                        fontSize: responsiveFontSize(1.7),
                        backgroundColor: COLORS.secondary,
                        paddingHorizontal: 40,
                        paddingVertical: 16,
                        borderRadius: 30,
                        fontWeight: "500",
                      }}
                    >
                      Next
                    </Text>
                  </DebouncedTouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Screen3;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F6F9",
    height: responsiveHeight(100),
    width: responsiveWidth(100),
  },
});
