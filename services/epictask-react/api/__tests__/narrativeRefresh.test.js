import { QueryClient } from "@tanstack/react-query";
import { narrativeService, storyLoadErrorMessage } from "../narrativeService";
import createAuthenticatedClient from "../apiClient";

jest.mock("../apiClient", () => ({
  __esModule: true,
  default: jest.fn(() => ({ get: jest.fn() })),
}));
const api = createAuthenticatedClient.mock.results[0].value;

beforeEach(() => jest.clearAllMocks());

it("loads a resumed scene for the active child without inventing an age", async () => {
  const node = { node_id: "saved", options: [] };
  api.get.mockResolvedValueOnce({ data: node });
  await expect(narrativeService.getNode("story", "saved", "child")).resolves.toBe(node);
  expect(api.get).toHaveBeenCalledWith("/stories/story/nodes/saved", {
    params: { user_id: "child" },
  });
});

it("does not request a scene before a child is selected", async () => {
  await expect(narrativeService.getNode("story", "saved", "")).rejects.toThrow("active child");
  expect(api.get).not.toHaveBeenCalled();
});

it.each([403, 500])("preserves the node API failure (%s) for diagnosis and retry", async (status) => {
  const failure = { isAxiosError: true, response: { status, data: { detail: "Server detail" } } };
  api.get.mockRejectedValueOnce(failure);
  await expect(narrativeService.getNode("story", "saved", "child")).rejects.toBe(failure);
  expect(storyLoadErrorMessage(failure)).toBe(status === 403
    ? "This story is not available for the selected child."
    : "Failed to load story. Please try again.");
});

it("keeps cached story progress when its endpoint fails instead of replacing it with an empty list", async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  const options = {
    queryKey: ["storyProgress", "kid"],
    queryFn: () => narrativeService.getProgress("kid"),
  };
  const progress = [
    { story_id: "lesson", status: "in_progress", total_xp: 10 },
  ];
  api.get.mockResolvedValueOnce({ data: progress });
  await client.fetchQuery(options);
  api.get.mockRejectedValueOnce(new Error("offline"));
  await expect(client.fetchQuery(options)).rejects.toThrow("offline");
  expect(client.getQueryData(options.queryKey)).toEqual(progress);
  client.clear();
});

it("treats a missing individual story as unstarted, but does not hide a missing list endpoint", async () => {
  const missing = { isAxiosError: true, response: { status: 404 } };
  api.get.mockRejectedValueOnce(missing);
  await expect(
    narrativeService.getProgress("kid", "unstarted"),
  ).resolves.toEqual([]);
  api.get.mockRejectedValueOnce(missing);
  await expect(narrativeService.getProgress("kid")).rejects.toBe(missing);
});
