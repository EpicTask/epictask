import { Stack } from 'expo-router';

export default function ScreensLayout() {
  return (
    <Stack screenOptions={{headerShown:false}}>
      <Stack.Screen name="kid-profile" options={{ title: 'Kid Profile', headerShown:false }} />
    </Stack>
  );
}