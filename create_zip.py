import zipfile

files = {
    "roadbook-event-rail.tsx": '''"use client";

import { CalendarDays, ExternalLink, MapPin } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import type {
  RoadbookEvent,
  RoadbookVenue,
} from "@/features/roadbook/roadbook-schema";

export function RoadbookEventRail({
  events,
  venues,
  open,
  onOpenChange,
  onSelectVenue,
}: {
  events: RoadbookEvent[];
  venues: RoadbookVenue[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectVenue: (venue: RoadbookVenue) => void;
}) {
  const t = useTranslations("Roadbook.events");
  const locale = useLocale();
  const venuesById = new Map(venues.map((venue) => [venue.id, venue]));

  return (
    <section className="absolute top-36 right-3 z-30 sm:top-44 lg:right-5">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
        className="ml-auto flex min-h-11 items-center gap-2 rounded-xl border border-white/12 bg-[#09100d]/90 px-4 text-xs font-semibold text-white/75 shadow-xl backdrop-blur-xl transition hover:bg-[#101a16] hover:text-white"
      >
        <CalendarDays className="size-4 text-[#ff667a]" />
        {t("upcoming", { count: events.length })}
      </button>

      {open && (
        <div className="mt-2 w-[min(25rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-white/12 bg-[#09100d]/96 shadow-2xl backdrop-blur-xl">
          <header className="border-b border-white/9 p-4">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-[#ff667a] uppercase">
              {t("eyebrow")}
            </p>
            <h2 className="mt-1 text-lg font-medium">{t("title")}</h2>
            <p className="mt-1 text-xs leading-5 text-white/42">
              {t("description")}
            </p>
          </header>

          <div className="max-h-[min(31rem,60dvh)] overflow-y-auto p-2">
            {!events.length && (
              <p className="p-4 text-xs leading-5 text-white/45">
                {t("empty")}
              </p>
            )}
            {events.map((event) => {
              const venue = venuesById.get(event.venueId);
              if (!venue) return null;
              const startsAt = new Date(event.startsAt);
              const endsAt = new Date(event.endsAt);
              const sameDay = startsAt.toDateString() === endsAt.toDateString();
              const date = new Intl.DateTimeFormat(locale, {
                dateStyle: "medium",
                ...(sameDay ? { timeStyle: "short" as const } : {}),
              }).format(startsAt);

              return (
                <article
                  key={event.id}
                  className="rounded-xl border border-transparent p-3 transition hover:border-white/9 hover:bg-white/[0.035]"
                >
                  <div className="flex gap-3">
                    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#e72d45]/12 text-[#ff788a]">
                      <CalendarDays className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold tracking-[0.1em] text-white/35 uppercase">
                        {t(`types.${event.eventType}`)} · {date}
                      </p>
                      <h3 className="mt-1 text-sm font-semibold text-white/88">
                        {event.title}
                      </h3>
                      <p className="mt-1 text-[11px] text-white/38">
                        {t(`participation.${event.participation}`)}
                      </p>
                      <button
                        type="button"
                        onClick={() => onSelectVenue(venue)}
                        className="mt-2 inline-flex min-h-8 items-center gap-1.5 text-left text-xs text-white/48 transition hover:text-white"
                      >
                        <MapPin className="size-3.5" />
                        {venue.name} · {venue.city}
                      </button>
                      <a
                        href={event.bookingUrl ?? event.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 flex min-h-8 items-center gap-1.5 text-xs font-semibold text-[#ff788a]"
                      >
                        {event.bookingUrl ? t("booking") : t("source")}
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
''',
    "roadbook-experience.tsx": '''"use client";

import { AlertTriangle, Crosshair, MapPinned, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { RoadbookFilterBar } from "@/components/roadbook/roadbook-filter-bar";
import { RoadbookEventRail } from "@/components/roadbook/roadbook-event-rail";
import { RoadbookMap } from "@/components/roadbook/roadbook-map";
import { RoadbookModerationQueue } from "@/components/roadbook/roadbook-moderation-queue";
import { RoadbookPosterButton } from "@/components/roadbook/roadbook-poster-button";
import { RoadbookThemeSwitcher } from "@/components/roadbook/roadbook-theme-switcher";
import { RoadbookVenueDrawer } from "@/components/roadbook/roadbook-venue-drawer";
import {
  fetchRoadbookVenues,
  fetchRoadbookEvents,
  recordRoadbookVisit,
  reportRoadbookVenue,
  saveRoadbookPlace,
  type RoadbookCenter,
} from "@/features/roadbook/roadbook-client";
import {
  roadbookCategories,
  roadbookMapModes,
  type RoadbookCategory,
  type RoadbookEvent,
  type RoadbookMapMode,
  type RoadbookVenue,
} from "@/features/roadbook/roadbook-schema";
import {
  readRoadbookVisits,
  ROADBOOK_VISITS_STORAGE_EVENT,
} from "@/features/roadbook/roadbook-storage";
import { readBuildState } from "@/features/builds/build-storage";
import { useVehicles } from "@/features/vehicles/use-vehicles";

const defaultCenter: RoadbookCenter = { latitude: 50.1109, longitude: 8.6821 };

export function RoadbookExperience() {
  const t = useTranslations("Roadbook");
  const { vehicles } = useVehicles();
  const [vehicleId, setVehicleId] = useState<string>();
  const [venues, setVenues] = useState<RoadbookVenue[]>([]);
  const [events, setEvents] = useState<RoadbookEvent[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<RoadbookVenue>();
  const [categories, setCategories] = useState<RoadbookCategory[]>([]);
  const [mode, setMode] = useState<RoadbookMapMode>("petrol_night");
  const [center, setCenter] = useState(defaultCenter);
  const [radiusKm, setRadiusKm] = useState(350);
  const [userPosition, setUserPosition] = useState<RoadbookCenter>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mapError, setMapError] = useState("");
  const [mapReady, setMapReady] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const [visits, setVisits] = useState(() =>
    typeof window === "undefined"
      ? []
      : readRoadbookVisits(window.localStorage),
  );
  const fetchSequence = useRef(0);
  const fetchController = useRef<AbortController | null>(null);

  useEffect(() => {
    const update = () => setVisits(readRoadbookVisits(window.localStorage));
    window.addEventListener(ROADBOOK_VISITS_STORAGE_EVENT, update);
    return () =>
      window.removeEventListener(ROADBOOK_VISITS_STORAGE_EVENT, update);
  }, []);

  const loadVenues = useCallback(async () => {
    const sequence = ++fetchSequence.current;
    fetchController.current?.abort();
    const controller = new AbortController();
    fetchController.current = controller;
    setLoading(true);
    setError("");
    try {
      const result = await fetchRoadbookVenues({
        center,
        radiusKm,
        categories,
        signal: controller.signal,
      });
      if (sequence === fetchSequence.current) {
        setVenues(result);
        try {
          const nextEvents = await fetchRoadbookEvents({
            venueIds: result.map((venue) => venue.id),
            signal: controller.signal,
          });
          if (sequence === fetchSequence.current) setEvents(nextEvents);
        } catch {
          if (!controller.signal.aborted) setEvents([]);
        }
      }
    } catch {
      if (sequence === fetchSequence.current && !controller.signal.aborted)
        setError(t("errors.load"));
    } finally {
      if (sequence === fetchSequence.current) setLoading(false);
    }
  }, [categories, center, radiusKm, t]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadVenues(), 320);
    return () => {
      window.clearTimeout(timer);
      fetchController.current?.abort();
    };
  }, [loadVenues]);

  useEffect(() => {
    if (mapReady) return;
    const timeout = window.setTimeout(
      () => setMapError(t("errors.mapUnavailable")),
      15000,
    );
    return () => window.clearTimeout(timeout);
  }, [mapReady, t]);

  const filterLabels = useMemo(
    () =>
      Object.fromEntries(
        roadbookCategories.map((category) => [
          category,
          t(`categories.${category}`),
        ]),
      ) as Record<RoadbookCategory, string>,
    [t],
  );
  const modeLabels = useMemo(
    () =>
      Object.fromEntries(
        roadbookMapModes.map((mapMode) => [mapMode, t(`modes.${mapMode}`)]),
      ) as Record<RoadbookMapMode, string>,
    [t],
  );
  const activeVehicleId = vehicleId ?? vehicles[0]?.id;
  const selectedVehicle = vehicles.find(
    (vehicle) => vehicle.id === activeVehicleId,
  );

  const updateViewport = useCallback(
    (nextCenter: RoadbookCenter, nextRadiusKm: number) => {
      setCenter(nextCenter);
      setRadiusKm(nextRadiusKm);
    },
    [],
  );

  function locateUser() {
    if (!navigator.geolocation) {
      setError(t("errors.locationUnavailable"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setUserPosition(next);
        setCenter(next);
        setRadiusKm(150);
      },
      () => setError(t("errors.locationDenied")),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
  }

  return (
    <div className="relative h-[calc(100dvh-4.5rem)] min-h-[38rem] overflow-hidden bg-[#0b0e0c] text-white sm:h-[calc(100dvh-5rem)]">
      <RoadbookMap
        venues={venues}
        events={events}
        selectedVenue={selectedVenue}
        mode={mode}
        center={center}
        userPosition={userPosition}
        onSelect={setSelectedVenue}
        onViewportChange={updateViewport}
        onError={() => setMapError(t("errors.mapUnavailable"))}
        onReady={() => {
          setMapReady(true);
          setMapError("");
        }}
      />

      {!mapReady && !mapError && (
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-[#0b0e0c]">
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.035] px-4 py-3 text-xs text-white/55">
            <RefreshCw className="size-4 animate-spin text-[#ff667a]" />
            {t("mapLoading")}
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-36 bg-gradient-to-b from-[#07100d]/82 to-transparent" />
      <div className="absolute top-3 left-3 z-20 max-w-[min(38rem,calc(100%-1.5rem))] sm:top-5 sm:left-5">
        <div className="rounded-2xl border border-white/12 bg-[#09100d]/88 p-4 shadow-2xl backdrop-blur-xl sm:p-5">
          <p className="text-[10px] font-semibold tracking-[0.16em] text-[#ff667a] uppercase">
            {t("eyebrow")}
          </p>
          <h1 className="mt-1 text-xl font-medium tracking-[-0.035em] sm:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-1 hidden max-w-lg text-xs leading-5 text-white/48 sm:block">
            {t("description")}
          </p>
        </div>
      </div>

      <div className="absolute top-3 right-3 z-20 hidden gap-2 lg:flex">
        <RoadbookModerationQueue />
        <RoadbookPosterButton
          vehicle={selectedVehicle}
          visits={visits}
          label={t("poster.action")}
          emptyLabel={t("poster.empty")}
        />
        <RoadbookThemeSwitcher
          mode={mode}
          onChange={setMode}
          label={t("modes.label")}
          labels={modeLabels}
        />
      </div>

      <RoadbookEventRail
        events={events}
        venues={venues}
        open={eventsOpen}
        onOpenChange={setEventsOpen}
        onSelectVenue={(venue) => {
          setSelectedVenue(venue);
          setEventsOpen(false);
        }}
      />

      <div className="absolute right-3 bottom-3 left-3 z-20 flex items-end gap-2 lg:right-[28rem] lg:left-5">
        <div className="min-w-0 flex-1">
          <RoadbookFilterBar
            selected={categories}
            onChange={setCategories}
            label={t("filtersLabel")}
            labels={filterLabels}
          />
        </div>
        <button
          type="button"
          onClick={locateUser}
          aria-label={t("locate")}
          title={t("locate")}
          className="grid size-12 shrink-0 place-items-center rounded-2xl border border-white/12 bg-[#09100d]/88 text-white/70 shadow-2xl backdrop-blur-xl hover:text-white"
        >
          <Crosshair className="size-4" />
        </button>
        <div className="lg:hidden">
          <RoadbookThemeSwitcher
            mode={mode}
            onChange={setMode}
            label={t("modes.label")}
            labels={modeLabels}
          />
        </div>
      </div>

      <div className="absolute top-36 left-3 z-20 sm:top-44 sm:left-5">
        <div className="rounded-xl border border-white/10 bg-[#09100d]/82 px-3 py-2 text-[11px] text-white/52 shadow-lg backdrop-blur-xl">
          {loading ? t("loading") : t("resultCount", { count: venues.length })}
        </div>
      </div>

      {(error || mapError) && (
        <div
          role="alert"
          className="absolute top-36 right-3 left-3 z-40 flex items-center justify-between gap-3 rounded-xl border border-red-200/20 bg-[#2d1014]/94 p-3 text-xs text-red-50 shadow-xl sm:top-auto sm:right-auto sm:bottom-20 sm:left-5 sm:max-w-lg"
        >
          <span className="inline-flex items-center gap-2">
            <AlertTriangle className="size-4 shrink-0" /> {error || mapError}
          </span>
          <button
            type="button"
            onClick={() => {
              if (mapError) window.location.reload();
              else void loadVenues();
            }}
            className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-lg border border-white/15 px-3 font-semibold"
          >
            <RefreshCw className="size-3.5" /> {t("retry")}
          </button>
        </div>
      )}

      {!loading && !error && venues.length === 0 && (
        <div className="absolute top-1/2 left-1/2 z-20 w-[min(28rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/12 bg-[#09100d]/92 p-5 text-center shadow-2xl backdrop-blur-xl">
          <MapPinned className="mx-auto size-6 text-white/45" />
          <h2 className="mt-3 text-lg font-medium">{t("empty.title")}</h2>
          <p className="mt-2 text-xs leading-5 text-white/45">
            {t("empty.description")}
          </p>
        </div>
      )}

      {selectedVenue && (
        <RoadbookVenueDrawer
          key={selectedVenue.id}
          venue={selectedVenue}
          events={events.filter((event) => event.venueId === selectedVenue.id)}
          vehicles={vehicles}
          vehicleId={activeVehicleId}
          onVehicleChange={(id) => setVehicleId(id || undefined)}
          onClose={() => setSelectedVenue(undefined)}
          onSave={async (activeVehicleId) => {
            const buildId = readBuildState(window.localStorage).builds.find(
              (build) =>
                build.vehicleId === activeVehicleId &&
                build.status !== "complete",
            )?.id;
            await saveRoadbookPlace({
              venueId: selectedVenue.id,
              vehicleId: activeVehicleId,
              buildId,
            });
          }}
          onRecord={async ({ vehicle, details, photos, obdFile }) => {
            await recordRoadbookVisit({
              venue: selectedVenue,
              vehicle,
              details,
              photos,
              obdFile,
            });
            setVisits(readRoadbookVisits(window.localStorage));
          }}
          onReport={(report) => reportRoadbookVenue(selectedVenue.id, report)}
        />
      )}
    </div>
  );
}
''',
    "roadbook-filter-bar.tsx": '''"use client";

import {
  FlagTriangleRight,
  Gauge,
  Milestone,
  Mountain,
  Route,
  TestTubeDiagonal,
} from "lucide-react";

import type { RoadbookCategory } from "@/features/roadbook/roadbook-schema";

const filters = [
  { value: "drift_circuit", icon: Route },
  { value: "drag_acceleration", icon: Gauge },
  { value: "track_day", icon: FlagTriangleRight },
  { value: "proving_ground", icon: TestTubeDiagonal },
  { value: "scenic_route", icon: Mountain },
  { value: "autobahn_context", icon: Milestone },
] as const;

export function RoadbookFilterBar({
  selected,
  onChange,
  label,
  labels,
}: {
  selected: RoadbookCategory[];
  onChange: (categories: RoadbookCategory[]) => void;
  label: string;
  labels: Record<RoadbookCategory, string>;
}) {
  function toggle(category: RoadbookCategory) {
    onChange(
      selected.includes(category)
        ? selected.filter((value) => value !== category)
        : [...selected, category],
    );
  }

  return (
    <div
      aria-label={label}
      className="flex max-w-full [scrollbar-width:none] gap-2 overflow-x-auto rounded-2xl border border-white/12 bg-[#09100d]/88 p-2 shadow-2xl backdrop-blur-xl [&::-webkit-scrollbar]:hidden"
    >
      {filters.map(({ value, icon: Icon }) => {
        const active = selected.includes(value);
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(value)}
            className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-medium transition ${
              active
                ? "bg-[#e72d45] text-white shadow-lg"
                : "bg-white/[0.055] text-white/62 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon aria-hidden="true" className="size-3.5" />
            {labels[value]}
          </button>
        );
      })}
    </div>
  );
}
''',
    "roadbook-map.tsx": '''"use client";

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
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  "topo-vintage": {
    name: "03 / Vintage Topo",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM',
  },
  "cyber-neon": {
    name: "04 / Neon Grid",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  "berlin-asphalt": {
    name: "05 / Berlin Industrial",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  "tokyo-drift": {
    name: "06 / Tokyo High-Contrast",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
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
    url: "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
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

    const initialStyleKey =
      mapStyle ?? MODE_TO_MAP_STYLE[mode] ?? "midnight-dark";
    const currentStyleConfig =
      ROADBOOK_MAP_STYLES[initialStyleKey] ??
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
''',
    "roadbook-map-loader.tsx": '''"use client";

import dynamic from "next/dynamic";

const RoadbookExperience = dynamic(
  () =>
    import("@/components/roadbook/roadbook-experience").then(
      (module) => module.RoadbookExperience,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-[calc(100dvh-4.5rem)] min-h-[38rem] place-items-center bg-[#0b0e0c] text-white">
        <div className="size-8 animate-spin rounded-full border-2 border-white/15 border-t-[#e72d45]" />
      </div>
    ),
  },
);

export function RoadbookMapLoader() {
  return <RoadbookExperience />;
}
''',
    "roadbook-moderation-queue.tsx": '''"use client";

import { Check, ExternalLink, Shield, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import {
  fetchRoadbookModerationQueue,
  isRoadbookModerator,
  moderateRoadbookReport,
  type RoadbookModerationReport,
} from "@/features/roadbook/roadbook-client";

export function RoadbookModerationQueue() {
  const t = useTranslations("Roadbook.moderation");
  const [reports, setReports] = useState<RoadbookModerationReport[]>([]);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [activeId, setActiveId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void isRoadbookModerator()
      .then(async (moderator) => {
        if (!moderator || cancelled) return;
        const queue = await fetchRoadbookModerationQueue();
        if (!cancelled) {
          setReports(queue);
          setVisible(true);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  if (!visible) return null;

  async function decide(status: "accepted" | "rejected") {
    if (!activeId || note.trim().length < 10) return;
    setBusy(true);
    setError("");
    try {
      await moderateRoadbookReport(activeId, status, note);
      setReports((current) =>
        current.filter((report) => report.id !== activeId),
      );
      setActiveId("");
      setNote("");
    } catch {
      setError(t("error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/12 bg-[#09100d]/88 px-4 text-xs font-semibold text-white/70 shadow-xl backdrop-blur-xl"
      >
        <Shield className="size-4 text-[#6bd2ae]" />
        {t("action")} · {reports.length}
      </button>
      {open && (
        <section className="absolute top-13 right-0 w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-white/12 bg-[#09100d]/96 p-4 text-white shadow-2xl backdrop-blur-xl">
          <h2 className="text-sm font-semibold">{t("title")}</h2>
          {error && (
            <p className="mt-2 rounded-lg bg-red-300/8 p-2 text-xs text-red-100">
              {error}
            </p>
          )}
          <div className="mt-3 max-h-80 space-y-3 overflow-y-auto">
            {!reports.length && (
              <p className="text-xs text-white/45">{t("empty")}</p>
            )}
            {reports.map((report) => (
              <article
                key={report.id}
                className="rounded-xl border border-white/9 bg-white/[0.035] p-3"
              >
                <p className="text-xs font-semibold">{report.venueName}</p>
                <p className="mt-2 text-xs leading-5 text-white/48">
                  {report.reason}
                </p>
                {report.evidenceUrl && (
                  <a
                    href={report.evidenceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-[#ff788a]"
                  >
                    {t("evidence")} <ExternalLink className="size-3" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setActiveId(report.id)}
                  className="mt-3 block text-xs font-semibold text-white/60 underline"
                >
                  {t("review")}
                </button>
                {activeId === report.id && (
                  <div className="mt-3 grid gap-2">
                    <textarea
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      minLength={10}
                      maxLength={1000}
                      placeholder={t("note")}
                      className="rounded-lg border border-white/12 bg-black/30 p-2 text-xs"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={busy || note.trim().length < 10}
                        onClick={() => void decide("accepted")}
                        className="inline-flex min-h-9 items-center justify-center gap-1 rounded-lg bg-amber-300/15 text-xs text-amber-100"
                      >
                        <Check className="size-3" /> {t("accept")}
                      </button>
                      <button
                        type="button"
                        disabled={busy || note.trim().length < 10}
                        onClick={() => void decide("rejected")}
                        className="inline-flex min-h-9 items-center justify-center gap-1 rounded-lg bg-white/7 text-xs text-white/60"
                      >
                        <X className="size-3" /> {t("reject")}
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
''',
    "roadbook-poster-button.tsx": '''"use client";

import { Download } from "lucide-react";
import { useState } from "react";

import type { RoadbookVisitRecord } from "@/features/roadbook/roadbook-schema";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

function drawTrackedRoutes(
  context: CanvasRenderingContext2D,
  visits: RoadbookVisitRecord[],
) {
  const coordinateGroups = visits.map((visit) =>
    visit.routeGeoJson?.coordinates?.length
      ? visit.routeGeoJson.coordinates
      : [[visit.longitude, visit.latitude] as [number, number]],
  );
  const points = coordinateGroups.flat();
  if (!points.length) return;
  const lngs = points.map(([lng]) => lng);
  const lats = points.map(([, lat]) => lat);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const width = Math.max(maxLng - minLng, 0.05);
  const height = Math.max(maxLat - minLat, 0.05);
  const position = ([lng, lat]: [number, number]) => ({
    x: 110 + ((lng - minLng) / width) * 860,
    y: 980 - ((lat - minLat) / height) * 430,
  });

  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";
  coordinateGroups.forEach((coordinates, index) => {
    context.beginPath();
    coordinates.forEach((coordinate, pointIndex) => {
      const point = position(coordinate);
      if (pointIndex === 0) context.moveTo(point.x, point.y);
      else context.lineTo(point.x, point.y);
    });
    context.strokeStyle = index === 0 ? "#e72d45" : "rgba(244,245,242,.48)";
    context.lineWidth = index === 0 ? 7 : 4;
    context.stroke();
    const lastCoord = coordinates[coordinates.length - 1];
    if (lastCoord) {
      const last = position(lastCoord);
      context.beginPath();
      context.arc(last.x, last.y, 8, 0, Math.PI * 2);
      context.fillStyle = "#f4f5f2";
      context.fill();
    }
  });
  context.restore();
}

export async function renderRoadbookPoster(
  vehicle: Vehicle,
  visits: RoadbookVisitRecord[],
) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Poster rendering is unavailable.");

  context.fillStyle = "#09100d";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "rgba(244,245,242,.06)";
  context.lineWidth = 1;
  for (let x = 60; x < 1080; x += 60) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, 1350);
    context.stroke();
  }
  for (let y = 60; y < 1350; y += 60) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(1080, y);
    context.stroke();
  }

  context.fillStyle = "#e72d45";
  context.font = "700 24px Arial";
  context.fillText("CAPCAR ROADBOOK", 72, 92);
  context.fillStyle = "#f4f5f2";
  context.font = "500 76px Arial";
  context.fillText("Roads that shaped", 72, 190);
  context.fillText("this build.", 72, 278);
  context.fillStyle = "rgba(244,245,242,.55)";
  context.font = "400 27px Arial";
  context.fillText(
    `${vehicle.productionYear} ${vehicle.make} ${vehicle.model} · ${vehicle.platform}`,
    76,
    334,
  );

  if (vehicle.imageUrl) {
    try {
      const image = await loadImage(vehicle.imageUrl);
      const ratio = Math.max(
        900 / image.naturalWidth,
        360 / image.naturalHeight,
      );
      const width = image.naturalWidth * ratio;
      const height = image.naturalHeight * ratio;
      context.save();
      context.beginPath();
      if (typeof context.roundRect === "function") {
        context.roundRect(72, 385, 936, 360, 34);
      } else {
        context.rect(72, 385, 936, 360);
      }
      context.clip();
      context.drawImage(
        image,
        72 + (936 - width) / 2,
        385 + (360 - height) / 2,
        width,
        height,
      );
      context.restore();
      context.fillStyle = "rgba(9,16,13,.22)";
      context.fillRect(72, 385, 936, 360);
    } catch {
      context.fillStyle = "#111a16";
      context.fillRect(72, 385, 936, 360);
    }
  }

  drawTrackedRoutes(context, visits);
  context.fillStyle = "#f4f5f2";
  context.font = "600 30px Arial";
  context.fillText(
    `${visits.length} recorded ${visits.length === 1 ? "drive" : "drives"}`,
    72,
    1085,
  );
  context.fillStyle = "rgba(244,245,242,.5)";
  context.font = "400 23px Arial";
  visits.slice(0, 4).forEach((visit, index) => {
    context.fillText(
      `${visit.visitedAt}  ·  ${visit.venueName}`,
      72,
      1140 + index * 38,
    );
  });
  context.fillStyle = "#f4f5f2";
  context.font = "700 24px Arial";
  context.fillText("FROM PLAN TO ROAD. NO GUESSWORK.", 72, 1300);

  const link = document.createElement("a");
  link.download = `capcar-roadbook-${vehicle.make}-${vehicle.model}.png`
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-");
  link.href = canvas.toDataURL("image/png");
  link.click();
}

export function RoadbookPosterButton({
  vehicle,
  visits,
  label,
  emptyLabel,
}: {
  vehicle?: Vehicle;
  visits: RoadbookVisitRecord[];
  label: string;
  emptyLabel: string;
}) {
  const [busy, setBusy] = useState(false);
  const eligibleVisits = vehicle
    ? visits.filter((visit) => visit.vehicleId === vehicle.id)
    : [];
  return (
    <button
      type="button"
      disabled={!vehicle || !eligibleVisits.length || busy}
      title={!eligibleVisits.length ? emptyLabel : undefined}
      onClick={async () => {
        if (!vehicle || !eligibleVisits.length) return;
        setBusy(true);
        try {
          await renderRoadbookPoster(vehicle, eligibleVisits);
        } finally {
          setBusy(false);
        }
      }}
      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/12 bg-[#09100d]/88 px-4 text-xs font-semibold text-white/72 shadow-xl backdrop-blur-xl transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
    >
      <Download aria-hidden="true" className="size-4" />
      {label}
    </button>
  );
}
''',
    "roadbook-raster-fallback.tsx": '''"use client";

import { MapPinned } from "lucide-react";

import type { RoadbookCenter } from "@/features/roadbook/roadbook-client";
import type {
  RoadbookMapMode,
  RoadbookVenue,
} from "@/features/roadbook/roadbook-schema";

const styleIds: Record<RoadbookMapMode, string> = {
  workshop_cream: "light-v11",
  petrol_night: "dark-v11",
  blueprint: "navigation-night-v1",
  touring_clay: "outdoors-v12",
};

export function RoadbookRasterFallback({
  accessToken,
  venues,
  selectedVenue,
  mode,
  center,
  label,
  description,
  onSelect,
}: {
  accessToken: string;
  venues: RoadbookVenue[];
  selectedVenue?: RoadbookVenue;
  mode: RoadbookMapMode;
  center: RoadbookCenter;
  label: string;
  description: string;
  onSelect: (venue: RoadbookVenue) => void;
}) {
  const pins = venues
    .slice(0, 25)
    .map(
      (venue) =>
        `pin-s-${venue.id === selectedVenue?.id ? "e72d45" : "f3f1ec"}(${venue.longitude},${venue.latitude})`,
    )
    .join(",");
  const overlay = pins ? `${pins}/` : "";
  const imageUrl = `https://api.mapbox.com/styles/v1/mapbox/${styleIds[mode]}/static/${overlay}${center.longitude},${center.latitude},7.3,0/1280x800@2x?access_token=${encodeURIComponent(accessToken)}&logo=false&attribution=true`;

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0b0e0c]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="absolute inset-0 size-full object-cover opacity-82"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,16,13,.48),transparent_45%,rgba(7,16,13,.18))]" />

      <div className="absolute top-[10.5rem] right-3 z-10 max-w-[16rem] rounded-xl border border-white/12 bg-[#09100d]/88 p-3 shadow-xl backdrop-blur-xl sm:top-44 sm:right-5">
        <p className="flex items-center gap-2 text-[11px] font-semibold text-white/78">
          <MapPinned className="size-3.5 text-[#ff667a]" /> {label}
        </p>
        <p className="mt-1 hidden text-[10px] leading-4 text-white/42 sm:block">
          {description}
        </p>
      </div>

      {venues.length > 0 && (
        <div className="absolute right-3 bottom-24 left-3 z-10 flex gap-2 overflow-x-auto pb-1 sm:top-1/2 sm:right-5 sm:bottom-auto sm:left-auto sm:max-h-[38vh] sm:w-64 sm:-translate-y-1/2 sm:flex-col sm:overflow-y-auto sm:pr-1">
          {venues.map((venue) => (
            <button
              key={venue.id}
              type="button"
              onClick={() => onSelect(venue)}
              className={`min-h-11 shrink-0 rounded-xl border px-3 text-left text-xs shadow-lg backdrop-blur-xl transition sm:w-full ${
                venue.id === selectedVenue?.id
                  ? "border-[#ff667a]/50 bg-[#e72d45] text-white"
                  : "border-white/12 bg-[#09100d]/88 text-white/72 hover:border-white/25 hover:text-white"
              }`}
            >
              <span className="block max-w-48 truncate font-semibold">
                {venue.name}
              </span>
              <span className="mt-0.5 block text-[9px] tracking-[0.08em] uppercase opacity-55">
                {venue.city || venue.countryCode}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
''',
    "roadbook-theme-switcher.tsx": '''"use client";

import { MoonStar, PanelsTopLeft, Ruler, SunMedium } from "lucide-react";

import type { RoadbookMapMode } from "@/features/roadbook/roadbook-schema";

const modes = [
  { value: "workshop_cream", icon: SunMedium },
  { value: "petrol_night", icon: MoonStar },
  { value: "blueprint", icon: Ruler },
  { value: "touring_clay", icon: PanelsTopLeft },
] as const;

export function RoadbookThemeSwitcher({
  mode,
  onChange,
  label,
  labels,
}: {
  mode: RoadbookMapMode;
  onChange: (mode: RoadbookMapMode) => void;
  label: string;
  labels: Record<RoadbookMapMode, string>;
}) {
  return (
    <div
      aria-label={label}
      className="flex rounded-2xl border border-white/12 bg-[#09100d]/88 p-1.5 shadow-2xl backdrop-blur-xl"
    >
      {modes.map(({ value, icon: Icon }) => (
        <button
          key={value}
          type="button"
          title={labels[value]}
          aria-label={labels[value]}
          aria-pressed={mode === value}
          onClick={() => onChange(value)}
          className={`grid size-10 place-items-center rounded-xl transition ${
            mode === value
              ? "bg-[#f2ecdf] text-[#0e2d30]"
              : "text-white/55 hover:bg-white/8 hover:text-white"
          }`}
        >
          <Icon aria-hidden="true" className="size-4" />
        </button>
      ))}
    </div>
  );
}
''',
    "roadbook-venue-drawer.tsx": '''"use client";

import {
  AlertTriangle,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileScan,
  Flag,
  Gauge,
  MapPin,
  Ruler,
  Save,
  ShieldCheck,
  Volume2,
  X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";

import { evaluateRoadbookReadiness } from "@/features/roadbook/roadbook-readiness";
import type {
  RecordRoadbookVisitInput,
  RoadbookEvent,
  RoadbookReportInput,
  RoadbookVenue,
} from "@/features/roadbook/roadbook-schema";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";

type ActionState = "idle" | "working" | "done";

export function RoadbookVenueDrawer({
  venue,
  events,
  vehicles,
  vehicleId,
  onVehicleChange,
  onClose,
  onSave,
  onRecord,
  onReport,
}: {
  venue: RoadbookVenue;
  events: RoadbookEvent[];
  vehicles: Vehicle[];
  vehicleId?: string;
  onVehicleChange: (vehicleId: string) => void;
  onClose: () => void;
  onSave: (vehicleId: string) => Promise<void>;
  onRecord: (input: {
    vehicle: Vehicle;
    details: RecordRoadbookVisitInput;
    photos: File[];
    obdFile?: File;
  }) => Promise<void>;
  onReport: (input: RoadbookReportInput) => Promise<void>;
}) {
  const t = useTranslations("Roadbook");
  const locale = useLocale();
  const photoInputId = useId();
  const obdInputId = useId();
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === vehicleId);
  const readiness = useMemo(
    () => evaluateRoadbookReadiness(selectedVehicle, venue),
    [selectedVehicle, venue],
  );
  const [saveState, setSaveState] = useState<ActionState>("idle");
  const [recordState, setRecordState] = useState<ActionState>("idle");
  const [reportState, setReportState] = useState<ActionState>("idle");
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [obdFile, setObdFile] = useState<File>();
  const [visitDate, setVisitDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [bestLap, setBestLap] = useState("");
  const [visitNotes, setVisitNotes] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");

  const price =
    venue.entryPriceCents === undefined
      ? t("details.confirmPrice")
      : new Intl.NumberFormat(locale, {
          style: "currency",
          currency: venue.priceCurrency,
        }).format(venue.entryPriceCents / 100);
  const openingHours = Object.entries(venue.openingHours);

  function explainError(caught: unknown) {
    const message =
      caught instanceof Error ? caught.message : t("errors.generic");
    setError(
      message === "SIGN_IN_REQUIRED"
        ? t("errors.signInRequired")
        : t("errors.generic"),
    );
  }

  return (
    <aside
      aria-label={t("details.label")}
      className="absolute inset-x-2 bottom-2 z-30 max-h-[72%] overflow-y-auto rounded-[1.6rem] border border-white/12 bg-[#0a0f0c]/96 text-white shadow-[0_24px_90px_rgba(0,0,0,.45)] backdrop-blur-2xl lg:inset-y-3 lg:right-3 lg:left-auto lg:max-h-none lg:w-[26rem]"
    >
      <div className="sticky top-0 z-10 flex items-start justify-between gap-5 border-b border-white/8 bg-[#0a0f0c]/94 p-5 backdrop-blur-xl">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold tracking-[0.12em] uppercase">
            <span className="text-[#ff667a]">
              {t(`categories.${venue.category}`)}
            </span>
            <span className="text-white/25">·</span>
            <span className="text-white/45">
              {venue.city || venue.countryCode}
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-medium tracking-[-0.035em]">
            {venue.name}
          </h2>
        </div>
        <button
          type="button"
          aria-label={t("details.close")}
          onClick={onClose}
          className="grid size-10 shrink-0 place-items-center rounded-full border border-white/10 text-white/55 transition hover:bg-white/8 hover:text-white"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>

      <div className="space-y-5 p-5">
        {venue.category === "autobahn_context" && (
          <SafetyNotice text={t("safety.autobahn")} />
        )}
        {(venue.category === "drift_circuit" ||
          venue.category === "drag_acceleration") && (
          <SafetyNotice text={t("safety.closedVenue")} />
        )}

        <p className="text-sm leading-6 text-white/55">{venue.description}</p>

        {events.length > 0 && (
          <section className="rounded-2xl border border-[#ff667a]/20 bg-[#ff667a]/[0.055] p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="inline-flex items-center gap-2 text-sm font-semibold">
                <CalendarDays className="size-4 text-[#ff667a]" />
                {t("events.atVenue")}
              </h3>
              <span className="rounded-full bg-white/7 px-2 py-1 text-[10px] text-white/45">
                {events.length}
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {events.map((event) => {
                const start = new Date(event.startsAt);
                const end = new Date(event.endsAt);
                const sameDay = start.toDateString() === end.toDateString();
                const date = sameDay
                  ? new Intl.DateTimeFormat(locale, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(start)
                  : `${new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(start)} – ${new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(end)}`;
                return (
                  <article
                    key={event.id}
                    className="rounded-xl border border-white/9 bg-black/15 p-3"
                  >
                    <p className="text-[10px] font-semibold tracking-[0.1em] text-[#ff9baa] uppercase">
                      {t(`events.types.${event.eventType}`)} · {date}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white/85">
                      {event.title}
                    </p>
                    <p className="mt-1 text-[11px] text-white/38">
                      {t(`events.participation.${event.participation}`)}
                    </p>
                    {event.description && (
                      <p className="mt-1 text-xs leading-5 text-white/42">
                        {event.description}
                      </p>
                    )}
                    <a
                      href={event.bookingUrl ?? event.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex min-h-8 items-center gap-1.5 text-xs font-semibold text-[#ff788a]"
                    >
                      {event.bookingUrl
                        ? t("events.booking")
                        : t("events.source")}
                      <ExternalLink className="size-3" />
                    </a>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Fact
            icon={ShieldCheck}
            label={t("details.access")}
            value={t(`access.${venue.accessStatus}`)}
          />
          <Fact
            icon={Flag}
            label={t("details.surface")}
            value={venue.surface ?? t("details.unknown")}
          />
          <Fact
            icon={Ruler}
            label={t("details.length")}
            value={
              venue.lengthM
                ? `${(venue.lengthM / 1000).toLocaleString(locale)} km`
                : t("details.unknown")
            }
          />
          <Fact
            icon={Volume2}
            label={t("details.noise")}
            value={
              venue.noiseLimitDb
                ? `${venue.noiseLimitDb} dB`
                : t("details.confirmLimit")
            }
          />
          <Fact
            icon={Clock3}
            label={t("details.hours")}
            value={
              openingHours.length
                ? openingHours
                    .map(([day, hours]) => `${day}: ${hours}`)
                    .join(" · ")
                : t("details.confirmHours")
            }
          />
          <Fact icon={Gauge} label={t("details.entry")} value={price} />
        </div>

        <div className="rounded-2xl border border-white/9 bg-white/[0.035] p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-white/75">
              <CheckCircle2 className="size-4 text-[#6bd2ae]" />
              {t(`verification.${venue.verificationStatus}`)}
            </span>
            <span className="text-xs text-white/35">
              {(venue.distanceM / 1000).toLocaleString(locale, {
                maximumFractionDigits: 0,
              })}{" "}
              km
            </span>
          </div>
          <p className="mt-2 text-xs leading-5 text-white/40">
            {venue.verifiedAt
              ? t("details.verifiedOn", {
                  date: new Intl.DateTimeFormat(locale, {
                    dateStyle: "medium",
                  }).format(new Date(venue.verifiedAt)),
                })
              : t("details.sourceLinked")}
          </p>
          <a
            href={venue.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-[#ff788a] underline-offset-4 hover:underline"
          >
            {venue.sourceLabel} <ExternalLink className="size-3.5" />
          </a>
        </div>

        <div className="rounded-2xl border border-white/9 bg-white/[0.035] p-4">
          <label
            htmlFor="roadbook-vehicle"
            className="text-xs font-semibold tracking-[0.1em] text-white/40 uppercase"
          >
            {t("vehicle.label")}
          </label>
          <select
            id="roadbook-vehicle"
            value={vehicleId ?? ""}
            onChange={(event) => onVehicleChange(event.target.value)}
            className="mt-3 min-h-11 w-full rounded-xl border border-white/12 bg-[#111713] px-3 text-sm text-white outline-none focus:border-[#e72d45]"
          >
            <option value="">{t("vehicle.choose")}</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.productionYear} {vehicle.make} {vehicle.model} ·{" "}
                {vehicle.platform}
              </option>
            ))}
          </select>
          <div className="mt-4 grid gap-2">
            {readiness.map((check) => (
              <div
                key={check.key}
                className="flex items-start gap-2 text-xs leading-5 text-white/48"
              >
                {check.state === "ready" ? (
                  <Check className="mt-0.5 size-3.5 shrink-0 text-[#6bd2ae]" />
                ) : (
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-300" />
                )}
                {t(`readiness.${check.key}.${check.state}`)}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-300/20 bg-red-300/8 p-3 text-xs leading-5 text-red-100"
          >
            {error}
          </p>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            disabled={!selectedVehicle || saveState === "working"}
            onClick={async () => {
              if (!selectedVehicle) return;
              setError("");
              setSaveState("working");
              try {
                await onSave(selectedVehicle.id);
                setSaveState("done");
              } catch (caught) {
                setSaveState("idle");
                explainError(caught);
              }
            }}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#e72d45] px-4 text-sm font-semibold text-white transition hover:bg-[#f13d54] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {saveState === "done" ? (
              <Check className="size-4" />
            ) : (
              <Save className="size-4" />
            )}
            {saveState === "done" ? t("actions.saved") : t("actions.save")}
          </button>
          {venue.bookingUrl ? (
            <a
              href={venue.bookingUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/12 px-4 text-sm font-semibold text-white/75 hover:bg-white/7 hover:text-white"
            >
              {t("actions.booking")} <ExternalLink className="size-4" />
            </a>
          ) : (
            <a
              href={venue.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/12 px-4 text-sm font-semibold text-white/75 hover:bg-white/7 hover:text-white"
            >
              {t("actions.checkSource")} <ExternalLink className="size-4" />
            </a>
          )}
        </div>

        <details className="rounded-2xl border border-white/9 bg-white/[0.025] p-4">
          <summary className="flex min-h-8 cursor-pointer list-none items-center gap-2 text-sm font-semibold [&::-webkit-details-marker]:hidden">
            <CalendarDays className="size-4 text-[#ff667a]" />{" "}
            {t("visit.title")}
          </summary>
          <div className="mt-4 grid gap-3">
            <label className="grid gap-1.5 text-xs text-white/48">
              {t("visit.date")}
              <input
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                value={visitDate}
                onChange={(event) => setVisitDate(event.target.value)}
                className="min-h-11 rounded-xl border border-white/12 bg-[#111713] px-3 text-sm text-white"
              />
            </label>
            <label className="grid gap-1.5 text-xs text-white/48">
              {t("visit.lap")}
              <input
                type="number"
                min="1"
                max="86400"
                step="0.001"
                value={bestLap}
                onChange={(event) => setBestLap(event.target.value)}
                placeholder={t("visit.lapPlaceholder")}
                className="min-h-11 rounded-xl border border-white/12 bg-[#111713] px-3 text-sm text-white placeholder:text-white/25"
              />
            </label>
            <label className="grid gap-1.5 text-xs text-white/48">
              {t("visit.notes")}
              <textarea
                value={visitNotes}
                onChange={(event) => setVisitNotes(event.target.value)}
                maxLength={2000}
                rows={3}
                className="rounded-xl border border-white/12 bg-[#111713] px-3 py-2 text-sm text-white"
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label
                htmlFor={photoInputId}
                className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/18 text-xs text-white/58 hover:bg-white/6"
              >
                <Camera className="size-4" />{" "}
                {photos.length
                  ? t("visit.photosChosen", { count: photos.length })
                  : t("visit.photos")}
              </label>
              <input
                id={photoInputId}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) =>
                  setPhotos(Array.from(event.target.files ?? []).slice(0, 4))
                }
              />
              <label
                htmlFor={obdInputId}
                className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/18 text-xs text-white/58 hover:bg-white/6"
              >
                <FileScan className="size-4" />{" "}
                {obdFile ? obdFile.name.slice(0, 18) : t("visit.obd")}
              </label>
              <input
                id={obdInputId}
                type="file"
                accept=".txt,.csv,.json,text/plain,text/csv,application/json"
                className="sr-only"
                onChange={(event) => setObdFile(event.target.files?.[0])}
              />
            </div>
            <p className="text-[11px] leading-5 text-white/34">
              {t("visit.evidenceNotice")}
            </p>
            <button
              type="button"
              disabled={!selectedVehicle || recordState === "working"}
              onClick={async () => {
                if (!selectedVehicle) return;
                if (photos.some((file) => file.size > 12 * 1024 * 1024)) {
                  setError(t("errors.photoTooLarge"));
                  return;
                }
                if (obdFile && obdFile.size > 1024 * 1024) {
                  setError(t("errors.obdTooLarge"));
                  return;
                }
                setError("");
                setRecordState("working");
                try {
                  await onRecord({
                    vehicle: selectedVehicle,
                    details: {
                      visitedAt: visitDate,
                      notes: visitNotes || undefined,
                      bestLapSeconds: bestLap ? Number(bestLap) : undefined,
                    },
                    photos,
                    obdFile,
                  });
                  setRecordState("done");
                } catch (caught) {
                  setRecordState("idle");
                  explainError(caught);
                }
              }}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#f1eadf] px-4 text-sm font-semibold text-[#102e30] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {recordState === "done" ? (
                <Check className="size-4" />
              ) : (
                <MapPin className="size-4" />
              )}
              {recordState === "done" ? t("visit.recorded") : t("visit.action")}
            </button>
          </div>
        </details>

        <details className="rounded-2xl border border-white/9 bg-white/[0.025] p-4">
          <summary className="flex min-h-8 cursor-pointer list-none items-center gap-2 text-sm font-semibold [&::-webkit-details-marker]:hidden">
            <AlertTriangle className="size-4 text-amber-300" />{" "}
            {t("report.title")}
          </summary>
          <div className="mt-4 grid gap-3">
            <textarea
              value={reportReason}
              onChange={(event) => setReportReason(event.target.value)}
              minLength={10}
              maxLength={1000}
              rows={3}
              placeholder={t("report.placeholder")}
              className="rounded-xl border border-white/12 bg-[#111713] px-3 py-2 text-sm text-white placeholder:text-white/25"
            />
            <input
              type="url"
              value={evidenceUrl}
              onChange={(event) => setEvidenceUrl(event.target.value)}
              placeholder={t("report.sourcePlaceholder")}
              className="min-h-11 rounded-xl border border-white/12 bg-[#111713] px-3 text-sm text-white placeholder:text-white/25"
            />
            <button
              type="button"
              disabled={
                reportReason.trim().length < 10 || reportState === "working"
              }
              onClick={async () => {
                setError("");
                setReportState("working");
                try {
                  await onReport({
                    reason: reportReason,
                    evidenceUrl: evidenceUrl || undefined,
                  });
                  setReportState("done");
                } catch (caught) {
                  setReportState("idle");
                  explainError(caught);
                }
              }}
              className="min-h-11 rounded-xl border border-white/12 text-xs font-semibold text-white/65 hover:bg-white/6 disabled:opacity-45"
            >
              {reportState === "done" ? t("report.sent") : t("report.action")}
            </button>
          </div>
        </details>
      </div>
    </aside>
  );
}

function SafetyNotice({ text }: { text: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/8 p-4 text-xs leading-5 text-amber-50/75">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-300" />
      {text}
    </div>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="min-h-23 rounded-xl border border-white/8 bg-white/[0.025] p-3">
      <Icon aria-hidden="true" className="size-3.5 text-white/35" />
      <p className="mt-3 text-[10px] tracking-[0.1em] text-white/28 uppercase">
        {label}
      </p>
      <p className="mt-1 text-xs leading-5 text-white/70">{value}</p>
    </div>
  );
}
''',
}

with zipfile.ZipFile("roadbook-feature.zip", "w", zipfile.ZIP_DEFLATED) as zip_file:
    for filename, content in files.items():
        zip_file.writestr(filename, content)

print("Created roadbook-feature.zip successfully.")