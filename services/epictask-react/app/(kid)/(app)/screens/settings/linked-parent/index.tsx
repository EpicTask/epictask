import React from "react";
import ScreenHeading from "@/components/headings/ScreenHeading";

import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

import { ICONS, IMAGES } from "@/assets";
import { Image, Text } from "react-native";
import { COLORS } from "@/constants/Colors";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LinkedParent = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeading text="Linked Parent" back={true} plus={false} />
      <View
        style={{
          flex: 1,
          paddingVertical: 80,
          alignItems: "center",
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 22,
            backgroundColor: COLORS.bg,
            borderRadius: 100,
          }}
        >
          <Image
            source={IMAGES.profile}
            style={{
              height: responsiveHeight(14),
              width: responsiveHeight(14),
            }}
          />
        </View>
        <View style={{}}>{ICONS.linkedParent}</View>
        <View
          style={{
            height: 300,
            top: 50,
            borderRadius: 40,
            alignItems: "center",
            position:"absolute",
            justifyContent: "center",
            width: responsiveWidth(90),
          }}
        >
          <Text
            style={{
              fontSize: responsiveFontSize(3),
              fontWeight: "400",
              color: "#676767",
            }}
          >
            Full Name
          </Text>
          <Text
            style={{
              fontSize: responsiveFontSize(3),
              fontWeight: "500",
              color: COLORS.secondary,
            }}
          >
            John Wick
          </Text>
          {ICONS.link}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LinkedParent;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F6F9",
    justifyContent: "space-between",
    height: responsiveHeight(100),
    width: responsiveWidth(100),
    padding: responsiveWidth(6),
  },
  codeFieldRoot: { marginTop: 10, justifyContent: "flex-start" },
  cell: {
    width: 70,
    height: 70,
    lineHeight: 68,
    fontSize: 24,
    borderWidth: 0,
    borderColor: "#00000010",
    backgroundColor: "#fff",
    textAlign: "center",
    borderRadius: 8,
    marginHorizontal: "auto",
  },
  focusCell: {
    color: "white",
    backgroundColor: "#EE4266",
  },
});
