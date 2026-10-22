"use client";

import Image from "next/image";
import Link from "next/link";
import { VideoModal } from "@/components/ui/video-modal";
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
  PackageSearch,
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
      <div className="text-muted-foreground py-32 text-center">
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
        className="text-muted-foreground hover:text-foreground mb-7 inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="size-4" />{" "}
        {guide.purpose === "inspection"
          ? "Known problems & inspection"
          : "All guides"}
      </Link>

      <header className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_85%_10%,rgba(184,199,217,0.18),transparent_28%),#111111] p-6 sm:p-10">
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
        <p className="text-primary mt-7 text-xs font-semibold tracking-[0.14em] uppercase">
          {vehicle.productionYear} {vehicle.make} {vehicle.model}
        </p>
        <h1 className="mt-3 max-w-4xl text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
          {guide.title}
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl leading-7">
          {guide.summary}
        </p>
        <div className="mt-5 flex flex-wrap gap-2" aria-label="Guide scope">
          {guide.applicability.map((item) => (
            <span
              key={item}
              className="text-muted-foreground rounded-full border border-white/10 bg-black/10 px-3 py-1.5 text-xs leading-5"
            >
              {item}
            </span>
          ))}
        </div>
        <div className="text-muted-foreground mt-7 flex flex-wrap gap-3 text-xs">
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

      <details className="group bg-card mt-5 rounded-2xl border border-white/10 p-5">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
          <span className="text-muted-foreground flex items-center gap-3 text-sm">
            <FileCheck2 className="text-primary size-4" /> Evidence & source
            record · revision {resolvedGuide.revision}
          </span>
          <ChevronDown className="text-muted-foreground size-4 transition group-open:rotate-180" />
        </summary>
        <div className="mt-5 grid gap-3 border-t border-white/8 pt-5 sm:grid-cols-2">
          {resolvedGuide.sources.map((source) => (
            <div
              key={source.label}
              className="rounded-xl border border-white/8 bg-black/10 p-4"
            >
              <p className="text-muted-foreground text-sm leading-6">
                {source.label}
              </p>
              <p className="text-muted-foreground mt-2 text-[10px] tracking-[0.12em] uppercase">
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
            className="text-muted-foreground hover:text-foreground inline-flex min-h-11 items-center text-sm"
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
                <li
                  key={check}
                  className="text-muted-foreground text-sm leading-6"
                >
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
                className="accent-primary mt-1 size-4"
              />
              {guide.purpose === "inspection"
                ? "I have checked the stated vehicle and powertrain scope, read the safety limits and understand that this checklist does not diagnose or certify a repair."
                : "I have read these demo gates and will verify the authoritative procedure for my exact vehicle."}
            </label>
          </div>
        </aside>

        <article className="bg-card rounded-[2rem] border border-white/10 p-6 sm:p-9">
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-5">
            <p className="text-muted-foreground text-xs tracking-[0.14em] uppercase">
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
                  className={`rounded-lg px-3 py-2 capitalize ${current.mode === mode ? "text-foreground bg-white/8" : "text-muted-foreground"}`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/8">
            <div
              className="bg-primary text-primary-foreground h-full rounded-full transition-all"
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
            <summary className="text-muted-foreground flex cursor-pointer list-none items-center justify-between gap-4 text-sm">
              <span>Need more detail?</span>
              <ChevronDown className="size-4 transition group-open:rotate-180" />
            </summary>
            <div className="mt-5 space-y-5 border-t border-white/8 pt-5">
              {current.mode === "beginner" && (
                <div>
                  <p className="text-primary text-xs font-semibold tracking-[0.12em] uppercase">
                    Beginner note
                  </p>
                  <p className="text-muted-foreground mt-2 text-sm leading-6">
                    {step.beginnerDetail}
                  </p>
                </div>
              )}
              {step.whyItMatters && (
                <div>
                  <p className="text-muted-foreground text-xs font-semibold tracking-[0.12em] uppercase">
                    Why this matters
                  </p>
                  <p className="text-muted-foreground mt-2 text-sm leading-6">
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
                        className="text-muted-foreground flex gap-2 text-sm leading-6"
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
                  <p className="text-muted-foreground text-xs font-semibold tracking-[0.12em] uppercase">
                    Save before continuing
                  </p>
                  <ul className="mt-2 space-y-2">
                    {step.recordAfterStep?.map((record) => (
                      <li
                        key={record}
                        className="text-muted-foreground flex gap-2 text-sm leading-6"
                      >
                        <FileCheck2 className="text-muted-foreground mt-1 size-3.5 shrink-0" />
                        <span>{record}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </details>
          {step.warning && (
            <div className="text-muted-foreground mt-5 flex items-start gap-3 rounded-2xl border border-amber-300/15 bg-amber-300/6 p-5 text-sm leading-6">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-200" />
              {step.warning}
            </div>
          )}
          <div className="mt-8 rounded-2xl border border-white/10 p-5">
            <p className="text-muted-foreground text-xs tracking-[0.12em] uppercase">
              Confirmation
            </p>
            <p className="mt-3 text-sm leading-6 text-white/60">{step.check}</p>
          </div>
          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={stepIndex === 0}
              onClick={() => setStepIndex((index) => Math.max(0, index - 1))}
              className="text-muted-foreground inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm disabled:opacity-30"
            >
              <ChevronLeft className="size-4" /> Previous
            </button>
            {completed && stepIndex < guide.steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setStepIndex((index) => index + 1)}
                className="bg-primary text-primary-foreground inline-flex min-h-12 items-center gap-2 rounded-xl px-5 text-sm font-semibold"
              >
                Next step <ArrowRight className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!current.safetyAccepted || completed}
                onClick={completeStep}
                className="bg-primary text-primary-foreground inline-flex min-h-12 items-center gap-2 rounded-xl px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-35"
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
      <details className="group bg-card rounded-[1.7rem] border border-white/10 p-5 sm:p-6">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
          <span className="flex items-center gap-3">
            <span className="bg-primary/12 text-primary grid size-11 place-items-center rounded-xl">
              <PlayCircle className="size-5" />
            </span>
            <span>
              <span className="block font-medium">Visual walkthrough</span>
              <span className="text-muted-foreground mt-1 block text-xs">
                Video or illustrated source, on demand
              </span>
            </span>
          </span>
          <ChevronDown className="text-muted-foreground size-4 transition group-open:rotate-180" />
        </summary>
        <div className="mt-5 border-t border-white/8 pt-5">
          {guide.video ? (
            <VideoModal
              title={guide.video.title}
              src={guide.video.embedUrl ?? guide.video.url}
            />
          ) : (
            <p className="text-muted-foreground text-sm">
              Video reference coming soon.
            </p>
          )}
          {guide.video && (
            <>
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{guide.video.title}</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {guide.video.source}
                  </p>
                </div>
                <a
                  href={guide.video.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground inline-flex min-h-10 shrink-0 items-center gap-2 text-xs"
                >
                  Open <ExternalLink className="size-3.5" />
                </a>
              </div>
              <p className="text-muted-foreground mt-4 rounded-xl border border-amber-300/10 bg-amber-300/5 p-3 text-xs leading-5">
                {guide.video.note}
              </p>
            </>
          )}
        </div>
      </details>

      {(guide.parts?.length || guide.specifications?.length) && (
        <details className="group bg-card rounded-[1.7rem] border border-white/10 p-5 sm:p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
            <span className="flex items-center gap-3">
              <span className="bg-primary/12 text-primary grid size-11 place-items-center rounded-xl">
                <PackageSearch className="size-5" />
              </span>
              <span>
                <span className="block font-medium">Parts & exact values</span>
                <span className="text-muted-foreground mt-1 block text-xs">
                  VIN-aware references before you order
                </span>
              </span>
            </span>
            <ChevronDown className="text-muted-foreground size-4 transition group-open:rotate-180" />
          </summary>
          <div className="mt-5 space-y-3 border-t border-white/8 pt-5">
            {guide.specifications?.map((item) => (
              <div
                key={`${item.label}-${item.value}`}
                className="rounded-xl border border-white/8 bg-black/15 p-4"
              >
                <p className="text-muted-foreground text-[10px] tracking-[0.12em] uppercase">
                  {item.label}
                </p>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  {item.value}
                </p>
                {item.sourceLabel && item.sourceUrl && (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:text-foreground mt-2 inline-flex items-center gap-1.5 text-xs"
                  >
                    {item.sourceLabel} <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
            ))}
            {guide.parts?.map((part) => (
              <div
                key={`${part.name}-${part.specification}`}
                className="rounded-xl border border-white/8 bg-black/15 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="text-sm font-medium text-white/70">
                    {part.name}
                  </p>
                  <span className="text-muted-foreground rounded-full border border-white/10 px-2.5 py-1 text-[10px]">
                    {part.partNumber ?? "VIN required"}
                  </span>
                </div>
                <p className="text-muted-foreground mt-2 text-xs leading-5">
                  {part.specification}
                </p>
                {part.note && (
                  <p className="mt-2 text-xs leading-5 text-amber-100/45">
                    {part.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </details>
      )}

      <details className="group bg-card rounded-[1.7rem] border border-white/10 p-5 sm:p-6">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
          <span className="flex items-center gap-3">
            <span className="bg-primary/12 text-primary grid size-11 place-items-center rounded-xl">
              <Wrench className="size-5" />
            </span>
            <span>
              <span className="block font-medium">Tools & materials</span>
              <span className="text-muted-foreground mt-1 block text-xs">
                {guide.tools.length} items with visual cards
              </span>
            </span>
          </span>
          <ChevronDown className="text-muted-foreground size-4 transition group-open:rotate-180" />
        </summary>
        <div className="mt-5 grid gap-3 border-t border-white/8 pt-5 sm:grid-cols-2">
          {guide.tools.map((tool) => (
            <ToolVisual key={tool} name={tool} />
          ))}
        </div>
      </details>

      <details className="group bg-card rounded-[1.7rem] border border-white/10 p-5 sm:p-6">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
          <span className="flex items-center gap-3">
            <span className="bg-primary/12 text-primary grid size-11 place-items-center rounded-xl">
              <Images className="size-5" />
            </span>
            <span>
              <span className="block font-medium">Reference photos</span>
              <span className="text-muted-foreground mt-1 block text-xs">
                Before and after reminders
              </span>
            </span>
          </span>
          <ChevronDown className="text-muted-foreground size-4 transition group-open:rotate-180" />
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
                {photo.illustrative && (
                  <span className="absolute top-3 left-3 rounded-full border border-white/15 bg-black/70 px-3 py-1 text-[10px] font-semibold tracking-[0.16em] text-white/70 uppercase backdrop-blur-md">
                    Illustrative
                  </span>
                )}
              </div>
              <figcaption className="text-muted-foreground p-4 text-xs leading-5">
                {photo.caption}
              </figcaption>
            </figure>
          ))}
          {!guide.photos?.length && (
            <p className="text-muted-foreground text-sm">
              Reference photos are being prepared for this guide.
            </p>
          )}
        </div>
      </details>

      <details className="group bg-card rounded-[1.7rem] border border-white/10 p-5 sm:p-6">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
          <span className="flex items-center gap-3">
            <span className="bg-primary/12 text-primary grid size-11 place-items-center rounded-xl">
              <ShieldCheck className="size-5" />
            </span>
            <span>
              <span className="block font-medium">Plan & safety detail</span>
              <span className="text-muted-foreground mt-1 block text-xs">
                Scope, stop points and record
              </span>
            </span>
          </span>
          <ChevronDown className="text-muted-foreground size-4 transition group-open:rotate-180" />
        </summary>
        {plan && (
          <div className="mt-5 border-t border-white/8 pt-5">
            <div className="border-primary/15 bg-primary/5 rounded-xl border p-4">
              <p className="text-sm font-medium">{plan.recommendedSetting}</p>
              <p className="text-muted-foreground mt-2 text-xs leading-5">
                {plan.recommendation}
              </p>
              {planningCost && (
                <p className="text-muted-foreground mt-3 text-xs">
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
        <span className="border-primary/20 bg-primary/12 text-primary relative grid size-14 place-items-center rounded-2xl border shadow-[0_12px_30px_rgba(184,199,217,0.12)]">
          <Icon className="size-7" strokeWidth={1.6} />
        </span>
      </div>
      <p className="text-muted-foreground p-3 text-xs leading-5">{name}</p>
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
      <h3 className="text-muted-foreground text-xs font-semibold tracking-[0.1em] uppercase">
        {title}
      </h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="text-muted-foreground flex gap-2 text-sm leading-6"
          >
            {tone === "warning" ? (
              <AlertTriangle className="mt-1 size-3.5 shrink-0 text-amber-200/60" />
            ) : (
              <Check className="text-muted-foreground mt-1 size-3.5 shrink-0" />
            )}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
