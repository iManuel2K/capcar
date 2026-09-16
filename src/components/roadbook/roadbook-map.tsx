"use client";

import type { Map as MapboxMap, Marker } from "mapbox-gl";
import mapboxgl from "mapbox-gl/dist/mapbox-gl-csp.js";
import { useEffect, useRef } from "react";

import { createRoadbookMapStyle } from "@/features/roadbook/roadbook-map-style";
import type {
  RoadbookCategory,
  RoadbookEvent,
  RoadbookMapMode,
  RoadbookVenue,
} from "@/features/roadbook/roadbook-schema";
import type { RoadbookCenter } from "@/features/roadbook/roadbook-client";

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
  const button = document.createElement("button");
  button.type = "button";
  button.className = `roadbook-marker roadbook-marker--${venue.category}${selected ? " is-selected" : ""}`;
  button.setAttribute("aria-label", venue.name);
  button.title = venue.name;
  button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${markerIcons[venue.category]}</svg>`;
  if (upcomingEvents > 0) {
    const badge = document.createElement("span");
    badge.className = "roadbook-marker__events";
    badge.textContent = String(Math.min(upcomingEvents, 9));
    badge.setAttribute("aria-hidden", "true");
    button.append(badge);
    button.setAttribute(
      "aria-label",
      `${venue.name}, ${upcomingEvents} upcoming event${upcomingEvents === 1 ? "" : "s"}`,
    );
  }
  return button;
}

function addSelectedRoute(map: MapboxMap, venue?: RoadbookVenue) {
  if (map.getLayer("roadbook-selected-route"))
    map.removeLayer("roadbook-selected-route");
  if (map.getSource("roadbook-selected-route"))
    map.removeSource("roadbook-selected-route");
  if (!venue?.routeGeoJson || !map.isStyleLoaded()) return;
  map.addSource("roadbook-selected-route", {
    type: "geojson",
    data: { type: "Feature", properties: {}, geometry: venue.routeGeoJson },
  });
  map.addLayer({
    id: "roadbook-selected-route",
    type: "line",
    source: "roadbook-selected-route",
    paint: {
      "line-color": "#e72d45",
      "line-width": 5,
      "line-opacity": 0.9,
      "line-dasharray": [1.2, 0.8],
    },
  });
}

export function RoadbookMap({
  accessToken,
  venues,
  events,
  selectedVenue,
  mode,
  center,
  userPosition,
  onSelect,
  onViewportChange,
  onError,
  onReady,
}: {
  accessToken: string;
  venues: RoadbookVenue[];
  events: RoadbookEvent[];
  selectedVenue?: RoadbookVenue;
  mode: RoadbookMapMode;
  center: RoadbookCenter;
  userPosition?: RoadbookCenter;
  onSelect: (venue: RoadbookVenue) => void;
  onViewportChange: (center: RoadbookCenter, radiusKm: number) => void;
  onError: (message: string) => void;
  onReady: () => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapboxMap | null>(null);
  const markers = useRef<Marker[]>([]);
  const userMarker = useRef<Marker | null>(null);
  const initialCenter = useRef(center);
  const currentMode = useRef(mode);
  const onViewportChangeRef = useRef(onViewportChange);
  const onErrorRef = useRef(onError);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onViewportChangeRef.current = onViewportChange;
    onErrorRef.current = onError;
    onReadyRef.current = onReady;
  }, [onError, onReady, onViewportChange]);

  useEffect(() => {
    if (!container.current || map.current || !accessToken) return;
    mapboxgl.accessToken = accessToken;
    mapboxgl.workerUrl = "/mapbox-gl-csp-worker.js";
    let instance: MapboxMap;
    try {
      instance = new mapboxgl.Map({
        container: container.current,
        style: createRoadbookMapStyle(currentMode.current),
        center: [
          initialCenter.current.longitude,
          initialCenter.current.latitude,
        ],
        zoom: 7.3,
        minZoom: 3,
        maxZoom: 18,
        attributionControl: false,
      });
    } catch (error) {
      onErrorRef.current(
        error instanceof Error ? error.message : "MAP_INITIALIZATION_FAILED",
      );
      return;
    }
    instance.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      "bottom-left",
    );
    instance.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      "bottom-right",
    );
    instance.on("error", (event) => {
      const message = event.error?.message;
      if (
        message &&
        (!instance.loaded() ||
          /token|style|unauthorized|forbidden/i.test(message))
      ) {
        console.error("Roadbook map error:", message);
        onErrorRef.current(message);
      }
    });
    instance.once("load", () => onReadyRef.current());
    instance.on("moveend", () => {
      const next = instance.getCenter();
      const bounds = instance.getBounds();
      const radiusKm = bounds
        ? Math.min(
            1000,
            Math.max(10, next.distanceTo(bounds.getNorthEast()) / 1000),
          )
        : 150;
      onViewportChangeRef.current(
        { latitude: next.lat, longitude: next.lng },
        radiusKm,
      );
    });
    map.current = instance;
    return () => {
      markers.current.forEach((marker) => marker.remove());
      userMarker.current?.remove();
      instance.remove();
      map.current = null;
    };
  }, [accessToken]);

  useEffect(() => {
    const instance = map.current;
    if (!instance || mode === currentMode.current) return;
    currentMode.current = mode;
    instance.setStyle(createRoadbookMapStyle(mode));
  }, [mode]);

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
      const element = markerElement(
        venue,
        venue.id === selectedVenue?.id,
        eventCounts[venue.id] ?? 0,
      );
      element.addEventListener("click", () => onSelect(venue));
      return new mapboxgl.Marker({ element, anchor: "bottom" })
        .setLngLat([venue.longitude, venue.latitude])
        .addTo(instance);
    });
  }, [events, onSelect, selectedVenue?.id, venues]);

  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    userMarker.current?.remove();
    if (!userPosition) return;
    const dot = document.createElement("div");
    dot.className = "roadbook-user-position";
    dot.setAttribute("aria-label", "Your position");
    userMarker.current = new mapboxgl.Marker({ element: dot })
      .setLngLat([userPosition.longitude, userPosition.latitude])
      .addTo(instance);
    instance.easeTo({
      center: [userPosition.longitude, userPosition.latitude],
      zoom: Math.max(instance.getZoom(), 10),
      duration: 850,
    });
  }, [userPosition]);

  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    const draw = () => addSelectedRoute(instance, selectedVenue);
    if (instance.isStyleLoaded()) draw();
    else instance.once("style.load", draw);
    return () => {
      instance.off("style.load", draw);
    };
  }, [mode, selectedVenue]);

  useEffect(() => {
    const instance = map.current;
    if (!instance || !selectedVenue) return;
    instance.easeTo({
      center: [selectedVenue.longitude, selectedVenue.latitude],
      zoom: Math.max(instance.getZoom(), 11),
      padding: { right: window.innerWidth >= 1024 ? 430 : 0 },
      duration: 850,
    });
  }, [selectedVenue]);

  return (
    <div
      ref={container}
      className="absolute inset-0"
      aria-label="Capcar Roadbook map"
    />
  );
}
