import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Query, useQueryClient } from "@tanstack/react-query";

// The caller scopes this predicate to this screen and identity. Native app
// focus is handled once at the root; tab focus checks freshness here.
export function useScreenRefresh(predicate: (query: Query) => boolean) {
  const client = useQueryClient();
  const inFlight = useRef<Promise<void> | null>(null);
  const firstFocus = useRef(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // Enabled query observers already fetch on mount, including stale data.
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      void client.refetchQueries(
        { predicate, stale: true, type: "active" },
        { cancelRefetch: false },
      );
    }, [client, predicate]),
  );

  const onRefresh = useCallback(() => {
    if (inFlight.current) return inFlight.current;
    setRefreshing(true);
    const request = client
      .refetchQueries({ predicate, type: "active" }, { cancelRefetch: false })
      .finally(() => {
        inFlight.current = null;
        setRefreshing(false);
      });
    inFlight.current = request;
    return request;
  }, [client, predicate]);

  return { refreshing, onRefresh };
}
