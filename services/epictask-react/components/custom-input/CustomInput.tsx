import React, { ReactNode, useState } from "react";
import CustomText from "../CustomText";

import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardTypeOptions,
} from "react-native";

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
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  autoComplete?: React.ComponentProps<typeof TextInput>["autoComplete"];
  textContentType?: React.ComponentProps<typeof TextInput>["textContentType"];
  editable?: boolean;
  /** Inline validation message rendered under the field. */
  error?: string;
  /** Muted hint rendered under the field when there is no error. */
  helperText?: string;
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
  keyboardType,
  autoCapitalize,
  autoCorrect,
  autoComplete,
  textContentType,
  editable = true,
  error,
  helperText,
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
          !!error && styles.errorFieldContainer,
        ]}
      >
        <TextInput
          style={secureTextEntry ? styles.passwordInput : styles.inputField}
          value={value}
          onChangeText={handleTextChange}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          placeholder={placeholder}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          autoComplete={autoComplete}
          textContentType={textContentType}
          editable={editable}
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
      {error ? (
        <CustomText style={styles.errorText}>{error}</CustomText>
      ) : helperText ? (
        <CustomText style={styles.helperText}>{helperText}</CustomText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginTop: 20,
    width: "100%",
    alignSelf: "center",
  },
  errorFieldContainer: {
    borderColor: COLORS.red,
  },
  errorText: {
    marginTop: 6,
    marginLeft: 4,
    fontSize: 12,
    color: COLORS.red,
  },
  helperText: {
    marginTop: 6,
    marginLeft: 4,
    fontSize: 12,
    color: COLORS.grey,
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
