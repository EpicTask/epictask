import { QueryClient } from "@tanstack/react-query";
import { narrativeService } from "../narrativeService";
import createAuthenticatedClient from "../apiClient";

jest.mock("../apiClient", () => ({
  __esModule: true,
  default: jest.fn(() => ({ get: jest.fn() })),
}));
const api = createAuthenticatedClient.mock.results[0].value;

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
