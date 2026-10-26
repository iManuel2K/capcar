"use client";

import {
  alignTripPlanWithRoute,
  preserveExplicitStopOrder,
} from "@/features/trips/trip-ordering";

import { TripNavigationLinks } from "@/components/trips/trip-navigation-links";

import { AIInput, AIResponse } from "@/components/ui/ai-conversation";
import { useVehicles } from "@/features/vehicles/use-vehicles";
import { trackAnalytics } from "@/features/analytics/client";

import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  Camera,
  CarFront,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ExternalLink,
  Fuel,
  ListTree,
  Mail,
  Map as MapIcon,
  MapPin,
  MountainSnow,
  Plus,
  Route,
  Sparkles,
  Trees,
  Utensils,
  X,
} from "lucide-react";
import { MotionLoader as LoaderCircle } from "@/components/ui/motion-loader";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  assessTripSchedule,
  extractTripDetails,
  suggestTripBrief,
} from "@/features/trips/trip-intelligence";

import { TripRouteMapLoader } from "@/components/trips/trip-route-map-loader";

import {
  createStopMapLinks,
  type TripPlan,
  type TripStop,
} from "@/features/trips/trip-planner";
import {
  createRoutedMapLinks,
  type TripRoute,
} from "@/features/trips/trip-route";

type PlannerConnectionStatus = {
  configured: boolean;
  connected: boolean;
  email?: string;
  lastSyncedAt?: string | null;
};

type AiPlannerConnectionStatus = {
  configured: boolean;
  connected: boolean;
  provider?: "gemini" | "openai" | "anthropic";
};

const interestOptions = [
  "roads",
  "food",
  "photography",
  "culture",
  "nature",
] as const;

const stopIcons = {
  scenic_road: Route,
  fuel: Fuel,
  photo: Camera,
  food: Utensils,
  culture: MapPin,
  nature: Trees,
  overnight: MountainSnow,
} satisfies Record<TripStop["kind"], typeof Route>;

function upcomingFriday() {
  const date = new Date();
  const untilFriday = (5 - date.getDay() + 7) % 7 || 7;
  date.setDate(date.getDate() + untilFriday);
  return date.toISOString().slice(0, 10);
}

function nextDate(date: string) {
  const value = new Date(`${date}T12:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + 1);
  return value.toISOString().slice(0, 10);
}

function MapProviderLinks({
  links,
  compact = false,
}: {
  links: TripPlan["mapLinks"];
  compact?: boolean;
}) {
  const providers = [
    { label: "Google Maps", href: links.google },
    { label: "Apple Maps", href: links.apple },
    { label: "Waze", href: links.waze },
    { label: "OpenStreetMap", href: links.openStreetMap },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {providers.map((provider) => (
        <a
          key={provider.label}
          href={provider.href}
          target="_blank"
          rel="noreferrer"
          className={`inline-flex items-center gap-1.5 rounded-full border transition ${
            compact
              ? "border-foreground/10 bg-card text-muted-foreground hover:border-primary/30 hover:text-primary px-2.5 py-1.5 text-[10px]"
              : "hover:text-foreground border-white/12 bg-white/7 px-3.5 py-2 text-xs text-white/70 hover:bg-white/12"
          }`}
        >
          {provider.label}
          <ExternalLink className="size-3" />
        </a>
      ))}
    </div>
  );
}

function AnimatedRouteDemo() {
  return (
    <div className="bg-card relative overflow-hidden rounded-[1.6rem] shadow-[0_30px_80px_rgba(184,199,217,.24)]">
      <Image
        src="/ai/capcar-route-demo.gif"
        alt="Animated CapCar map from Rüsselsheim through Mainz to the scenic Rheingau route"
        width={713}
        height={470}
        unoptimized
        priority
        className="h-auto w-full"
      />
    </div>
  );
}

function StopCard({ stop }: { stop: TripStop }) {
  const Icon = stopIcons[stop.kind];
  const links = createStopMapLinks(stop);
  return (
    <article className="group border-foreground/10 bg-card hover:bg-card rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(184,199,217,.08)]">
      <div className="flex gap-3">
        <span className="bg-card text-primary grid size-10 shrink-0 place-items-center rounded-xl">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-primary text-[10px] font-semibold tracking-[0.12em] uppercase">
                Day {stop.day} · {stop.kind.replace("_", " ")}
              </p>
              <h4 className="mt-1 font-medium tracking-[-0.02em]">
                {stop.name}
              </h4>
            </div>
            {stop.confidence === "grounded" && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-semibold text-emerald-900">
                <Check className="size-2.5" /> researched
              </span>
            )}
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            {stop.area} · {stop.timing}
          </p>
          <p className="text-muted-foreground mt-3 text-xs leading-5">
            {stop.reason}
          </p>
          <div className="mt-3">
            <MapProviderLinks links={links} compact />
          </div>
        </div>
      </div>
    </article>
  );
}

function RouteStopGallery({ route }: { route: TripRoute }) {
  return (
    <section className="mt-5 grid gap-3 md:grid-cols-2">
      {route.stops.map((stop, index) => (
        <article
          key={`${stop.name}-${stop.latitude}-${stop.longitude}`}
          className="border-foreground/10 bg-card overflow-hidden rounded-2xl border"
        >
          {stop.photo ? (
            <a
              href={stop.photo.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="group bg-card/8 relative block h-40 overflow-hidden"
            >
              {/* The image is useful location context and always retains Unsplash attribution. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={stop.photo.url}
                alt={stop.photo.alt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.025]"
              />
              <span className="absolute right-2 bottom-2 rounded-full bg-black/70 px-2 py-1 text-[9px] text-white/75 backdrop-blur">
                Representative · {stop.photo.photographer} / Unsplash
              </span>
            </a>
          ) : null}
          <div className="flex gap-3 p-4">
            <span className="bg-card text-foreground grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold">
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="text-primary text-[10px] font-semibold tracking-[0.12em] uppercase">
                Day {stop.day} · {stop.kind.replace("_", " ")}
              </p>
              <h4 className="mt-1 font-medium">{stop.name}</h4>
              <p className="text-muted-foreground mt-1 text-xs">
                {stop.mapQuery}
              </p>
              {stop.locationAccuracy === "area" && (
                <p className="mt-1 text-[10px] font-medium text-amber-800">
                  Approximate area · confirm the exact entrance before leaving
                </p>
              )}
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

export function TripPlanner({
  initialAiConnection,
  initialJournalTrip = false,
  initialVehicleId,
}: {
  initialAiConnection?: AiPlannerConnectionStatus;
  initialJournalTrip?: boolean;
  initialVehicleId?: string;
}) {
  const t = useTranslations("AIPlanner");
  const { vehicles } = useVehicles();
  const selectedVehicle = vehicles.find((item) => item.id === initialVehicleId);
  const [prompt, setPrompt] = useState("");
  const promptDetails = extractTripDetails(prompt);
  const [vehicleInput, setVehicle] = useState("");
  const vehicle =
    vehicleInput ||
    (selectedVehicle
      ? `${selectedVehicle.productionYear} ${selectedVehicle.make} ${selectedVehicle.model}`
      : initialVehicleId
        ? ""
        : promptDetails.vehicle || "2011 BMW E90 318i");
  const [places, setPlaces] = useState(
    initialJournalTrip
      ? [
          "Rüsselsheim am Main",
          "Schloss Biebrich, Wiesbaden",
          "Eltville am Rhein",
          "Niederwalddenkmal, Rüdesheim",
          "Rüsselsheim am Main",
        ]
      : ["", ""],
  );
  const inputMode =
    places.filter((place) => place.trim()).length >= 2 ? "places" : "prompt";
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [placeModalOpen, setPlaceModalOpen] = useState(false);
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const [startDate, setStartDate] = useState("");
  const promptBrief = hydrated
    ? suggestTripBrief(prompt, new Date().toLocaleDateString("en-CA"))
    : { duration: undefined, startDate: undefined };
  const effectiveStartDate =
    startDate || promptBrief.startDate || (hydrated ? upcomingFriday() : "");
  const [originInput, setOrigin] = useState("");
  const origin = originInput || promptDetails.origin || "";
  const [hoursInput, setHoursPerDay] = useState<number>();
  const hoursPerDay = hoursInput ?? promptDetails.hoursPerDay ?? 6;
  const style = "scenic";
  const [returnToStart, setReturnToStart] = useState(true);
  const [briefError, setBriefError] = useState(false);
  const [schedule, setSchedule] =
    useState<ReturnType<typeof assessTripSchedule>>();
  const [durationInput, setDuration] = useState<number>();
  const duration =
    durationInput ?? promptBrief.duration ?? (initialJournalTrip ? 1 : 3);
  const [pace, setPace] = useState<"scenic" | "balanced" | "driving">("scenic");
  const [interests, setInterests] = useState<
    Array<(typeof interestOptions)[number]>
  >(["roads", "photography", "nature"]);
  const [useConnectedContext, setUseConnectedContext] = useState(true);
  const [plan, setPlan] = useState<TripPlan>();
  const [planView, setPlanView] = useState<"map" | "details">("map");
  const [route, setRoute] = useState<TripRoute>();
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState("");
  const [connection, setConnection] = useState<PlannerConnectionStatus>();
  const [aiConnection, setAiConnection] = useState<
    AiPlannerConnectionStatus | undefined
  >(initialAiConnection);
  const planningSequence = useRef(0);
  const [loading, setLoading] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [error, setError] = useState("");
  const [calendarMessage, setCalendarMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/connections/google/status", {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) return undefined;
        return (await response.json()) as PlannerConnectionStatus;
      })
      .then((status) => {
        if (status) setConnection(status);
      })
      .catch(() => undefined);
    void fetch("/api/connections/ai", {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) return undefined;
        return (await response.json()) as AiPlannerConnectionStatus;
      })
      .then((status) => {
        if (status) setAiConnection(status);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!placeModalOpen) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setPlaceModalOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [placeModalOpen]);

  function toggleInterest(value: (typeof interestOptions)[number]) {
    setInterests((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  async function createPlan() {
    if (
      !effectiveStartDate ||
      loading ||
      vehicle.trim().length < 2 ||
      (aiConnection?.configured === true && !aiConnection.connected)
    )
      return;
    const selectedPlaces = places.map((place) => place.trim()).filter(Boolean);
    const effectivePrompt =
      inputMode === "prompt"
        ? prompt.trim()
        : `${prompt.trim()} Plan a scenic trip visiting these places in this order: ${selectedPlaces.join(" → ")}. Keep every named place in the route and include practical parking and safe regrouping stops.`.slice(
            0,
            600,
          );
    const planningRegion =
      inputMode === "prompt"
        ? prompt.trim().slice(0, 120)
        : selectedPlaces.join(", ").slice(0, 120);
    if (
      effectivePrompt.length < 2 ||
      (inputMode === "places" && selectedPlaces.length < 2)
    )
      return;
    if (inputMode === "prompt" && origin.trim().length < 2) {
      setSettingsOpen(true);
      setBriefError(true);
      window.setTimeout(
        () => document.getElementById("trip-origin")?.focus(),
        0,
      );
      return;
    }
    const sequence = ++planningSequence.current;
    setBriefError(false);
    setSchedule(undefined);
    setLoading(true);
    setError("");
    setCalendarMessage("");
    try {
      const response = await fetch("/api/ai/trips", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          prompt: effectivePrompt,
          inputMode,
          vehicle,
          region: planningRegion,
          startDate: effectiveStartDate,
          duration,
          pace,
          interests,
          useConnectedContext,
          ...(inputMode === "prompt"
            ? { origin: origin.trim(), hoursPerDay, style, returnToStart }
            : {}),
        }),
      });
      const body = (await response.json()) as TripPlan | { error?: string };
      if (!response.ok || !("days" in body))
        throw new Error(
          "error" in body && body.error ? body.error : t("errors.plan"),
        );
      trackAnalytics("trip_plan_created");
      setPlan(body);
      setPlanView("map");
      setRoute(undefined);
      setRouteError("");
      setRouteLoading(true);
      const generatedRegion = [
        ...new Set(body.stops.map((stop) => stop.area.trim()).filter(Boolean)),
      ]
        .join(", ")
        .slice(0, 120);
      void fetch("/api/ai/trips/route-map", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          region: generatedRegion || planningRegion,
          preserveStopOrder: preserveExplicitStopOrder(inputMode, prompt),
          startDate: effectiveStartDate,
          stops: body.stops.map(({ day, kind, name, area, mapQuery }) => ({
            day,
            kind,
            name,
            area,
            mapQuery,
          })),
        }),
      })
        .then(async (routeResponse) => {
          const routeBody = (await routeResponse.json()) as
            TripRoute | { error?: string };
          if (!routeResponse.ok || !("geometry" in routeBody))
            throw new Error(
              "error" in routeBody && routeBody.error
                ? routeBody.error
                : "The calculated route is unavailable.",
            );
          if (sequence !== planningSequence.current) return;
          setSchedule(
            inputMode === "prompt"
              ? assessTripSchedule({
                  drivingMinutes: routeBody.durationMinutes,
                  stopKinds: body.stops
                    .filter(
                      (stop) =>
                        !(
                          stop.mapQuery.toLowerCase() ===
                            origin.trim().toLowerCase() &&
                          ["Departure", "Return"].includes(stop.timing)
                        ),
                    )
                    .map((stop) => stop.kind),
                  days: body.days.length,
                  hoursPerDay,
                })
              : undefined,
          );
          setRoute(routeBody);
          setPlan((current) =>
            current === body
              ? alignTripPlanWithRoute(current, routeBody)
              : current,
          );
        })
        .catch(
          (routeFailure) =>
            sequence === planningSequence.current &&
            setRouteError(
              routeFailure instanceof Error
                ? routeFailure.message
                : "The calculated route is unavailable.",
            ),
        )
        .finally(() => {
          if (sequence === planningSequence.current) setRouteLoading(false);
        });
      window.setTimeout(() =>
        document.getElementById("capcar-plan")?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "instant"
            : "smooth",
          block: "start",
        }),
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("errors.plan"));
    } finally {
      setLoading(false);
    }
  }

  async function addToCalendar() {
    if (!plan) return;
    setCalendarLoading(true);
    setError("");
    setCalendarMessage("");
    try {
      const response = await fetch("/api/connections/google/calendar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          summary: plan.title,
          description: [
            plan.summary,
            "",
            ...plan.days.map(
              (day) =>
                `${day.title} (${day.distanceKm} km): ${day.routeIdea} Highlight: ${day.highlight}.`,
            ),
            "",
            `Route: ${route ? createRoutedMapLinks(route.stops).google : plan.mapLinks.google}`,
            plan.verificationNote,
          ].join("\n"),
          startDate: plan.days[0].date,
          endDate: nextDate(plan.days.at(-1)!.date),
        }),
      });
      const body = (await response.json()) as {
        error?: string;
        htmlLink?: string;
      };
      if (!response.ok) throw new Error(body.error || t("errors.calendar"));
      setCalendarMessage(t("calendarAdded"));
      if (body.htmlLink)
        window.open(body.htmlLink, "_blank", "noopener,noreferrer");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("errors.calendar"));
    } finally {
      setCalendarLoading(false);
    }
  }

  return (
    <main className="bg-background text-foreground min-h-dvh overflow-hidden">
      <section className="capcar-paper-grid border-foreground/10 relative border-b px-5 pt-14 pb-14 sm:px-8 sm:pt-20 sm:pb-24">
        <div className="bg-primary/16 pointer-events-none absolute top-[-14rem] right-[-12rem] size-[34rem] rounded-full blur-3xl" />
        <div className="relative mx-auto max-w-[1440px]">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold tracking-[0.16em] uppercase">
            <span className="bg-primary text-primary-foreground rounded-full px-3 py-1.5 shadow-[0_8px_20px_rgba(184,199,217,.12)]">
              {t("experimental")}
            </span>
            <span className="border-foreground/15 rounded-full border px-3 py-1.5">
              {t("connected")}
            </span>
            <span className="border-foreground/15 rounded-full border px-3 py-1.5">
              Google · Apple · OSM
            </span>
          </div>
          <div className="mt-10 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
            <div>
              <p className="text-primary text-sm font-semibold">
                {t("eyebrow")}
              </p>
              <h1 className="mt-4 max-w-3xl text-5xl leading-[0.95] font-medium tracking-[-0.06em] sm:text-7xl lg:text-[5.6rem]">
                {t("title")}
              </h1>
              <p className="text-muted-foreground mt-7 max-w-xl text-lg leading-8">
                {t("description")}
              </p>
              <div className="mt-7 grid max-w-xl gap-3 sm:grid-cols-3">
                {[
                  [Route, "Scenic routes"],
                  [Fuel, "Fuel strategy"],
                  [Camera, "Photo spots"],
                ].map(([Icon, label]) => (
                  <div
                    key={label as string}
                    className="border-foreground/10 bg-card text-muted-foreground flex items-center gap-2 rounded-2xl border px-3 py-3 text-xs font-medium shadow-[0_8px_25px_rgba(184,199,217,.045)]"
                  >
                    <Icon className="text-primary size-4" /> {label as string}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-background overflow-hidden rounded-[2rem] border border-white/55 p-2 shadow-[0_35px_90px_rgba(184,199,217,.16)] sm:p-3">
              <AnimatedRouteDemo />
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-[1440px] gap-7 xl:grid-cols-[0.88fr_1.12fr]">
          <aside className="capcar-editorial-grid bg-card text-foreground h-fit rounded-[2rem] border border-white/8 p-6 shadow-[0_30px_80px_rgba(184,199,217,0.18)] sm:p-8 xl:sticky xl:top-24">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-muted-foreground text-xs tracking-[0.14em] uppercase">
                  {t("ask")}
                </p>
                <h2 className="mt-2 text-2xl font-medium">{t("formTitle")}</h2>
              </div>
              <Sparkles className="text-primary size-6" />
            </div>

            <div className="mt-4">
              <AIInput
                allowEmpty={inputMode === "places"}
                value={prompt}
                onValueChange={setPrompt}
                maxLength={600}
                busy={loading}
                disabled={
                  !effectiveStartDate ||
                  vehicle.trim().length < 2 ||
                  (aiConnection?.configured === true && !aiConnection.connected)
                }
                onSubmit={() => void createPlan()}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setPlaceModalOpen(true)}
                className="border-foreground/15 min-h-12 rounded-xl border px-4 text-sm font-medium"
              >
                {t("simple.choosePlaces")}
              </button>
              <button
                type="button"
                aria-expanded={settingsOpen}
                aria-controls="trip-settings"
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="border-foreground/15 min-h-12 rounded-xl border px-4 text-sm font-medium"
              >
                {t("simple.settings")}
              </button>
            </div>
            {places.some((place) => place.trim()) && (
              <p className="mt-3 text-sm leading-6">
                {places.filter((place) => place.trim()).join(" → ")}
              </p>
            )}
            <div id="trip-settings" hidden={!settingsOpen}>
              {inputMode === "prompt" && (
                <fieldset className="mt-5 space-y-4">
                  <legend className="text-sm font-semibold">
                    {t("brief.title")}
                  </legend>
                  <p className="text-muted-foreground text-xs leading-5">
                    {t("brief.assumptions")}
                  </p>
                  <label className="block text-sm" htmlFor="trip-origin">
                    {t("brief.origin")}
                  </label>
                  <input
                    id="trip-origin"
                    value={origin}
                    onChange={(event) => {
                      setOrigin(event.target.value);
                      setBriefError(false);
                    }}
                    maxLength={120}
                    aria-invalid={briefError}
                    aria-describedby={
                      briefError ? "trip-origin-error" : undefined
                    }
                    className="bg-secondary text-foreground min-h-12 w-full rounded-xl border border-white/12 px-4 text-sm"
                  />
                  {briefError && (
                    <p
                      id="trip-origin-error"
                      role="alert"
                      className="text-destructive text-sm"
                    >
                      {t("brief.needOrigin")}
                    </p>
                  )}
                  <label className="block text-sm">
                    {t("brief.hours")}
                    <input
                      type="number"
                      min={1}
                      max={12}
                      step={0.5}
                      value={hoursPerDay}
                      onChange={(event) => {
                        const n = Number(event.target.value);
                        if (n >= 1 && n <= 12) setHoursPerDay(n);
                      }}
                      className="bg-secondary mt-2 min-h-12 w-full rounded-xl border border-white/12 px-4"
                    />
                  </label>
                  <label className="flex min-h-12 items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={returnToStart}
                      onChange={(event) =>
                        setReturnToStart(event.target.checked)
                      }
                    />
                    {t("brief.return")}
                  </label>
                </fieldset>
              )}
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-muted-foreground text-xs">
                  {t("vehicle")}
                  <input
                    value={vehicle}
                    onChange={(event) => setVehicle(event.target.value)}
                    className="text-foreground focus:border-primary/60 mt-2 min-h-12 w-full rounded-xl border border-white/12 bg-white/6 px-4 text-sm outline-none"
                  />
                </label>
                <label className="text-muted-foreground text-xs">
                  {t("startDate")}
                  <input
                    type="date"
                    value={effectiveStartDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    className="text-foreground mt-2 min-h-12 w-full rounded-xl border border-white/12 bg-white/6 px-4 text-sm [color-scheme:dark] outline-none"
                  />
                </label>
                <label className="text-muted-foreground text-xs">
                  {t("duration")}
                  <select
                    value={duration}
                    onChange={(event) =>
                      setDuration(Number(event.target.value))
                    }
                    className="bg-secondary text-foreground mt-2 min-h-12 w-full rounded-xl border border-white/12 px-4 text-sm outline-none"
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <option key={value} value={value}>
                        {t("days", { count: value })}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-muted-foreground text-xs sm:col-span-2">
                  {t("pace")}
                  <select
                    value={pace}
                    onChange={(event) =>
                      setPace(event.target.value as typeof pace)
                    }
                    className="bg-secondary text-foreground mt-2 min-h-12 w-full rounded-xl border border-white/12 px-4 text-sm outline-none"
                  >
                    <option value="scenic">{t("paces.scenic")}</option>
                    <option value="balanced">{t("paces.balanced")}</option>
                    <option value="driving">{t("paces.driving")}</option>
                  </select>
                </label>
              </div>

              <fieldset className="mt-5">
                <legend className="text-muted-foreground text-xs">
                  {t("interests")}
                </legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {interestOptions.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      aria-pressed={interests.includes(interest)}
                      onClick={() => toggleInterest(interest)}
                      className={`min-h-11 rounded-full border px-3 py-2 text-xs transition ${interests.includes(interest) ? "border-primary/55 bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground border-white/12"}`}
                    >
                      {t(`interest.${interest}`)}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="mt-6 flex cursor-pointer gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <input
                  type="checkbox"
                  checked={useConnectedContext}
                  onChange={(event) =>
                    setUseConnectedContext(event.target.checked)
                  }
                  className="accent-primary mt-1 size-4"
                />
                <span>
                  <span className="block text-sm font-medium">
                    {t("useConnections")}
                  </span>
                  <span className="text-muted-foreground mt-1 block text-xs leading-5">
                    {connection?.connected
                      ? `Connected as ${connection.email ?? "Google account"}. Calendar conflicts and travel-mail metadata can shape this plan.`
                      : t("connectionHint")}{" "}
                    <Link
                      href="/account/connections"
                      className="text-primary underline underline-offset-2"
                    >
                      {connection?.connected
                        ? t("manageConnections")
                        : "Connect Google"}
                    </Link>
                  </span>
                </span>
              </label>

              {aiConnection ? (
                <div
                  className={
                    aiConnection.connected
                      ? "mt-3 flex items-center justify-between gap-3 rounded-2xl border border-emerald-200/15 bg-emerald-200/6 p-4"
                      : "border-primary/20 bg-primary/8 mt-3 flex items-center justify-between gap-3 rounded-2xl border p-4"
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className="text-primary grid size-9 shrink-0 place-items-center rounded-full bg-white/8">
                      <Sparkles className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">
                        {aiConnection.connected
                          ? `${
                              aiConnection.provider === "gemini"
                                ? "Gemini"
                                : aiConnection.provider === "anthropic"
                                  ? "Claude"
                                  : "OpenAI"
                            } connected`
                          : "Connect your AI"}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs leading-5">
                        {aiConnection.connected
                          ? "This plan uses your own API credits."
                          : "Connect Gemini, OpenAI or Claude to generate routes with your own provider."}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/account/connections"
                    className="text-primary shrink-0 text-xs font-semibold underline underline-offset-2"
                  >
                    {aiConnection.connected ? "Manage" : "Connect"}
                  </Link>
                </div>
              ) : null}
            </div>
          </aside>

          <article
            id="capcar-plan"
            className="border-foreground/10 bg-background scroll-mt-24 rounded-[2rem] border p-6 shadow-[0_24px_70px_rgba(184,199,217,.07)] sm:p-8"
          >
            {schedule && (
              <div
                role="status"
                className={`mb-6 rounded-xl border p-4 ${schedule.fits ? "border-primary/30" : "border-destructive text-destructive"}`}
              >
                <p className="font-semibold">
                  {t(schedule.fits ? "brief.timeFits" : "brief.timeOver")}
                </p>
                <p className="mt-2 text-sm">
                  {t("brief.timeDetail", {
                    driving: schedule.drivingMinutes,
                    stops: schedule.visitMinutes,
                    breaks: schedule.breakMinutes,
                    total: schedule.totalMinutes,
                    available: schedule.availableMinutes,
                  })}
                </p>
                <p className="mt-2 text-xs">{t("brief.timeNote")}</p>
              </div>
            )}
            {plan ? (
              <div>
                <div className="border-foreground/12 flex flex-wrap items-start justify-between gap-5 border-b pb-7">
                  <div>
                    <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
                      {plan.provider} ·{" "}
                      {plan.researchSources.length
                        ? "web-grounded"
                        : ["gemini", "openai", "anthropic"].includes(
                              plan.source,
                            )
                          ? "AI composed"
                          : "planning draft"}
                    </p>
                    <h2 className="mt-3 text-3xl font-medium tracking-[-0.045em] sm:text-5xl">
                      {plan.title}
                    </h2>
                    <div className="text-muted-foreground mt-4 max-w-2xl">
                      <AIResponse text={plan.summary} />
                    </div>
                  </div>
                  {connection?.connected ? (
                    <button
                      type="button"
                      disabled={calendarLoading || schedule?.fits === false}
                      onClick={() => void addToCalendar()}
                      className="border-foreground/15 hover:bg-card hover:text-foreground inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition disabled:opacity-40"
                    >
                      {calendarLoading ? (
                        <LoaderCircle className="size-4" />
                      ) : (
                        <CalendarPlus className="size-4" />
                      )}
                      {t("addCalendar")}
                    </button>
                  ) : (
                    <Link
                      href="/account/connections"
                      className="border-foreground/15 hover:bg-card hover:text-foreground inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition"
                    >
                      <CalendarPlus className="size-4" /> Connect calendar
                    </Link>
                  )}
                </div>

                <div className="mt-6 grid grid-cols-3 gap-2">
                  {[
                    [Route, `${plan.distanceKm} km`, "estimated route"],
                    [Clock3, `${plan.drivingHours} h`, "behind the wheel"],
                    [MapPin, `${plan.stops.length}`, "curated stops"],
                  ].map(([Icon, value, label]) => (
                    <div
                      key={label as string}
                      className="bg-card/5 rounded-2xl p-4"
                    >
                      <Icon className="text-primary size-4" />
                      <strong className="mt-3 block text-xl font-medium">
                        {value as string}
                      </strong>
                      <span className="text-muted-foreground mt-1 block text-[10px] uppercase">
                        {label as string}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
                  <div
                    className="border-foreground/10 bg-card/5 inline-flex rounded-full border p-1"
                    role="tablist"
                    aria-label="Generated plan view"
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={planView === "map"}
                      onClick={() => setPlanView("map")}
                      className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-xs font-semibold transition ${planView === "map" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      <MapIcon className="size-4" /> Route map
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={planView === "details"}
                      onClick={() => setPlanView("details")}
                      className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-xs font-semibold transition ${planView === "details" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      <ListTree className="size-4" /> Detailed plan
                    </button>
                  </div>
                  {route && <TripNavigationLinks route={route} />}
                </div>

                {planView === "map" && (
                  <div className="mt-5" role="tabpanel">
                    {routeLoading && (
                      <div className="bg-card text-foreground grid min-h-[34rem] place-items-center rounded-[1.7rem]">
                        <div className="text-center">
                          <LoaderCircle className="mx-auto size-7" />
                          <p className="text-muted-foreground mt-3 text-sm">
                            Calculating the road between every stop…
                          </p>
                        </div>
                      </div>
                    )}
                    {route && <TripRouteMapLoader route={route} />}
                    {route && <RouteStopGallery route={route} />}
                    {routeError && !routeLoading && (
                      <div className="rounded-2xl border border-amber-800/15 bg-amber-100/55 p-5">
                        <p className="flex gap-2 text-sm text-amber-200">
                          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                          {routeError}
                        </p>
                        <button
                          type="button"
                          onClick={() => setPlanView("details")}
                          className="text-primary mt-3 text-xs font-semibold underline underline-offset-2"
                        >
                          Open the detailed plan
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {planView === "details" && (
                  <div role="tabpanel">
                    <div className="mt-8">
                      <div>
                        <p className="text-primary text-[10px] font-semibold tracking-[0.16em] uppercase">
                          The drive
                        </p>
                        <h3 className="mt-1 text-2xl font-medium tracking-[-0.03em]">
                          Day by day
                        </h3>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      {plan.days.map((day, index) => (
                        <section
                          key={day.date}
                          className="border-foreground/10 bg-card grid gap-4 rounded-2xl border p-5 md:grid-cols-[auto_1fr]"
                        >
                          <div className="bg-card text-foreground grid size-11 place-items-center rounded-full text-sm font-semibold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h3 className="text-lg font-medium">
                                {day.title}
                              </h3>
                              <span className="text-muted-foreground text-xs">
                                {day.date} · {day.distanceKm} km
                              </span>
                            </div>
                            <p className="text-muted-foreground mt-2 text-sm leading-6">
                              {day.routeIdea}
                            </p>
                            <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-1.5 text-[10px]">
                              {day.waypoints.map((waypoint, waypointIndex) => (
                                <span key={waypoint} className="contents">
                                  {waypointIndex > 0 && (
                                    <ChevronRight className="text-primary/55 size-3" />
                                  )}
                                  <span className="bg-card/5 rounded-full px-2.5 py-1.5">
                                    {waypoint}
                                  </span>
                                </span>
                              ))}
                            </div>
                            <div className="mt-4 grid gap-2 text-xs sm:grid-cols-3">
                              <p className="bg-card/5 rounded-xl p-3">
                                <strong className="text-foreground block">
                                  {t("drive")}
                                </strong>
                                <span className="text-muted-foreground mt-1 block">
                                  {day.drivingWindow}
                                </span>
                              </p>
                              <p className="bg-card/5 rounded-xl p-3">
                                <strong className="text-foreground block">
                                  {t("highlight")}
                                </strong>
                                <span className="text-muted-foreground mt-1 block">
                                  {day.highlight}
                                </span>
                              </p>
                              <p className="bg-card/5 rounded-xl p-3">
                                <strong className="text-foreground block">
                                  {t("evening")}
                                </strong>
                                <span className="text-muted-foreground mt-1 block">
                                  {day.evening}
                                </span>
                              </p>
                            </div>
                          </div>
                        </section>
                      ))}
                    </div>

                    <section className="mt-8">
                      <p className="text-primary text-[10px] font-semibold tracking-[0.16em] uppercase">
                        Route intelligence
                      </p>
                      <h3 className="mt-1 text-2xl font-medium tracking-[-0.03em]">
                        Stops worth making
                      </h3>
                      <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-6">
                        Fuel at the right moment, scenery with somewhere
                        sensible to stop, and photo locations you can inspect in
                        your preferred map before the drive.
                      </p>
                      <div className="mt-5 grid gap-3 lg:grid-cols-2">
                        {plan.stops.map((stop) => (
                          <StopCard
                            key={`${stop.day}-${stop.kind}-${stop.name}`}
                            stop={stop}
                          />
                        ))}
                      </div>
                    </section>

                    <div className="mt-8 grid gap-5 md:grid-cols-2">
                      <section className="bg-card text-foreground rounded-2xl p-5">
                        <h3 className="font-medium">{t("checklist")}</h3>
                        <ul className="mt-4 space-y-3">
                          {plan.checklist.map((item) => (
                            <li
                              key={item}
                              className="text-muted-foreground flex gap-2 text-xs leading-5"
                            >
                              <CheckCircle2 className="text-primary mt-0.5 size-3.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </section>
                      <section className="border-foreground/10 rounded-2xl border p-5">
                        <h3 className="font-medium">{t("connectedContext")}</h3>
                        {plan.contextNotes.length ? (
                          <ul className="mt-4 space-y-3">
                            {plan.contextNotes.map((note) => (
                              <li
                                key={note}
                                className="text-muted-foreground flex gap-2 text-xs leading-5"
                              >
                                <Sparkles className="text-primary mt-0.5 size-3.5 shrink-0" />
                                {note}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted-foreground mt-4 text-xs leading-5">
                            {t("noContext")}
                          </p>
                        )}
                        <Link
                          href="/account/connections"
                          className="text-primary mt-4 inline-flex items-center gap-1 text-xs font-semibold underline underline-offset-2"
                        >
                          {t("manageConnections")}{" "}
                          <ArrowRight className="size-3" />
                        </Link>
                      </section>
                    </div>

                    {plan.researchSources.length > 0 && (
                      <section className="border-foreground/10 bg-card mt-6 rounded-2xl border p-5">
                        <h3 className="text-sm font-medium">
                          Research used by CapCar AI
                        </h3>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {plan.researchSources.map((source) => (
                            <a
                              key={source.url}
                              href={source.url}
                              target="_blank"
                              rel="noreferrer"
                              className="border-foreground/10 bg-card text-muted-foreground hover:text-primary inline-flex max-w-full items-center gap-1 rounded-full border px-3 py-2 text-[10px]"
                            >
                              <span className="truncate">{source.label}</span>
                              <ExternalLink className="size-3 shrink-0" />
                            </a>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                )}

                <p className="mt-5 flex gap-2 rounded-xl bg-amber-300/10 p-4 text-xs leading-5 text-amber-200">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  {plan.verificationNote}
                </p>
              </div>
            ) : (
              <div className="flex min-h-[760px] flex-col justify-between">
                <div>
                  <p className="text-primary text-[10px] font-semibold tracking-[0.16em] uppercase">
                    How it flows
                  </p>
                  <h2 className="mt-3 max-w-xl text-4xl leading-[1.02] font-medium tracking-[-0.045em]">
                    From one sentence to a weekend that already feels real.
                  </h2>
                  <p className="text-muted-foreground mt-4 max-w-xl leading-7">
                    CapCar combines your car, pace and interests with planning
                    context you choose to connect.
                  </p>
                </div>
                <div className="my-10 space-y-3">
                  {[
                    [
                      "01",
                      CarFront,
                      "Understands the car",
                      "Keeps distance, road character and practical stops appropriate for what you drive.",
                    ],
                    [
                      "02",
                      Route,
                      "Composes the drive",
                      "Builds believable daily loops instead of a list of disconnected attractions.",
                    ],
                    [
                      "03",
                      Fuel,
                      "Finds the smart stops",
                      "Surfaces fuel, food, scenery and photo opportunities at useful moments.",
                    ],
                    [
                      "04",
                      CalendarDays,
                      "Fits your real life",
                      "Checks permission-based calendar and travel-mail signals, then saves the chosen plan.",
                    ],
                  ].map(([number, Icon, title, copy]) => (
                    <div
                      key={number as string}
                      className="border-foreground/10 bg-card grid gap-4 rounded-2xl border p-5 shadow-[0_10px_30px_rgba(184,199,217,.035)] sm:grid-cols-[auto_auto_1fr] sm:items-center"
                    >
                      <span className="text-primary text-xs font-semibold">
                        {number as string}
                      </span>
                      <span className="bg-card text-primary grid size-10 place-items-center rounded-xl">
                        <Icon className="size-4" />
                      </span>
                      <div>
                        <h3 className="font-medium">{title as string}</h3>
                        <p className="text-muted-foreground mt-1 text-xs leading-5">
                          {copy as string}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-card/5 rounded-[1.5rem] p-5">
                  <div className="flex items-start gap-3">
                    <span className="bg-primary text-primary-foreground grid size-9 shrink-0 place-items-center rounded-full">
                      <Mail className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">
                        Calendar & mail make the flow better.
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs leading-5">
                        Dates and booking signals help CapCar avoid conflicts.
                        You stay in control of every connection and calendar
                        write.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {calendarMessage && (
              <p className="mt-5 flex gap-2 rounded-xl bg-emerald-200/55 p-4 text-sm text-emerald-950">
                <CheckCircle2 className="size-4 shrink-0" />
                {calendarMessage}
              </p>
            )}
            {error && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-100 p-4 text-sm text-red-950">
                <span className="flex gap-2">
                  <AlertTriangle className="size-4 shrink-0" />
                  {error}
                </span>
                <Link
                  href="/account/connections"
                  className="inline-flex items-center gap-1 font-semibold underline"
                >
                  {t("manageConnections")} <ArrowRight className="size-3.5" />
                </Link>
              </div>
            )}
          </article>
        </div>
      </section>

      {placeModalOpen && (
        <div
          className="bg-background/78 fixed inset-0 z-[1000] grid place-items-center p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPlaceModalOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="place-picker-title"
            className="bg-background text-foreground max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-[1.75rem] p-5 shadow-[0_35px_100px_rgba(0,0,0,.4)] sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-primary text-[10px] font-semibold tracking-[0.14em] uppercase">
                  Route places
                </p>
                <h2
                  id="place-picker-title"
                  className="mt-2 text-2xl font-medium tracking-[-0.03em]"
                >
                  Choose the drive in order.
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close place picker"
                onClick={() => setPlaceModalOpen(false)}
                className="border-foreground/10 hover:bg-card hover:text-foreground grid size-10 place-items-center rounded-full border"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {places.map((place, index) => (
                <label
                  key={index}
                  className="border-foreground/10 bg-card grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border p-3"
                >
                  <span className="bg-card text-foreground grid size-8 place-items-center rounded-full text-xs font-semibold">
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="text-primary block text-[10px] font-semibold tracking-[0.1em] uppercase">
                      {index === 0
                        ? "Start"
                        : index === places.length - 1
                          ? "Destination"
                          : "Stop"}
                    </span>
                    <input
                      value={place}
                      maxLength={90}
                      autoFocus={index === 0 && !place}
                      onChange={(event) =>
                        setPlaces((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index ? event.target.value : item,
                          ),
                        )
                      }
                      placeholder="City, landmark or exact place"
                      className="placeholder:text-muted-foreground/45 mt-1 w-full bg-transparent text-sm outline-none"
                    />
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove place ${index + 1}`}
                    disabled={places.length <= 2}
                    onClick={() =>
                      setPlaces((current) =>
                        current.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                    className="text-muted-foreground hover:text-primary grid size-9 place-items-center rounded-full hover:bg-red-100 disabled:invisible"
                  >
                    <X className="size-4" />
                  </button>
                </label>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                disabled={places.length >= 6}
                onClick={() => setPlaces((current) => [...current, ""])}
                className="border-foreground/12 hover:bg-card inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-xs font-semibold disabled:opacity-40"
              >
                <Plus className="size-4" /> Add another stop
              </button>
              <button
                type="button"
                disabled={places.filter((place) => place.trim()).length < 2}
                onClick={() => setPlaceModalOpen(false)}
                className="bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground min-h-11 rounded-full px-5 text-xs font-semibold disabled:opacity-40"
              >
                Use these places
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
