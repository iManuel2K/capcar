import type { StyleSpecification } from "mapbox-gl";

import type { RoadbookMapMode } from "@/features/roadbook/roadbook-schema";

type Palette = {
  background: string;
  land: string;
  park: string;
  water: string;
  building: string;
  roadCase: string;
  road: string;
  majorRoad: string;
  boundary: string;
  label: string;
  labelHalo: string;
};

const palettes: Record<RoadbookMapMode, Palette> = {
  workshop_cream: {
    background: "#e6dfcf",
    land: "#ded5c3",
    park: "#cdd8c8",
    water: "#9ebfc0",
    building: "#c8beab",
    roadCase: "#b6aa96",
    road: "#f5efe3",
    majorRoad: "#c98f79",
    boundary: "#806f61",
    label: "#123437",
    labelHalo: "#e6dfcf",
  },
  petrol_night: {
    background: "#070b09",
    land: "#0d1511",
    park: "#10231c",
    water: "#0a2427",
    building: "#151b17",
    roadCase: "#050706",
    road: "#2a312d",
    majorRoad: "#74363e",
    boundary: "#53605a",
    label: "#e6e5db",
    labelHalo: "#070b09",
  },
  blueprint: {
    background: "#082631",
    land: "#0c3442",
    park: "#104654",
    water: "#061d27",
    building: "#164454",
    roadCase: "#061c24",
    road: "#5e8590",
    majorRoad: "#c7eceb",
    boundary: "#7ea7ad",
    label: "#e5f4f1",
    labelHalo: "#082631",
  },
  touring_clay: {
    background: "#c9ad93",
    land: "#d3bba2",
    park: "#aeb9a0",
    water: "#789ca0",
    building: "#b2937d",
    roadCase: "#806b5e",
    road: "#ead9c7",
    majorRoad: "#77353a",
    boundary: "#6c5448",
    label: "#192f2e",
    labelHalo: "#d3bba2",
  },
};

export function createRoadbookMapStyle(mode: RoadbookMapMode) {
  const color = palettes[mode];
  return {
    version: 8,
    name: `Capcar ${mode}`,
    glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
    sprite: "mapbox://sprites/mapbox/streets-v12",
    sources: {
      streets: { type: "vector", url: "mapbox://mapbox.mapbox-streets-v8" },
    },
    layers: [
      {
        id: "background",
        type: "background",
        paint: { "background-color": color.background },
      },
      {
        id: "landcover",
        type: "fill",
        source: "streets",
        "source-layer": "landcover",
        paint: { "fill-color": color.land, "fill-opacity": 0.85 },
      },
      {
        id: "park",
        type: "fill",
        source: "streets",
        "source-layer": "landuse",
        filter: [
          "match",
          ["get", "class"],
          ["park", "pitch", "grass", "wood"],
          true,
          false,
        ],
        paint: { "fill-color": color.park, "fill-opacity": 0.7 },
      },
      {
        id: "water",
        type: "fill",
        source: "streets",
        "source-layer": "water",
        paint: { "fill-color": color.water },
      },
      {
        id: "buildings",
        type: "fill",
        source: "streets",
        "source-layer": "building",
        minzoom: 13,
        paint: { "fill-color": color.building, "fill-opacity": 0.74 },
      },
      {
        id: "road-case",
        type: "line",
        source: "streets",
        "source-layer": "road",
        paint: {
          "line-color": color.roadCase,
          "line-width": ["interpolate", ["linear"], ["zoom"], 5, 0.5, 15, 8],
        },
      },
      {
        id: "road",
        type: "line",
        source: "streets",
        "source-layer": "road",
        paint: {
          "line-color": color.road,
          "line-width": ["interpolate", ["linear"], ["zoom"], 5, 0.25, 15, 6],
        },
      },
      {
        id: "major-road",
        type: "line",
        source: "streets",
        "source-layer": "road",
        filter: [
          "match",
          ["get", "class"],
          ["motorway", "trunk", "primary"],
          true,
          false,
        ],
        paint: {
          "line-color": color.majorRoad,
          "line-width": ["interpolate", ["linear"], ["zoom"], 5, 0.7, 15, 5],
        },
      },
      {
        id: "boundaries",
        type: "line",
        source: "streets",
        "source-layer": "admin",
        paint: {
          "line-color": color.boundary,
          "line-dasharray": [2, 2],
          "line-opacity": 0.45,
        },
      },
      {
        id: "road-labels",
        type: "symbol",
        source: "streets",
        "source-layer": "road",
        minzoom: 11,
        layout: {
          "symbol-placement": "line",
          "text-field": ["coalesce", ["get", "name_en"], ["get", "name"]],
          "text-font": ["DIN Pro Regular", "Arial Unicode MS Regular"],
          "text-size": 11,
        },
        paint: {
          "text-color": color.label,
          "text-halo-color": color.labelHalo,
          "text-halo-width": 1.5,
        },
      },
      {
        id: "place-labels",
        type: "symbol",
        source: "streets",
        "source-layer": "place_label",
        layout: {
          "text-field": ["coalesce", ["get", "name_en"], ["get", "name"]],
          "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 5, 11, 12, 16],
        },
        paint: {
          "text-color": color.label,
          "text-halo-color": color.labelHalo,
          "text-halo-width": 2,
        },
      },
    ],
  } as StyleSpecification;
}
