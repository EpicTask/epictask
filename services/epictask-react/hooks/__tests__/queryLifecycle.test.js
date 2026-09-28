import { renderHook } from "@testing-library/react-native";
import { AppState } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { focusManager, onlineManager } from "@tanstack/react-query";
import { useQueryLifecycle } from "../useQueryLifecycle";

jest.mock("@react-native-community/netinfo", () => ({
  __esModule: true,
  default: { addEventListener: jest.fn() },
}));

it("forwards native focus/connectivity changes and cleans up both subscriptions", () => {
  const remove = jest.fn();
  const unsubscribe = jest.fn();
  const appListener = jest
    .spyOn(AppState, "addEventListener")
    .mockReturnValue({ remove });
  NetInfo.addEventListener.mockReturnValue(unsubscribe);
  const focus = jest.spyOn(focusManager, "setFocused");
  const online = jest.spyOn(onlineManager, "setOnline");
  const { unmount } = renderHook(useQueryLifecycle);
  const onAppState = appListener.mock.calls[0][1];
  const onNetwork = NetInfo.addEventListener.mock.calls[0][0];
  onAppState("background");
  expect(focus).toHaveBeenLastCalledWith(false);
  onAppState("active");
  expect(focus).toHaveBeenLastCalledWith(true);
  onNetwork({ isConnected: true, isInternetReachable: false });
  expect(online).toHaveBeenLastCalledWith(false);
  onNetwork({ isConnected: true, isInternetReachable: true });
  expect(online).toHaveBeenLastCalledWith(true);
  unmount();
  expect(remove).toHaveBeenCalledTimes(1);
  expect(unsubscribe).toHaveBeenCalledTimes(1);
  jest.restoreAllMocks();
});
