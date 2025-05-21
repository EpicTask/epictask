import { Stack } from "expo-router";

export default function OnBoardingLayout() {
  return (
    <Stack
      initialRouteName="screen1"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#f5f5f5" },
      }}
    >
      <Stack.Screen name="screen1" options={{headerShown:false}} />
      <Stack.Screen name="screen2" options={{headerShown:false}} />
      <Stack.Screen name="screen3" options={{headerShown:false}} />
    </Stack>
  );
}
