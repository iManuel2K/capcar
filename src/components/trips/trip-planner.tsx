"use client";

import {
  AlertTriangle,
  ArrowRight,
  CalendarPlus,
  CarFront,
  CheckCircle2,
  LoaderCircle,
  Mail,
  Map,
  Route,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState, useSyncExternalStore } from "react";

import type { TripPlan } from "@/features/trips/trip-planner";

const interestOptions = [
  "roads",
  "food",
  "photography",
  "culture",
  "nature",
] as const;

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

export function TripPlanner() {
  const t = useTranslations("AIPlanner");
  const [vehicle, setVehicle] = useState("2011 BMW E90 318i");
  const [region, setRegion] = useState("Black Forest");
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
                `${day.title}: ${day.routeIdea} Highlight: ${day.highlight}.`,
            ),
            "",
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
    <main className="min-h-dvh bg-[#e8e6d7] text-[#0e2d30]">
      <section className="overflow-hidden border-b border-[#0e2d30]/12 px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.14em] uppercase">
            <span className="rounded-full bg-[#6d0101] px-3 py-1.5 text-[#fff7ed]">
              {t("experimental")}
            </span>
            <span className="rounded-full border border-[#0e2d30]/15 px-3 py-1.5">
              {t("connected")}
            </span>
          </div>
          <div className="mt-9 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold text-[#6d0101]">
                {t("eyebrow")}
              </p>
              <h1 className="mt-4 max-w-4xl text-5xl leading-[0.94] font-medium tracking-[-0.065em] sm:text-7xl lg:text-[6.4rem]">
                {t("title")}
              </h1>
            </div>
            <div className="lg:pb-2">
              <p className="max-w-2xl text-lg leading-8 text-[#405856]">
                {t("description")}
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-xs text-[#405856]">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#0e2d30]/12 bg-white/35 px-3 py-2">
                  <CarFront className="size-4" /> {t("vehicleContext")}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#0e2d30]/12 bg-white/35 px-3 py-2">
                  <Mail className="size-4" /> {t("calendarMail")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-8 sm:px-8 sm:py-12">
        <div className="mx-auto grid max-w-[1440px] gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <aside className="rounded-[2rem] bg-[#0e2d30] p-6 text-[#f5f2e8] shadow-[0_30px_80px_rgba(14,45,48,0.2)] sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.14em] text-[#f5f2e8]/45 uppercase">
                  {t("ask")}
                </p>
                <h2 className="mt-2 text-2xl font-medium">{t("formTitle")}</h2>
              </div>
              <Sparkles className="size-6 text-[#ff7d75]" />
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <label className="text-xs text-[#f5f2e8]/55 sm:col-span-2">
                {t("vehicle")}
                <input
                  value={vehicle}
                  onChange={(event) => setVehicle(event.target.value)}
                  className="mt-2 min-h-12 w-full rounded-xl border border-white/12 bg-white/6 px-4 text-sm text-white outline-none focus:border-[#ff7d75]/60"
                />
              </label>
              <label className="text-xs text-[#f5f2e8]/55 sm:col-span-2">
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
                    className={`rounded-full border px-3 py-2 text-xs transition ${
                      interests.includes(interest)
                        ? "border-[#ff7d75]/55 bg-[#6d0101] text-white"
                        : "border-white/12 text-white/55 hover:text-white"
                    }`}
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
                <Route className="size-4" />
              )}
              {t("create")}
            </button>
          </aside>

          <article className="rounded-[2rem] border border-[#0e2d30]/12 bg-[#f5f2e8] p-6 sm:p-8">
            {plan ? (
              <div>
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#0e2d30]/12 pb-6">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.14em] text-[#6d0101] uppercase">
                      {plan.provider} · {plan.source}
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

                <div className="mt-6 space-y-3">
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
                            {day.date}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-[#405856]">
                          {day.routeIdea}
                        </p>
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

                <div className="mt-6 grid gap-5 md:grid-cols-2">
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
                  </section>
                </div>
                <p className="mt-5 flex gap-2 rounded-xl bg-amber-200/45 p-4 text-xs leading-5 text-[#5b4516]">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  {plan.verificationNote}
                </p>
              </div>
            ) : (
              <div className="flex min-h-[720px] flex-col items-center justify-center text-center">
                <div className="grid size-16 place-items-center rounded-full bg-[#0e2d30]/7">
                  <Map className="size-7 text-[#6d0101]" />
                </div>
                <h2 className="mt-6 text-3xl font-medium tracking-[-0.04em]">
                  {t("emptyTitle")}
                </h2>
                <p className="mt-3 max-w-md leading-7 text-[#405856]">
                  {t("emptyDescription")}
                </p>
                <p className="mt-6 rounded-2xl border border-[#0e2d30]/10 bg-white/45 px-5 py-4 text-sm text-[#405856]">
                  “{t("samplePrompt")}”
                </p>
              </div>
            )}

            {calendarMessage && (
              <p className="mt-5 flex gap-2 rounded-xl bg-emerald-200/55 p-4 text-sm text-emerald-950">
                <CheckCircle2 className="size-4 shrink-0" /> {calendarMessage}
              </p>
            )}
            {error && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-100 p-4 text-sm text-red-950">
                <span className="flex gap-2">
                  <AlertTriangle className="size-4 shrink-0" /> {error}
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
