import React, { useState } from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, TextInput, View } from "react-native";
import { responsiveWidth } from "react-native-responsive-dimensions";

const Search = () => {
  const [text, setText] = useState("");
  return (
    <View
      style={{
        backgroundColor: "white",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: responsiveWidth(100),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <TextInput
        placeholder="Search..."
        style={{ flex: 1 }}
        onChangeText={(e) => {
          setText(e);
        }}
      />
      <MaterialIcons name="keyboard-arrow-down" size={20} color="black" />
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({});
