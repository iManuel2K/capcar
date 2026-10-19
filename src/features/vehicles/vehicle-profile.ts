import { z } from "zod";

export const profileMetrics = [
  "performance",
  "comfort",
  "speed",
  "handling",
  "efficiency",
  "customization",
  "practicality",
] as const;
export type ProfileMetric = (typeof profileMetrics)[number];
const score = z.number().int().min(1).max(10);
export const vehicleProfileSchema = z.object({
  performance: score,
  comfort: score,
  speed: score,
  handling: score,
  efficiency: score,
  customization: score,
  practicality: score,
});
export type VehicleProfile = z.infer<typeof vehicleProfileSchema>;
export const neutralProfile: VehicleProfile = {
  performance: 5,
  comfort: 5,
  speed: 5,
  handling: 5,
  efficiency: 5,
  customization: 5,
  practicality: 5,
};
// Fictional showcase values demonstrate the chart. They are not road-test data.
const examples: Record<string, VehicleProfile> = {
  "demo-bmw-318i-e90": {
    performance: 5,
    comfort: 7,
    speed: 5,
    handling: 8,
    efficiency: 7,
    customization: 9,
    practicality: 7,
  },
  "demo-ford-f150-night-shift": {
    performance: 8,
    comfort: 8,
    speed: 5,
    handling: 4,
    efficiency: 3,
    customization: 9,
    practicality: 10,
  },
  "demo-mercedes-eclass-w213": {
    performance: 7,
    comfort: 10,
    speed: 7,
    handling: 7,
    efficiency: 6,
    customization: 6,
    practicality: 8,
  },
  "demo-vw-gti-tcr": {
    performance: 8,
    comfort: 6,
    speed: 8,
    handling: 9,
    efficiency: 6,
    customization: 9,
    practicality: 8,
  },
};
export function exampleVehicleProfile(vehicle: {
  id: string;
  demoProject?: boolean;
}) {
  return vehicle.demoProject ? examples[vehicle.id] : undefined;
}
export function radarPoint(
  index: number,
  value: number,
  radius = 100,
  center = 160,
) {
  const angle = -Math.PI / 2 + (index * Math.PI * 2) / profileMetrics.length;
  const scale = Math.max(0, Math.min(10, value)) / 10;
  return [
    center + Math.cos(angle) * radius * scale,
    center + Math.sin(angle) * radius * scale,
  ] as const;
}
export function radarPolygon(
  profile: VehicleProfile,
  radius = 100,
  center = 160,
) {
  return profileMetrics
    .map((metric, index) =>
      radarPoint(index, profile[metric], radius, center).join(","),
    )
    .join(" ");
}
