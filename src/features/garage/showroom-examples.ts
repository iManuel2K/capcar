import {
  vehicleSchema,
  type Vehicle,
} from "@/features/vehicles/vehicle-schema";
import { getShowcaseVehicles } from "@/features/vehicles/vehicle-storage";

/** Public-only examples. Never seeds storage or changes an owner's vehicles. */
export function getShowroomExamples(): Vehicle[] {
  const cars = [
    {
      id: "bmw-m3-e30",
      make: "BMW",
      model: "M3",
      platform: "E30",
      productionYear: 1990,
    },
    {
      id: "nissan-gt-r",
      make: "Nissan",
      model: "Skyline GT-R",
      platform: "R34",
      productionYear: 2000,
    },
    {
      id: "toyota-supra-mk",
      make: "Toyota",
      model: "Supra",
      platform: "A80",
      productionYear: 1996,
    },
  ];
  return [
    ...cars.map(({ id, ...identity }) =>
      vehicleSchema.parse({
        ...identity,
        id: `showroom-${id}`,
        bodyStyle: "Coupe",
        engineCode: "UNKNOWN",
        transmission: "Manual",
        mileage: 0,
        createdAt: "2026-10-19T12:00:00Z",
        demoProject: true,
        imageUrl: `/models/cars/previews/${id}.webp`,
      }),
    ),
    ...getShowcaseVehicles(),
  ];
}
