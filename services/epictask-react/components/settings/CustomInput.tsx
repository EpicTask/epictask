import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import HomeIcon from "@/assets/icons/Home";

const CustomInput = ({
  text,
  isPassword = false,
}: {
  text: string;
  isPassword?: boolean;
}) => {
  const [name, setName] = useState(text);
  const [visisble, setVisisble] = useState(false);
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: "#00000080",
        borderRadius: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 4,
        paddingHorizontal: 14,
      }}
    >
      <TextInput
        secureTextEntry={isPassword ? visisble : false}
        value={name}
        onChangeText={(e) => setName(e)}
        placeholder="Enter value here..."
        style={{
          paddingVertical: 14,
          paddingHorizontal: 10,
          flex:1
        }}
      />
      {/* <TouchableOpacity
        onPress={() => {
          setVisisble(!visisble);
        }}
      >
        <HomeIcon fill="black" />
      </TouchableOpacity> */}
    </View>
  );
};

export default CustomInput;

const styles = StyleSheet.create({});
