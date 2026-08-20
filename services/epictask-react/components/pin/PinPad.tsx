import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS } from "@/constants/Colors";
import CustomText from "@/components/CustomText";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";

interface PinPadProps {
  pin: string;
  onPinChange: (newPin: string) => void;
  maxLength?: number;
}

const PinPad: React.FC<PinPadProps> = ({
  pin,
  onPinChange,
  maxLength = 4,
}) => {
  const handleNumberPress = (num: string) => {
    if (pin.length < maxLength) {
      onPinChange(pin + num);
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      onPinChange(pin.slice(0, -1));
    }
  };

  const renderDots = () => {
    const dots = [];
    for (let i = 0; i < maxLength; i++) {
      const filled = i < pin.length;
      dots.push(
        <View
          key={i}
          style={[styles.dot, filled ? styles.filledDot : styles.emptyDot]}
        />
      );
    }
    return <View style={styles.dotsContainer}>{dots}</View>;
  };

  const keyPadNumbers = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["", "0", "DEL"],
  ];

  return (
    <View style={styles.container}>
      {renderDots()}
      <View style={styles.padContainer}>
        {keyPadNumbers.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((key, colIndex) => {
              if (key === "") {
                return <View key={colIndex} style={styles.keyButtonEmpty} />;
              }
              if (key === "DEL") {
                return (
                  <TouchableOpacity
                    key={colIndex}
                    style={styles.keyButtonAction}
                    onPress={handleDelete}
                  >
                    <CustomText variant="semiBold" style={styles.actionText}>
                      DEL
                    </CustomText>
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  key={colIndex}
                  style={styles.keyButton}
                  onPress={() => handleNumberPress(key)}
                >
                  <CustomText variant="bold" style={styles.keyText}>
                    {key}
                  </CustomText>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

export default PinPad;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: responsiveHeight(2),
  },
  dotsContainer: {
    flexDirection: "row",
    gap: responsiveWidth(4),
    marginBottom: responsiveHeight(3),
  },
  dot: {
    width: responsiveWidth(5),
    height: responsiveWidth(5),
    borderRadius: responsiveWidth(2.5),
  },
  filledDot: {
    backgroundColor: COLORS.primary,
  },
  emptyDot: {
    backgroundColor: COLORS.grey,
  },
  padContainer: {
    gap: responsiveHeight(1.5),
  },
  row: {
    flexDirection: "row",
    gap: responsiveWidth(4),
  },
  keyButton: {
    width: responsiveWidth(20),
    height: responsiveWidth(20),
    borderRadius: responsiveWidth(10),
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.grey,
  },
  keyButtonAction: {
    width: responsiveWidth(20),
    height: responsiveWidth(20),
    borderRadius: responsiveWidth(10),
    backgroundColor: COLORS.grey,
    justifyContent: "center",
    alignItems: "center",
  },
  keyButtonEmpty: {
    width: responsiveWidth(20),
    height: responsiveWidth(20),
  },
  keyText: {
    fontSize: responsiveFontSize(3),
    color: COLORS.black,
  },
  actionText: {
    fontSize: responsiveFontSize(1.8),
    color: COLORS.white,
  },
});
