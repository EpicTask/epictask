import { useEffect } from "react";
import { AppState, Platform } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { focusManager, onlineManager } from "@tanstack/react-query";

export function useQueryLifecycle() {
  useEffect(() => {
    if (Platform.OS === "web") return;
    focusManager.setFocused(AppState.currentState === "active");
    const appState = AppState.addEventListener("change", (state) => {
      focusManager.setFocused(state === "active");
    });
    const unsubscribe = NetInfo.addEventListener((state) => {
      // Unknown reachability during startup is not evidence of being offline.
      onlineManager.setOnline(
        state.isConnected !== false && state.isInternetReachable !== false,
      );
    });
    return () => {
      appState.remove();
      unsubscribe();
    };
  }, []);
}
