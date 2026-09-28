import { queryOptions } from "@tanstack/react-query";
import { firestoreService } from "./firestoreService";
import { taskService } from "./taskService";
import { narrativeService } from "./narrativeService";
import { notificationService } from "./notificationService";
import { Task } from "@/constants/Interfaces";

export interface HomeKid {
  uid: string;
  displayName: string;
  age: number;
  grade_level: string;
  device_sharing_enabled?: boolean;
}

export interface TaskSummary {
  completed: number;
  in_progress: number;
  total: number;
}

export interface FamilyRewards {
  children: { user_id: string; token_score: number; level: number }[];
}

export const homeKeys = {
  summary: (uid: string) => ["home", uid, "summary"] as const,
  recent: (uid: string) => ["home", uid, "recent", 5, 7] as const,
  rewards: (uid: string) => ["home", uid, "rewards"] as const,
  payouts: (uid: string) => ["home", uid, "payouts"] as const,
  kidSummary: (parentId: string, kidId: string) =>
    ["home", parentId, "kidSummary", kidId] as const,
};

const freshness = { staleTime: 30_000, retry: 1 };

// React Query owns freshness here. Bypass the legacy service cache on every
// actual read so invalidation and pull-to-refresh cannot return its old values.
export const childrenQuery = (uid: string) =>
  queryOptions({
    queryKey: ["linkedChildren", uid],
    queryFn: async (): Promise<HomeKid[]> => {
      const result = await firestoreService.getLinkedChildren(uid, false);
      if (!result.success)
        throw new Error(result.error || "Could not load children");
      return result.children;
    },
    enabled: !!uid,
    ...freshness,
    staleTime: 120_000,
  });

export const tasksQuery = (uid: string) =>
  queryOptions({
    queryKey: ["allTasks", uid],
    queryFn: async (): Promise<Task[]> => {
      const result = await firestoreService.getTasksForUser(uid, {
        useCache: false,
      });
      if (!result.success) throw new Error("Could not load tasks");
      return result.tasks.map((task: Task & { id: string }) => ({
        ...task,
        task_id: task.task_id || task.id,
      }));
    },
    enabled: !!uid,
    ...freshness,
  });

export const progressQuery = (uid: string) =>
  queryOptions({
    queryKey: ["storyProgress", uid],
    queryFn: () => narrativeService.getProgress(uid),
    enabled: !!uid,
    ...freshness,
  });

// Notifications are addressed by the authenticated API principal, including
// shared-device mode. Do not mislabel this endpoint with the selected kid ID.
export const notificationsQuery = (uid: string) =>
  queryOptions({
    queryKey: ["notifications", uid, "unread", 20],
    queryFn: async (): Promise<number> => {
      const result = await notificationService.getNotifications(20, true);
      return result.length;
    },
    enabled: !!uid,
    ...freshness,
  });

export const summaryQuery = (uid: string) =>
  queryOptions({
    queryKey: homeKeys.summary(uid),
    queryFn: async (): Promise<TaskSummary> =>
      (await firestoreService.getTaskSummary(uid, {
        useCache: false,
      })) as TaskSummary,
    enabled: !!uid,
    ...freshness,
  });

export const recentQuery = (uid: string) =>
  queryOptions({
    queryKey: homeKeys.recent(uid),
    queryFn: () =>
      firestoreService.getRecentTasks(uid, 5, 7, { useCache: false }),
    enabled: !!uid,
    ...freshness,
  });

export const rewardsQuery = (uid: string) =>
  queryOptions({
    queryKey: homeKeys.rewards(uid),
    queryFn: async (): Promise<FamilyRewards> =>
      taskService.getFamilyLeaderboard(uid),
    enabled: !!uid,
    ...freshness,
  });

export const payoutsQuery = (uid: string) =>
  queryOptions({
    queryKey: homeKeys.payouts(uid),
    // The endpoint already scopes the family by authentication. Its optional
    // argument filters by KID ID, so passing the parent ID filters out its kids.
    queryFn: () => narrativeService.getPendingPayouts(),
    enabled: !!uid,
    ...freshness,
  });

export const kidSummaryQuery = (parentId: string, kidId: string) =>
  queryOptions({
    queryKey: homeKeys.kidSummary(parentId, kidId),
    queryFn: async (): Promise<TaskSummary> =>
      (await firestoreService.getKidTaskSummary(kidId, {
        useCache: false,
      })) as TaskSummary,
    enabled: !!parentId && !!kidId,
    ...freshness,
  });
