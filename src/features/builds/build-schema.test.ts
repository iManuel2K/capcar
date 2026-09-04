import { describe, expect, it } from "vitest";

import {
  buildInputSchema,
  buildItemInputSchema,
} from "@/features/builds/build-schema";

describe("build validation", () => {
  it("normalizes a build budget", () => {
    const build = buildInputSchema.parse({
      vehicleId: "vehicle-1",
      name: "Stealth Rear",
      goal: "Appearance",
      description: "A subtle and darker rear treatment.",
      budget: "1200",
      status: "planning",
    });
    expect(build.budget).toBe(1200);
  });

  it("rejects an empty modification", () => {
    const result = buildItemInputSchema.safeParse({
      buildId: "build-1",
      title: "",
      stage: "appearance",
      priority: "next",
      estimatedCost: 250,
      status: "planned",
    });
    expect(result.success).toBe(false);
  });
});
