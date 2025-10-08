import { StyleSheet, Text, View, Modal, TouchableOpacity, ScrollView } from "react-native";
import React, { useState } from "react";
import CustomInput from "./custom-input/CustomInput";
import { ICONS } from "@/assets";

const DateInput = ({title}:{title:string}) => {
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateSelect = (date: Date): void => {
    setSelectedDate(date);
    setShowDateModal(false);
  };

  return (
    <View>
      <CustomDatePickerModal
        isVisible={showDateModal}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        onCancel={() => setShowDateModal(false)}
      />
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

interface CustomDatePickerModalProps {
  isVisible: boolean;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onCancel: () => void;
}

const CustomDatePickerModal: React.FC<CustomDatePickerModalProps> = ({
  isVisible,
  selectedDate,
  onDateSelect,
  onCancel,
}) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const isSelectedDay = (day: number | null) => {
    if (!day) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth &&
      selectedDate.getFullYear() === currentYear
    );
  };

  const handleDayPress = (day: number | null) => {
    if (day) {
      const newDate = new Date(currentYear, currentMonth, day);
      onDateSelect(newDate);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigateMonth('prev')}
            >
              <Text style={styles.navButtonText}>‹</Text>
            </TouchableOpacity>
            
            <Text style={styles.monthYearText}>
              {months[currentMonth]} {currentYear}
            </Text>
            
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigateMonth('next')}
            >
              <Text style={styles.navButtonText}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Days of week header */}
          <View style={styles.daysOfWeekContainer}>
            {daysOfWeek.map((day, index) => (
              <Text key={index} style={styles.dayOfWeekText}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar grid */}
          <ScrollView style={styles.calendarContainer}>
            <View style={styles.calendarGrid}>
              {generateCalendarDays().map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayButton,
                    day === null && styles.emptyDay,
                    isSelectedDay(day) && styles.selectedDay,
                  ]}
                  onPress={() => handleDayPress(day)}
                  disabled={day === null}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isSelectedDay(day) && styles.selectedDayText,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Action buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.todayButton}
              onPress={() => {
                const today = new Date();
                setCurrentMonth(today.getMonth());
                setCurrentYear(today.getFullYear());
                onDateSelect(today);
              }}
            >
              <Text style={styles.todayButtonText}>Today</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DateInput;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 350,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  navButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  daysOfWeekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  dayOfWeekText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    width: 35,
    textAlign: 'center',
  },
  calendarContainer: {
    maxHeight: 250,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayButton: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    borderRadius: 17.5,
  },
  emptyDay: {
    backgroundColor: 'transparent',
  },
  selectedDay: {
    backgroundColor: '#007AFF',
  },
  dayText: {
    fontSize: 16,
    color: '#333',
  },
  selectedDayText: {
    color: 'white',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  cancelButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
  },
  todayButton: {
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
  },
  todayButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});
