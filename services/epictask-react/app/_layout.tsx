import "react-native-reanimated";
import * as SplashScreen from "expo-splash-screen";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

import { useEffect } from "react";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    MontSerrat_regular: require("../assets/fonts/Montserrat/Montserrat-Regular.ttf"),
    MontSerrat_bold: require("../assets/fonts/Montserrat/Montserrat-Bold.ttf"),
    MontSerrat_light: require("../assets/fonts/Montserrat/Montserrat-Light.ttf"),
    MontSerrat_medium: require("../assets/fonts/Montserrat/Montserrat-Medium.ttf"),
    MontSerrat_extraBold: require("../assets/fonts/Montserrat/Montserrat-ExtraBold.ttf"),
    MontSerrat_semiBold: require("../assets/fonts/Montserrat/Montserrat-SemiBold.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(kid)" options={{ headerShown: false }} />
        <Stack.Screen name="(parent)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar backgroundColor="transparent" />
    </ThemeProvider>
  );
}
