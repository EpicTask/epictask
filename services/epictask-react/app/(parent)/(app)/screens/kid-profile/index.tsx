import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { ICONS, IMAGES } from "@/assets";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import ProgressCard from "@/components/cards/ProgressCard";
import { COLORS } from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import TaskCard from "@/components/cards/TaskCard";
import CustomText from "@/components/CustomText";

const KidProfile = () => {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ flex: 1, gap: 10, backgroundColor: COLORS.bg }}>
        <View style={{}}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 20,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                router.back();
              }}
            >
              {ICONS.back_arrow}
            </TouchableOpacity>
            <CustomText
              variant="semiBold"
              style={{
                flex: 1,
                fontSize: responsiveFontSize(3.5),
                textAlign: "center",
              }}
            >
              Kid Profile
            </CustomText>
          </View>
          <View
            style={{
              borderRadius: 20,
              paddingHorizontal: 10,
              paddingVertical: 16,
              backgroundColor: "white",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{ justifyContent: "center", alignItems: "center", gap: 4 }}
            >
              <Image
                source={IMAGES.profile}
                style={{
                  height: responsiveHeight(14),
                  width: responsiveHeight(14),
                }}
              />
              <View
                style={{
                  gap: 4,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 10,
                }}
              >
                <CustomText
                  variant="semiBold"
                  style={{ fontSize: 16, fontWeight: "500" }}
                >
                  Ingridia
                </CustomText>
                <CustomText
                  variant="medium"
                  style={{ fontSize: 14, color: COLORS.grey }}
                >
                  Level 1
                </CustomText>
              </View>
              <View
                style={{
                  gap: 10,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    gap: responsiveWidth(4),
                  }}
                >
                  <ProgressCard
                    text={"Completed"}
                    color={COLORS.purple}
                    row={true}
                    completed={4}
                    progress={0.8}
                    total={10}
                  />
                  <ProgressCard
                    text={"In Progress"}
                    color={COLORS.grey}
                    row={true}
                    completed={2}
                    progress={0.2}
                    total={10}
                  />
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    gap: responsiveWidth(4),
                    justifyContent: "space-between",
                  }}
                >
                  <ProgressCard
                    text={"Skipped"}
                    color={"red"}
                    row={true}
                    completed={5}
                    progress={0.5}
                    total={10}
                  />
                  <View style={styles.reward}>
                    <CustomText>Reward Points</CustomText>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Image
                        source={IMAGES.reward}
                        style={{
                          height: responsiveHeight(2),
                          width: responsiveHeight(2),
                        }}
                      />
                      <CustomText style={{}}> 85</CustomText>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flex: 1, paddingVertical: 20 }}>
          <FlatList
            showsHorizontalScrollIndicator={false}
            style={{ gap: 10 }}
            data={[...new Array(3)]}
            horizontal
            renderItem={() => (
              <View style={{ marginHorizontal: 6, flex: 1, height: 180 }}>
                <TaskCard name="Prepare your breakfast" stars={55} />
              </View>
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default KidProfile;

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
  reward: {
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "white",
    borderColor: "#EAEBEC",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
