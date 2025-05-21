import React from "react";
import PlusButton from "../PlusButton";
import CustomText from "../CustomText";

import { ICONS } from "@/assets";
import { router } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { responsiveFontSize } from "react-native-responsive-dimensions";

const ScreenHeading = ({
  plus,
  back,
  text,
  plusPress,
}: {
  plus: boolean;
  back: boolean;
  text: string;
  plusPress?: () => void;
}) => {
  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 14,
        }}
      >
        {back && (
          <TouchableOpacity
            onPress={() => {
              router.back();
            }}
          >
            {ICONS.back_arrow}
          </TouchableOpacity>
        )}
        <CustomText
          variant="semiBold"
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: responsiveFontSize(2.7),
          }}
        >
          {text}
        </CustomText>
        {plus && <PlusButton onPress={plusPress} />}
      </View>
    </View>
  );
};

export default ScreenHeading;

const styles = StyleSheet.create({});
