import { queryClient } from "./queryClient";

// Mutations do not always carry the parent and every assignee. Invalidate the
// affected resource families in this session, not unrelated profile/story data.
export const invalidateTaskQueries = () => {
  void queryClient.invalidateQueries({
    predicate: ({ queryKey: key }) =>
      key[0] === "allTasks" ||
      (key[0] === "home" &&
        ["summary", "recent", "kidSummary", "rewards"].includes(key[2])),
  });
};

export const invalidateChildrenQueries = (parentId) => {
  void queryClient.invalidateQueries({
    queryKey: ["linkedChildren", parentId],
  });
  void queryClient.invalidateQueries({
    queryKey: ["home", parentId, "rewards"],
  });
};

export const invalidateNotificationQueries = () => {
  void queryClient.invalidateQueries({ queryKey: ["notifications"] });
};

export const invalidateProgressQueries = (uid) => {
  void queryClient.invalidateQueries({ queryKey: ["storyProgress", uid] });
  void queryClient.invalidateQueries({ queryKey: ["activeStoryNode", uid] });
};

export const invalidatePayoutQueries = () => {
  void queryClient.invalidateQueries({
    predicate: ({ queryKey: key }) =>
      key[0] === "home" && ["payouts", "rewards"].includes(key[2]),
  });
};
