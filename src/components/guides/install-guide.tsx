"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  FileCheck2,
  FileWarning,
  ListChecks,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { useState, useSyncExternalStore } from "react";

import { findGuideBySlug } from "@/features/guides/guide-catalog";
import { problemsForVehicle } from "@/features/problems/problem-catalog";
import { dailyProblemsForVehicle } from "@/features/problems/daily-car-coverage";
import { evaluateGuideGovernance } from "@/features/guides/guide-governance";
import {
  announceGuideProgressChange,
  saveGuideProgress,
  type GuideProgress,
} from "@/features/guides/guide-progress";
import { useGuideProgress } from "@/features/guides/use-guide-progress";
import { useGuideReviews } from "@/features/guides/use-guide-reviews";
import { useVehicles } from "@/features/vehicles/use-vehicles";

export function InstallGuide({
  vehicleId,
  guideSlug,
}: {
  vehicleId: string;
  guideSlug: string;
}) {
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const { vehicles } = useVehicles();
  const allProgress = useGuideProgress();
  const reviews = useGuideReviews();
  const [stepIndex, setStepIndex] = useState(0);
  const vehicle = vehicles.find((candidate) => candidate.id === vehicleId);
  const guide = findGuideBySlug(guideSlug);
  const progress = allProgress.find(
    (record) =>
      record.vehicleId === vehicleId && record.guideSlug === guideSlug,
  );

  if (!hydrated)
    return (
      <div className="min-h-[720px] animate-pulse rounded-[2rem] bg-white/[0.04]" />
    );
  if (!vehicle || !guide)
    return (
      <div className="py-32 text-center text-white/45">
        Vehicle or guide not found.
      </div>
    );
  if (
    guide.purpose === "inspection" &&
    ![...problemsForVehicle(vehicle), ...dailyProblemsForVehicle(vehicle)].some(
      (problem) => `inspection-${problem.id}` === guide.slug,
    )
  )
    return (
      <div className="py-16">
        <p>
          This inspection checklist does not match the saved vehicle identity.
        </p>
        <Link
          className="mt-4 inline-flex min-h-11 items-center underline"
          href={`/garage/${vehicleId}/known-problems`}
        >
          View matching references
        </Link>
      </div>
    );

  const resolvedGuide = guide;
  const current = progress ?? {
    vehicleId,
    guideSlug,
    mode: "beginner" as const,
    safetyAccepted: false,
    completedSteps: [],
    updatedAt: new Date(0).toISOString(),
  };
  const step = resolvedGuide.steps[stepIndex];
  const completed = current.completedSteps.includes(step.id);
  const completion = Math.round(
    (current.completedSteps.length / resolvedGuide.steps.length) * 100,
  );
  const governance = evaluateGuideGovernance(resolvedGuide, reviews);
  const installationPlan = resolvedGuide.installationPlan;
  const planningCost = installationPlan
    ? new Intl.NumberFormat("en-IE", {
        style: "currency",
        currency: installationPlan.costRange.currency,
        maximumFractionDigits: 0,
      })
    : undefined;

  function persist(changes: Partial<GuideProgress>) {
    saveGuideProgress(
      {
        ...current,
        ...changes,
        vehicleId,
        guideSlug,
      },
      window.localStorage,
    );
    announceGuideProgressChange();
  }

  function completeStep() {
    const completedSteps = Array.from(
      new Set([...current.completedSteps, step.id]),
    );
    const isLast = completedSteps.length === resolvedGuide.steps.length;
    persist({
      completedSteps,
      completedAt: isLast
        ? (current.completedAt ?? new Date().toISOString())
        : current.completedAt,
    });
    if (!isLast)
      setStepIndex((index) =>
        Math.min(index + 1, resolvedGuide.steps.length - 1),
      );
  }

  return (
    <div className="pb-24 sm:pb-0">
      <Link
        href={
          guide.purpose === "inspection"
            ? `/garage/${vehicleId}/known-problems`
            : `/garage/${vehicleId}/parts/${guide.partId}`
        }
        className="mb-7 inline-flex items-center gap-2 text-sm text-white/45 hover:text-white"
      >
        <ArrowLeft className="size-4" />{" "}
        {guide.purpose === "inspection"
          ? "Known problems & inspection"
          : "Part details"}
      </Link>

      <header className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_85%_10%,rgba(231,45,69,0.18),transparent_28%),#111111] p-6 sm:p-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/20 bg-amber-300/8 px-3 py-1.5 text-[11px] text-amber-100/70 uppercase">
            <FileWarning className="size-3" />{" "}
            {guide.purpose === "inspection"
              ? "Sourced inspection checklist · not a repair procedure"
              : governance.label}
          </span>
          {current.completedAt && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-[11px] text-emerald-200">
              <CheckCircle2 className="size-3" /> COMPLETED
            </span>
          )}
        </div>
        <p className="mt-7 text-xs font-semibold tracking-[0.14em] text-[#ff667a] uppercase">
          {vehicle.productionYear} {vehicle.make} {vehicle.model}
        </p>
        <h1 className="mt-3 max-w-4xl text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
          {guide.title}
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-white/45">
          {guide.summary}
        </p>
        <div className="mt-7 flex flex-wrap gap-3 text-xs text-white/45">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2">
            <Clock3 className="size-3.5" /> {guide.estimatedMinutes} min
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2">
            <Wrench className="size-3.5" /> {guide.difficulty}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2">
            <ListChecks className="size-3.5" /> {completion}%
          </span>
          {installationPlan && planningCost && (
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2">
              {planningCost.format(installationPlan.costRange.min)}–
              {planningCost.format(installationPlan.costRange.max)} planning
              range
            </span>
          )}
        </div>
      </header>

      <section className="mt-5 grid gap-5 rounded-[2rem] border border-white/10 bg-[#111111] p-6 sm:grid-cols-[0.7fr_1.3fr] sm:p-8">
        <div>
          <p className="text-xs tracking-[0.14em] text-white/30 uppercase">
            Trust record
          </p>
          <h2 className="mt-2 text-2xl font-medium">
            Revision {resolvedGuide.revision}
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/40">
            Updated {resolvedGuide.updatedAt}. This guide cannot receive a
            verified label while its source requirements remain open.
          </p>
          <Link
            href={`/garage/${vehicleId}/guides/${guideSlug}/review`}
            className="mt-5 inline-flex min-h-11 items-center rounded-xl border border-white/10 px-4 text-sm text-white/60 hover:text-white"
          >
            Open review workspace
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {resolvedGuide.sources.map((source) => (
            <div
              key={source.label}
              className="rounded-2xl border border-white/8 bg-black/10 p-4"
            >
              <FileCheck2 className="size-4 text-white/25" />
              <p className="mt-3 text-sm leading-6 text-white/50">
                {source.label}
              </p>
              <p className="mt-2 text-[10px] tracking-[0.12em] text-white/25 uppercase">
                {source.kind}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">
        <aside className="space-y-5">
          <div className="rounded-[2rem] border border-white/10 bg-[#111111] p-6">
            <h2 className="flex items-center gap-2 font-medium">
              <Wrench className="size-4 text-[#ff667a]" /> Tools and preparation
            </h2>
            <ul className="mt-5 space-y-3">
              {guide.tools.map((tool) => (
                <li key={tool} className="flex gap-2 text-sm text-white/45">
                  <Check className="mt-0.5 size-4 shrink-0 text-white/25" />
                  {tool}
                </li>
              ))}
            </ul>
          </div>
          {installationPlan && (
            <div className="rounded-[2rem] border border-[#e72d45]/20 bg-[#e72d45]/[0.045] p-6">
              <p className="text-[10px] font-semibold tracking-[0.14em] text-[#ff667a] uppercase">
                Installation Guidance 2.0 · Beta coverage
              </p>
              <h2 className="mt-3 text-xl font-medium">
                {installationPlan.recommendedSetting}
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/50">
                {installationPlan.recommendation}
              </p>
              <p className="mt-4 text-xs leading-5 text-white/35">
                {installationPlan.costRange.note}
              </p>
              <PreparationList
                title="Confirm before starting"
                items={installationPlan.prerequisites}
              />
              <PreparationList
                title="Consumables"
                items={installationPlan.consumables}
              />
              <PreparationList
                title="Technical checks"
                items={installationPlan.technicalChecks}
              />
              <PreparationList
                title="Legal and disposal"
                items={installationPlan.legalChecks}
              />
            </div>
          )}
          <div className="rounded-[2rem] border border-amber-300/15 bg-amber-300/6 p-6">
            <h2 className="flex items-center gap-2 font-medium text-amber-100/80">
              <ShieldCheck className="size-4" /> Safety gate
            </h2>
            <ul className="mt-5 space-y-3">
              {guide.safetyChecks.map((check) => (
                <li key={check} className="text-sm leading-6 text-white/45">
                  {check}
                </li>
              ))}
            </ul>
            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/10 p-4 text-sm leading-6 text-white/60">
              <input
                type="checkbox"
                checked={current.safetyAccepted}
                onChange={(event) =>
                  persist({ safetyAccepted: event.target.checked })
                }
                className="mt-1 size-4 accent-[#e72d45]"
              />
              {guide.purpose === "inspection"
                ? "I have checked the stated vehicle and powertrain scope, read the safety limits and understand that this checklist does not diagnose or certify a repair."
                : "I have read these demo gates and will verify the authoritative procedure for my exact vehicle."}
            </label>
          </div>
        </aside>

        <article className="rounded-[2rem] border border-white/10 bg-[#111111] p-6 sm:p-9">
          <div className="flex items-center justify-between gap-5">
            <p className="text-xs tracking-[0.14em] text-white/30 uppercase">
              Step {stepIndex + 1} of {guide.steps.length}
            </p>
            <div className="flex rounded-xl border border-white/10 bg-black/10 p-1 text-xs">
              {(["beginner", "expert"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => persist({ mode })}
                  className={`rounded-lg px-3 py-2 capitalize ${current.mode === mode ? "bg-white/8 text-white" : "text-white/35"}`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-[#e72d45] transition-all"
              style={{
                width: `${((stepIndex + 1) / guide.steps.length) * 100}%`,
              }}
            />
          </div>
          <h2 className="mt-10 text-3xl font-medium tracking-[-0.035em] sm:text-5xl">
            {step.title}
          </h2>
          <p className="mt-6 text-lg leading-8 text-white/65">
            {step.instruction}
          </p>
          {current.mode === "beginner" && (
            <div className="mt-6 rounded-2xl border border-[#e72d45]/15 bg-[#e72d45]/7 p-5">
              <p className="text-xs font-semibold tracking-[0.12em] text-[#9ec2ff] uppercase">
                Beginner detail
              </p>
              <p className="mt-3 text-sm leading-6 text-white/55">
                {step.beginnerDetail}
              </p>
            </div>
          )}
          {step.warning && (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-300/15 bg-amber-300/6 p-5 text-sm leading-6 text-white/50">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-200" />
              {step.warning}
            </div>
          )}
          <div className="mt-8 rounded-2xl border border-white/10 p-5">
            <p className="text-xs tracking-[0.12em] text-white/30 uppercase">
              Confirmation
            </p>
            <p className="mt-3 text-sm leading-6 text-white/60">{step.check}</p>
          </div>
          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={stepIndex === 0}
              onClick={() => setStepIndex((index) => Math.max(0, index - 1))}
              className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-white/55 disabled:opacity-30"
            >
              <ChevronLeft className="size-4" /> Previous
            </button>
            {completed && stepIndex < guide.steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setStepIndex((index) => index + 1)}
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#e72d45] px-5 text-sm font-semibold text-[#07101d]"
              >
                Next step <ArrowRight className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!current.safetyAccepted || completed}
                onClick={completeStep}
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#e72d45] px-5 text-sm font-semibold text-[#07101d] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <Check className="size-4" />
                {stepIndex === guide.steps.length - 1
                  ? "Complete guide"
                  : "Confirm and continue"}
              </button>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}

function PreparationList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-5 border-t border-white/8 pt-4">
      <h3 className="text-xs font-semibold tracking-[0.1em] text-white/55 uppercase">
        {title}
      </h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-6 text-white/45">
            <Check className="mt-1 size-3.5 shrink-0 text-white/25" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
