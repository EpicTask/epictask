import React from "react";
import CustomText from "@/components/CustomText";
import ScreenHeading from "@/components/headings/ScreenHeading";

import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

import { ICONS } from "@/assets";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Transaction = ({ type }: { type: string }) => {
  return (
    <View
      style={{
        flexDirection: "row",
        paddingVertical: 10,
        gap: 20,
        alignItems: "center",
        width: responsiveWidth(100),
      }}
    >
      <View>
        {type == "send"
          ? ICONS.SETTINGS.WALLET.send
          : ICONS.SETTINGS.WALLET.recieve}
      </View>
      <View
        style={{
          flexDirection: "row",
          width: responsiveWidth(75),
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: 10,
          borderBottomColor: "#00000020",
          borderBottomWidth: 1,
        }}
      >
        <View style={{ gap: 6 }}>
          <CustomText
            variant="semiBold"
            style={{ fontSize: responsiveFontSize(2.3) }}
          >
            Jerome Bell
          </CustomText>
          <Text style={{ fontSize: 14, fontWeight: "400", color: "#545454" }}>
            6776 3253 3532 1211
          </Text>
        </View>
        <View>
          <CustomText
            variant="semiBold"
            style={{
              fontSize: responsiveFontSize(2.3),
              color: type !== "send" ? "green" : "black",
            }}
          >
            -$834
          </CustomText>
        </View>
      </View>
    </View>
  );
};

const Buttoncard = () => {
  return (
    <View
      style={styles.box}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ alignItems: "center", gap: 4 }}>
          <TouchableOpacity>
            <View
              style={{
                backgroundColor: "#F6F6F6",
                borderRadius: 100,
                padding: 10,
              }}
            >
              {ICONS.SETTINGS.WALLET.upload}
            </View>
          </TouchableOpacity>
          <Text>Send</Text>
        </View>
        <View style={{ alignItems: "center", gap: 4 }}>
          <TouchableOpacity>
            <View
              style={{
                backgroundColor: "#F6F6F6",
                borderRadius: 100,
                padding: 10,
              }}
            >
              {ICONS.SETTINGS.WALLET.download}
            </View>
          </TouchableOpacity>
          <Text>Request</Text>
        </View>
        <View style={{ alignItems: "center", gap: 4 }}>
          <TouchableOpacity>
            <View
              style={{
                backgroundColor: "#F6F6F6",
                borderRadius: 100,
                padding: 10,
              }}
            >
              {ICONS.SETTINGS.WALLET.transfer}
            </View>
          </TouchableOpacity>
          <Text>Transfer</Text>
        </View>
      </View>
    </View>
  );
};

const Wallet = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeading text="Wallet" back={true} plus={false} />
      <View
        style={{
          justifyContent: "space-between",
          flex: 1,
          paddingVertical: 20,
        }}
      >
        <View style={{ flex: 1, gap: 30 }}>
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View style={{ alignItems: "center", paddingBottom: 30 }}>
              <CustomText
                variant="regular"
                style={{ fontSize: responsiveFontSize(2) }}
              >
                Current balance
              </CustomText>
              <CustomText
                variant="bold"
                style={{ fontSize: responsiveFontSize(4) }}
              >
                $ 1,250.45
              </CustomText>
            </View>
            <View>
              <Buttoncard />
            </View>
          </View>
          <View style={{ alignItems: "flex-start" }}>
            <CustomText
              variant="bold"
              style={{ fontSize: responsiveFontSize(2.7) }}
            >
              Transaction History
            </CustomText>
            <View>
              <FlatList
                style={{ marginBottom: 250 }}
                showsVerticalScrollIndicator={false}
                data={[...new Array(12)]}
                renderItem={() => <Transaction type={"send"} />}
              />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F6F9",
    justifyContent: "space-between",
    height: responsiveHeight(100),
    width: responsiveWidth(100),
    padding: responsiveWidth(6),
  },
  codeFieldRoot: { marginTop: 20, justifyContent: "space-between" },
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
    marginHorizontal: 1,
  },
  focusCell: {
    color: "white",
    backgroundColor: "#EE4266",
  },
  box: {
    backgroundColor: "white",
    width: responsiveWidth(90),
    paddingVertical: 25,
    borderRadius: 10,
    paddingHorizontal: 30,
    elevation: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
});

export default Wallet;
