import "react-native-reanimated";
import * as SplashScreen from "expo-splash-screen";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useEffect, useContext } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/hooks/useColorScheme";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, AuthContext } from '../context/AuthContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayout() {
  const colorScheme = useColorScheme();
  const { user, loading } = useContext(AuthContext);
  const segments = useSegments();
  const router = useRouter();

  const [loaded] = useFonts({
    MontSerrat_regular: require("../assets/fonts/Montserrat/Montserrat-Regular.ttf"),
    MontSerrat_bold: require("../assets/fonts/Montserrat/Montserrat-Bold.ttf"),
    MontSerrat_light: require("../assets/fonts/Montserrat/Montserrat-Light.ttf"),
    MontSerrat_medium: require("../assets/fonts/Montserrat/Montserrat-Medium.ttf"),
    MontSerrat_extraBold: require("../assets/fonts/Montserrat/Montserrat-ExtraBold.ttf"),
    MontSerrat_semiBold: require("../assets/fonts/Montserrat/Montserrat-SemiBold.ttf"),
  });

  useEffect(() => {
    if (loaded && !loading) {
      SplashScreen.hideAsync();
      const inAuthGroup = segments[0] === 'auth';

      // If the user is not signed in and the initial segment is not the auth group, redirect to the auth group.
      if (user && inAuthGroup) {
        // If the user is signed in and in the auth group, redirect to their respective dashboard.
        const targetPath = user.role === 'parent' ? '/(parent)' : '/(kid)';
        router.replace(targetPath);
      }
    }
  }, [loaded, user, loading, segments, router]);

  if (!loaded || loading) {
    return null; 
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(kid)" options={{ headerShown: false }} />
        <Stack.Screen name="(parent)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar backgroundColor="transparent" />
    </ThemeProvider>
  );
}

export default function AppWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootLayout />
      </AuthProvider>
    </QueryClientProvider>
  );
}
