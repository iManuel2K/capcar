"use client";

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
  LoaderCircle,
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
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState, useSyncExternalStore } from "react";

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
              ? "border-[#0e2d30]/10 bg-white/55 px-2.5 py-1.5 text-[10px] text-[#405856] hover:border-[#6d0101]/30 hover:text-[#6d0101]"
              : "border-white/12 bg-white/7 px-3.5 py-2 text-xs text-white/70 hover:bg-white/12 hover:text-white"
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
    <div className="relative overflow-hidden rounded-[1.6rem] bg-[#0e2d30] shadow-[0_30px_80px_rgba(14,45,48,.24)]">
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
    <article className="group rounded-2xl border border-[#0e2d30]/10 bg-white/50 p-4 transition hover:-translate-y-0.5 hover:bg-white/75 hover:shadow-[0_14px_35px_rgba(14,45,48,.08)]">
      <div className="flex gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#0e2d30] text-[#ff938c]">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.12em] text-[#6d0101] uppercase">
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
          <p className="mt-1 text-xs text-[#405856]">
            {stop.area} · {stop.timing}
          </p>
          <p className="mt-3 text-xs leading-5 text-[#405856]">{stop.reason}</p>
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
          className="overflow-hidden rounded-2xl border border-[#0e2d30]/10 bg-white/50"
        >
          {stop.photo ? (
            <a
              href={stop.photo.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="group relative block h-40 overflow-hidden bg-[#0e2d30]/8"
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
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#0e2d30] text-xs font-semibold text-white">
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.12em] text-[#6d0101] uppercase">
                Day {stop.day} · {stop.kind.replace("_", " ")}
              </p>
              <h4 className="mt-1 font-medium">{stop.name}</h4>
              <p className="mt-1 text-xs text-[#405856]">{stop.mapQuery}</p>
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
}: {
  initialAiConnection?: AiPlannerConnectionStatus;
}) {
  const t = useTranslations("AIPlanner");
  const [vehicle, setVehicle] = useState("2011 BMW E90 318i");
  const [inputMode, setInputMode] = useState<"prompt" | "places">("prompt");
  const [prompt, setPrompt] = useState(
    "Plan me a long scenic weekend with my BMW in the Black Forest. I want great roads, quiet photo spots and sensible fuel stops.",
  );
  const [places, setPlaces] = useState(["", ""]);
  const [placeModalOpen, setPlaceModalOpen] = useState(false);
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const [startDate, setStartDate] = useState("");
  const effectiveStartDate = startDate || (hydrated ? upcomingFriday() : "");
  const [duration, setDuration] = useState(3);
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
    if (!effectiveStartDate) return;
    const selectedPlaces = places.map((place) => place.trim()).filter(Boolean);
    const effectivePrompt =
      inputMode === "prompt"
        ? prompt.trim()
        : `Plan a scenic trip visiting these places in this order: ${selectedPlaces.join(" → ")}. Keep every named place in the route and include practical parking and safe regrouping stops.`.slice(
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
        }),
      });
      const body = (await response.json()) as TripPlan | { error?: string };
      if (!response.ok || !("days" in body))
        throw new Error(
          "error" in body && body.error ? body.error : t("errors.plan"),
        );
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
          setRoute(routeBody);
        })
        .catch((routeFailure) =>
          setRouteError(
            routeFailure instanceof Error
              ? routeFailure.message
              : "The calculated route is unavailable.",
          ),
        )
        .finally(() => setRouteLoading(false));
      window.setTimeout(() =>
        document
          .getElementById("capcar-plan")
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
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
            `Route: ${plan.mapLinks.google}`,
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
    <main className="min-h-dvh overflow-hidden bg-[#ebe9dc] text-[#0e2d30]">
      <section className="capcar-paper-grid relative border-b border-[#0e2d30]/10 px-5 pt-14 pb-14 sm:px-8 sm:pt-20 sm:pb-24">
        <div className="pointer-events-none absolute top-[-14rem] right-[-12rem] size-[34rem] rounded-full bg-[#92644d]/16 blur-3xl" />
        <div className="relative mx-auto max-w-[1440px]">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold tracking-[0.16em] uppercase">
            <span className="rounded-full bg-[#6d0101] px-3 py-1.5 text-[#fff7ed] shadow-[0_8px_20px_rgba(109,1,1,.12)]">
              {t("experimental")}
            </span>
            <span className="rounded-full border border-[#0e2d30]/15 px-3 py-1.5">
              {t("connected")}
            </span>
            <span className="rounded-full border border-[#0e2d30]/15 px-3 py-1.5">
              Google · Apple · OSM
            </span>
          </div>
          <div className="mt-10 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
            <div>
              <p className="text-sm font-semibold text-[#6d0101]">
                {t("eyebrow")}
              </p>
              <h1 className="mt-4 max-w-3xl text-5xl leading-[0.95] font-medium tracking-[-0.06em] sm:text-7xl lg:text-[5.6rem]">
                {t("title")}
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-[#405856]">
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
                    className="flex items-center gap-2 rounded-2xl border border-[#0e2d30]/10 bg-white/45 px-3 py-3 text-xs font-medium text-[#405856] shadow-[0_8px_25px_rgba(14,45,48,.045)]"
                  >
                    <Icon className="size-4 text-[#6d0101]" /> {label as string}
                  </div>
                ))}
              </div>
            </div>
            <div className="overflow-hidden rounded-[2rem] border border-white/55 bg-[#f5f2e8] p-2 shadow-[0_35px_90px_rgba(14,45,48,.16)] sm:p-3">
              <AnimatedRouteDemo />
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-[1440px] gap-7 xl:grid-cols-[0.88fr_1.12fr]">
          <aside className="capcar-editorial-grid h-fit rounded-[2rem] border border-white/8 bg-[#0e2d30] p-6 text-[#f5f2e8] shadow-[0_30px_80px_rgba(14,45,48,0.18)] sm:p-8 xl:sticky xl:top-24">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.14em] text-[#f5f2e8]/45 uppercase">
                  {t("ask")}
                </p>
                <h2 className="mt-2 text-2xl font-medium">{t("formTitle")}</h2>
              </div>
              <Sparkles className="size-6 text-[#ff7d75]" />
            </div>

            <div
              className="mt-7 grid grid-cols-2 rounded-2xl border border-white/10 bg-black/10 p-1"
              role="tablist"
              aria-label="Trip input method"
            >
              <button
                type="button"
                role="tab"
                aria-selected={inputMode === "prompt"}
                onClick={() => setInputMode("prompt")}
                className={`min-h-11 rounded-xl px-3 text-xs font-semibold transition ${inputMode === "prompt" ? "bg-white text-[#0e2d30] shadow-sm" : "text-white/55 hover:text-white"}`}
              >
                Describe with AI
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={inputMode === "places"}
                onClick={() => {
                  setInputMode("places");
                  setPlaceModalOpen(true);
                }}
                className={`min-h-11 rounded-xl px-3 text-xs font-semibold transition ${inputMode === "places" ? "bg-white text-[#0e2d30] shadow-sm" : "text-white/55 hover:text-white"}`}
              >
                Choose places
              </button>
            </div>

            {inputMode === "prompt" ? (
              <label className="mt-4 block text-xs text-[#f5f2e8]/55">
                Tell CapCar where you want to go
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  maxLength={600}
                  rows={5}
                  placeholder="I will visit Kosovo with two cars. Plan a route through Pristina and Pejë…"
                  className="mt-2 w-full resize-none rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm leading-6 text-white transition outline-none placeholder:text-white/25 focus:border-[#ff7d75]/60"
                />
                <span className="mt-2 block text-[10px] text-white/35">
                  Your message is the only destination source in this mode.
                </span>
              </label>
            ) : (
              <div className="mt-4 rounded-2xl border border-white/12 bg-white/6 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-white/45">Selected route</p>
                    <p className="mt-1 text-sm leading-6 text-white">
                      {places.filter((place) => place.trim()).join(" → ") ||
                        "No places selected"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPlaceModalOpen(true)}
                    className="shrink-0 rounded-full border border-[#ff7d75]/40 px-3 py-2 text-xs font-semibold text-[#ff9b94] transition hover:bg-[#ff766d] hover:text-[#260808]"
                  >
                    Edit places
                  </button>
                </div>
                <p className="mt-3 text-[10px] leading-4 text-white/35">
                  CapCar keeps these places in order and adds useful fuel,
                  scenery and photo stops around them.
                </p>
              </div>
            )}

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-xs text-[#f5f2e8]/55">
                {t("vehicle")}
                <input
                  value={vehicle}
                  onChange={(event) => setVehicle(event.target.value)}
                  className="mt-2 min-h-12 w-full rounded-xl border border-white/12 bg-white/6 px-4 text-sm text-white outline-none focus:border-[#ff7d75]/60"
                />
              </label>
              <label className="text-xs text-[#f5f2e8]/55">
                {t("startDate")}
                <input
                  type="date"
                  value={effectiveStartDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="mt-2 min-h-12 w-full rounded-xl border border-white/12 bg-white/6 px-4 text-sm text-white [color-scheme:dark] outline-none"
                />
              </label>
              <label className="text-xs text-[#f5f2e8]/55">
                {t("duration")}
                <select
                  value={duration}
                  onChange={(event) => setDuration(Number(event.target.value))}
                  className="mt-2 min-h-12 w-full rounded-xl border border-white/12 bg-[#173d40] px-4 text-sm text-white outline-none"
                >
                  {[2, 3, 4, 5].map((value) => (
                    <option key={value} value={value}>
                      {t("days", { count: value })}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-[#f5f2e8]/55 sm:col-span-2">
                {t("pace")}
                <select
                  value={pace}
                  onChange={(event) =>
                    setPace(event.target.value as typeof pace)
                  }
                  className="mt-2 min-h-12 w-full rounded-xl border border-white/12 bg-[#173d40] px-4 text-sm text-white outline-none"
                >
                  <option value="scenic">{t("paces.scenic")}</option>
                  <option value="balanced">{t("paces.balanced")}</option>
                  <option value="driving">{t("paces.driving")}</option>
                </select>
              </label>
            </div>

            <fieldset className="mt-5">
              <legend className="text-xs text-[#f5f2e8]/55">
                {t("interests")}
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {interestOptions.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    aria-pressed={interests.includes(interest)}
                    onClick={() => toggleInterest(interest)}
                    className={`rounded-full border px-3 py-2 text-xs transition ${interests.includes(interest) ? "border-[#ff7d75]/55 bg-[#6d0101] text-white" : "border-white/12 text-white/55 hover:text-white"}`}
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
                className="mt-1 size-4 accent-[#ff7d75]"
              />
              <span>
                <span className="block text-sm font-medium">
                  {t("useConnections")}
                </span>
                <span className="mt-1 block text-xs leading-5 text-white/40">
                  {connection?.connected
                    ? `Connected as ${connection.email ?? "Google account"}. Calendar conflicts and travel-mail metadata can shape this plan.`
                    : t("connectionHint")}{" "}
                  <Link
                    href="/account/connections"
                    className="text-[#ff9b94] underline underline-offset-2"
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
                    : "mt-3 flex items-center justify-between gap-3 rounded-2xl border border-[#ff7d75]/20 bg-[#ff7d75]/8 p-4"
                }
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/8 text-[#ff938c]">
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
                    <p className="mt-1 text-xs leading-5 text-white/40">
                      {aiConnection.connected
                        ? "This plan uses your own API credits."
                        : "Connect Gemini, OpenAI or Claude to generate routes with your own provider."}
                    </p>
                  </div>
                </div>
                <Link
                  href="/account/connections"
                  className="shrink-0 text-xs font-semibold text-[#ff9b94] underline underline-offset-2"
                >
                  {aiConnection.connected ? "Manage" : "Connect"}
                </Link>
              </div>
            ) : null}

            <button
              type="button"
              disabled={
                loading ||
                vehicle.trim().length < 2 ||
                (inputMode === "prompt"
                  ? prompt.trim().length < 2
                  : places.filter((place) => place.trim()).length < 2) ||
                (inputMode === "prompt" &&
                  aiConnection?.configured === true &&
                  !aiConnection.connected) ||
                !effectiveStartDate
              }
              onClick={() => void createPlan()}
              className="mt-5 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#ff766d] px-5 text-sm font-semibold text-[#260808] transition hover:bg-[#ff8f87] disabled:opacity-40"
            >
              {loading ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {loading ? "CapCar is composing your route…" : t("create")}
            </button>
          </aside>

          <article
            id="capcar-plan"
            className="scroll-mt-24 rounded-[2rem] border border-[#0e2d30]/10 bg-[#f5f2e8] p-6 shadow-[0_24px_70px_rgba(14,45,48,.07)] sm:p-8"
          >
            {plan ? (
              <div>
                <div className="flex flex-wrap items-start justify-between gap-5 border-b border-[#0e2d30]/12 pb-7">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.14em] text-[#6d0101] uppercase">
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
                    <p className="mt-4 max-w-2xl leading-7 text-[#405856]">
                      {plan.summary}
                    </p>
                  </div>
                  {connection?.connected ? (
                    <button
                      type="button"
                      disabled={calendarLoading}
                      onClick={() => void addToCalendar()}
                      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#0e2d30]/15 px-4 text-sm font-medium transition hover:bg-[#0e2d30] hover:text-[#f5f2e8] disabled:opacity-40"
                    >
                      {calendarLoading ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : (
                        <CalendarPlus className="size-4" />
                      )}
                      {t("addCalendar")}
                    </button>
                  ) : (
                    <Link
                      href="/account/connections"
                      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#0e2d30]/15 px-4 text-sm font-medium transition hover:bg-[#0e2d30] hover:text-[#f5f2e8]"
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
                      className="rounded-2xl bg-[#0e2d30]/5 p-4"
                    >
                      <Icon className="size-4 text-[#6d0101]" />
                      <strong className="mt-3 block text-xl font-medium">
                        {value as string}
                      </strong>
                      <span className="mt-1 block text-[10px] text-[#405856] uppercase">
                        {label as string}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
                  <div
                    className="inline-flex rounded-full border border-[#0e2d30]/10 bg-[#0e2d30]/5 p-1"
                    role="tablist"
                    aria-label="Generated plan view"
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={planView === "map"}
                      onClick={() => setPlanView("map")}
                      className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-xs font-semibold transition ${planView === "map" ? "bg-[#0e2d30] text-white shadow-sm" : "text-[#405856] hover:text-[#0e2d30]"}`}
                    >
                      <MapIcon className="size-4" /> Route map
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={planView === "details"}
                      onClick={() => setPlanView("details")}
                      className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-xs font-semibold transition ${planView === "details" ? "bg-[#0e2d30] text-white shadow-sm" : "text-[#405856] hover:text-[#0e2d30]"}`}
                    >
                      <ListTree className="size-4" /> Detailed plan
                    </button>
                  </div>
                  <MapProviderLinks
                    links={
                      route ? createRoutedMapLinks(route.stops) : plan.mapLinks
                    }
                    compact
                  />
                </div>

                {planView === "map" && (
                  <div className="mt-5" role="tabpanel">
                    {routeLoading && (
                      <div className="grid min-h-[34rem] place-items-center rounded-[1.7rem] bg-[#0e2d30] text-white">
                        <div className="text-center">
                          <LoaderCircle className="mx-auto size-7 animate-spin text-[#ff766d]" />
                          <p className="mt-3 text-sm text-white/55">
                            Calculating the road between every stop…
                          </p>
                        </div>
                      </div>
                    )}
                    {route && <TripRouteMapLoader route={route} />}
                    {route && <RouteStopGallery route={route} />}
                    {routeError && !routeLoading && (
                      <div className="rounded-2xl border border-amber-800/15 bg-amber-100/55 p-5">
                        <p className="flex gap-2 text-sm text-[#5b4516]">
                          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                          {routeError}
                        </p>
                        <button
                          type="button"
                          onClick={() => setPlanView("details")}
                          className="mt-3 text-xs font-semibold text-[#6d0101] underline underline-offset-2"
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
                        <p className="text-[10px] font-semibold tracking-[0.16em] text-[#6d0101] uppercase">
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
                          className="grid gap-4 rounded-2xl border border-[#0e2d30]/10 bg-white/38 p-5 md:grid-cols-[auto_1fr]"
                        >
                          <div className="grid size-11 place-items-center rounded-full bg-[#0e2d30] text-sm font-semibold text-[#f5f2e8]">
                            {index + 1}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h3 className="text-lg font-medium">
                                {day.title}
                              </h3>
                              <span className="text-xs text-[#405856]">
                                {day.date} · {day.distanceKm} km
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-[#405856]">
                              {day.routeIdea}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px] text-[#405856]">
                              {day.waypoints.map((waypoint, waypointIndex) => (
                                <span key={waypoint} className="contents">
                                  {waypointIndex > 0 && (
                                    <ChevronRight className="size-3 text-[#6d0101]/55" />
                                  )}
                                  <span className="rounded-full bg-[#0e2d30]/5 px-2.5 py-1.5">
                                    {waypoint}
                                  </span>
                                </span>
                              ))}
                            </div>
                            <div className="mt-4 grid gap-2 text-xs sm:grid-cols-3">
                              <p className="rounded-xl bg-[#0e2d30]/5 p-3">
                                <strong className="block text-[#0e2d30]">
                                  {t("drive")}
                                </strong>
                                <span className="mt-1 block text-[#405856]">
                                  {day.drivingWindow}
                                </span>
                              </p>
                              <p className="rounded-xl bg-[#0e2d30]/5 p-3">
                                <strong className="block text-[#0e2d30]">
                                  {t("highlight")}
                                </strong>
                                <span className="mt-1 block text-[#405856]">
                                  {day.highlight}
                                </span>
                              </p>
                              <p className="rounded-xl bg-[#0e2d30]/5 p-3">
                                <strong className="block text-[#0e2d30]">
                                  {t("evening")}
                                </strong>
                                <span className="mt-1 block text-[#405856]">
                                  {day.evening}
                                </span>
                              </p>
                            </div>
                          </div>
                        </section>
                      ))}
                    </div>

                    <section className="mt-8">
                      <p className="text-[10px] font-semibold tracking-[0.16em] text-[#6d0101] uppercase">
                        Route intelligence
                      </p>
                      <h3 className="mt-1 text-2xl font-medium tracking-[-0.03em]">
                        Stops worth making
                      </h3>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#405856]">
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
                      <section className="rounded-2xl bg-[#0e2d30] p-5 text-[#f5f2e8]">
                        <h3 className="font-medium">{t("checklist")}</h3>
                        <ul className="mt-4 space-y-3">
                          {plan.checklist.map((item) => (
                            <li
                              key={item}
                              className="flex gap-2 text-xs leading-5 text-white/55"
                            >
                              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-[#ff7d75]" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </section>
                      <section className="rounded-2xl border border-[#0e2d30]/10 p-5">
                        <h3 className="font-medium">{t("connectedContext")}</h3>
                        {plan.contextNotes.length ? (
                          <ul className="mt-4 space-y-3">
                            {plan.contextNotes.map((note) => (
                              <li
                                key={note}
                                className="flex gap-2 text-xs leading-5 text-[#405856]"
                              >
                                <Sparkles className="mt-0.5 size-3.5 shrink-0 text-[#6d0101]" />
                                {note}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-4 text-xs leading-5 text-[#405856]">
                            {t("noContext")}
                          </p>
                        )}
                        <Link
                          href="/account/connections"
                          className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#6d0101] underline underline-offset-2"
                        >
                          {t("manageConnections")}{" "}
                          <ArrowRight className="size-3" />
                        </Link>
                      </section>
                    </div>

                    {plan.researchSources.length > 0 && (
                      <section className="mt-6 rounded-2xl border border-[#0e2d30]/10 bg-white/30 p-5">
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
                              className="inline-flex max-w-full items-center gap-1 rounded-full border border-[#0e2d30]/10 bg-white/55 px-3 py-2 text-[10px] text-[#405856] hover:text-[#6d0101]"
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

                <p className="mt-5 flex gap-2 rounded-xl bg-amber-200/45 p-4 text-xs leading-5 text-[#5b4516]">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  {plan.verificationNote}
                </p>
              </div>
            ) : (
              <div className="flex min-h-[760px] flex-col justify-between">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.16em] text-[#6d0101] uppercase">
                    How it flows
                  </p>
                  <h2 className="mt-3 max-w-xl text-4xl leading-[1.02] font-medium tracking-[-0.045em]">
                    From one sentence to a weekend that already feels real.
                  </h2>
                  <p className="mt-4 max-w-xl leading-7 text-[#405856]">
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
                      className="grid gap-4 rounded-2xl border border-[#0e2d30]/10 bg-white/45 p-5 shadow-[0_10px_30px_rgba(14,45,48,.035)] sm:grid-cols-[auto_auto_1fr] sm:items-center"
                    >
                      <span className="text-xs font-semibold text-[#6d0101]">
                        {number as string}
                      </span>
                      <span className="grid size-10 place-items-center rounded-xl bg-[#0e2d30] text-[#ff938c]">
                        <Icon className="size-4" />
                      </span>
                      <div>
                        <h3 className="font-medium">{title as string}</h3>
                        <p className="mt-1 text-xs leading-5 text-[#405856]">
                          {copy as string}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-[1.5rem] bg-[#0e2d30]/5 p-5">
                  <div className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#6d0101] text-white">
                      <Mail className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">
                        Calendar & mail make the flow better.
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#405856]">
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
          className="fixed inset-0 z-[1000] grid place-items-center bg-[#07191b]/78 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPlaceModalOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="place-picker-title"
            className="max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-[1.75rem] bg-[#f5f2e8] p-5 text-[#0e2d30] shadow-[0_35px_100px_rgba(0,0,0,.4)] sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.14em] text-[#6d0101] uppercase">
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
                className="grid size-10 place-items-center rounded-full border border-[#0e2d30]/10 hover:bg-[#0e2d30] hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {places.map((place, index) => (
                <label
                  key={index}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border border-[#0e2d30]/10 bg-white/55 p-3"
                >
                  <span className="grid size-8 place-items-center rounded-full bg-[#0e2d30] text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-semibold tracking-[0.1em] text-[#6d0101] uppercase">
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
                      className="mt-1 w-full bg-transparent text-sm outline-none placeholder:text-[#405856]/45"
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
                    className="grid size-9 place-items-center rounded-full text-[#405856] hover:bg-red-100 hover:text-[#6d0101] disabled:invisible"
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
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#0e2d30]/12 px-4 text-xs font-semibold hover:bg-white disabled:opacity-40"
              >
                <Plus className="size-4" /> Add another stop
              </button>
              <button
                type="button"
                disabled={places.filter((place) => place.trim()).length < 2}
                onClick={() => setPlaceModalOpen(false)}
                className="min-h-11 rounded-full bg-[#ff766d] px-5 text-xs font-semibold text-[#260808] hover:bg-[#ff8f87] disabled:opacity-40"
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
