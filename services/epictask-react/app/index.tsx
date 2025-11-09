import { FONT_SIZES } from "@/constants/FontSize";
import React, { ReactNode } from "react";

import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

import { router } from "expo-router";
import { ICONS, IMAGES } from "@/assets";
import { COLORS } from "@/constants/Colors";
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "@/context/AuthContext";

const CustomButton = ({
  title,
  desc,
  onPress,
  icon,
}: {
  title: string;
  icon: ReactNode;
  desc: string;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.btn_container}>
      <View style={{flexDirection:"row", gap: 10}}>
        <View style={styles.btn_icon}>{icon}</View>
        <View style={{}}>
          <View style={styles.btn_title}>
            <Text style={styles.btn_text}>{title}</Text>
            {ICONS.SPLASH.arrow}
          </View>
          <Text style={styles.btn_desc}>{desc}</Text>
        </View>
      </View>
      <View
        style={{
          width: 70,
          height: 70,
          borderRadius: 200,
          backgroundColor: "#E8ECFF",
          position: "absolute",
          right: -30,
          bottom: -30,
          zIndex: -20,
        }}
      />
    </TouchableOpacity>
  );
};

const RolesScreen = () => {
  const { user, loading } = useAuth();

  const handleParentPress = () => {
    if (user) {
      // User is authenticated, check their role
      if (user.role === 'parent') {
        // Navigate to parent main app
        router.push("/(parent)/(app)" as any);
      } else {
        // User is authenticated but not a parent, go to onboarding
        router.push("/(parent)/on-boarding" as any);
      }
    } else {
      // User is not authenticated, go to parent auth
      router.push("/(parent)/auth" as any);
    }
  };

  const handleKidPress = () => {
    if (user) {
      // User is authenticated, check their role
      if (user.role === 'child') {
        // Navigate to kid main app
        router.push("/(kid)/(app)" as any);
      } else {
        // User is authenticated but not a child, go to onboarding
        router.push("/(kid)/on-boarding" as any);
      }
    } else {
      // User is not authenticated, go to kid auth
      router.push("/(kid)/auth" as any);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.white} />
        <Text style={[styles.screenText, { fontSize: FONT_SIZES.extraLarge, marginTop: 20 }]}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={IMAGES.role}
      resizeMode="contain"
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.main}>
          <Image
            source={IMAGES.splash_img}
            resizeMode="contain"
            style={styles.bgimg}
          />
          <View style={styles.pv_10}>
            <Text style={styles.screenText}>WHO'S USING</Text>
            <Text style={[styles.fw, styles.screenText]}>THE APP?</Text>
          </View>
          <View style={styles.gp_10}>
            <CustomButton
              icon={ICONS.SPLASH.parent}
              onPress={handleParentPress}
              title={"Parent"}
              desc={"Manages tasks, sets rewards, and tracks progress."}
            />
            <CustomButton
              icon={ICONS.SPLASH.kid}
              onPress={handleKidPress}
              title={"Teen/Child"}
              desc={
                "Completes tasks, earns rewards, and learns financial skills."
              }
            />
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default RolesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    height: responsiveHeight(110),
    width: responsiveWidth(100),
    padding: responsiveWidth(4),
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  main: {
    flex: 1,
  },
  bgimg: {
    height: responsiveHeight(42),
    width: responsiveWidth(100),
    top: 24
  },
  pv_10: {
    paddingVertical: 20,
  },
  screenText: {
    fontSize: FONT_SIZES.display,
    color: COLORS.white,
  },
  fw: {
    fontWeight: "600",
  },
  gp_10: {
    gap: 16,
  },
  btn_container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  btn_icon: {
    padding: 14,
    backgroundColor: "#F1F6F9",
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "#6D6FE11C",
  },
  btn_title: {
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
  },
  btn_text: {
    fontWeight: "bold",
    fontSize: FONT_SIZES.extraLarge,
    color: COLORS.primary,
  },
  btn_desc: {
    color: COLORS.primary,
    width: responsiveWidth(60),
    fontSize: FONT_SIZES.small,
  },
});
