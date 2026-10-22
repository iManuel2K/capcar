"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  CircleAlert,
  Database,
  Search,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/config";
import { problemSourceCopy } from "@/features/problems/problem-source-copy";
import { OfficialProblemRecords } from "./official-problem-records";

import {
  hasEngineSpecificCoverage,
  problemsForVehicle,
  type ProblemEvidence,
} from "@/features/problems/problem-catalog";
import { useVehicles } from "@/features/vehicles/use-vehicles";
import {
  dailyCarProblems,
  dailyProblemsForVehicle,
} from "@/features/problems/daily-car-coverage";

const evidenceLabels: Record<ProblemEvidence, string> = {
  "inspection-data": "Inspection data",
  "technical-bulletin": "Technical bulletin",
  "safety-recall": "Safety recall · verify VIN",
};

export function KnownProblemsDashboard({ vehicleId }: { vehicleId: string }) {
  const c = problemSourceCopy[useLocale() as AppLocale] ?? problemSourceCopy.en;
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const { vehicles } = useVehicles();
  const [system, setSystem] = useState("All");
  const vehicle = vehicles.find((candidate) => candidate.id === vehicleId);
  if (!hydrated)
    return (
      <div className="min-h-[620px] animate-pulse rounded-[2rem] bg-white/[0.04]" />
    );
  if (!vehicle)
    return (
      <div className="py-32 text-center text-white/75">Vehicle not found.</div>
    );

  const problems = [
    ...problemsForVehicle(vehicle),
    ...dailyProblemsForVehicle(vehicle),
  ];
  const systems = [
    "All",
    ...new Set(problems.map((problem) => problem.system)),
  ];
  const visible =
    system === "All"
      ? problems
      : problems.filter((problem) => problem.system === system);
  const engineUnknown = /UNKNOWN|UNCONFIRMED|NOT KNOWN/.test(
    vehicle.engineCode.toUpperCase(),
  );

  return (
    <div className="pb-24 sm:pb-0">
      <Link
        href={`/garage/${vehicleId}`}
        className="hover:text-foreground mb-7 inline-flex items-center gap-2 text-sm text-white/75"
      >
        <ArrowLeft className="size-4" /> Vehicle overview
      </Link>

      <header className="bg-card overflow-hidden rounded-[2rem] border border-white/10">
        <div className="grid gap-7 p-6 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-primary text-xs tracking-[0.14em] uppercase">
              Model watchlist · sourced
            </p>
            <h1 className="mt-3 text-4xl font-medium tracking-[-0.045em] sm:text-5xl">
              Know what to watch.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/75">
              Evidence matched to your {vehicle.productionYear} {vehicle.make}{" "}
              {vehicle.model}, {vehicle.platform} and confirmed engine details.
              This is inspection guidance—not a diagnosis or a prediction that
              your car will fail.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-4">
            <p className="text-xs text-white/70 uppercase">{c.local}</p>
            <p className="mt-1 text-3xl font-medium">{problems.length}</p>
          </div>
        </div>
      </header>
      <OfficialProblemRecords
        key={`${vehicle.make}:${vehicle.model}:${vehicle.platform}:${vehicle.productionYear}`}
        vehicle={vehicle}
      />
      <h2 className="mt-8 text-2xl font-medium">{c.local}</h2>
      <p className="mt-3 text-sm leading-7 text-white/75">{c.localNote}</p>

      {engineUnknown && hasEngineSpecificCoverage(vehicle.platform) && (
        <aside className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-300/15 bg-amber-300/6 p-5 text-sm leading-6 text-amber-50/70">
          <CircleAlert className="mt-0.5 size-4 shrink-0" /> Confirm the engine
          code from the vehicle documents or a verified VIN source to unlock
          engine-specific bulletins. CapCar has intentionally hidden uncertain
          matches.
        </aside>
      )}

      <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.34fr]">
        <div>
          {problems.length > 0 ? (
            <>
              <div
                className="mb-4 flex flex-wrap gap-2"
                aria-label="Filter by system"
              >
                {systems.map((candidate) => (
                  <button
                    key={candidate}
                    type="button"
                    onClick={() => setSystem(candidate)}
                    aria-pressed={system === candidate}
                    className={`rounded-xl border px-3.5 py-2 text-sm ${system === candidate ? "border-primary/45 bg-primary/12 text-primary" : "border-white/10 text-white/75"}`}
                  >
                    {candidate}
                  </button>
                ))}
              </div>
              <div className="space-y-4">
                {visible.map((problem) => {
                  const dailyProblem = dailyCarProblems.find(
                    (candidate) => candidate.id === problem.id,
                  );

                  return (
                    <article
                      key={problem.id}
                      className="bg-card rounded-[1.75rem] border border-white/10 p-6 sm:p-7"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full bg-white/6 px-2.5 py-1 text-white/75">
                              {problem.system}
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-300/8 px-2.5 py-1 text-emerald-100/65">
                              <BadgeCheck className="size-3" />{" "}
                              {evidenceLabels[problem.evidence]}
                            </span>
                          </div>
                          <h2 className="mt-4 text-2xl font-medium tracking-tight">
                            {problem.title}
                          </h2>
                          <p className="mt-2 text-sm text-white/75">
                            Applies to: {problem.applicability}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs ${problem.severity === "check-recall" ? "bg-amber-300/10 text-amber-100" : problem.severity === "service-soon" ? "bg-amber-300/10 text-amber-100/70" : "bg-primary/10 text-primary"}`}
                        >
                          {problem.severity === "check-recall"
                            ? "Check required · verify VIN"
                            : problem.severity === "service-soon"
                              ? "Inspect if symptoms appear"
                              : "Monitor"}
                        </span>
                      </div>
                      <div className="mt-6 grid gap-5 sm:grid-cols-2">
                        <div>
                          <p className="text-xs tracking-wider text-white/75 uppercase">
                            Possible symptoms
                          </p>
                          <ul className="mt-3 space-y-2 text-sm leading-6 text-white/75">
                            {problem.symptoms.map((symptom) => (
                              <li key={symptom} className="flex gap-2">
                                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-white/25" />
                                {symptom}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs tracking-wider text-white/75 uppercase">
                            Next check
                          </p>
                          <p className="mt-3 text-sm leading-6 text-white/75">
                            {problem.nextCheck}
                          </p>
                        </div>
                      </div>
                      <a
                        href={problem.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:text-primary mt-6 inline-flex items-center gap-2 text-sm"
                      >
                        {problem.sourceLabel}
                        <ArrowUpRight className="size-3.5" />
                      </a>
                      {dailyProblem?.requiresVariantConfirmation && (
                        <p className="mt-4 text-sm text-amber-200">
                          Candidate reference only: confirm the engine,
                          transmission, production details and equipment in the
                          stated scope before applying this record.
                        </p>
                      )}
                      {dailyProblem &&
                        dailyProblem.inspectionSteps.length > 0 && (
                          <Link
                            className="mt-4 flex min-h-11 items-center text-sm underline"
                            href={`/garage/${vehicleId}/guides/inspection-${problem.id}`}
                          >
                            Open native inspection checklist →
                          </Link>
                        )}
                      {dailyProblem?.reviewedAt && (
                        <p className="mt-2 text-xs text-white/60">
                          Source checked {dailyProblem.reviewedAt} · inspection
                          guidance, not a diagnosed fault
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="bg-card rounded-[2rem] border border-white/10 p-8 text-center">
              <Database className="mx-auto size-6 text-white/75" />
              <h2 className="mt-4 text-2xl font-medium">
                Coverage is being verified.
              </h2>
              <p className="mx-auto mt-3 max-w-lg leading-7 text-white/75">
                {c.localEmpty}
              </p>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="bg-card rounded-[1.75rem] border border-white/10 p-6">
            <ShieldCheck className="size-5 text-emerald-200" />
            <h2 className="mt-4 text-lg font-medium">Check safety recalls</h2>
            <p className="mt-3 text-sm leading-6 text-white/75">
              Search official recall records by make and model. Confirm whether
              your exact vehicle is affected with the manufacturer or an
              authorized workshop.
            </p>
            <a
              href="https://www.kba-online.de/rrdb/buerger/"
              target="_blank"
              rel="noreferrer"
              className="bg-card mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-black"
            >
              Open official recall search
              <ArrowUpRight className="size-3.5" />
            </a>
          </div>
          <div className="bg-card rounded-[1.75rem] border border-white/10 p-6">
            <Wrench className="text-primary size-5" />
            <h2 className="mt-4 text-lg font-medium">Act on evidence</h2>
            <div className="mt-4 grid gap-2">
              <Link
                href={`/garage/${vehicleId}/maintenance`}
                className="hover:text-foreground rounded-xl border border-white/10 px-4 py-3 text-sm text-white/75"
              >
                Open maintenance
              </Link>
              <Link
                href={`/garage/${vehicleId}/parts`}
                className="hover:text-foreground inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-white/75"
              >
                <Search className="size-3.5" /> Research parts after diagnosis
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
