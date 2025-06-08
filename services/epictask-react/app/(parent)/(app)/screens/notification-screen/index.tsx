import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeading from "@/components/headings/ScreenHeading";
import { useSwipeable } from "react-swipeable";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

// Define the structure for a notification
interface Notification {
  id: string;
  message: string;
  timestamp: Date; // Changed to Date type for better handling
}

// Props for the individual notification item component
interface NotificationItemProps {
  notification: Notification;
  onDelete: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onDelete,
}) => {
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      console.log(`Swiped left on: ${notification.id}`);
      onDelete(notification.id);
    },
    preventScrollOnSwipe: true,
    trackMouse: true,
  });
  // Helper to choose the correct wrapper for web swipe compatibility
  const Wrapper = Platform.OS === "web" ? "div" : View;

  // Format the timestamp
  const formattedDate = notification.timestamp.toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric'
  });
  const formattedTime = notification.timestamp.toLocaleTimeString(undefined, {
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <Wrapper {...handlers} style={styles.notificationRow}>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationMessage}>{notification.message}</Text>
        <Text style={styles.notificationTimestamp}>{`${formattedDate} at ${formattedTime}`}</Text>
      </View>
    </Wrapper>
  );
};

// Main component for the notification list screen
const NotificationList: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // For simulating data fetch

  useEffect(() => {
    // Simulate fetching data from Firestore
    const fetchNotifications = async () => {
      setLoading(true);
      // In a real app, this is where you'd call Firestore
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

      setNotifications([
        {
          id: "1",
          message: 'Your task "Clean your room" is overdue.',
          timestamp: new Date(2024, 3, 15, 10, 30, 0), // April 15, 2024, 10:30 AM
        },
        {
          id: "2",
          message: 'New reward "Movie Night" has been added!',
          timestamp: new Date(2024, 3, 14, 17, 45, 0), // April 14, 2024, 05:45 PM
        },
        {
          id: "3",
          message: "Reminder: Pocket money will be distributed tomorrow.",
          timestamp: new Date(2024, 3, 13, 9, 0, 0),   // April 13, 2024, 09:00 AM
        },
        {
          id: "4",
          message: "Swipe left to delete this notification for a demo.",
          timestamp: new Date(2024, 3, 12, 12, 15, 0), // April 12, 2024, 12:15 PM
        },
      ]);
      setLoading(false);
    };

    fetchNotifications();
  }, []);

  const handleDeleteNotification = (id: string) => {
    console.log(`Deleting: ${id}`);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading notifications...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeading text="Notifications" back={true} plus={false} />
      <ScrollView style={styles.scrollView}>
        {notifications.length === 0 ? (
          <View style={styles.centered}><Text style={styles.noNotificationsText}>No new notifications.</Text></View>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onDelete={handleDeleteNotification}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationList;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F6F9",
    height: responsiveHeight(100),
    width: responsiveWidth(100),
    padding: responsiveWidth(4),
  },
  scrollView: {
    marginTop: responsiveHeight(2), // Add some space below the heading
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationRow: {
    backgroundColor: "white",
    borderRadius: 8, // Rounded corners for the card
    marginBottom: responsiveHeight(1.5), // Space between cards
    padding: 15,
    // Add shadow for a card-like effect (optional, adjust as needed)
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 1,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 16,
    fontWeight: '500', // Make message slightly bolder
    marginBottom: 5, // Space between message and timestamp
  },
  notificationTimestamp: {
    fontSize: 12,
    color: "#666", // Lighter color for the timestamp
  },
  noNotificationsText: {
    textAlign: "center",
    marginTop: 20,
    paddingBottom: 20, // Ensure it's visible if ScrollView is short
    fontSize: 16,
    color: "#666",
  },
});
