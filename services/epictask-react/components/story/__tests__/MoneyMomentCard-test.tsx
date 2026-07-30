import * as React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import MoneyMomentCard from "../MoneyMomentCard";
import { MoneyMoment } from "@/api/narrativeService";

jest.mock("expo-blur", () => ({
  BlurView: ({ children }: any) => children ?? null,
}));

const sampleMoment: MoneyMoment = {
  id: "starter-saving",
  concept: "saving",
  title: "Saving",
  simpleDefinition: "Saving means keeping some coins for later.",
  scenario: "Mia has 3 coins. She wants a kite that costs 5 coins.",
  choices: [
    {
      id: "save",
      label: "Save the coins",
      resultText: "Mia keeps her coins.",
      rewardType: "badge",
      rewardId: "super_saver",
    },
    {
      id: "spend",
      label: "Buy a snack",
      resultText: "Mia gets a snack now.",
      rewardType: "sticker",
      rewardId: "fun_today",
    },
  ],
  ageBand: "youngest",
};

describe("MoneyMomentCard", () => {
  it("renders title, definition, scenario, and both choices", () => {
    const { getByText } = render(
      <MoneyMomentCard
        visible
        moment={sampleMoment}
        onComplete={jest.fn()}
      />
    );

    expect(getByText("Saving")).toBeTruthy();
    expect(
      getByText("Saving means keeping some coins for later.")
    ).toBeTruthy();
    expect(
      getByText("Mia has 3 coins. She wants a kite that costs 5 coins.")
    ).toBeTruthy();
    expect(getByText("Save the coins")).toBeTruthy();
    expect(getByText("Buy a snack")).toBeTruthy();
  });

  it("shows outcome and reward after a choice is selected", () => {
    const { getByText, queryByText } = render(
      <MoneyMomentCard
        visible
        moment={sampleMoment}
        onComplete={jest.fn()}
      />
    );

    fireEvent.press(getByText("Save the coins"));

    expect(getByText("Mia keeps her coins.")).toBeTruthy();
    expect(getByText(/super saver/i)).toBeTruthy();
    // Choice buttons should no longer be visible in outcome phase
    expect(queryByText("Buy a snack")).toBeNull();
  });

  it("invokes onComplete with the selected choice when Continue is pressed", () => {
    const onComplete = jest.fn();
    const { getByText } = render(
      <MoneyMomentCard
        visible
        moment={sampleMoment}
        onComplete={onComplete}
      />
    );

    fireEvent.press(getByText("Buy a snack"));
    fireEvent.press(getByText("Continue"));

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({ id: "spend" })
    );
  });
});
