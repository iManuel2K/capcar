"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Clock3,
  Droplets,
  ExternalLink,
  FileCheck2,
  FileWarning,
  Gauge,
  Hand,
  Images,
  ListChecks,
  PlayCircle,
  Puzzle,
  ScanLine,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { useState, useSyncExternalStore } from "react";

import {
  findGuideBySlug,
  guideMatchesVehicle,
  type InstallationGuide,
} from "@/features/guides/guide-catalog";
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
  const locale = useLocale();
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
  if (guide.purpose !== "inspection" && !guideMatchesVehicle(guide, vehicle))
    return (
      <div className="py-16">
        <p>This guide does not match the saved vehicle identity.</p>
        <Link
          className="mt-4 inline-flex min-h-11 items-center underline"
          href={`/garage/${vehicleId}/guides`}
        >
          View guides for this car
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
    ? new Intl.NumberFormat(locale, {
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
            : `/garage/${vehicleId}/guides`
        }
        className="mb-7 inline-flex items-center gap-2 text-sm text-white/45 hover:text-white"
      >
        <ArrowLeft className="size-4" />{" "}
        {guide.purpose === "inspection"
          ? "Known problems & inspection"
          : "All guides"}
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
        <div className="mt-5 flex flex-wrap gap-2" aria-label="Guide scope">
          {guide.applicability.map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/10 bg-black/10 px-3 py-1.5 text-xs leading-5 text-white/45"
            >
              {item}
            </span>
          ))}
        </div>
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

      <GuideMediaHub guide={resolvedGuide} planningCost={planningCost} />

      <details className="group mt-5 rounded-2xl border border-white/10 bg-[#111111] p-5">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
          <span className="flex items-center gap-3 text-sm text-white/55">
            <FileCheck2 className="size-4 text-[#ff667a]" /> Evidence & source
            record · revision {resolvedGuide.revision}
          </span>
          <ChevronDown className="size-4 text-white/30 transition group-open:rotate-180" />
        </summary>
        <div className="mt-5 grid gap-3 border-t border-white/8 pt-5 sm:grid-cols-2">
          {resolvedGuide.sources.map((source) => (
            <div
              key={source.label}
              className="rounded-xl border border-white/8 bg-black/10 p-4"
            >
              <p className="text-sm leading-6 text-white/50">{source.label}</p>
              <p className="mt-2 text-[10px] tracking-[0.12em] text-white/25 uppercase">
                {source.kind}
              </p>
              {source.url && (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex min-h-10 items-center gap-2 text-xs text-white/60 underline decoration-white/25 underline-offset-4"
                >
                  Open source <ExternalLink className="size-3.5" />
                </a>
              )}
            </div>
          ))}
          <Link
            href={`/garage/${vehicleId}/guides/${guideSlug}/review`}
            className="inline-flex min-h-11 items-center text-sm text-white/55 hover:text-white"
          >
            Open review workspace <ArrowRight className="ml-2 size-4" />
          </Link>
        </div>
      </details>

      <section className="mt-5 grid gap-5 lg:grid-cols-[0.58fr_1.42fr]">
        <aside className="space-y-5">
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
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-5">
            <p className="text-xs tracking-[0.14em] text-white/30 uppercase">
              Step {stepIndex + 1} of {guide.steps.length}
              {step.estimatedMinutes
                ? ` · about ${step.estimatedMinutes} min`
                : ""}
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
          <details className="group mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm text-white/55">
              <span>Need more detail?</span>
              <ChevronDown className="size-4 transition group-open:rotate-180" />
            </summary>
            <div className="mt-5 space-y-5 border-t border-white/8 pt-5">
              {current.mode === "beginner" && (
                <div>
                  <p className="text-xs font-semibold tracking-[0.12em] text-[#ff8898] uppercase">
                    Beginner note
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/50">
                    {step.beginnerDetail}
                  </p>
                </div>
              )}
              {step.whyItMatters && (
                <div>
                  <p className="text-xs font-semibold tracking-[0.12em] text-white/35 uppercase">
                    Why this matters
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/50">
                    {step.whyItMatters}
                  </p>
                </div>
              )}
              {Boolean(step.mistakesToAvoid?.length) && (
                <div>
                  <p className="text-xs font-semibold tracking-[0.12em] text-amber-100/60 uppercase">
                    Avoid
                  </p>
                  <ul className="mt-2 space-y-2">
                    {step.mistakesToAvoid?.map((mistake) => (
                      <li
                        key={mistake}
                        className="flex gap-2 text-sm leading-6 text-white/45"
                      >
                        <AlertTriangle className="mt-1 size-3.5 shrink-0 text-amber-200/60" />
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {Boolean(step.recordAfterStep?.length) && (
                <div>
                  <p className="text-xs font-semibold tracking-[0.12em] text-white/35 uppercase">
                    Save before continuing
                  </p>
                  <ul className="mt-2 space-y-2">
                    {step.recordAfterStep?.map((record) => (
                      <li
                        key={record}
                        className="flex gap-2 text-sm leading-6 text-white/45"
                      >
                        <FileCheck2 className="mt-1 size-3.5 shrink-0 text-white/30" />
                        <span>{record}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </details>
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

function GuideMediaHub({
  guide,
  planningCost,
}: {
  guide: InstallationGuide;
  planningCost?: Intl.NumberFormat;
}) {
  const plan = guide.installationPlan;

  return (
    <section
      className="mt-5 grid gap-4 lg:grid-cols-2"
      aria-label="Optional guide media and preparation"
    >
      <details className="group rounded-[1.7rem] border border-white/10 bg-[#111111] p-5 sm:p-6">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
          <span className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-[#e72d45]/12 text-[#ff667a]">
              <PlayCircle className="size-5" />
            </span>
            <span>
              <span className="block font-medium">Video walkthrough</span>
              <span className="mt-1 block text-xs text-white/35">
                Watch only when you need it
              </span>
            </span>
          </span>
          <ChevronDown className="size-4 text-white/30 transition group-open:rotate-180" />
        </summary>
        <div className="mt-5 border-t border-white/8 pt-5">
          {guide.video?.embedUrl ? (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
              <iframe
                src={guide.video.embedUrl}
                title={guide.video.title}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="aspect-video w-full"
              />
            </div>
          ) : guide.video?.url ? (
            <a
              href={guide.video.url}
              target="_blank"
              rel="noreferrer"
              className="group/video flex aspect-video items-center justify-center rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_center,rgba(231,45,69,0.22),transparent_52%),#090909]"
            >
              <span className="grid size-16 place-items-center rounded-full bg-[#e72d45] text-white transition group-hover/video:scale-105">
                <PlayCircle className="size-7" />
              </span>
            </a>
          ) : (
            <p className="text-sm text-white/35">
              Video reference coming soon.
            </p>
          )}
          {guide.video && (
            <>
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{guide.video.title}</p>
                  <p className="mt-1 text-xs text-white/35">
                    {guide.video.source}
                  </p>
                </div>
                <a
                  href={guide.video.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-10 shrink-0 items-center gap-2 text-xs text-white/55 hover:text-white"
                >
                  Open <ExternalLink className="size-3.5" />
                </a>
              </div>
              <p className="mt-4 rounded-xl border border-amber-300/10 bg-amber-300/5 p-3 text-xs leading-5 text-white/35">
                {guide.video.note}
              </p>
            </>
          )}
        </div>
      </details>

      <details className="group rounded-[1.7rem] border border-white/10 bg-[#111111] p-5 sm:p-6">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
          <span className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-[#e72d45]/12 text-[#ff667a]">
              <Wrench className="size-5" />
            </span>
            <span>
              <span className="block font-medium">Tools & materials</span>
              <span className="mt-1 block text-xs text-white/35">
                {guide.tools.length} items with visual cards
              </span>
            </span>
          </span>
          <ChevronDown className="size-4 text-white/30 transition group-open:rotate-180" />
        </summary>
        <div className="mt-5 grid gap-3 border-t border-white/8 pt-5 sm:grid-cols-2">
          {guide.tools.map((tool) => (
            <ToolVisual key={tool} name={tool} />
          ))}
        </div>
      </details>

      <details className="group rounded-[1.7rem] border border-white/10 bg-[#111111] p-5 sm:p-6">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
          <span className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-[#e72d45]/12 text-[#ff667a]">
              <Images className="size-5" />
            </span>
            <span>
              <span className="block font-medium">Reference photos</span>
              <span className="mt-1 block text-xs text-white/35">
                Before and after reminders
              </span>
            </span>
          </span>
          <ChevronDown className="size-4 text-white/30 transition group-open:rotate-180" />
        </summary>
        <div className="mt-5 grid gap-3 border-t border-white/8 pt-5 sm:grid-cols-2">
          {(guide.photos ?? []).map((photo) => (
            <figure
              key={`${photo.src}-${photo.caption}`}
              className="overflow-hidden rounded-2xl border border-white/10 bg-black/15"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="p-4 text-xs leading-5 text-white/40">
                {photo.caption}
              </figcaption>
            </figure>
          ))}
          {!guide.photos?.length && (
            <p className="text-sm text-white/35">
              Reference photos are being prepared for this guide.
            </p>
          )}
        </div>
      </details>

      <details className="group rounded-[1.7rem] border border-white/10 bg-[#111111] p-5 sm:p-6">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
          <span className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-[#e72d45]/12 text-[#ff667a]">
              <ShieldCheck className="size-5" />
            </span>
            <span>
              <span className="block font-medium">Plan & safety detail</span>
              <span className="mt-1 block text-xs text-white/35">
                Scope, stop points and record
              </span>
            </span>
          </span>
          <ChevronDown className="size-4 text-white/30 transition group-open:rotate-180" />
        </summary>
        {plan && (
          <div className="mt-5 border-t border-white/8 pt-5">
            <div className="rounded-xl border border-[#e72d45]/15 bg-[#e72d45]/5 p-4">
              <p className="text-sm font-medium">{plan.recommendedSetting}</p>
              <p className="mt-2 text-xs leading-5 text-white/40">
                {plan.recommendation}
              </p>
              {planningCost && (
                <p className="mt-3 text-xs text-white/30">
                  {planningCost.format(plan.costRange.min)}–
                  {planningCost.format(plan.costRange.max)} planning range
                </p>
              )}
            </div>
            <PreparationList title="Confirm first" items={plan.prerequisites} />
            <PreparationList title="Work area" items={plan.workAreaChecks} />
            <PreparationList
              title="Technical checks"
              items={plan.technicalChecks}
            />
            <PreparationList
              title="Stop when"
              items={plan.stopConditions}
              tone="warning"
            />
            <PreparationList title="Save after" items={plan.completionRecord} />
          </div>
        )}
      </details>
    </section>
  );
}

function ToolVisual({ name }: { name: string }) {
  const lower = name.toLowerCase();
  const Icon =
    lower.includes("scan") || lower.includes("obd")
      ? ScanLine
      : lower.includes("gauge") ||
          lower.includes("pressure") ||
          lower.includes("tester")
        ? Gauge
        : lower.includes("fluid") ||
            lower.includes("oil") ||
            lower.includes("funnel")
          ? Droplets
          : lower.includes("glove") ||
              lower.includes("towel") ||
              lower.includes("cloth")
            ? Hand
            : lower.includes("clip") ||
                lower.includes("tape") ||
                lower.includes("trim")
              ? Puzzle
              : lower.includes("light") ||
                  lower.includes("camera") ||
                  lower.includes("mirror")
                ? Images
                : lower.includes("multimeter") || lower.includes("voltage")
                  ? Activity
                  : Wrench;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/8 bg-black/15">
      <div className="relative grid h-24 place-items-center overflow-hidden bg-[linear-gradient(135deg,rgba(255,255,255,0.055),transparent_55%)]">
        <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:20px_20px] opacity-25" />
        <span className="relative grid size-14 place-items-center rounded-2xl border border-[#ff667a]/20 bg-[#e72d45]/12 text-[#ff8898] shadow-[0_12px_30px_rgba(231,45,69,0.12)]">
          <Icon className="size-7" strokeWidth={1.6} />
        </span>
      </div>
      <p className="p-3 text-xs leading-5 text-white/55">{name}</p>
    </div>
  );
}

function PreparationList({
  title,
  items,
  tone = "default",
}: {
  title: string;
  items: string[];
  tone?: "default" | "warning";
}) {
  return (
    <div className="mt-5 border-t border-white/8 pt-4">
      <h3 className="text-xs font-semibold tracking-[0.1em] text-white/55 uppercase">
        {title}
      </h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-6 text-white/45">
            {tone === "warning" ? (
              <AlertTriangle className="mt-1 size-3.5 shrink-0 text-amber-200/60" />
            ) : (
              <Check className="mt-1 size-3.5 shrink-0 text-white/25" />
            )}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
