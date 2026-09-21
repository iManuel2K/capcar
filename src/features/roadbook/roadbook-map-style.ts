import type { RoadbookMapMode } from "@/features/roadbook/roadbook-schema";

const roadbookMapStyles: Record<RoadbookMapMode, string> = {
  konstanz: "mapbox://styles/mapbox/streets-v12",
  reykjavik: "mapbox://styles/mapbox/navigation-night-v1",
  lissabon: "mapbox://styles/mapbox/outdoors-v12",
  wien: "mapbox://styles/mapbox/light-v11",
  zurich: "mapbox://styles/mapbox/streets-v12",
  venedig: "mapbox://styles/mapbox/outdoors-v12",
  kyoto: "mapbox://styles/mapbox/light-v11",
  marrakesch: "mapbox://styles/mapbox/outdoors-v12",
  tokyo: "mapbox://styles/mapbox/dark-v11",
};

export function createRoadbookMapStyle(mode: RoadbookMapMode) {
  return roadbookMapStyles[mode];
}
