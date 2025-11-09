import { FONT_SIZES } from "@/constants/FontSize";
import React from "react";
import CustomText from "@/components/CustomText";
import ScreenHeading from "@/components/headings/ScreenHeading";

import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

import {
  FlatList,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { IMAGES } from "@/assets";
import { router } from "expo-router";
import { COLORS } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import DebouncedTouchableOpacity from "@/components/buttons/DebouncedTouchableOpacity";

const ExploreCard = () => {
  return (
    <ImageBackground
      borderRadius={20}
      source={IMAGES.explore}
      style={{
        height: 200,
        width: "100%",
        marginVertical: 10,
        justifyContent: "flex-end",
      }}
      resizeMode="cover"
    >
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          paddingHorizontal: 10,
          justifyContent: "space-between",
        }}
      >
        <View>
          <CustomText
            style={{ color: COLORS.white, fontSize: FONT_SIZES.medium }}
          >
            Our Planet
          </CustomText>
          <CustomText
            variant="semiBold"
            style={{
              width: "80%",
              color: COLORS.white,
              fontSize: FONT_SIZES.display,
            }}
          >
            The Blue Planet
          </CustomText>
        </View>
        <DebouncedTouchableOpacity
          onPress={() => {
            router.push("/screens/quiz");
          }}
          style={{
            borderRadius: 10,
            paddingVertical: 10,
            paddingHorizontal: 14,
            backgroundColor: "#ffffff50",
          }}
        >
          <MaterialIcons name="arrow-right-alt" size={24} color="white" />
        </DebouncedTouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const Explore = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeading back={false} plus={false} text="Explore" />
      <FlatList
      showsVerticalScrollIndicator={false}
      style={{marginBottom: 50}}
      showsHorizontalScrollIndicator={false}
        data={[...new Array(3)]}
        renderItem={({ item, index }) => {
          return (
            <View style={{ borderRadius: 20 }}>
              <ExploreCard key={index} />
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
};

export default Explore;

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
