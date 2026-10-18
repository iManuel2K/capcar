import { beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import {
  emptyOnboardingDraft,
  saveOnboarding,
} from "@/features/onboarding/onboarding";
import { GarageGoalPanel } from "./garage-goal-panel";
beforeEach(() => {
  cleanup();
  localStorage.clear();
});
describe("personalized garage main action", () => {
  it("offers a real next step instead of linking back to the same page after skipping the first action", () => {
    const result = saveOnboarding(
      {
        ...emptyOnboardingDraft(),
        make: "Ford",
        model: "Fiesta",
        productionYear: "2010",
        goal: "maintain",
        skipAction: true,
      },
      localStorage,
      { name: "First plan", description: "Owner-created first vehicle plan." },
    );
    render(<GarageGoalPanel vehicle={result.vehicle} />);
    expect(
      screen.getByRole("link", { name: /Plan maintenance/ }),
    ).toHaveAttribute("href", `/garage/new?vehicle=${result.vehicle.id}`);
  });
  it("links a saved maintenance plan directly to its task", () => {
    const result = saveOnboarding(
      {
        ...emptyOnboardingDraft(),
        make: "Ford",
        model: "Fiesta",
        productionYear: "2010",
        goal: "maintain",
        title: "Plan oil service",
      },
      localStorage,
      { name: "First plan", description: "Owner-created first vehicle plan." },
    );
    render(<GarageGoalPanel vehicle={result.vehicle} />);
    expect(
      screen.getByRole("link", { name: /Open saved plan/ }),
    ).toHaveAttribute("href", result.record.destination);
  });
});
