"use client";

import { trackAnalytics } from "@/features/analytics/client";

import { brandPalette } from "@/features/ui/brand-palette";

import L, { type Map as LeafletMap, type TileLayer } from "leaflet";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import {
  readRoadbookMapStyle,
  ROADBOOK_MAP_STYLES,
  writeRoadbookMapStyle,
} from "@/features/roadbook/roadbook-map-style";
import {
  roadbookMapModes,
  type RoadbookMapMode,
} from "@/features/roadbook/roadbook-schema";
import {
  createRoadbookVectorLayerStyles,
  parseRoadbookVectorProvider,
  ROADBOOK_VECTOR_TILEJSON_URL,
  type RoadbookVectorProvider,
} from "@/features/roadbook/roadbook-vector-style";
import type { TripRoute } from "@/features/trips/trip-route";
import { createTripStopMarker } from "@/features/trips/trip-stop-marker";

const RASTER_TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const OPENFREE_ATTRIBUTION =
  '&copy; <a href="https://openfreemap.org/">OpenFreeMap</a> · OpenMapTiles';
const VECTOR_PANE = "trip-route-vector-basemap";

export function TripRouteMap({ route }: { route: TripRoute }) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const raster = useRef<TileLayer | null>(null);
  const vector = useRef<L.VectorGrid.Protobuf | null>(null);
  const [provider, setProvider] = useState<RoadbookVectorProvider | null>(null);
  const [vectorReady, setVectorReady] = useState(false);
  const [mode, setMode] = useState<RoadbookMapMode>(() =>
    readRoadbookMapStyle(
      typeof window === "undefined" ? undefined : window.localStorage,
    ),
  );
  const visualStyle = ROADBOOK_MAP_STYLES[mode];

  useEffect(() => {
    writeRoadbookMapStyle(
      mode,
      typeof window === "undefined" ? undefined : window.localStorage,
    );
  }, [mode]);

  useEffect(() => {
    if (!container.current || map.current) return;
    const instance = L.map(container.current, {
      zoomControl: false,
      attributionControl: false,
      minZoom: 3,
      maxZoom: 18,
      scrollWheelZoom: true,
    });
    instance.createPane(VECTOR_PANE).style.zIndex = "210";
    const tiles = L.tileLayer(RASTER_TILES, {
      minZoom: 3,
      maxZoom: 19,
      crossOrigin: true,
      attribution: OSM_ATTRIBUTION,
    }).addTo(instance);
    L.control.zoom({ position: "bottomleft" }).addTo(instance);
    L.control
      .attribution({ position: "bottomright", prefix: false })
      .addAttribution(OSM_ATTRIBUTION)
      .addAttribution(OPENFREE_ATTRIBUTION)
      .addTo(instance);
    const bounds = L.latLngBounds(route.bounds);
    instance.fitBounds(bounds, { padding: [54, 54], animate: false });

    const routeCoordinates = route.geometry.coordinates.map(
      ([longitude, latitude]) => [latitude, longitude] as [number, number],
    );
    L.polyline(routeCoordinates, {
      color: brandPalette.background,
      opacity: 0.82,
      weight: 13,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(instance);
    L.polyline(routeCoordinates, {
      color: brandPalette.primary,
      opacity: 1,
      weight: 7,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(instance);
    route.stops.forEach((stop, index) => {
      L.marker([stop.latitude, stop.longitude], {
        icon: L.divIcon({
          className: "trip-route-marker-shell",
          html: createTripStopMarker(index, stop.name),
          iconSize: [42, 42],
          iconAnchor: [21, 21],
        }),
        title: stop.name,
        alt: `${index + 1}. ${stop.name}`,
        keyboard: true,
        riseOnHover: true,
      }).addTo(instance);
    });

    // The route geometry and stop markers have actually been added to the map.
    trackAnalytics("trip_route_displayed");
    map.current = instance;
    raster.current = tiles;
    return () => {
      instance.remove();
      map.current = null;
      raster.current = null;
      vector.current = null;
    };
  }, [route]);

  useEffect(() => {
    const controller = new AbortController();
    (window as Window & { L?: typeof L }).L = L;
    void import("leaflet.vectorgrid")
      .then(async () => {
        const response = await fetch(ROADBOOK_VECTOR_TILEJSON_URL, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Vector map unavailable");
        const next = parseRoadbookVectorProvider(await response.json());
        if (!next) throw new Error("Vector map invalid");
        setProvider(next);
      })
      .catch(() => setVectorReady(false));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const instance = map.current;
    if (!instance || !provider || !L.vectorGrid) return;
    const previous = vector.current;
    let loaded = false;
    const next = L.vectorGrid.protobuf(provider.tileUrl, {
      pane: VECTOR_PANE,
      minZoom: 3,
      maxZoom: 18,
      maxNativeZoom: 14,
      rendererFactory: L.canvas.tile,
      interactive: false,
      vectorTileLayerStyles: createRoadbookVectorLayerStyles(
        visualStyle.vector,
        provider.layerIds,
      ) as L.VectorGrid.ProtobufOptions["vectorTileLayerStyles"],
    });
    next.setOpacity(0);
    next.once("load", () => {
      loaded = true;
      vector.current = next;
      next.setOpacity(1);
      raster.current?.setOpacity(0);
      previous?.remove();
      setVectorReady(true);
    });
    next.addTo(instance);
    const timer = window.setTimeout(() => {
      if (!loaded) {
        next.remove();
        raster.current?.setOpacity(1);
        setVectorReady(false);
      }
    }, 8_000);
    return () => {
      window.clearTimeout(timer);
      next.off("load");
      if (vector.current !== next) next.remove();
    };
  }, [provider, visualStyle.vector]);

  return (
    <section
      className="border-foreground/12 bg-card overflow-hidden rounded-[1.7rem] border shadow-[0_24px_60px_rgba(184,199,217,.16)]"
      style={{ "--trip-map-canvas": visualStyle.canvas } as CSSProperties}
    >
      <header className="bg-card text-foreground flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-5">
        <div>
          <p className="text-primary text-[10px] font-semibold tracking-[0.14em] uppercase">
            Calculated road route
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            {route.distanceKm} km · {route.durationMinutes} min ·{" "}
            {route.provider}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {route.weather && (
            <a
              href={route.weather.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground rounded-full border border-white/10 px-3 py-1.5 text-[10px] text-white/60"
            >
              {route.weather.temperatureMinC}–{route.weather.temperatureMaxC}°C
              · {route.weather.precipitationProbability}% rain
            </a>
          )}
          <span className="text-muted-foreground rounded-full border border-white/10 px-3 py-1.5 text-[10px]">
            {vectorReady ? "Styled Roadbook map" : "OSM compatibility map"}
          </span>
        </div>
      </header>
      <div
        className="trip-route-style-rail"
        role="radiogroup"
        aria-label="Map style"
      >
        {roadbookMapModes.map((value) => {
          const style = ROADBOOK_MAP_STYLES[value];
          const selected = value === mode;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setMode(value)}
              className={selected ? "is-selected" : ""}
              style={
                {
                  "--trip-style-land": style.swatch[0],
                  "--trip-style-road": style.swatch[1],
                  "--trip-style-water": style.swatch[2],
                } as CSSProperties
              }
            >
              <span aria-hidden="true" />
              {style.name}
            </button>
          );
        })}
      </div>
      <div className="relative h-[34rem] bg-[var(--trip-map-canvas)] sm:h-[40rem]">
        <div ref={container} className="trip-route-leaflet absolute inset-0" />
      </div>
    </section>
  );
}
