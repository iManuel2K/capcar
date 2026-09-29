"use client";

import {
  AlertTriangle,
  Crosshair,
  MapPinned,
  RefreshCw,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { RoadbookFilterBar } from "@/components/roadbook/roadbook-filter-bar";
import {
  RoadbookDiscoveryRail,
  type RoadbookDiscoveryPanel,
} from "@/components/roadbook/roadbook-discovery-rail";
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
import {
  readRoadbookMapStyle,
  writeRoadbookMapStyle,
} from "@/features/roadbook/roadbook-map-style";
import { ROADBOOK_DATA_TIMEOUT_MS } from "@/features/roadbook/roadbook-timeout";

const defaultCenter: RoadbookCenter = { latitude: 50.1, longitude: 10.4 };

export function RoadbookExperience() {
  const t = useTranslations("Roadbook");
  const { vehicles } = useVehicles();
  const [vehicleId, setVehicleId] = useState<string>();
  const [venues, setVenues] = useState<RoadbookVenue[]>([]);
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState<RoadbookEvent[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<RoadbookVenue>();
  const [categories, setCategories] = useState<RoadbookCategory[]>([]);
  const [mode, setMode] = useState<RoadbookMapMode>(() =>
    readRoadbookMapStyle(
      typeof window === "undefined" ? undefined : window.localStorage,
    ),
  );
  const [center, setCenter] = useState(defaultCenter);
  const [radiusKm, setRadiusKm] = useState(2500);
  const [userPosition, setUserPosition] = useState<RoadbookCenter>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mapError, setMapError] = useState("");
  const [mapReady, setMapReady] = useState(false);
  const [vectorReady, setVectorReady] = useState(false);
  const [discoveryPanel, setDiscoveryPanel] =
    useState<RoadbookDiscoveryPanel>();
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
    let timedOut = false;
    const timeout = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, ROADBOOK_DATA_TIMEOUT_MS);
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
      if (
        sequence === fetchSequence.current &&
        (timedOut || !controller.signal.aborted)
      )
        setError(t(timedOut ? "errors.slow" : "errors.load"));
    } finally {
      window.clearTimeout(timeout);
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
  const visibleVenues = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return term
      ? venues.filter((venue) =>
          [venue.name, venue.city, venue.countryCode, venue.description].some(
            (value) => value.toLocaleLowerCase().includes(term),
          ),
        )
      : venues;
  }, [search, venues]);
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

  const updateMode = useCallback((nextMode: RoadbookMapMode) => {
    setMode(nextMode);
    writeRoadbookMapStyle(nextMode, window.localStorage);
  }, []);

  const upcomingEventsLabel = useCallback(
    (count: number) => t("map.upcomingEvents", { count }),
    [t],
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
        venues={visibleVenues}
        events={events}
        selectedVenue={selectedVenue}
        mode={mode}
        center={center}
        userPosition={userPosition}
        mapLabel={t("map.label")}
        userLocationLabel={t("map.userLocation")}
        upcomingEventsLabel={upcomingEventsLabel}
        onSelect={setSelectedVenue}
        onViewportChange={updateViewport}
        onError={() => setMapError(t("errors.mapUnavailable"))}
        onReady={() => {
          setMapReady(true);
          setMapError("");
        }}
        onRendererChange={setVectorReady}
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
      <div className="absolute top-3 left-3 z-30 max-w-[min(38rem,calc(100%-1.5rem))] sm:top-5 sm:left-5">
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
          <label className="mt-3 flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 text-white/60">
            <Search className="size-4 shrink-0" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("search")}
              aria-label={t("search")}
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/45"
            />
          </label>
          <RoadbookDiscoveryRail
            venues={visibleVenues}
            events={events}
            open={discoveryPanel}
            onOpenChange={setDiscoveryPanel}
            onSelectVenue={(venue) => {
              setSelectedVenue(venue);
              setDiscoveryPanel(undefined);
            }}
          />
        </div>
      </div>

      <div className="absolute top-3 right-3 z-20 hidden justify-end gap-2 lg:flex">
        <RoadbookModerationQueue />
        <RoadbookPosterButton
          vehicle={selectedVehicle}
          visits={visits}
          label={t("poster.action")}
          emptyLabel={t("poster.empty")}
        />
      </div>

      <div
        className={`absolute bottom-[5.35rem] z-20 hidden lg:block ${
          selectedVenue
            ? "right-[28rem] left-5 w-auto translate-x-0"
            : "left-1/2 w-[min(64rem,calc(100%-8rem))] -translate-x-1/2"
        }`}
      >
        <RoadbookThemeSwitcher
          mode={mode}
          onChange={updateMode}
          label={t("modes.label")}
          labels={modeLabels}
          headline={t("modes.headline")}
          description={t("modes.description")}
          compatibility={!vectorReady}
          compatibilityLabel={t("fallback.styles")}
        />
      </div>

      <div className="absolute top-[17rem] right-3 left-3 z-20 lg:hidden">
        <RoadbookThemeSwitcher
          mode={mode}
          onChange={updateMode}
          label={t("modes.label")}
          labels={modeLabels}
          headline={t("modes.headline")}
          description={t("modes.description")}
          compatibility={!vectorReady}
          compatibilityLabel={t("fallback.styles")}
        />
      </div>

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
      </div>

      <div className="absolute top-[27rem] left-3 z-20 lg:top-[16.5rem] lg:left-5">
        <div className="rounded-xl border border-white/10 bg-[#09100d]/82 px-3 py-2 text-[11px] text-white/52 shadow-lg backdrop-blur-xl">
          {loading
            ? t("loading")
            : t("resultCount", { count: visibleVenues.length })}
        </div>
      </div>

      {(error || mapError) && (
        <div
          role="alert"
          className="absolute top-[21rem] right-3 left-3 z-40 flex items-center justify-between gap-3 rounded-xl border border-red-200/20 bg-[#2d1014]/94 p-3 text-xs text-red-50 shadow-xl sm:top-auto sm:right-auto sm:bottom-20 sm:left-5 sm:max-w-lg"
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

      {!loading && !error && visibleVenues.length === 0 && (
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
