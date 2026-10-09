import { describe, expect, it } from "vitest";

import {
  guideMatchesVehicle,
  installationGuides,
} from "@/features/guides/guide-catalog";

const bmw318i = {
  make: "BMW",
  model: "318i",
  platform: "E90",
  engineCode: "N43B20",
};

describe("BMW E90 guide coverage", () => {
  it("provides twenty media-ready workshop guides for the demo 318i", () => {
    const guides = installationGuides.filter(
      (guide) =>
        guide.purpose !== "inspection" && guideMatchesVehicle(guide, bmw318i),
    );

    expect(guides).toHaveLength(20);
    for (const guide of guides) {
      expect(guide.tools.length).toBeGreaterThanOrEqual(3);
      expect(guide.video?.url).toMatch(/^https:\/\//);
      expect(guide.photos?.length).toBeGreaterThanOrEqual(2);
      expect(guide.category).toBeTruthy();
    }
  });

  it("does not expose BMW-only guides to unrelated vehicles", () => {
    const golf = {
      make: "Volkswagen",
      model: "Golf GTI TCR",
      platform: "MK7.5",
      engineCode: "EA888",
    };
    const bmwOnly = installationGuides.filter((guide) =>
      guide.vehicleRules?.[0]?.makes?.includes("BMW"),
    );

    expect(bmwOnly.length).toBeGreaterThanOrEqual(20);
    expect(bmwOnly.every((guide) => !guideMatchesVehicle(guide, golf))).toBe(
      true,
    );
  });
});
