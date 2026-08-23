import { FONT_SIZES } from "@/constants/FontSize";
import React, { useEffect, useState } from "react";
import ScreenHeading from "@/components/headings/ScreenHeading";
import { useAuth } from "@/context/AuthContext";
import { firestoreService } from "@/api/firestoreService";

import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

import { ICONS, IMAGES } from "@/assets";
import { Image, Text, ActivityIndicator } from "react-native";
import { COLORS } from "@/constants/Colors";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LinkedParent = () => {
  const { user, isSharedDeviceMode } = useAuth();
  const [parent, setParent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchParent = async () => {
      if (isSharedDeviceMode && user?.role === "parent") {
        setParent(user);
        setLoading(false);
        return;
      }

      const parentId = user?.parent_id || user?.parentId;

      if (parentId) {
        try {
          const result = await firestoreService.getUserProfile(parentId);
          if (active && result.success) {
            setParent(result.user);
          }
        } catch (error) {
          console.log("Error fetching parent:", error);
        }
      }
      if (active) setLoading(false);
    };

    fetchParent();

    return () => {
      active = false;
    };
  }, [user, isSharedDeviceMode]);

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
            source={parent?.image ? { uri: parent.image } : IMAGES.profile}
            style={{
              height: responsiveHeight(14),
              width: responsiveHeight(14),
              borderRadius: responsiveHeight(7),
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
            position: "absolute",
            justifyContent: "center",
            width: responsiveWidth(90),
          }}
        >
          <Text
            style={{
              fontSize: FONT_SIZES.title,
              fontWeight: "400",
              color: "#676767",
              marginBottom: 10,
            }}
          >
            {loading ? "Loading..." : "Full Name"}
          </Text>
          <Text
            style={{
              fontSize: FONT_SIZES.title,
              fontWeight: "500",
              color: COLORS.secondary,
            }}
          >
            {loading
              ? ""
              : parent?.displayName || parent?.email || "Unknown Parent"}
          </Text>
          <View style={{ marginTop: 20 }}>{ICONS.link}</View>
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
