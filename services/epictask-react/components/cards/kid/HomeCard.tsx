import React from "react";
import * as Progress from "react-native-progress";

import { COLORS } from "@/constants/Colors";
import { StyleSheet, Text, View } from "react-native";

const HomeCard = () => {
  return (
    <View style={{backgroundColor:"white", borderRadius: 20}}>
      <View style={{}}>
        <View>
          <Text>You have 3 tasks taody!</Text>
        </View>
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <Progress.Circle
            size={50}
            progress={0.7}
            thickness={4}
            color={"red"}
            unfilledColor="#E5E7EB"
            borderWidth={0}
            showsText={true}
            formatText={() => `${Math.round(0.7 * 100)}%`}
            textStyle={{
              fontSize: 12,
              fontWeight: "bold",
              color: "#000",
            }}
          />
          <View style={{}}>
            <Text>Completed</Text>
            <Text>7/10</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default HomeCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderColor: "#EAEBEC",
    borderRadius: 28,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  percentageText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  completedText: {
    marginTop: 10,
    fontWeight: "semibold",
    fontSize: 16,
    color: COLORS.grey,
  },
  fractionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
});
