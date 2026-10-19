import { describe, expect, it } from "vitest";
import { vehicleInputSchema } from "./vehicle-schema";
import {
  neutralProfile,
  profileMetrics,
  radarPoint,
  radarPolygon,
  vehicleProfileSchema,
} from "./vehicle-profile";
const input = {
  make: "BMW",
  model: "318i",
  productionYear: 2011,
  platform: "E90",
  bodyStyle: "Sedan",
  engineCode: "N43",
  transmission: "Manual",
  mileage: 100000,
};
describe("vehicle profile data", () => {
  it("accepts only complete integer ratings from one to ten", () => {
    expect(vehicleProfileSchema.safeParse(neutralProfile).success).toBe(true);
    for (const invalid of [0, 11, NaN, Infinity, 4.2, "8"]) {
      expect(
        vehicleProfileSchema.safeParse({ ...neutralProfile, comfort: invalid })
          .success,
      ).toBe(false);
    }
  });
  it("does not lose vehicles when an optional profile is malformed", () => {
    const parsed = vehicleInputSchema.parse({
      ...input,
      profileRatings: { ...neutralProfile, speed: 1000 },
    });
    expect(parsed.model).toBe("318i");
    expect(parsed.profileRatings).toBeUndefined();
  });
  it("keeps points within a fixed one-to-ten scale with seven axes", () => {
    expect(radarPoint(0, 10)).toEqual([160, 60]);
    expect(radarPoint(0, 100)).toEqual([160, 60]);
    const points = radarPolygon(neutralProfile).split(" ");
    expect(points).toHaveLength(profileMetrics.length);
    for (const point of points) {
      const [x, y] = point.split(",").map(Number);
      expect(Math.hypot(x - 160, y - 160)).toBeCloseTo(50);
    }
  });
});
