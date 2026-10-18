import { beforeEach, describe, expect, it, vi } from "vitest";
const track = vi.hoisted(() => vi.fn());
vi.mock("@/features/analytics/client", () => ({ trackAnalytics: track }));
import { activateGarage } from "./activation";
import {
  emptyOnboardingDraft,
  readOnboarding,
  saveOnboarding,
} from "./onboarding";
beforeEach(() => {
  localStorage.clear();
  track.mockClear();
});
describe("first useful action activation", () => {
  it("activates a skipped setup once when a useful action happens later, without sending private content", () => {
    const input = {
      ...emptyOnboardingDraft(),
      make: "Ford",
      model: "Fiesta",
      productionYear: "2010",
      goal: "maintain" as const,
      title: "PRIVATE TASK",
      skipAction: true,
    };
    const saved = saveOnboarding(input, localStorage, {
      name: "First plan",
      description: "Owner-created initial planning record.",
    });
    expect(saved.newlyActivated).toBe(false);
    activateGarage(saved.vehicle.id, "maintenance");
    activateGarage(saved.vehicle.id, "maintenance");
    expect(readOnboarding(localStorage)[0].activatedAt).toBeDefined();
    expect(
      track.mock.calls.filter(([event]) => event === "onboarding_activated"),
    ).toHaveLength(1);
    expect(JSON.stringify(track.mock.calls)).not.toContain(saved.vehicle.id);
    expect(JSON.stringify(track.mock.calls)).not.toMatch(/Fiesta|PRIVATE/);
    const second = saveOnboarding(
      {
        ...input,
        id: crypto.randomUUID(),
        existingVehicleId: saved.vehicle.id,
        skipAction: false,
      },
      localStorage,
      {
        name: "Another plan",
        description: "Another private owner planning record.",
      },
    );
    expect(second.newlyActivated).toBe(false);
  });
  it("leaves existing accounts without onboarding state alone", () => {
    activateGarage("existing-vehicle", "modification");
    expect(readOnboarding(localStorage)).toEqual([]);
    expect(track).not.toHaveBeenCalled();
  });
});
