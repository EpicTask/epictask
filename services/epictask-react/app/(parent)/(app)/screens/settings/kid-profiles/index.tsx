import { FlatList, StyleSheet, Text, View } from "react-native";
import React from "react";
import ScreenHeading from "@/components/headings/ScreenHeading";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { SafeAreaView } from "react-native-safe-area-context";
import KidsCard from "@/components/cards/KidsCard";
import { router } from "expo-router";

const KidProfiles = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeading
        text="Kid Profile"
        back={true}
        plus={true}
        plusPress={() => {
          router.push("/screens/add-kid" as any);
        }}
      />
      <View>
        <FlatList
          numColumns={2}
          style={{ gap: 4, marginBottom: 50 }}
          data={[...new Array(14)]}
          showsVerticalScrollIndicator={false}
          renderItem={() => {
            return (
              <View style={{ padding: 4, flex: 1 }}>
                <KidsCard
                  name="Wisteria"
                  level={1}
                  stars={55}
                  completed={9}
                  pending={2}
                />
              </View>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default KidProfiles;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F6F9",
    height: responsiveHeight(100),
    width: responsiveWidth(100),
    padding: responsiveWidth(4),
  },
});
