import { Stack } from "expo-router";

export default function ScreensLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="first-run/index" options={{ headerShown: false }} />
      <Stack.Screen name="kid-profile/index" options={{ headerShown: false }} />
      <Stack.Screen name="notification-screen/index" options={{ headerShown: false }} />
    </Stack>
  );
}