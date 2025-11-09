import React, { ReactNode, useState } from "react";
import CustomText from "../CustomText";

import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";

import { COLORS } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";

interface CustomInputProps {
  label: string;
  value: string;
  date?: boolean;
  icon?: ReactNode;
  placeholder?: string;
  onIconClick?: () => void;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  capitalizeFirstLetter?: boolean;
}

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  value,
  icon,
  onChangeText,
  onIconClick = () => {},
  placeholder,
  date = false,
  secureTextEntry = false,
  capitalizeFirstLetter = false,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleTextChange = (text: string) => {
    if (capitalizeFirstLetter) {
      onChangeText(text.charAt(0).toUpperCase() + text.slice(1));
    } else {
      onChangeText(text);
    }
  };

  return (
    <View style={styles.inputContainer}>
      <CustomText style={styles.label}>{label}</CustomText>
      <View
        style={[
          secureTextEntry
            ? styles.passwordInputContainer
            : styles.inputFieldContainer,
          icon ? styles.iconContainer : styles.inputFieldContainer,
        ]}
      >
        <TextInput
          style={secureTextEntry ? styles.passwordInput : styles.inputField}
          value={value}
          onChangeText={handleTextChange}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          placeholder={placeholder}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.visibilityButton}
          >
            {isPasswordVisible ? (
              <Ionicons name="eye-outline" size={20} color="black" />
            ) : (
              <Ionicons name="eye-off-outline" size={20} color="black" />
            )}
          </TouchableOpacity>
        )}
        {icon && (
          <TouchableOpacity onPress={onIconClick}>{icon}</TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginTop: 20,
    width: "100%",
    alignSelf: "center",
  },
  label: {
    position: "absolute",
    top: -10,
    left: 10,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 5,
    fontSize: 12,
    color: "gray",
    zIndex: 10,
  },
  inputFieldContainer: {
    height: 52,
    borderColor: "#D3D3D3",
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: COLORS.bg,
  },
  inputField: {
    flex: 1,
    height: "100%",
  },
  passwordInputContainer: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#D3D3D3",
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: COLORS.bg,
  },
  iconContainer: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#D3D3D3",
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: COLORS.bg,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  visibilityButton: {
    padding: 15,
    justifyContent: "center",
  },
  visibilityIcon: {
    fontSize: 20,
    color: "gray",
  },
});

export default CustomInput;
