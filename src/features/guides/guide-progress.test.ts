import { describe, expect, it } from "vitest";

import {
  getGuideProgress,
  saveGuideProgress,
} from "@/features/guides/guide-progress";

describe("guide progress", () => {
  it("saves and replaces progress for one vehicle and guide", () => {
    const storage = window.localStorage;
    storage.clear();
    saveGuideProgress(
      {
        vehicleId: "vehicle-1",
        guideSlug: "demo-guide",
        mode: "beginner",
        safetyAccepted: true,
        completedSteps: ["one"],
      },
      storage,
      "2026-01-01T10:00:00.000Z",
    );
    saveGuideProgress(
      {
        vehicleId: "vehicle-1",
        guideSlug: "demo-guide",
        mode: "expert",
        safetyAccepted: true,
        completedSteps: ["one", "two"],
        completedAt: "2026-01-01T11:00:00.000Z",
      },
      storage,
      "2026-01-01T11:00:00.000Z",
    );

    const progress = getGuideProgress("vehicle-1", "demo-guide", storage);
    expect(progress?.mode).toBe("expert");
    expect(progress?.completedSteps).toEqual(["one", "two"]);
    expect(progress?.completedAt).toBeDefined();
  });
});
