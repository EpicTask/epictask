import { Stack } from "expo-router";

export default function ParentLayout() {
  return (
    <Stack
    initialRouteName="auth"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#f5f5f5" },
      }}
    >
      <Stack.Screen name="(app)" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="on-boarding" />
    </Stack>
  );
}
