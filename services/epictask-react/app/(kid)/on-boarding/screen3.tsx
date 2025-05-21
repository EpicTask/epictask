import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { SafeAreaView } from "react-native-safe-area-context";
import { IMAGES } from "@/assets";
import CustomText from "@/components/CustomText";
import { COLORS } from "@/constants/Colors";
import { router } from "expo-router";

const Screen3 = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ flex: 1 }}>
        <View
          style={{
            width: responsiveWidth(100),
            height: responsiveHeight(100),
            backgroundColor: COLORS.primary,
          }}
        >
          <Image
            source={IMAGES.ob_k_3}
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
            backgroundColor: "white",
            width: "100%",
            height: responsiveHeight(30),
            borderTopRightRadius: 100,
            borderTopLeftRadius: 100,
          }}
        >
          <View
            style={{
              position: "relative",
              justifyContent: "center",
              alignItems: "center",
              paddingTop: 30,
              paddingHorizontal: responsiveWidth(10),
              gap: 10,
            }}
          >
            <CustomText
              variant="semiBold"
              style={{
                fontSize: responsiveFontSize(3.3),
                textAlign: "center",
                paddingHorizontal: 20,
              }}
            >
              Mark as Done
            </CustomText>
            <CustomText
              style={{
                textAlign: "center",
                color: COLORS.grey,
                fontSize: responsiveFontSize(1.6),
              }}
              variant="medium"
            >
              Finished a task? Tap and mark it as complete!
            </CustomText>
            <View
              style={{
                paddingVertical: 14,
                justifyContent: "space-between",
                flexDirection: "row",
                alignItems: "center",
                width: responsiveWidth(70),
                paddingHorizontal: 20,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  router.push("/(kid)/auth/login");
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
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  router.push("/(kid)/auth/login");
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
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
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
