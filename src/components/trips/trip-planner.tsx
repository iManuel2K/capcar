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
  Mail,
  MapPin,
  MountainSnow,
  Route,
  Sparkles,
  Trees,
  Utensils,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState, useSyncExternalStore } from "react";

import {
  createStopMapLinks,
  type TripPlan,
  type TripStop,
} from "@/features/trips/trip-planner";

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
    <div className="relative overflow-hidden rounded-[1.45rem] bg-[#0e2d30] shadow-[0_24px_55px_rgba(14,45,48,.2)]">
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

export function TripPlanner() {
  const t = useTranslations("AIPlanner");
  const [vehicle, setVehicle] = useState("2011 BMW E90 318i");
  const [region, setRegion] = useState("Black Forest");
  const [prompt, setPrompt] = useState(
    "Plan me a long scenic weekend with my BMW in the Black Forest. I want great roads, quiet photo spots and sensible fuel stops.",
  );
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
  const [loading, setLoading] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [error, setError] = useState("");
  const [calendarMessage, setCalendarMessage] = useState("");

  function toggleInterest(value: (typeof interestOptions)[number]) {
    setInterests((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  async function createPlan() {
    if (!effectiveStartDate) return;
    setLoading(true);
    setError("");
    setCalendarMessage("");
    try {
      const response = await fetch("/api/ai/trips", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          prompt,
          vehicle,
          region,
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
    <main className="min-h-dvh overflow-hidden bg-[#e8e6d7] text-[#0e2d30]">
      <section className="relative border-b border-[#0e2d30]/10 px-5 pt-14 pb-12 sm:px-8 sm:pt-20 sm:pb-20">
        <div className="pointer-events-none absolute top-[-14rem] right-[-12rem] size-[34rem] rounded-full bg-[#ff766d]/12 blur-3xl" />
        <div className="relative mx-auto max-w-[1440px]">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold tracking-[0.16em] uppercase">
            <span className="rounded-full bg-[#6d0101] px-3 py-1.5 text-[#fff7ed]">
              {t("experimental")}
            </span>
            <span className="rounded-full border border-[#0e2d30]/15 px-3 py-1.5">
              {t("connected")}
            </span>
            <span className="rounded-full border border-[#0e2d30]/15 px-3 py-1.5">
              Google · Apple · OSM
            </span>
          </div>
          <div className="mt-9 grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold text-[#6d0101]">
                {t("eyebrow")}
              </p>
              <h1 className="mt-4 max-w-4xl text-5xl leading-[0.93] font-medium tracking-[-0.065em] sm:text-7xl lg:text-[6rem]">
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
                    className="flex items-center gap-2 rounded-2xl border border-[#0e2d30]/10 bg-white/30 px-3 py-3 text-xs text-[#405856]"
                  >
                    <Icon className="size-4 text-[#6d0101]" /> {label as string}
                  </div>
                ))}
              </div>
            </div>
            <div className="overflow-hidden rounded-[2rem] border border-[#0e2d30]/10 shadow-[0_35px_90px_rgba(14,45,48,.14)]">
              <AnimatedRouteDemo />
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8 sm:py-16">
        <div className="mx-auto grid max-w-[1440px] gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <aside className="h-fit rounded-[2rem] bg-[#0e2d30] p-6 text-[#f5f2e8] shadow-[0_30px_80px_rgba(14,45,48,0.2)] sm:p-8 xl:sticky xl:top-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.14em] text-[#f5f2e8]/45 uppercase">
                  {t("ask")}
                </p>
                <h2 className="mt-2 text-2xl font-medium">{t("formTitle")}</h2>
              </div>
              <Sparkles className="size-6 text-[#ff7d75]" />
            </div>

            <label className="mt-7 block text-xs text-[#f5f2e8]/55">
              Ask CapCar naturally
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                rows={4}
                className="mt-2 w-full resize-none rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm leading-6 text-white transition outline-none placeholder:text-white/25 focus:border-[#ff7d75]/60"
              />
            </label>

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
                {t("region")}
                <input
                  value={region}
                  onChange={(event) => setRegion(event.target.value)}
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
                  {t("connectionHint")}{" "}
                  <Link
                    href="/account/connections"
                    className="text-[#ff9b94] underline underline-offset-2"
                  >
                    {t("manageConnections")}
                  </Link>
                </span>
              </span>
            </label>

            <button
              type="button"
              disabled={
                loading ||
                vehicle.trim().length < 2 ||
                region.trim().length < 2 ||
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
            className="scroll-mt-5 rounded-[2rem] border border-[#0e2d30]/10 bg-[#f5f2e8] p-6 sm:p-8"
          >
            {plan ? (
              <div>
                <div className="flex flex-wrap items-start justify-between gap-5 border-b border-[#0e2d30]/12 pb-7">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.14em] text-[#6d0101] uppercase">
                      {plan.provider} ·{" "}
                      {plan.researchSources.length
                        ? "web-grounded"
                        : plan.source === "openai"
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

                <div className="mt-8 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.16em] text-[#6d0101] uppercase">
                      The drive
                    </p>
                    <h3 className="mt-1 text-2xl font-medium tracking-[-0.03em]">
                      Day by day
                    </h3>
                  </div>
                  <MapProviderLinks links={plan.mapLinks} compact />
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
                          <h3 className="text-lg font-medium">{day.title}</h3>
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
                    Fuel at the right moment, scenery with somewhere sensible to
                    stop, and photo locations you can inspect in your preferred
                    map before the drive.
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
                      {t("manageConnections")} <ArrowRight className="size-3" />
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

                <p className="mt-5 flex gap-2 rounded-xl bg-amber-200/45 p-4 text-xs leading-5 text-[#5b4516]">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  {plan.verificationNote}
                </p>
              </div>
            ) : (
              <div className="flex min-h-[850px] flex-col justify-between">
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
                      className="grid gap-4 rounded-2xl border border-[#0e2d30]/10 bg-white/35 p-5 sm:grid-cols-[auto_auto_1fr] sm:items-center"
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
    </main>
  );
}
