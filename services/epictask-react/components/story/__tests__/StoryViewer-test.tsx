import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import StoryViewer from "@/app/(kid)/(app)/screens/story-viewer";
import narrativeService from "@/api/narrativeService";

jest.mock("expo-router", () => ({
  router: { back: jest.fn() },
  useLocalSearchParams: () => ({ storyId: "story" }),
}));
jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ effectiveUserId: "child", user: { uid: "parent" } }),
}));
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: require("react-native").View,
}));
jest.mock("react-native-progress", () => ({ Bar: () => null }));
jest.mock("@/components/CustomText", () => require("react-native").Text);
jest.mock("@/components/story/MoneyMomentCard", () => () => null);
jest.mock("@/api/narrativeService", () => ({
  __esModule: true,
  default: {
    getStory: jest.fn(), getProgress: jest.fn(), startStory: jest.fn(), getNode: jest.fn(),
  },
  storyLoadErrorMessage: () => "Failed to load story. Please try again.",
}));

const api = jest.mocked(narrativeService);
const progress = {
  user_id: "child", story_id: "story", current_node: "scene",
  completed_nodes: [], total_xp: 0, status: "in_progress" as const,
  started_at: "", last_updated: "",
};
const node = { node_id: "scene", prompt: "Welcome back to your story", options: [] };

beforeEach(() => {
  jest.clearAllMocks();
  api.getStory.mockResolvedValue({ story_id: "story", title: "Saving", total_nodes: 3 } as any);
  api.startStory.mockResolvedValue({ node, progress });
  api.getNode.mockResolvedValue(node);
});

it("starts once, then resumes the saved scene for the child after leaving and returning", async () => {
  api.getProgress.mockResolvedValueOnce([]).mockResolvedValueOnce([progress]);
  const firstVisit = render(<StoryViewer />);
  await firstVisit.findByText(node.prompt);
  expect(api.startStory).toHaveBeenCalledWith("child", "story");
  firstVisit.unmount();

  const returnVisit = render(<StoryViewer />);
  await returnVisit.findByText(node.prompt);
  expect(api.getNode).toHaveBeenCalledWith("story", "scene", "child");
  expect(api.startStory).toHaveBeenCalledTimes(1);
  expect(returnVisit.queryByText("Story Load Failed")).toBeNull();
});

it("retries a failed resume without starting over", async () => {
  api.getProgress.mockResolvedValue([progress]);
  api.getNode.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(node);
  const screen = render(<StoryViewer />);
  await screen.findByText("Story Load Failed");
  fireEvent.press(screen.getByText(/Try Again/));
  await screen.findByText(node.prompt);
  expect(api.startStory).not.toHaveBeenCalled();
  expect(api.getNode).toHaveBeenCalledTimes(2);
});
