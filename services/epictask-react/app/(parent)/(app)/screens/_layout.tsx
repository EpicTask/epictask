import { Stack } from "expo-router";

export default function ScreensLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="kid-profile/index" options={{ headerShown: false }} />
    </Stack>
  );
}
