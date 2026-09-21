"use client";

import L, {
  type Map as LeafletMap,
  type Marker,
  type Polyline,
  type TileLayer,
} from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

import type { RoadbookCenter } from "@/features/roadbook/roadbook-client";
import type {
  RoadbookCategory,
  RoadbookEvent,
  RoadbookMapMode,
  RoadbookVenue,
} from "@/features/roadbook/roadbook-schema";

export const ROADBOOK_MAP_STYLES: Record<
  string,
  { name: string; url: string; attribution: string }
> = {
  "monochrome-light": {
    name: "01 / Classic Paper",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  "midnight-dark": {
    name: "02 / Midnight Club",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  "topo-vintage": {
    name: "03 / Vintage Topo",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM',
  },
  "cyber-neon": {
    name: "04 / Neon Grid",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  "berlin-asphalt": {
    name: "05 / Berlin Industrial",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  "tokyo-drift": {
    name: "06 / Tokyo High-Contrast",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  "monaco-coastal": {
    name: "07 / Riviera Coastal",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
  },
  "satellite-hybrid": {
    name: "08 / Satellite Overhead",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
  },
  "minimal-stealth": {
    name: "09 / Stealth Minimal",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
};

const MODE_TO_MAP_STYLE: Record<RoadbookMapMode, string> = {
  workshop_cream: "monochrome-light",
  petrol_night: "midnight-dark",
  blueprint: "minimal-stealth",
  touring_clay: "topo-vintage",
};

const markerIcons: Record<RoadbookCategory, string> = {
  drift_circuit:
    '<path d="M4 17c5-1 5-9 10-10 3-.6 5 1 6 3"/><path d="m16 6 4 4-5 2"/>',
  drag_acceleration:
    '<path d="M5 19a8 8 0 1 1 14 0"/><path d="m12 12 4-3"/><path d="M12 4v2"/>',
  track_day: '<path d="M5 21V4"/><path d="M5 5c5-3 8 3 14 0v9c-6 3-9-3-14 0"/>',
  proving_ground:
    '<path d="M9 3h6"/><path d="M10 3v5l-5 9a3 3 0 0 0 3 4h8a3 3 0 0 0 3-4l-5-9V3"/><path d="M8 15h8"/>',
  scenic_route: '<path d="m3 20 6-10 3 5 3-7 6 12"/><path d="M3 20h18"/>',
  autobahn_context:
    '<path d="M8 21 10 3"/><path d="m16 21-2-18"/><path d="M4 9h16"/><path d="M5 15h14"/>',
};

function markerElement(
  venue: RoadbookVenue,
  selected: boolean,
  upcomingEvents: number,
) {
  const element = document.createElement("div");
  element.className = `roadbook-marker roadbook-marker--${venue.category}${selected ? " is-selected" : ""}`;
  const iconSvg = markerIcons[venue.category] ?? markerIcons.track_day;
  element.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${iconSvg}</svg>`;
  if (upcomingEvents > 0) {
    const badge = document.createElement("span");
    badge.className = "roadbook-marker__events";
    badge.textContent = String(Math.min(upcomingEvents, 9));
    badge.setAttribute("aria-hidden", "true");
    element.append(badge);
  }
  return element;
}

export function RoadbookMap({
  venues,
  events,
  selectedVenue,
  mode,
  center,
  userPosition,
  mapStyle,
  onSelect,
  onViewportChange,
  onError,
  onReady,
}: {
  venues: RoadbookVenue[];
  events: RoadbookEvent[];
  selectedVenue?: RoadbookVenue;
  mode: RoadbookMapMode;
  center: RoadbookCenter;
  userPosition?: RoadbookCenter;
  mapStyle?: string;
  onSelect: (venue: RoadbookVenue) => void;
  onViewportChange: (center: RoadbookCenter, radiusKm: number) => void;
  onError: (message: string) => void;
  onReady: () => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const tileLayer = useRef<TileLayer | null>(null);
  const markers = useRef<Marker[]>([]);
  const userMarker = useRef<L.CircleMarker | null>(null);
  const selectedRoute = useRef<Polyline | null>(null);
  const initialCenter = useRef(center);
  const initialStyleKey = useRef(
    mapStyle ?? MODE_TO_MAP_STYLE[mode] ?? "midnight-dark",
  );
  const onSelectRef = useRef(onSelect);
  const onViewportChangeRef = useRef(onViewportChange);
  const onErrorRef = useRef(onError);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onSelectRef.current = onSelect;
    onViewportChangeRef.current = onViewportChange;
    onErrorRef.current = onError;
    onReadyRef.current = onReady;
  }, [onError, onReady, onSelect, onViewportChange]);

  useEffect(() => {
    if (!container.current || map.current) return;

    const currentStyleConfig =
      ROADBOOK_MAP_STYLES[initialStyleKey.current] ??
      ROADBOOK_MAP_STYLES["midnight-dark"];

    const instance = L.map(container.current, {
      center: [initialCenter.current.latitude, initialCenter.current.longitude],
      zoom: 7,
      minZoom: 3,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false,
    });

    let tileFailures = 0;
    let usingFallback = false;
    let hasLoadedTiles = false;
    const tiles = L.tileLayer(currentStyleConfig.url, {
      minZoom: 3,
      maxZoom: 19,
      crossOrigin: true,
      attribution: currentStyleConfig.attribution,
    });

    L.control.zoom({ position: "bottomleft" }).addTo(instance);
    L.control
      .attribution({ position: "bottomright", prefix: false })
      .addTo(instance);

    tiles.on("load", () => {
      hasLoadedTiles = true;
      onReadyRef.current();
    });
    tiles.on("tileerror", () => {
      tileFailures += 1;
      if (!hasLoadedTiles && tileFailures >= 4) {
        if (!usingFallback) {
          usingFallback = true;
          tileFailures = 0;
          tiles.setUrl(ROADBOOK_MAP_STYLES["monochrome-light"].url);
          return;
        }
        onErrorRef.current("MAP_TILES_FAILED");
      }
    });
    tiles.addTo(instance);

    instance.on("moveend", () => {
      const next = instance.getCenter();
      const radiusKm = Math.min(
        1000,
        Math.max(
          10,
          next.distanceTo(instance.getBounds().getNorthEast()) / 1000,
        ),
      );
      onViewportChangeRef.current(
        { latitude: next.lat, longitude: next.lng },
        radiusKm,
      );
    });

    map.current = instance;
    tileLayer.current = tiles;

    return () => {
      markers.current.forEach((marker) => marker.remove());
      userMarker.current?.remove();
      selectedRoute.current?.remove();
      instance.remove();
      map.current = null;
      tileLayer.current = null;
    };
  }, []);

  useEffect(() => {
    if (!tileLayer.current) return;
    const activeStyleKey =
      mapStyle ?? MODE_TO_MAP_STYLE[mode] ?? "midnight-dark";
    const config =
      ROADBOOK_MAP_STYLES[activeStyleKey] ??
      ROADBOOK_MAP_STYLES["midnight-dark"];
    tileLayer.current.setUrl(config.url);
  }, [mapStyle, mode]);

  useEffect(() => {
    const instance = map.current;
    if (!instance) return;

    markers.current.forEach((marker) => marker.remove());
    const eventCounts = events.reduce<Record<string, number>>(
      (counts, event) => {
        counts[event.venueId] = (counts[event.venueId] ?? 0) + 1;
        return counts;
      },
      {},
    );

    markers.current = venues.map((venue) => {
      const eventCount = eventCounts[venue.id] ?? 0;
      const marker = L.marker([venue.latitude, venue.longitude], {
        icon: L.divIcon({
          className: "roadbook-leaflet-marker-shell",
          html: markerElement(
            venue,
            venue.id === selectedVenue?.id,
            eventCount,
          ),
          iconSize: [43, 43],
          iconAnchor: [10, 38],
        }),
        keyboard: true,
        title: venue.name,
        alt: `${venue.name}${eventCount > 0 ? `, ${eventCount} upcoming events` : ""}`,
        riseOnHover: true,
      });
      marker.on("click", () => onSelectRef.current(venue));
      return marker.addTo(instance);
    });
  }, [events, selectedVenue?.id, venues]);

  useEffect(() => {
    const instance = map.current;
    if (!instance) return;

    userMarker.current?.remove();
    if (!userPosition) return;

    userMarker.current = L.circleMarker(
      [userPosition.latitude, userPosition.longitude],
      {
        radius: 8,
        weight: 3,
        color: "#ffffff",
        fillColor: "#e72d45",
        fillOpacity: 1,
        className: "roadbook-user-position",
      },
    ).addTo(instance);
    instance.flyTo(
      [userPosition.latitude, userPosition.longitude],
      Math.max(instance.getZoom(), 10),
      { duration: 0.85 },
    );
  }, [userPosition]);

  useEffect(() => {
    const instance = map.current;
    if (!instance) return;

    selectedRoute.current?.remove();
    if (!selectedVenue?.routeGeoJson) {
      selectedRoute.current = null;
      return;
    }

    selectedRoute.current = L.polyline(
      selectedVenue.routeGeoJson.coordinates.map(([longitude, latitude]) => [
        latitude,
        longitude,
      ]),
      {
        color: "#e72d45",
        weight: 5,
        opacity: 0.9,
        dashArray: "8 6",
      },
    ).addTo(instance);
  }, [selectedVenue]);

  useEffect(() => {
    const instance = map.current;
    if (!instance || !selectedVenue) return;
    instance.flyTo(
      [selectedVenue.latitude, selectedVenue.longitude],
      Math.max(instance.getZoom(), 11),
      { duration: 0.85 },
    );
  }, [selectedVenue]);

  return (
    <div
      ref={container}
      className="roadbook-leaflet-map absolute inset-0"
      data-roadbook-mode={mode}
      aria-label="Capcar Roadbook map"
    />
  );
}
