"use client";

import L, {
  type Map as LeafletMap,
  type Marker,
  type Polyline,
  type TileLayer,
} from "leaflet";
import "leaflet/dist/leaflet.css";
import type {
  GeoJSONSource,
  Map as MapLibreMap,
  Marker as MapLibreMarker,
} from "maplibre-gl";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

import type { RoadbookCenter } from "@/features/roadbook/roadbook-client";
import {
  recoverRoadbookTiles,
  ROADBOOK_MAP_STYLES,
} from "@/features/roadbook/roadbook-map-style";
import type {
  RoadbookCategory,
  RoadbookEvent,
  RoadbookMapMode,
  RoadbookVenue,
} from "@/features/roadbook/roadbook-schema";
import {
  applyRoadbookVectorPalette,
  ROADBOOK_VECTOR_STYLE_URL,
  supportsRoadbookWebGL,
} from "@/features/roadbook/roadbook-vector-style";

const PRIMARY_TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const FALLBACK_TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const VECTOR_LOAD_TIMEOUT_MS = 9_000;
const WEBGL_RECOVERY_TIMEOUT_MS = 5_000;
const ROUTE_SOURCE_ID = "roadbook-selected-route";

type RoadbookRouteData = Exclude<
  Parameters<GeoJSONSource["setData"]>[0],
  string
>;

const emptyRoute: RoadbookRouteData = {
  type: "FeatureCollection",
  features: [],
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
  car_photo_spot:
    '<path d="M4 8h3l2-3h6l2 3h3v12H4z"/><circle cx="12" cy="14" r="3"/>',
  autobahn_context:
    '<path d="M8 21 10 3"/><path d="m16 21-2-18"/><path d="M4 9h16"/><path d="M5 15h14"/>',
};

function eventCounts(events: RoadbookEvent[]) {
  return events.reduce<Record<string, number>>((counts, event) => {
    counts[event.venueId] = (counts[event.venueId] ?? 0) + 1;
    return counts;
  }, {});
}

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

function radiusFromLeafletMap(instance: LeafletMap) {
  return Math.min(
    1000,
    Math.max(
      10,
      instance.getCenter().distanceTo(instance.getBounds().getNorthEast()) /
        1000,
    ),
  );
}

function radiusFromVectorMap(instance: MapLibreMap) {
  const center = instance.getCenter();
  const corner = instance.getBounds().getNorthEast();
  return Math.min(1000, Math.max(10, center.distanceTo(corner) / 1000));
}

function routeData(selectedVenue?: RoadbookVenue): RoadbookRouteData {
  if (!selectedVenue?.routeGeoJson) return emptyRoute;
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: selectedVenue.routeGeoJson.coordinates,
        },
      },
    ],
  };
}

export function RoadbookMap({
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
  onRendererChange,
  mapLabel,
  userLocationLabel,
  upcomingEventsLabel,
}: {
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
  onRendererChange: (vector: boolean) => void;
  mapLabel: string;
  userLocationLabel: string;
  upcomingEventsLabel: (count: number) => string;
}) {
  const visualStyle = ROADBOOK_MAP_STYLES[mode];
  const leafletContainer = useRef<HTMLDivElement>(null);
  const vectorContainer = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const tileLayer = useRef<TileLayer | null>(null);
  const markers = useRef<Marker[]>([]);
  const userMarker = useRef<L.CircleMarker | null>(null);
  const selectedRoute = useRef<Polyline | null>(null);
  const vectorMap = useRef<MapLibreMap | null>(null);
  const vectorMarkers = useRef<MapLibreMarker[]>([]);
  const vectorUserMarker = useRef<MapLibreMarker | null>(null);
  const vectorModule = useRef<typeof import("maplibre-gl") | null>(null);
  const vectorActive = useRef(false);
  const initialCenter = useRef(center);
  const initialMode = useRef(mode);
  const activeMode = useRef(mode);
  const onSelectRef = useRef(onSelect);
  const onViewportChangeRef = useRef(onViewportChange);
  const onErrorRef = useRef(onError);
  const onReadyRef = useRef(onReady);
  const onRendererChangeRef = useRef(onRendererChange);
  const [vectorReady, setVectorReady] = useState(false);

  useEffect(() => {
    activeMode.current = mode;
    onSelectRef.current = onSelect;
    onViewportChangeRef.current = onViewportChange;
    onErrorRef.current = onError;
    onReadyRef.current = onReady;
    onRendererChangeRef.current = onRendererChange;
  }, [mode, onError, onReady, onRendererChange, onSelect, onViewportChange]);

  useEffect(() => {
    if (!leafletContainer.current || map.current) return;

    const instance = L.map(leafletContainer.current, {
      center: [initialCenter.current.latitude, initialCenter.current.longitude],
      zoom: 7,
      minZoom: 3,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
      boxZoom: true,
      keyboard: true,
    });

    let recovery = { failures: 0, fallbackAttempted: false };
    let hasLoadedTiles = false;
    const tiles = L.tileLayer(PRIMARY_TILES, {
      minZoom: 3,
      maxZoom: 19,
      crossOrigin: true,
      attribution: OSM_ATTRIBUTION,
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
      const result = recoverRoadbookTiles(recovery, hasLoadedTiles);
      recovery = result.state;
      if (result.action === "fallback") tiles.setUrl(FALLBACK_TILES, false);
      if (result.action === "error" && !vectorActive.current)
        onErrorRef.current("MAP_TILES_FAILED");
    });
    tiles.addTo(instance);

    instance.on("moveend", () => {
      if (vectorActive.current) return;
      const next = instance.getCenter();
      onViewportChangeRef.current(
        { latitude: next.lat, longitude: next.lng },
        radiusFromLeafletMap(instance),
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
    if (
      !vectorContainer.current ||
      vectorMap.current ||
      !supportsRoadbookWebGL()
    )
      return;

    let disposed = false;
    let failed = false;
    let vectorTileFailures = 0;
    let instance: MapLibreMap | undefined;
    let timeout = 0;
    let contextRecoveryTimeout = 0;

    const fallBackToLeaflet = () => {
      if (failed) return;
      failed = true;
      window.clearTimeout(timeout);
      window.clearTimeout(contextRecoveryTimeout);
      // The dormant raster map only inherits the active camera on recovery.
      // It never runs a second, continuously synchronized viewport state.
      if (instance && map.current) {
        const camera = instance.getCenter();
        map.current.setView([camera.lat, camera.lng], instance.getZoom(), {
          animate: false,
        });
      }
      vectorActive.current = false;
      setVectorReady(false);
      onRendererChangeRef.current(false);
      vectorMarkers.current.forEach((marker) => marker.remove());
      vectorMarkers.current = [];
      vectorUserMarker.current?.remove();
      vectorUserMarker.current = null;
      instance?.remove();
      vectorMap.current = null;
      vectorModule.current = null;
    };

    void import("maplibre-gl")
      .then((maplibre) => {
        if (disposed || !vectorContainer.current) return;

        vectorModule.current = maplibre;
        maplibre.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");
        maplibre.setWorkerCount(1);
        const leaflet = map.current;
        const leafletCenter = leaflet?.getCenter();
        instance = new maplibre.Map({
          container: vectorContainer.current,
          style: ROADBOOK_VECTOR_STYLE_URL,
          center: leafletCenter
            ? [leafletCenter.lng, leafletCenter.lat]
            : [initialCenter.current.longitude, initialCenter.current.latitude],
          zoom: leaflet?.getZoom() ?? 7,
          minZoom: 3,
          maxZoom: 18,
          attributionControl: false,
          dragRotate: false,
          pitchWithRotate: false,
          touchPitch: false,
          scrollZoom: true,
          doubleClickZoom: true,
          touchZoomRotate: true,
          boxZoom: true,
          keyboard: true,
          maxTileCacheSize: 64,
          pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
          canvasContextAttributes: {
            contextType: "webgl2",
            failIfMajorPerformanceCaveat: false,
            antialias: false,
            preserveDrawingBuffer: false,
          },
        });
        vectorMap.current = instance;

        instance.addControl(
          new maplibre.NavigationControl({
            showCompass: false,
            visualizePitch: false,
          }),
          "bottom-left",
        );
        instance.addControl(
          new maplibre.AttributionControl({
            compact: true,
            customAttribution:
              "OpenFreeMap © OpenMapTiles Data from OpenStreetMap",
          }),
          "bottom-right",
        );

        instance.on("error", () => {
          // Tile, glyph, and sprite requests can fail independently and then
          // recover. The load timeout still catches a broken style or worker.
          vectorTileFailures += 1;
          if (vectorTileFailures >= 8) fallBackToLeaflet();
        });
        instance.on("idle", () => {
          vectorTileFailures = 0;
        });
        instance.on("webglcontextlost", () => {
          if (failed || !instance) return;
          const camera = instance.getCenter();
          map.current?.setView([camera.lat, camera.lng], instance.getZoom(), {
            animate: false,
          });
          vectorActive.current = false;
          setVectorReady(false);
          onRendererChangeRef.current(false);
          window.clearTimeout(contextRecoveryTimeout);
          contextRecoveryTimeout = window.setTimeout(
            fallBackToLeaflet,
            WEBGL_RECOVERY_TIMEOUT_MS,
          );
        });
        instance.on("webglcontextrestored", () => {
          if (disposed || failed || !instance) return;
          window.clearTimeout(contextRecoveryTimeout);
          contextRecoveryTimeout = 0;
          vectorTileFailures = 0;
          applyRoadbookVectorPalette(
            instance,
            ROADBOOK_MAP_STYLES[activeMode.current].vector,
          );
          vectorActive.current = true;
          setVectorReady(true);
          onRendererChangeRef.current(true);
        });

        instance.on("moveend", () => {
          if (!vectorActive.current || !instance) return;
          const next = instance.getCenter();
          onViewportChangeRef.current(
            { latitude: next.lat, longitude: next.lng },
            radiusFromVectorMap(instance),
          );
        });

        instance.once("load", () => {
          if (disposed || failed || !instance) return;
          applyRoadbookVectorPalette(
            instance,
            ROADBOOK_MAP_STYLES[initialMode.current].vector,
          );
          instance.addSource(ROUTE_SOURCE_ID, {
            type: "geojson",
            data: emptyRoute,
          });
          instance.addLayer({
            id: "roadbook-route-casing",
            type: "line",
            source: ROUTE_SOURCE_ID,
            layout: { "line-cap": "round", "line-join": "round" },
            paint: {
              "line-color": "#07100d",
              "line-width": [
                "interpolate",
                ["linear"],
                ["zoom"],
                7,
                5,
                12,
                9.5,
                15,
                13,
              ],
              "line-opacity": 0.82,
            },
          });
          instance.addLayer({
            id: "roadbook-route-line",
            type: "line",
            source: ROUTE_SOURCE_ID,
            layout: { "line-cap": "round", "line-join": "round" },
            paint: {
              "line-color": "#e72d45",
              "line-width": [
                "interpolate",
                ["linear"],
                ["zoom"],
                7,
                2.4,
                12,
                5,
                15,
                7,
              ],
              "line-opacity": 1,
            },
          });
          window.clearTimeout(timeout);
          const fallbackMap = map.current;
          if (fallbackMap) {
            const fallbackCenter = fallbackMap.getCenter();
            instance.jumpTo({
              center: [fallbackCenter.lng, fallbackCenter.lat],
              zoom: fallbackMap.getZoom(),
            });
          }
          vectorActive.current = true;
          setVectorReady(true);
          onRendererChangeRef.current(true);
          onReadyRef.current();
        });

        timeout = window.setTimeout(fallBackToLeaflet, VECTOR_LOAD_TIMEOUT_MS);
      })
      .catch(() => {
        if (!disposed) fallBackToLeaflet();
      });

    return () => {
      disposed = true;
      window.clearTimeout(timeout);
      window.clearTimeout(contextRecoveryTimeout);
      vectorActive.current = false;
      vectorMarkers.current.forEach((marker) => marker.remove());
      vectorMarkers.current = [];
      vectorUserMarker.current?.remove();
      vectorUserMarker.current = null;
      instance?.remove();
      vectorMap.current = null;
      vectorModule.current = null;
    };
  }, []);

  useEffect(() => {
    const instance = map.current;
    if (!instance) return;

    markers.current.forEach((marker) => marker.remove());
    const counts = eventCounts(events);

    markers.current = venues.map((venue) => {
      const eventCount = counts[venue.id] ?? 0;
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
        alt: `${venue.name}${eventCount > 0 ? `, ${upcomingEventsLabel(eventCount)}` : ""}`,
        riseOnHover: true,
      });
      marker.on("click", () => onSelectRef.current(venue));
      return marker.addTo(instance);
    });
  }, [events, selectedVenue?.id, upcomingEventsLabel, venues]);

  useEffect(() => {
    const instance = vectorMap.current;
    const maplibre = vectorModule.current;
    if (!vectorReady || !instance || !maplibre) return;

    vectorMarkers.current.forEach((marker) => marker.remove());
    const counts = eventCounts(events);
    vectorMarkers.current = venues.map((venue) => {
      const eventCount = counts[venue.id] ?? 0;
      const shell = document.createElement("div");
      shell.className = "roadbook-vector-marker-shell";
      const element = markerElement(
        venue,
        venue.id === selectedVenue?.id,
        eventCount,
      );
      element.tabIndex = 0;
      element.setAttribute("role", "button");
      element.setAttribute(
        "aria-label",
        `${venue.name}${eventCount > 0 ? `, ${upcomingEventsLabel(eventCount)}` : ""}`,
      );
      const selectVenue = () => onSelectRef.current(venue);
      element.addEventListener("click", selectVenue);
      element.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        selectVenue();
      });
      shell.append(element);
      return new maplibre.Marker({ element: shell, anchor: "bottom" })
        .setLngLat([venue.longitude, venue.latitude])
        .addTo(instance);
    });
  }, [events, selectedVenue?.id, upcomingEventsLabel, vectorReady, venues]);

  useEffect(() => {
    const instance = map.current;
    if (!instance) return;

    userMarker.current?.remove();
    if (userPosition) {
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
    }

    vectorUserMarker.current?.remove();
    vectorUserMarker.current = null;
    const vector = vectorMap.current;
    const maplibre = vectorModule.current;
    if (userPosition && vectorReady && vector && maplibre) {
      const element = document.createElement("div");
      element.className = "roadbook-user-position";
      element.setAttribute("aria-label", userLocationLabel);
      vectorUserMarker.current = new maplibre.Marker({ element })
        .setLngLat([userPosition.longitude, userPosition.latitude])
        .addTo(vector);
    }

    if (!userPosition) return;
    if (vectorActive.current && vector) {
      vector.flyTo({
        center: [userPosition.longitude, userPosition.latitude],
        zoom: Math.max(vector.getZoom(), 10),
        duration: 850,
      });
    } else {
      instance.flyTo(
        [userPosition.latitude, userPosition.longitude],
        Math.max(instance.getZoom(), 10),
        { duration: 0.85 },
      );
    }
  }, [userLocationLabel, userPosition, vectorReady]);

  useEffect(() => {
    const instance = map.current;
    if (!instance) return;

    selectedRoute.current?.remove();
    if (selectedVenue?.routeGeoJson) {
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
    } else {
      selectedRoute.current = null;
    }

    const vectorSource = vectorMap.current?.getSource(
      ROUTE_SOURCE_ID,
    ) as GeoJSONSource | null;
    vectorSource?.setData(routeData(selectedVenue));
  }, [selectedVenue, vectorReady]);

  useEffect(() => {
    if (!selectedVenue) return;
    const vector = vectorMap.current;
    if (vectorActive.current && vector) {
      vector.flyTo({
        center: [selectedVenue.longitude, selectedVenue.latitude],
        zoom: Math.max(vector.getZoom(), 11),
        duration: 850,
      });
      return;
    }
    const instance = map.current;
    instance?.flyTo(
      [selectedVenue.latitude, selectedVenue.longitude],
      Math.max(instance.getZoom(), 11),
      { duration: 0.85 },
    );
  }, [selectedVenue]);

  useEffect(() => {
    const instance = vectorMap.current;
    if (!vectorReady || !instance || !instance.isStyleLoaded()) return;
    applyRoadbookVectorPalette(instance, visualStyle.vector);
  }, [vectorReady, visualStyle.vector]);

  return (
    <div
      className={`roadbook-map-shell absolute inset-0 ${vectorReady ? "is-vector-ready" : ""}`}
      data-roadbook-style={mode}
      style={
        {
          "--roadbook-map-canvas": visualStyle.canvas,
        } as CSSProperties
      }
      role="application"
      aria-label={mapLabel}
    >
      <div
        ref={leafletContainer}
        className="roadbook-leaflet-map absolute inset-0"
        aria-hidden={vectorReady || undefined}
        inert={vectorReady}
      />
      <div
        ref={vectorContainer}
        className="roadbook-vector-map absolute inset-0"
        aria-hidden={!vectorReady}
        inert={!vectorReady}
      />
    </div>
  );
}
