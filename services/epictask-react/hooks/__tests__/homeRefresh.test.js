import React, { useCallback, useEffect } from "react";
import { Text, TouchableOpacity } from "react-native";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { queryClient } from "../../api/queryClient";
import {
  childrenQuery,
  tasksQuery,
  summaryQuery,
  kidSummaryQuery,
} from "../../api/homeQueries";
import { firestoreService } from "../../api/firestoreService";
import { invalidateChildrenQueries } from "../../api/queryInvalidation";
import taskService from "../../api/taskService";
import createAuthenticatedClient from "../../api/apiClient";
import { useScreenRefresh } from "../useScreenRefresh";
import { QuerySection } from "../../components/common/QuerySection";

let mockFocus;
jest.mock("expo-router", () => ({
  useFocusEffect: (callback) => {
    const React = require("react");
    React.useEffect(() => {
      mockFocus = callback;
      return callback();
    }, [callback]);
  },
}));
jest.mock("../../api/firestoreService", () => ({
  firestoreService: {
    getTasksForUser: jest.fn(),
    getLinkedChildren: jest.fn(),
    getTaskSummary: jest.fn(),
    getKidTaskSummary: jest.fn(),
    cache: { clearTasks: jest.fn() },
  },
}));
jest.mock("../../api/apiClient", () => ({
  __esModule: true,
  default: jest.fn(() => ({ post: jest.fn() })),
}));
jest.mock("../../api/narrativeService", () => ({
  __esModule: true,
  default: {},
  narrativeService: {},
  notificationService: {},
}));
jest.mock("../../api/notificationService", () => ({
  __esModule: true,
  default: {},
  narrativeService: {},
  notificationService: {},
}));

const task = (title) => ({ id: "t1", task_id: "t1", task_title: title });
const taskApi = createAuthenticatedClient.mock.results[0].value;
const response = (title) => ({ success: true, tasks: [task(title)] });
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
};

function Content({ title, onMount }) {
  useEffect(() => {
    onMount();
  }, [onMount]);
  return <Text>{title}</Text>;
}

function Tasks({ uid, onMount }) {
  const query = useQuery({ ...tasksQuery(uid), retry: false });
  const predicate = useCallback(
    ({ queryKey }) => queryKey[0] === "allTasks" && queryKey[1] === uid,
    [uid],
  );
  const { refreshing, onRefresh } = useScreenRefresh(predicate);
  return (
    <>
      <Text>Always-visible header</Text>
      <Text>{refreshing ? "Refreshing" : "Idle"}</Text>
      <TouchableOpacity onPress={onRefresh}>
        <Text>Refresh</Text>
      </TouchableOpacity>
      <QuerySection query={query} label="tasks">
        <Content
          title={query.data?.[0]?.task_title || "Empty"}
          onMount={onMount}
        />
      </QuerySection>
    </>
  );
}
const tree = (uid, onMount) => (
  <QueryClientProvider client={queryClient}>
    <Tasks key={uid} uid={uid} onMount={onMount} />
  </QueryClientProvider>
);

beforeEach(() => {
  jest.clearAllMocks();
  queryClient.clear();
  queryClient.setDefaultOptions({
    queries: { retry: false, gcTime: Infinity },
  });
  firestoreService.getTasksForUser.mockResolvedValue(response("Original task"));
});
afterEach(() => {
  queryClient.clear();
});

it("keeps content mounted on fresh focus and deduplicates forced refreshes that bypass the legacy cache", async () => {
  const onMount = jest.fn();
  const screen = render(tree("kid-a", onMount));
  await screen.findByText("Original task");
  await act(async () => {
    mockFocus();
    mockFocus();
  });
  expect(firestoreService.getTasksForUser).toHaveBeenCalledTimes(1);

  const read = deferred();
  firestoreService.getTasksForUser.mockReturnValueOnce(read.promise);
  fireEvent.press(screen.getByText("Refresh"));
  fireEvent.press(screen.getByText("Refresh"));
  expect(screen.getByText("Original task")).toBeTruthy();
  expect(screen.queryByLabelText("Loading tasks")).toBeNull();
  expect(screen.getByText("Refreshing")).toBeTruthy();
  expect(firestoreService.getTasksForUser).toHaveBeenCalledTimes(2);
  expect(firestoreService.getTasksForUser).toHaveBeenLastCalledWith("kid-a", {
    useCache: false,
  });
  await act(async () => {
    read.resolve(response("Updated task"));
  });
  await screen.findByText("Updated task");
  expect(screen.getByText("Idle")).toBeTruthy();
  expect(onMount).toHaveBeenCalledTimes(1);
});

it("retains successful content on refresh failure and provides retry", async () => {
  const onMount = jest.fn();
  const screen = render(tree("kid-a", onMount));
  await screen.findByText("Original task");
  firestoreService.getTasksForUser.mockRejectedValueOnce(new Error("offline"));
  fireEvent.press(screen.getByText("Refresh"));
  const retry = await screen.findByText(/Couldn't update tasks/);
  expect(screen.getByText("Original task")).toBeTruthy();
  expect(screen.getByText("Idle")).toBeTruthy();
  firestoreService.getTasksForUser.mockResolvedValueOnce(
    response("Recovered task"),
  );
  fireEvent.press(retry);
  await screen.findByText("Recovered task");
  expect(onMount).toHaveBeenCalledTimes(1);
});

it("shows only the new child's data when an old child's request resolves late", async () => {
  const oldRead = deferred();
  const newRead = deferred();
  firestoreService.getTasksForUser.mockImplementation((uid) =>
    uid === "kid-a" ? oldRead.promise : newRead.promise,
  );
  const onMount = jest.fn();
  const screen = render(tree("kid-a", onMount));
  expect(screen.getByText("Always-visible header")).toBeTruthy();
  screen.rerender(tree("kid-b", onMount));
  await act(async () => {
    oldRead.resolve(response("Old child task"));
  });
  expect(screen.queryByText("Old child task")).toBeNull();
  expect(screen.getByLabelText("Loading tasks")).toBeTruthy();
  await act(async () => {
    newRead.resolve(response("New child task"));
  });
  await screen.findByText("New child task");
});

it("revalidates stale data on focus while retaining existing content", async () => {
  const screen = render(tree("kid-a", jest.fn()));
  await screen.findByText("Original task");
  await act(async () => {
    await queryClient.invalidateQueries({
      queryKey: ["allTasks", "kid-a"],
      refetchType: "none",
    });
  });
  firestoreService.getTasksForUser.mockResolvedValueOnce(
    response("Changed elsewhere"),
  );
  await act(async () => {
    mockFocus();
  });
  await screen.findByText("Changed elsewhere");
  expect(firestoreService.getTasksForUser).toHaveBeenCalledTimes(2);
});

it("adding a child invalidates fresh membership without waiting for its two-minute freshness window", async () => {
  firestoreService.getLinkedChildren.mockResolvedValueOnce({
    success: true,
    children: [],
  });
  function Children() {
    const result = useQuery(childrenQuery("parent"));
    return (
      <Text>
        {result.data?.map((child) => child.displayName).join(",") || "No kids"}
      </Text>
    );
  }
  const screen = render(
    <QueryClientProvider client={queryClient}>
      <Children />
    </QueryClientProvider>,
  );
  await waitFor(() =>
    expect(queryClient.getQueryData(["linkedChildren", "parent"])).toEqual([]),
  );
  firestoreService.getLinkedChildren.mockResolvedValueOnce({
    success: true,
    children: [{ uid: "kid", displayName: "New kid" }],
  });
  act(() => {
    invalidateChildrenQueries("parent");
  });
  await screen.findByText("New kid");
  expect(firestoreService.getLinkedChildren).toHaveBeenLastCalledWith(
    "parent",
    false,
  );
});

it("a successful completion updates the observed task query; failed writes do not invalidate it", async () => {
  const screen = render(tree("kid-a", jest.fn()));
  await screen.findByText("Original task");
  taskApi.post.mockRejectedValueOnce(new Error("write failed"));
  await expect(
    taskService.taskCompleted({ task_id: "t1", completed_by_id: "kid-a" }),
  ).rejects.toThrow();
  expect(firestoreService.getTasksForUser).toHaveBeenCalledTimes(1);
  taskApi.post.mockResolvedValueOnce({ data: { success: true } });
  firestoreService.getTasksForUser.mockResolvedValueOnce(
    response("Completed task"),
  );
  await act(async () => {
    await taskService.taskCompleted({
      task_id: "t1",
      completed_by_id: "kid-a",
    });
  });
  await screen.findByText("Completed task");
});

it("preserves all-history summary counts rather than deriving them from capped task lists", async () => {
  firestoreService.getTaskSummary.mockResolvedValue({
    total: 101,
    completed: 80,
    in_progress: 21,
  });
  firestoreService.getKidTaskSummary.mockResolvedValue({
    total: 70,
    completed: 60,
    in_progress: 10,
  });
  expect(await queryClient.fetchQuery(summaryQuery("parent"))).toEqual({
    total: 101,
    completed: 80,
    in_progress: 21,
  });
  expect(
    await queryClient.fetchQuery(kidSummaryQuery("parent", "kid-a")),
  ).toEqual({ total: 70, completed: 60, in_progress: 10 });
  expect(firestoreService.getTasksForUser).not.toHaveBeenCalled();
});
