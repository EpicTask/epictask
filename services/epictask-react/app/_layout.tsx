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
      const inParentGroup = segments[0] === '(parent)';
      const inKidGroup = segments[0] === '(kid)';

      if (user) {
        // User is authenticated
        const userRole = user.role || (user.user && user.user.role);
        console.log("User authenticated with role:", userRole);
        
        if (inAuthGroup) {
          // If user is authenticated but in auth screens, redirect to their dashboard
          const targetPath = userRole === 'parent' ? '/(parent)/(app)/(tabs)' : '/(kid)/(app)/(tabs)';
          console.log("Redirecting authenticated user to:", targetPath);
          router.replace(targetPath as any);
        } else if (userRole === 'parent' && !inParentGroup) {
          // Parent user not in parent section (and not in admin), redirect to parent dashboard
          console.log("Redirecting parent to parent dashboard");
          router.replace('/(parent)/(app)/(tabs)' as any);
        } else if (userRole === 'child' && !inKidGroup) {
          // Child user not in kid section (and not in admin), redirect to kid dashboard
          console.log("Redirecting child to kid dashboard");
          router.replace('/(kid)/(app)/(tabs)' as any);
        }
      } else {
        // User is not authenticated
        if (!inAuthGroup && segments[0] !== undefined) {
          // If user is not authenticated and not in auth group or index, redirect to index
          console.log("Redirecting unauthenticated user to index");
          router.replace('/(parent)/auth/login' as any);
        }
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
