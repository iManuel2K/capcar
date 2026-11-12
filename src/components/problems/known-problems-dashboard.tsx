"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ArrowLeft, ArrowUpRight, CircleAlert } from "lucide-react";
import { useLocale } from "next-intl";
import { isAppLocale } from "@/i18n/config";
import { OfficialProblemRecords } from "./official-problem-records";
import { CommonCheckCards } from "./common-check-cards";
import { ModelProblemCards } from "./model-problem-cards";
import { modelProblemProfileForVehicle } from "@/features/problems/model-problem-profiles";
import { findProblemProfile } from "@/features/problems/source-profiles";
import { commonCheckCopy } from "@/features/problems/common-check-copy";
import {
  hasEngineSpecificCoverage,
  problemsForVehicle,
} from "@/features/problems/problem-catalog";
import { useVehicles } from "@/features/vehicles/use-vehicles";
import {
  dailyCarProblems,
  dailyProblemsForVehicle,
} from "@/features/problems/daily-car-coverage";

export function KnownProblemsDashboard({ vehicleId }: { vehicleId: string }) {
  const requestedLocale = useLocale();
  const locale = isAppLocale(requestedLocale) ? requestedLocale : "en";
  const c = commonCheckCopy[locale];
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const { vehicles } = useVehicles();
  const vehicle = vehicles.find((candidate) => candidate.id === vehicleId);
  if (!hydrated)
    return (
      <div className="min-h-[620px] animate-pulse rounded-3xl bg-white/5" />
    );
  if (!vehicle)
    return (
      <div className="text-muted-foreground py-32 text-center">{c.missing}</div>
    );
  const problems = [
    ...problemsForVehicle(vehicle),
    ...dailyProblemsForVehicle(vehicle),
  ];
  const profile = findProblemProfile(vehicle);
  const modelProfile = modelProblemProfileForVehicle(vehicle);
  const engineUnknown = /UNKNOWN|UNCONFIRMED|NOT KNOWN/.test(
    vehicle.engineCode.toUpperCase(),
  );

  return (
    <div className="mx-auto max-w-6xl pb-24">
      <Link
        href={`/garage/${vehicleId}`}
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex min-h-11 items-center gap-2 focus-visible:outline-2"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {c.overview}
      </Link>
      <header>
        <p className="text-primary">
          {vehicle.productionYear} {vehicle.make} {vehicle.model} ·{" "}
          {vehicle.platform}
        </p>
        <h1 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">
          {c.title}
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl text-base leading-7">
          {c.intro}
        </p>
      </header>
      <section
        className="mt-12 border-t border-white/15 pt-8"
        aria-labelledby="model-notes"
      >
        <h2 id="model-notes" className="text-2xl font-medium">
          {c.modelNotes}
        </h2>
        <p className="text-muted-foreground mt-3 max-w-3xl text-base leading-7">
          {c.modelNote}
        </p>
        {profile?.catalogSource && !modelProfile && (
          <a
            href={profile.catalogSource}
            target="_blank"
            rel="noreferrer"
            className="text-primary mt-3 inline-flex min-h-11 items-center gap-2 underline underline-offset-4 focus-visible:outline-2"
          >
            {c.source}: ADAC · {vehicle.make} {vehicle.model}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        )}
        {engineUnknown && hasEngineSpecificCoverage(vehicle.platform) && (
          <p className="text-muted-foreground mt-4 flex items-start gap-3 text-base leading-7">
            <CircleAlert
              className="text-primary mt-1 size-5 shrink-0"
              aria-hidden="true"
            />
            {c.engine}
          </p>
        )}
        <ModelProblemCards vehicle={vehicle} locale={locale} />
        {problems.length === 0 && !modelProfile ? (
          <p className="bg-card text-muted-foreground mt-5 rounded-xl p-5 text-base leading-7">
            {c.noModelNotes}
          </p>
        ) : problems.length > 0 ? (
          <>
            {locale !== "en" && (
              <p className="text-muted-foreground mt-3 text-sm">
                {c.researchLanguage}
              </p>
            )}
            <div className="mt-6 space-y-5">
              {problems.map((problem) => {
                const daily = dailyCarProblems.find(
                  (entry) => entry.id === problem.id,
                );
                return (
                  <article
                    key={problem.id}
                    className="bg-card rounded-2xl border border-white/15 p-5 sm:p-6"
                  >
                    <div className="text-primary flex flex-wrap gap-3 text-sm">
                      <span>{c.evidence[problem.evidence]}</span>
                      <span className="text-muted-foreground">
                        {problem.severity === "check-recall"
                          ? c.recall
                          : problem.severity === "service-soon"
                            ? c.inspect
                            : c.monitor}
                      </span>
                    </div>
                    <h3 lang="en" className="mt-3 text-2xl font-medium">
                      {problem.title}
                    </h3>
                    <p className="text-muted-foreground mt-3 text-base leading-7">
                      {c.applies}:{" "}
                      <span lang="en">{problem.applicability}</span>
                    </p>
                    <div className="mt-5 grid gap-5 md:grid-cols-2">
                      <div>
                        <h4 className="font-medium">{c.symptoms}</h4>
                        <ul
                          lang="en"
                          className="text-muted-foreground mt-2 list-disc space-y-2 pl-5 text-base leading-7"
                        >
                          {problem.symptoms.map((symptom) => (
                            <li key={symptom}>{symptom}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium">{c.nextCheck}</h4>
                        <p
                          lang="en"
                          className="text-muted-foreground mt-2 text-base leading-7"
                        >
                          {problem.nextCheck}
                        </p>
                      </div>
                    </div>
                    {daily?.requiresVariantConfirmation && (
                      <p className="mt-4 text-base leading-7 text-amber-100">
                        {c.variant}
                      </p>
                    )}
                    <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
                      {daily && daily.inspectionSteps.length > 0 && (
                        <Link
                          className="text-primary inline-flex min-h-11 items-center underline underline-offset-4 focus-visible:outline-2"
                          href={`/garage/${vehicleId}/guides/inspection-${problem.id}`}
                        >
                          {c.checklist}
                        </Link>
                      )}
                      <a
                        href={problem.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground inline-flex min-h-11 items-center gap-2 text-sm underline underline-offset-4 focus-visible:outline-2"
                      >
                        {c.source}: {problem.sourceLabel}
                        <ArrowUpRight className="size-4" aria-hidden="true" />
                      </a>
                    </div>
                    {daily?.reviewedAt && (
                      <p className="text-muted-foreground mt-2 text-sm">
                        {c.reviewed}: {daily.reviewedAt}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          </>
        ) : null}
      </section>
      <CommonCheckCards key={vehicle.id} vehicle={vehicle} locale={locale} />
      <OfficialProblemRecords
        key={`${vehicle.make}:${vehicle.model}:${vehicle.platform}:${vehicle.productionYear}`}
        vehicle={vehicle}
      />
      <nav className="mt-8 flex flex-wrap gap-3" aria-label={c.overview}>
        <Link
          href={`/garage/${vehicleId}/maintenance`}
          className="inline-flex min-h-11 items-center rounded-xl border border-white/20 px-4 py-2 focus-visible:outline-2"
        >
          {c.maintenance}
        </Link>
        <Link
          href={`/garage/${vehicleId}/parts`}
          className="inline-flex min-h-11 items-center rounded-xl border border-white/20 px-4 py-2 focus-visible:outline-2"
        >
          {c.parts}
        </Link>
      </nav>
    </div>
  );
}
