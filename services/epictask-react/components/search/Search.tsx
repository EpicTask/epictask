import React, { useState, useEffect, useCallback } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, TextInput, View, TouchableOpacity } from "react-native";
import { responsiveWidth } from "react-native-responsive-dimensions";
import { COLORS } from "@/constants/Colors";

interface SearchProps {
  placeholder?: string;
  onSearchChange?: (text: string) => void;
  value?: string;
  debounceMs?: number;
}

const Search: React.FC<SearchProps> = ({ 
  placeholder = "Search...", 
  onSearchChange,
  value = "",
  debounceMs = 300
}) => {
  const [internalText, setInternalText] = useState(value);

  // Debounced search functionality
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (onSearchChange) {
        onSearchChange(internalText);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [internalText, onSearchChange, debounceMs]);

  // Update internal state when external value changes
  useEffect(() => {
    setInternalText(value);
  }, [value]);

  const handleClear = useCallback(() => {
    setInternalText("");
    if (onSearchChange) {
      onSearchChange("");
    }
  }, [onSearchChange]);

  return (
    <View style={styles.container}>
      <MaterialIcons name="search" size={20} color={COLORS.grey} style={styles.searchIcon} />
      <TextInput
        placeholder={placeholder}
        style={styles.textInput}
        value={internalText}
        onChangeText={setInternalText}
        placeholderTextColor={COLORS.grey}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {internalText.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <MaterialIcons name="clear" size={20} color={COLORS.grey} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: responsiveWidth(100),
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EAEBEC",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    paddingVertical: 0, // Remove default padding for better alignment
  },
  clearButton: {
    marginLeft: 8,
    padding: 2,
  },
});
