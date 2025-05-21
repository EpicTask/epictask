import { Stack } from "expo-router";

export default function ScreensLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="kid-profile" options={{ headerShown: false }} />
      <Stack.Screen name="settings/basic-info" options={{ headerShown: false }} />
      <Stack.Screen name="settings/task-overview" options={{ headerShown: false }} />
      <Stack.Screen name="settings/linked-parent" options={{ headerShown: false }} />
      <Stack.Screen name="settings/change-pin" options={{ headerShown: false }} />
      <Stack.Screen name="settings/wallet" options={{ headerShown: false }} />
    </Stack>
  );
}
