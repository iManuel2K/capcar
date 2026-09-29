"use client";

import L, {
  type Map as LeafletMap,
  type Marker,
  type Polyline,
  type TileLayer,
} from "leaflet";
import "leaflet/dist/leaflet.css";
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
  createRoadbookVectorLayerStyles,
  parseRoadbookVectorProvider,
  ROADBOOK_VECTOR_TILEJSON_URL,
  type RoadbookVectorProvider,
} from "@/features/roadbook/roadbook-vector-style";

const PRIMARY_TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const FALLBACK_TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const OPENFREE_ATTRIBUTION =
  '&copy; <a href="https://openfreemap.org/">OpenFreeMap</a> · OpenMapTiles';
const VECTOR_PANE = "roadbook-vector-basemap";

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

function radiusFromMap(instance: LeafletMap) {
  return Math.min(
    3500,
    Math.max(
      10,
      instance.getCenter().distanceTo(instance.getBounds().getNorthEast()) /
        1000,
    ),
  );
}

function monitorVectorTiles(
  layer: L.VectorGrid.Protobuf,
  onResult: (loaded: boolean) => void,
) {
  const original = layer._getVectorTilePromise.bind(layer) as (
    ...args: unknown[]
  ) => Promise<unknown>;
  layer._getVectorTilePromise = ((...args: unknown[]) =>
    original(...args)
      .then((result) => {
        const layers = (result as { layers?: Record<string, unknown> }).layers;
        onResult(Boolean(layers && Object.keys(layers).length > 0));
        return result;
      })
      .catch(() => {
        onResult(false);
        return { layers: {} };
      })) as typeof layer._getVectorTilePromise;
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
  const map = useRef<LeafletMap | null>(null);
  const rasterTiles = useRef<TileLayer | null>(null);
  const styledTiles = useRef<L.VectorGrid.Protobuf | null>(null);
  const attribution = useRef<L.Control.Attribution | null>(null);
  const hasOpenFreeAttribution = useRef(false);
  const markers = useRef<Marker[]>([]);
  const userMarker = useRef<L.CircleMarker | null>(null);
  const selectedRoute = useRef<Polyline | null>(null);
  const initialCenter = useRef(center);
  const onSelectRef = useRef(onSelect);
  const onViewportChangeRef = useRef(onViewportChange);
  const onErrorRef = useRef(onError);
  const onReadyRef = useRef(onReady);
  const onRendererChangeRef = useRef(onRendererChange);
  const [vectorProvider, setVectorProvider] =
    useState<RoadbookVectorProvider | null>(null);
  const [styledReady, setStyledReady] = useState(false);

  useEffect(() => {
    onSelectRef.current = onSelect;
    onViewportChangeRef.current = onViewportChange;
    onErrorRef.current = onError;
    onReadyRef.current = onReady;
    onRendererChangeRef.current = onRendererChange;
  }, [onError, onReady, onRendererChange, onSelect, onViewportChange]);

  useEffect(() => {
    if (!leafletContainer.current || map.current) return;

    const instance = L.map(leafletContainer.current, {
      center: [initialCenter.current.latitude, initialCenter.current.longitude],
      zoom: 4,
      minZoom: 3,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
      boxZoom: true,
      keyboard: true,
      dragging: true,
    });
    const vectorPane = instance.createPane(VECTOR_PANE);
    vectorPane.style.zIndex = "210";
    vectorPane.style.pointerEvents = "none";

    let recovery = { failures: 0, fallbackAttempted: false };
    let hasLoadedTiles = false;
    const tiles = L.tileLayer(PRIMARY_TILES, {
      minZoom: 3,
      maxZoom: 19,
      crossOrigin: true,
      attribution: OSM_ATTRIBUTION,
    });

    L.control.zoom({ position: "bottomleft" }).addTo(instance);
    const attributionControl = L.control.attribution({
      position: "bottomright",
      prefix: false,
    });
    attributionControl.addTo(instance);

    tiles.on("load", () => {
      hasLoadedTiles = true;
      onReadyRef.current();
    });
    tiles.on("tileerror", () => {
      const result = recoverRoadbookTiles(recovery, hasLoadedTiles);
      recovery = result.state;
      if (result.action === "fallback") tiles.setUrl(FALLBACK_TILES, false);
      if (result.action === "error" && !styledTiles.current)
        onErrorRef.current("MAP_TILES_FAILED");
    });
    tiles.addTo(instance);

    instance.on("moveend", () => {
      const next = instance.getCenter();
      onViewportChangeRef.current(
        { latitude: next.lat, longitude: next.lng },
        radiusFromMap(instance),
      );
    });

    map.current = instance;
    rasterTiles.current = tiles;
    attribution.current = attributionControl;

    return () => {
      markers.current.forEach((marker) => marker.remove());
      userMarker.current?.remove();
      selectedRoute.current?.remove();
      instance.remove();
      map.current = null;
      rasterTiles.current = null;
      styledTiles.current = null;
      attribution.current = null;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;
    (window as Window & { L?: typeof L }).L = L;

    void import("leaflet.vectorgrid")
      .then(async () => {
        const response = await fetch(ROADBOOK_VECTOR_TILEJSON_URL, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("OPENFREE_TILEJSON_FAILED");
        const provider = parseRoadbookVectorProvider(await response.json());
        if (!provider) throw new Error("OPENFREE_TILEJSON_INVALID");
        if (!disposed) setVectorProvider(provider);
      })
      .catch(() => {
        if (disposed || controller.signal.aborted) return;
        setStyledReady(false);
        onRendererChangeRef.current(false);
      });

    return () => {
      disposed = true;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const instance = map.current;
    if (!instance || !vectorProvider || !L.vectorGrid) return;

    let disposed = false;
    let successfulTiles = 0;
    const previous = styledTiles.current;
    const next = L.vectorGrid.protobuf(vectorProvider.tileUrl, {
      pane: VECTOR_PANE,
      minZoom: 3,
      maxZoom: 18,
      maxNativeZoom: 14,
      rendererFactory: L.canvas.tile,
      interactive: false,
      vectorTileLayerStyles: createRoadbookVectorLayerStyles(
        visualStyle.vector,
        vectorProvider.layerIds,
      ) as L.VectorGrid.ProtobufOptions["vectorTileLayerStyles"],
    });
    next.setOpacity(0);

    monitorVectorTiles(next, (loaded) => {
      if (loaded) successfulTiles += 1;
    });

    const activate = () => {
      if (disposed) return;
      if (successfulTiles === 0) {
        next.remove();
        if (!previous) {
          rasterTiles.current?.setOpacity(1);
          setStyledReady(false);
          onRendererChangeRef.current(false);
        }
        return;
      }

      styledTiles.current = next;
      next.setOpacity(1);
      if (previous) {
        previous.setOpacity(0);
        window.setTimeout(() => previous.remove(), 240);
      }
      rasterTiles.current?.setOpacity(0);
      if (!hasOpenFreeAttribution.current) {
        attribution.current?.addAttribution(OPENFREE_ATTRIBUTION);
        hasOpenFreeAttribution.current = true;
      }
      setStyledReady(true);
      onRendererChangeRef.current(true);
      onReadyRef.current();
    };

    next.once("load", activate);
    next.addTo(instance);

    return () => {
      disposed = true;
      next.off("load", activate);
      if (styledTiles.current !== next) next.remove();
    };
  }, [vectorProvider, visualStyle.vector]);

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
      const element = userMarker.current.getElement();
      element?.setAttribute("role", "img");
      element?.setAttribute("aria-label", userLocationLabel);
    }

    if (!userPosition) return;
    instance.flyTo(
      [userPosition.latitude, userPosition.longitude],
      Math.max(instance.getZoom(), 10),
      { duration: 0.85 },
    );
  }, [userLocationLabel, userPosition]);

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
  }, [selectedVenue]);

  useEffect(() => {
    if (!selectedVenue) return;
    const instance = map.current;
    instance?.flyTo(
      [selectedVenue.latitude, selectedVenue.longitude],
      Math.max(instance.getZoom(), 11),
      { duration: 0.85 },
    );
  }, [selectedVenue]);

  return (
    <div
      className={`roadbook-map-shell absolute inset-0 ${styledReady ? "is-vector-ready" : ""}`}
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
      />
    </div>
  );
}
