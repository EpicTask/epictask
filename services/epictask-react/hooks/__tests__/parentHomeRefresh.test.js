import React from "react";
import { ScrollView } from "react-native";
import { act, render, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import HomeScreen from "../../app/(parent)/(app)/(tabs)/index";
import { firestoreService } from "../../api/firestoreService";
import { narrativeService } from "../../api/narrativeService";

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  Link: ({ children }) => children,
  useFocusEffect: (callback) => {
    require("react").useEffect(callback, [callback]);
  },
}));
jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ user: { uid: "parent", displayName: "Parent" } }),
}));
jest.mock("../../hooks/useXummAuth", () => ({
  useXummAuth: () => ({}),
  isXummWalletConnected: () => true,
}));
jest.mock("../../assets", () => ({
  ICONS: { SETTINGS: { bell: null } },
  IMAGES: { profile: 1 },
}));
jest.mock("@expo/vector-icons", () => ({ MaterialIcons: () => null }));
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: require("react-native").View,
}));
jest.mock("../../components/CustomText", () => require("react-native").Text);
jest.mock("../../components/headings/Heading", () => ({ title }) => (
  <>{title}</>
));
jest.mock("../../components/PlusButton", () => () => null);
jest.mock("../../components/onboarding/SetupChecklist", () => () => null);
jest.mock("../../components/modals/ChildSelectionModal", () => () => null);
jest.mock("../../components/modals/ChildPINModal", () => () => null);
jest.mock("../../components/modals/XummQrModal", () => ({
  XummQrModal: () => null,
}));
jest.mock("../../components/cards/TaskCard", () => () => null);
jest.mock("../../components/cards/KidsCard", () => () => null);
jest.mock(
  "../../components/cards/ProgressCard",
  () =>
    ({ completed, text }) => {
      const { Text } = require("react-native");
      return <Text>{`${completed} ${text}`}</Text>;
    },
);
jest.mock("../../api/firestoreService", () => ({
  firestoreService: {
    getTaskSummary: jest.fn(),
    getRecentTasks: jest.fn(),
    getLinkedChildren: jest.fn(),
    subscribeToFamilyTasks: jest.fn(),
  },
}));
jest.mock("../../api/taskService", () => {
  const service = {
    getFamilyLeaderboard: jest.fn(async () => ({ children: [] })),
  };
  return { __esModule: true, default: service, taskService: service };
});
jest.mock("../../api/narrativeService", () => {
  const service = { getPendingPayouts: jest.fn(async () => []) };
  return { __esModule: true, default: service, narrativeService: service };
});
jest.mock("../../api/notificationService", () => {
  const service = { getNotifications: jest.fn(async () => []) };
  return { __esModule: true, default: service, notificationService: service };
});

it("loads sections independently and preserves the same ScrollView through a failed refresh", async () => {
  let finishSummary;
  firestoreService.getTaskSummary.mockReturnValueOnce(
    new Promise((resolve) => {
      finishSummary = resolve;
    }),
  );
  firestoreService.getRecentTasks.mockResolvedValue([]);
  firestoreService.getLinkedChildren.mockResolvedValue({
    success: true,
    children: [],
  });
  const client = new QueryClient({
    defaultOptions: { queries: { gcTime: Infinity } },
  });
  const screen = render(
    <QueryClientProvider client={client}>
      <HomeScreen />
    </QueryClientProvider>,
  );
  const scroll = screen.UNSAFE_getByType(ScrollView);
  await screen.findByText(
    "No kids linked yet. Link your first child to get started!",
  );
  expect(screen.getByLabelText("Loading task overview")).toBeTruthy();
  expect(firestoreService.getRecentTasks).toHaveBeenCalledTimes(1);
  expect(narrativeService.getPendingPayouts).toHaveBeenCalledWith();
  expect(firestoreService.subscribeToFamilyTasks).not.toHaveBeenCalled();
  await act(async () => {
    finishSummary({ total: 100, completed: 80, in_progress: 20 });
  });
  await screen.findByText("80 Completed");

  // Disable retries only for the failure fixture, not production behavior.
  client
    .getQueryCache()
    .getAll()
    .forEach((query) => query.setOptions({ ...query.options, retry: false }));
  firestoreService.getTaskSummary.mockRejectedValue(new Error("offline"));
  await act(async () => {
    await scroll.props.refreshControl.props.onRefresh();
  });
  await waitFor(() =>
    expect(screen.getByText(/Couldn't update task overview/)).toBeTruthy(),
  );
  expect(screen.getByText("80 Completed")).toBeTruthy();
  expect(screen.UNSAFE_getByType(ScrollView)).toBe(scroll);
  expect(screen.queryByLabelText("Loading task overview")).toBeNull();
  screen.unmount();
  client.clear();
});
