import { garageCarCatalog } from "@/features/vehicles/garage-car-catalog";
import { carModels } from "@/features/visualizer/car-model-catalog";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";

// Search candidates, NOT assertions that a model has a fault. The provider
// must find an exact name in NHTSA's year/make model index before querying it.
type SourceMapping = {
  models: string[];
  years?: [number, number];
  reason?: "market" | "concept" | "historic";
};
export const problemSourceMappings: Record<string, SourceMapping> = {
  "bmw-318i-e90": { models: [], reason: "market" },
  "golf-vii": { models: ["GOLF"], years: [2015, 2020] },
  "fiesta-ja8": { models: ["FIESTA"], years: [2011, 2017] },
  "auris-e180": { models: [], reason: "market" },
  "mazda3-bm": { models: ["MAZDA3"], years: [2014, 2016] },
  "mazda3-bn": { models: ["MAZDA3"], years: [2017, 2018] },
  "audi-r8": { models: ["R8"], years: [2008, 2024] },
  "audi-tt": { models: ["TT", "TT ROADSTER"], years: [2016, 2023] },
  "bmw-m3-e30": { models: ["M3"], years: [1988, 1991] },
  "bmw-e36-m3": { models: ["M3"], years: [1995, 1999] },
  "bmw-320i": { models: [], reason: "market" },
  "datsun-280z": { models: ["280Z"] },
  "ford-mustang": { models: ["SHELBY GT500", "MUSTANG SHELBY GT500", "GT500"] },
  "honda-civic": { models: [], reason: "market" },
  "honda-nsx": { models: [], reason: "market" },
  "lamborghini-countach-lp500s": { models: ["COUNTACH"] },
  "mazda-rx-7-fc": { models: ["RX-7", "RX7"], years: [1986, 1991] },
  "mazda-rx-7-fd": { models: ["RX-7", "RX7"], years: [1993, 1995] },
  "mercedes-benz-190": { models: ["190E", "190D", "190"], years: [1984, 1993] },
  "mercedes-300sl": { models: [], reason: "historic" },
  "mercedes-gclass": {
    models: ["G500", "G550", "G55", "G55 AMG", "G63 AMG", "G65 AMG", "G-CLASS"],
    years: [2002, 2018],
  },
  "mini-cooper": {
    models: ["COOPER S", "COOPER S CONVERTIBLE", "COOPER S HARDTOP"],
    years: [2002, 2024],
  },
  "nissan-gt-r": { models: [], reason: "market" },
  "nissan-proto": { models: [], reason: "concept" },
  "nissan-s14": { models: [], reason: "market" },
  "porsche-911-carrera": { models: ["911 CARRERA 4S", "911"] },
  "porsche-911": { models: ["911 TURBO", "930", "911"] },
  "subaru-impreza": { models: ["IMPREZA WRX STI", "IMPREZA", "IMPREZA WRX"] },
  "toyota-ae86": { models: [], reason: "market" },
  "toyota-supra-mk": { models: ["SUPRA"], years: [1993, 1998] },
  "volkswagen-beetle": { models: ["BEETLE", "TYPE 1"] },
};

export function getProblemProfile(id: string) {
  const car = garageCarCatalog.find((entry) => entry.id === id);
  const mapping = problemSourceMappings[id];
  return car && mapping ? { ...car, mapping } : undefined;
}

const normalize = (value: string) =>
  value.trim().toUpperCase().replace(/^VW$/, "VOLKSWAGEN");
export function findProblemProfile(
  vehicle: Pick<Vehicle, "make" | "model" | "platform" | "productionYear">,
) {
  return garageCarCatalog.find((car) => {
    if (
      normalize(car.make) !== normalize(vehicle.make) ||
      normalize(car.model) !== normalize(vehicle.model)
    )
      return false;
    if (
      vehicle.productionYear < car.years[0] ||
      vehicle.productionYear > car.years[1]
    )
      return false;
    const platforms = carModels.find((model) => model.id === car.id)
      ?.platforms ?? [car.platform];
    return (
      platforms.length === 0 ||
      platforms.some(
        (platform) => normalize(platform) === normalize(vehicle.platform),
      )
    );
  });
}
