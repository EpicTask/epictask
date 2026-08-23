import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Switch,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeading from "@/components/headings/ScreenHeading";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS } from "@/constants/Colors";
import { userService } from "@/api/userService";

const notificationSettings = [
  { key: "email", label: "Email Notifications" },
  { key: "push", label: "Push Notifications" },
  { key: "sms", label: "SMS Notifications" },
  { key: "reminders", label: "Task Reminders" },
];

function NotificationsContent() {
  const [settings, setSettings] = useState({
    email: true,
    push: true,
    sms: false,
    reminders: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const prefs = await userService.getNotificationPreferences();
        if (prefs) {
          setSettings({
            email: prefs.email,
            push: prefs.push,
            sms: prefs.sms,
            reminders: prefs.reminders,
          });
        }
      } catch (error) {
        console.log("Failed to fetch preferences:", error);
        Alert.alert("Error", "Could not load notification preferences.");
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const toggleSwitch = async (key: string) => {
    const newValue = !settings[key as keyof typeof settings];

    // Optimistic update
    const previousSettings = { ...settings };
    setSettings((prev) => ({
      ...prev,
      [key]: newValue,
    }));

    try {
      await userService.updateNotificationPreferences({ [key]: newValue });
    } catch (error) {
      console.log("Failed to update preference:", error);
      Alert.alert("Error", "Could not save your setting. Please try again.");
      // Rollback on failure
      setSettings(previousSettings);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {notificationSettings.map((setting) => (
          <View key={setting.key} style={styles.settingRow}>
            <Text style={styles.label}>{setting.label}</Text>
            <Switch
              trackColor={{ false: COLORS.grey, true: COLORS.primary }}
              thumbColor={
                settings[setting.key as keyof typeof settings]
                  ? COLORS.secondary
                  : "#f4f3f4"
              }
              ios_backgroundColor="#3e3e3e"
              value={settings[setting.key as keyof typeof settings]}
              onValueChange={() => toggleSwitch(setting.key)}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export default function NotificationsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeading text="Notification Settings" back={true} plus={false} />
      <NotificationsContent />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F6F9", // Or your app's background color
    paddingHorizontal: responsiveWidth(4),
    paddingTop: responsiveHeight(2), // Adjust as needed
  },
  scrollContainer: {
    paddingVertical: 20,
    flexGrow: 1,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: responsiveWidth(2),
    borderBottomWidth: 1,
    borderColor: "#00000010", // Softer border color
    backgroundColor: COLORS.white, // Assuming you want a card-like look for rows
    borderRadius: 10, // Optional: if you want rounded corners for each row
    marginBottom: 10, // Optional: space between rows
  },
  label: {
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F6F9",
  },
});
