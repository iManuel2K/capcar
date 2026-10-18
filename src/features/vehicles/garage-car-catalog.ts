import { carModels } from "@/features/visualizer/car-model-catalog";
import { problemsForVehicle } from "@/features/problems/problem-catalog";
import { dailyProblemsForVehicle } from "@/features/problems/daily-car-coverage";
import { partCatalog } from "@/features/parts/part-catalog";
import type { Vehicle } from "./vehicle-schema";

export type GarageCarChoice = {
  id: string;
  make: string;
  model: string;
  platform: string;
  years: [number, number];
  visual: boolean;
};
// Reuse the actual visual catalog, not a second list claiming models we don't
// have. Missing chassis information stays unknown until the owner confirms it.
export const garageCarCatalog: GarageCarChoice[] = [
  {
    id: "bmw-318i-e90",
    make: "BMW",
    model: "318i",
    platform: "E90",
    years: [2005, 2012],
    visual: false,
  },
  {
    id: "golf-vii",
    make: "Volkswagen",
    model: "Golf",
    platform: "MK7",
    years: [2012, 2020],
    visual: false,
  },
  {
    id: "fiesta-ja8",
    make: "Ford",
    model: "Fiesta",
    platform: "JA8",
    years: [2008, 2017],
    visual: false,
  },
  {
    id: "auris-e180",
    make: "Toyota",
    model: "Auris",
    platform: "E180",
    years: [2013, 2019],
    visual: false,
  },
  {
    id: "mazda3-bm",
    make: "Mazda",
    model: "3",
    platform: "BM",
    years: [2013, 2016],
    visual: false,
  },
  {
    id: "mazda3-bn",
    make: "Mazda",
    model: "3",
    platform: "BN",
    years: [2016, 2019],
    visual: false,
  },
  ...carModels.map((car) => ({
    id: car.id,
    make: car.make,
    model: car.model,
    platform: car.platforms[0] ?? "UNKNOWN",
    years: car.years,
    visual: true,
  })),
];

export function garageCarCoverage(vehicle: Vehicle) {
  return {
    problems: [
      ...problemsForVehicle(vehicle),
      ...dailyProblemsForVehicle(vehicle),
    ].length,
    // These are catalog planning references, not a promise of exact fitment.
    parts: partCatalog.filter((part) =>
      part.fitmentRules.some((rule) =>
        rule.platforms.includes(vehicle.platform),
      ),
    ).length,
  };
}
