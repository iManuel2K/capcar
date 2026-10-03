import { describe, expect, it } from "vitest";

import {
  getTripPlannerStatus,
  planScenicTrip,
  tripPlannerRequestSchema,
} from "@/features/trips/trip-planner";

const request = tripPlannerRequestSchema.parse({
  vehicle: "2011 BMW E90 318i",
  region: "Black Forest",
  startDate: "2026-10-16",
  duration: 3,
  pace: "scenic",
  interests: ["roads", "photography"],
  useConnectedContext: true,
});

describe("trip planner", () => {
  it("builds a bounded multi-day draft", async () => {
    const plan = await planScenicTrip(request, {
      busyDates: ["2026-10-17"],
      mailSignals: [{ subject: "Hotel booking" }],
    });

    expect(plan.days).toHaveLength(3);
    expect(plan.days[2].date).toBe("2026-10-18");
    expect(plan.contextNotes.join(" ")).toContain("2026-10-17");
    expect(plan.verificationNote).toContain("Verify");
  });

  it("keeps the zero-cost deterministic fallback as the default", () => {
    expect(getTripPlannerStatus({})).toMatchObject({
      mode: "deterministic",
      configured: true,
    });
  });

  it("rejects oversized requests", () => {
    expect(() =>
      tripPlannerRequestSchema.parse({
        ...request,
        vehicle: "x".repeat(121),
      }),
    ).toThrow();
  });
});
