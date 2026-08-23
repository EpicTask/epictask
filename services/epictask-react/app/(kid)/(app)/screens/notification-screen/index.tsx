import React, { useState, useEffect, useCallback } from "react";
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeading from "@/components/headings/ScreenHeading";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { notificationService } from "@/api/notificationService";
import { MaterialIcons } from "@expo/vector-icons";

// Define the structure for a notification
interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string; // ISO string from API
  metadata?: any;
}

// Props for the individual notification item component
interface NotificationItemProps {
  notification: Notification;
  onDelete: (id: string) => void;
  onMarkRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onDelete,
  onMarkRead,
}) => {
  const handlePress = () => {
    if (!notification.is_read) {
      onMarkRead(notification.id);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(notification.id),
        },
      ],
    );
  };

  const date = new Date(notification.created_at);
  const formattedDate = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const formattedTime = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <TouchableOpacity
      style={[
        styles.notificationRow,
        !notification.is_read && styles.unreadNotification,
      ]}
      onPress={handlePress}
    >
      <View style={styles.notificationContent}>
        <View style={styles.headerRow}>
          <Text
            style={[
              styles.notificationTitle,
              !notification.is_read && styles.unreadText,
            ]}
          >
            {notification.title}
          </Text>
          {!notification.is_read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notificationMessage}>{notification.message}</Text>
        <Text
          style={styles.notificationTimestamp}
        >{`${formattedDate} at ${formattedTime}`}</Text>
      </View>
      <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
        <MaterialIcons name="delete-outline" size={24} color="#FF6B6B" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const NotificationList: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationService.getNotifications(50); // Get last 50
      setNotifications(data);
    } catch (error) {
      console.log("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, [fetchNotifications]);

  const handleDeleteNotification = async (id: string) => {
    try {
      // Optimistic update
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      await notificationService.deleteNotification(id);
    } catch (error) {
      console.log("Failed to delete notification:", error);
      Alert.alert("Error", "Failed to delete notification");
      fetchNotifications(); // Revert on error
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
      await notificationService.markAsRead(id);
    } catch (error) {
      console.log("Failed to mark as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      await notificationService.markAllAsRead();
    } catch (error) {
      console.log("Failed to mark all as read:", error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeading text="Notifications" back={true} plus={false} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <ScreenHeading text="Notifications" back={true} plus={false} />
        {notifications.some((n) => !n.is_read) && (
          <TouchableOpacity
            onPress={handleMarkAllRead}
            style={styles.markAllButton}
          >
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.noNotificationsText}>
              No notifications yet.
            </Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onDelete={handleDeleteNotification}
              onMarkRead={handleMarkRead}
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
    paddingHorizontal: responsiveWidth(4),
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: responsiveHeight(1),
  },
  markAllButton: {
    padding: 8,
  },
  markAllText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: responsiveHeight(20),
  },
  notificationRow: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: responsiveHeight(1.5),
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "transparent",
  },
  unreadNotification: {
    backgroundColor: "#fff",
    borderLeftColor: "#007AFF",
  },
  notificationContent: {
    flex: 1,
    marginRight: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  unreadText: {
    color: "#000",
    fontWeight: "700",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#007AFF",
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationTimestamp: {
    fontSize: 12,
    color: "#999",
  },
  deleteButton: {
    padding: 8,
  },
  noNotificationsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
