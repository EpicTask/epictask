import * as React from "react";
import { Animated } from "react-native";
import { render } from "@testing-library/react-native";
import KidRewardsView from "../KidRewardsView";

// The component starts an infinite coin-spin via Animated.loop. Left running it
// keeps scheduling frames and the test run never terminates, so stub it.
beforeAll(() => {
  jest.spyOn(Animated, "loop").mockReturnValue({
    start: jest.fn(),
    stop: jest.fn(),
    reset: jest.fn(),
  } as any);
});

afterAll(() => {
  jest.restoreAllMocks();
});

/**
 * Locks in the reward-display fixes. Each of these was a real defect:
 *  - the "Treasure Chest" headlined tasks_completed, so the balance a child
 *    opens the tab to see was not on the screen
 *  - ages 8-18 had no pending state at all
 *  - the 5-7 jar was passed a *count* of pending payouts and rendered it as
 *    coins, and showed a weighted float to six-year-olds
 *  - a partial payload crashed the tab instead of degrading
 */

const build = (overrides: any = {}) => ({
  kid_data: {
    user_id: "child_1",
    display_name: "Ada",
    currencies: {
      xrp_earned: 6,
      rlusd_earned: 1.5,
      etask_earned: 0,
      xrp_pending: 4,
      rlusd_pending: 0,
      etask_pending: 0,
    },
    tasks_completed: 3,
    tasks_pending: 1,
    level: 2,
    family_rank: 1,
    global_rank: 1,
    token_score: 6,
    achievements: ["First Task Completed"],
    next_level_progress: 60,
    ...(overrides.kid_data || {}),
  },
  family_position: 1,
  family_total_kids: 2,
  encouragement_message: "Nice work!",
  next_milestone: { type: "level", current: 2, next: 3, progress: 60 },
  global_context: { rank: 1, message: "Ranked #1" },
  ...overrides,
});

describe("KidRewardsView — 8-18 view", () => {
  it("headlines the settled balance, not the task count", () => {
    const { getByText, queryByText } = render(
      <KidRewardsView kidData={build() as any} childAge={12} />,
    );
    // 6 XRP + 1.5 RLUSD settled. Distinct from either currency card, so this
    // also proves the headline is a sum rather than one bucket.
    expect(getByText("7.50")).toBeTruthy();
    expect(getByText("Yours to keep")).toBeTruthy();
    expect(queryByText("Tasks Completed")).toBeNull();
  });

  it("shows approved-but-unpaid money", () => {
    const { getByText } = render(
      <KidRewardsView kidData={build() as any} childAge={12} />,
    );
    expect(getByText("4.00 approved — waiting to arrive")).toBeTruthy();
  });

  it("hides the pending row when nothing is pending", () => {
    const data = build({
      kid_data: {
        currencies: { xrp_earned: 6, rlusd_earned: 0, etask_earned: 0 },
      },
    });
    const { queryByText } = render(
      <KidRewardsView kidData={data as any} childAge={12} />,
    );
    expect(queryByText(/waiting to arrive/)).toBeNull();
  });

  it("prompts a brand-new child instead of showing a blank chest", () => {
    const data = build({
      kid_data: {
        currencies: { xrp_earned: 0, rlusd_earned: 0, etask_earned: 0 },
        tasks_completed: 0,
        tasks_pending: 0,
        token_score: 0,
        achievements: [],
      },
    });
    const { getByText } = render(
      <KidRewardsView kidData={data as any} childAge={12} />,
    );
    expect(
      getByText("Your chest is empty. Finish a task to add your first coins!"),
    ).toBeTruthy();
  });
});

describe("KidRewardsView — 5-7 jar", () => {
  it("shows whole coins, never a weighted float", () => {
    const data = build({
      kid_data: {
        currencies: {
          xrp_earned: 12.75,
          rlusd_earned: 0,
          etask_earned: 0,
          xrp_pending: 0,
        },
      },
    });
    const { getByText, queryByText } = render(
      <KidRewardsView kidData={data as any} childAge={6} />,
    );
    expect(getByText("12")).toBeTruthy();
    expect(queryByText("12.75")).toBeNull();
  });

  it("reports the pending amount, not a count of payout requests", () => {
    const data = build({
      kid_data: {
        currencies: {
          xrp_earned: 0,
          rlusd_earned: 0,
          etask_earned: 0,
          etask_pending: 50,
        },
      },
    });
    const { getByText } = render(
      <KidRewardsView
        kidData={data as any}
        childAge={6}
        // One pending request worth 50. The old code passed this count
        // straight to the jar and rendered "+1 waiting".
        progressSummary={{ total_payouts_pending: 1 }}
      />,
    );
    expect(getByText("+50 waiting for Mom/Dad")).toBeTruthy();
  });
});

describe("KidRewardsView — resilience", () => {
  it("renders without crashing on a partial payload", () => {
    const { getByText } = render(
      <KidRewardsView kidData={{ kid_data: {} } as any} childAge={12} />,
    );
    expect(getByText("Yours to keep")).toBeTruthy();
  });

  it("renders without crashing on an empty payload", () => {
    expect(() =>
      render(<KidRewardsView kidData={{} as any} childAge={12} />),
    ).not.toThrow();
  });
});
