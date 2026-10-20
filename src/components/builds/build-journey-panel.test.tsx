import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { BuildJourneyPanel } from "./build-journey-panel";
import {
  createStarterBuild,
  readBuildState,
} from "@/features/builds/build-storage";
import { getBuildJourney } from "@/features/builds/build-journey";

beforeEach(() => localStorage.clear());
afterEach(cleanup);
const setup = () => {
  const build = createStarterBuild(
    {
      vehicleId: "car",
      name: "OEM Plus",
      description: "A considered daily build.",
      goal: "OEM+ daily",
      budget: 2000,
    },
    {
      title: "Rear lights",
      stage: "appearance",
      priority: "now",
      estimatedCost: 300,
    },
    localStorage,
  );
  return { build, items: readBuildState(localStorage).items };
};
describe("build progress position", () => {
  it("keeps all six numbers and marks the current stage even when a visual was saved early", () => {
    const { build, items } = setup();
    expect(getBuildJourney(build, items, true).currentStep).toBe(2);
    render(<BuildJourneyPanel build={build} items={items} />);
    const steps = within(
      screen.getByRole("list", { name: "Build progress" }),
    ).getAllByRole("listitem");
    expect(steps).toHaveLength(6);
    steps.forEach((step, index) =>
      expect(
        within(step).getByText(String(index + 1), { exact: true }),
      ).toBeInTheDocument(),
    );
    expect(steps[2]).toHaveAttribute("aria-current", "step");
    expect(steps[2]).toHaveTextContent("FindYou are here");
    expect(steps[0]).toHaveAttribute("data-passed", "true");
  });
  it("follows actual work without requiring an optional visual or retailer offer", () => {
    const { build, items } = setup();
    const item = items[0];
    expect(
      getBuildJourney(build, [{ ...item, selectedOfferId: "offer" }], false)
        .currentStep,
    ).toBe(3);
    expect(
      getBuildJourney(build, [{ ...item, selectedOfferId: "offer" }], true)
        .currentStep,
    ).toBe(4);
    expect(
      getBuildJourney(build, [{ ...item, status: "ordered" }], false)
        .currentStep,
    ).toBe(4);
    expect(
      getBuildJourney(build, [{ ...item, status: "installed" }], false)
        .currentStep,
    ).toBe(5);
  });
});
