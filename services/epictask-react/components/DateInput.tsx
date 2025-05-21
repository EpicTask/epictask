import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import CustomInput from "./custom-input/CustomInput";
import { ICONS } from "@/assets";

const DateInput = ({title}:{title:string}) => {
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateChange = (event: any, date?: Date): void => {
    setShowDateModal(false);
    if (date) {
      setSelectedDate(date);
    }
  };
  return (
    <View>
      {showDateModal && (
        <RNDateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      <CustomInput
        onIconClick={() => {
          setShowDateModal(true);
        }}
        label={title}
        value={selectedDate.toLocaleDateString()}
        icon={ICONS.calendar}
        onChangeText={() => {}}
      />
    </View>
  );
};

export default DateInput;

const styles = StyleSheet.create({});
