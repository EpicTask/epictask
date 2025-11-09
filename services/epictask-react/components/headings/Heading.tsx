import { FONT_SIZES } from "@/constants/FontSize";
import React, { ReactElement } from "react";

import PlusButton from "../PlusButton";

import { StyleSheet, Text, View } from "react-native";
import { responsiveFontSize } from "react-native-responsive-dimensions";
import CustomText from "../CustomText";


const Heading = ({
  title,
  icon,
}: {
  title: string;
  icon?: ReactElement<any, any>;
}) => {
  return (
    <View style={styles.container}>
      <CustomText variant="semiBold" style={styles.headingStyle}>{title}</CustomText>
      {icon}
    </View>
  );
};

export default Heading;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headingStyle: {
    fontWeight: "500",
    fontSize: FONT_SIZES.subtitle,
  },
});
