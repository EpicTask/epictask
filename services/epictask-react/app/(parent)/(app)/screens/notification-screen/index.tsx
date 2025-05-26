import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import ScreenHeading from '@/components/headings/ScreenHeading';
import { useSwipeable } from 'react-swipeable';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';

interface Notification {
  id: string;
  message: string;
  timestamp: any;
}

interface NotificationRowProps {
  notification: Notification;
  onDelete: (id: string) => void;
}

const NotificationRow: React.FC<NotificationRowProps> = ({ notification, onDelete }) => {
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      console.log(`Swiped left on: ${notification.id}`);
      onDelete(notification.id);
    },
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const Wrapper = Platform.OS === 'web' ? 'div' : View;

  return (
    <Wrapper {...handlers} style={styles.notificationRow}>
      <Text style={styles.notificationMessage}>{notification.message}</Text>
    </Wrapper>
  );
};

const NotificationList: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    setNotifications([
      { id: '1', message: 'Your task "Clean your room" is overdue.', timestamp: new Date() },
      { id: '2', message: 'New reward "Movie Night" has been added!', timestamp: new Date() },
      { id: '3', message: 'Reminder: Pocket money will be distributed tomorrow.', timestamp: new Date() },
      { id: '4', message: 'Swipe left to delete this notification.', timestamp: new Date() },
    ]);
  }, []);

  const handleDeleteNotification = (id: string) => {
    console.log(`Deleting: ${id}`);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeading text="Notifications" back={true} plus={false} />
      <ScrollView style={styles.scrollView}>
        {notifications.length === 0 ? (
          <Text style={styles.noNotificationsText}>No new notifications.</Text>
        ) : (
          notifications.map((notification) => (
            <NotificationRow
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
    flex: 1,
  },
  notificationRow: {
    padding: 15,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
  },
  notificationMessage: {
    fontSize: 16,
  },
  noNotificationsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});
