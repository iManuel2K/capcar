import type { RoadbookMapMode } from "@/features/roadbook/roadbook-schema";

const roadbookMapStyles: Record<RoadbookMapMode, string> = {
  workshop_cream: "mapbox://styles/mapbox/light-v11",
  petrol_night: "mapbox://styles/mapbox/dark-v11",
  blueprint: "mapbox://styles/mapbox/navigation-night-v1",
  touring_clay: "mapbox://styles/mapbox/outdoors-v12",
};

export function createRoadbookMapStyle(mode: RoadbookMapMode) {
  return roadbookMapStyles[mode];
}
