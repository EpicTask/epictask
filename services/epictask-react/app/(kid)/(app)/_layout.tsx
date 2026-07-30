import { Stack } from "expo-router";
import SharedModeBanner from "@/components/common/SharedModeBanner";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";

export default function AppLayout() {
  const { isSharedDeviceMode } = useAuth();

  return (
    <View style={styles.container}>
      {isSharedDeviceMode && (
        <SafeAreaView edges={['top']} style={styles.bannerContainer}>
          <SharedModeBanner />
        </SafeAreaView>
      )}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#f5f5f5" },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="screens" options={{ headerShown: false }}  />
        <Stack.Screen name="+not-found" options={{ headerShown: false }}  />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bannerContainer: {
    backgroundColor: '#fff',
  }
});
