/**
 * usePushNotifications.ts
 *
 * Handles the full push notification lifecycle for the EpicTask app:
 *   1. Request OS permissions (iOS requires explicit prompt)
 *   2. Get the raw device push token (FCM on Android, APNs on iOS)
 *   3. Register the token with mono_service (PUT /api/users/fcm-token)
 *   4. Set up an Android notification channel
 *   5. Handle foreground notifications (display them while app is open)
 *   6. Handle notification taps → navigate to the relevant screen
 *
 * Usage:
 *   Call inside the authenticated section of _layout.tsx after the user
 *   object is available:
 *
 *     usePushNotifications(user);
 *
 * Notes:
 *   - iOS production builds require APNs auth key configured in Firebase Console.
 *   - Android requires "google-services.json" in the project root (Expo manages this).
 *   - The Android channel id ("epictask_notifications") must match the value used
 *     in mono_service notification_service.py and xrpl_management notificationHelper.ts.
 */

import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { userService } from "@/api/userService";

// ── Android notification channel ─────────────────────────────────────────────
// Must be created before any notification can appear on Android 8+.
// The channel id must match what mono_service / notificationHelper sets in
// the `android.notification.channelId` FCM field.
if (Platform.OS === "android") {
  Notifications.setNotificationChannelAsync("epictask_notifications", {
    name: "EpicTask Notifications",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#6C63FF",
    sound: "default",
  });
}

// ── Foreground notification behaviour ────────────────────────────────────────
// Show the alert, play sound, and update the badge while the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ── Navigation mapping ────────────────────────────────────────────────────────
type NotificationData = {
  notification_type?: string;
  task_id?: string;
  [key: string]: string | undefined;
};

function navigateFromNotification(
  data: NotificationData,
  userRole?: string
): void {
  const { notification_type, task_id } = data;
  if (!notification_type) return;

  const isParent = userRole === "parent";

  switch (notification_type) {
    case "TASK_ASSIGNED":
    case "TASK_COMPLETED":
    case "TASK_VERIFIED":
    case "REWARD_EARNED":
      if (task_id) {
        // Navigate to the appropriate task detail screen
        const taskPath = isParent
          ? "/(parent)/(app)/screens/task"
          : "/(kid)/(app)/screens/task";
        router.push({ pathname: taskPath as any, params: { task_id } });
      } else {
        // Fall back to the task tab
        router.push(
          isParent ? "/(parent)/(app)/(tabs)/task" : "/(kid)/(app)/(tabs)"
        );
      }
      break;

    case "ESCROW_CREATED":
    case "ESCROW_RELEASED":
    case "ESCROW_CANCELLED":
    case "PAYMENT_SENT":
    case "PAYMENT_RECEIVED":
      // Navigate to the wallet/settings screen
      router.push(
        isParent
          ? ("/(parent)/(app)/screens/settings/wallet" as any)
          : ("/(kid)/(app)/screens/settings/wallet" as any)
      );
      break;

    case "FAMILY_INVITE":
      router.push("/(parent)/(app)/screens/add-kid" as any);
      break;

    default:
      // Open the notification list for any other type
      router.push("/(parent)/(app)/screens/notification-screen" as any);
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function usePushNotifications(
  user: { uid?: string; role?: string } | null | undefined
): void {
  const notificationListenerRef = useRef<Notifications.Subscription | null>(
    null
  );
  const responseListenerRef = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // Don't register until the user is authenticated
    if (!user?.uid) return;

    let isMounted = true;

    async function register() {
      try {
        // 1. Request / check permissions
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== "granted") {
          // User denied — don't block the app, just skip registration
          console.log(
            "[usePushNotifications] Push notification permission denied"
          );
          return;
        }

        // 2. Get the raw device token (FCM on Android, APNs on iOS)
        const tokenResult = await Notifications.getDevicePushTokenAsync();
        if (!isMounted) return;

        const platform =
          tokenResult.type === "ios" ? "ios" : "android";

        // 3. Register the token with mono_service
        await userService.registerPushToken(tokenResult.data, platform);
        console.log(
          `[usePushNotifications] Push token registered [${platform}]`
        );
      } catch (err) {
        console.warn("[usePushNotifications] Registration failed:", err);
      }
    }

    register();

    // 4. Handle notifications received while the app is foregrounded
    notificationListenerRef.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log(
          "[usePushNotifications] Foreground notification:",
          notification.request.content.title
        );
        // The handler set above already shows the alert automatically
      });

    // 5. Handle notification taps (app in background or killed)
    responseListenerRef.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = (response.notification.request.content.data ??
          {}) as NotificationData;
        navigateFromNotification(data, user.role);
      });

    // 6. Handle the initial notification that launched the app (if any)
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response && isMounted) {
        const data = (response.notification.request.content.data ??
          {}) as NotificationData;
        navigateFromNotification(data, user.role);
      }
    });

    return () => {
      isMounted = false;
      notificationListenerRef.current?.remove();
      responseListenerRef.current?.remove();
    };
  }, [user?.uid, user?.role]);
}
