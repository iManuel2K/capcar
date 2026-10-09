"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Images,
  PlayCircle,
  Search,
  Wrench,
} from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";

import {
  guideMatchesVehicle,
  installationGuides,
  type GuideCategory,
  type InstallationGuide,
} from "@/features/guides/guide-catalog";
import { evaluateGuideGovernance } from "@/features/guides/guide-governance";
import { useGuideProgress } from "@/features/guides/use-guide-progress";
import { useGuideReviews } from "@/features/guides/use-guide-reviews";
import { dailyProblemsForVehicle } from "@/features/problems/daily-car-coverage";
import { problemsForVehicle } from "@/features/problems/problem-catalog";
import { useVehicles } from "@/features/vehicles/use-vehicles";

const categories: Array<"All" | GuideCategory> = [
  "All",
  "Maintenance",
  "Engine",
  "Electrical",
  "Exterior",
  "Interior",
  "Diagnostics",
];

export function GuideLibrary({ vehicleId }: { vehicleId: string }) {
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const { vehicles } = useVehicles();
  const reviews = useGuideReviews();
  const progress = useGuideProgress();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const vehicle = vehicles.find((candidate) => candidate.id === vehicleId);

  const inspectionSlugs = useMemo(() => {
    if (!vehicle) return new Set<string>();
    return new Set(
      [...problemsForVehicle(vehicle), ...dailyProblemsForVehicle(vehicle)].map(
        (problem) => `inspection-${problem.id}`,
      ),
    );
  }, [vehicle]);

  if (!hydrated)
    return (
      <div className="min-h-[680px] animate-pulse rounded-[2rem] bg-white/[0.04]" />
    );
  if (!vehicle)
    return (
      <div className="py-32 text-center text-white/45">Vehicle not found.</div>
    );

  const matchingGuides = installationGuides.filter(
    (guide) =>
      guideMatchesVehicle(guide, vehicle) &&
      (guide.purpose !== "inspection" || inspectionSlugs.has(guide.slug)),
  );
  const workshopGuides = matchingGuides.filter(
    (guide) => guide.purpose !== "inspection",
  );
  const inspectionGuides = matchingGuides.filter(
    (guide) => guide.purpose === "inspection",
  );
  const normalizedQuery = query.trim().toLowerCase();
  const visibleGuides = workshopGuides.filter((guide) => {
    const matchesCategory = category === "All" || guide.category === category;
    const matchesQuery =
      !normalizedQuery ||
      `${guide.title} ${guide.summary} ${guide.tools.join(" ")}`
        .toLowerCase()
        .includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="pb-24 sm:pb-0">
      <Link
        href={`/garage/${vehicleId}`}
        className="mb-7 inline-flex items-center gap-2 text-sm text-white/45 hover:text-white"
      >
        <ArrowLeft className="size-4" /> Vehicle overview
      </Link>

      <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#101010] p-6 sm:p-10">
        <div className="absolute inset-y-0 right-0 hidden w-[44%] lg:block">
          <Image
            src={vehicle.imageUrl ?? "/capcar-bmw-current-side.webp"}
            alt=""
            fill
            sizes="44vw"
            className="[mask-image:linear-gradient(to_right,transparent,black_40%)] object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#101010_0%,transparent_70%)]" />
        </div>
        <div className="relative max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.15em] text-[#ff667a] uppercase">
            {vehicle.productionYear} {vehicle.make} {vehicle.model} ·{" "}
            {vehicle.engineCode}
          </p>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
            Pick a job. Know what comes next.
          </h1>
          <p className="mt-5 max-w-2xl leading-7 text-white/50">
            {workshopGuides.length} concise guides matched to this car. Open
            only the video, tools, photos or safety detail you need.
          </p>
          <div className="mt-7 flex flex-wrap gap-2 text-xs text-white/55">
            <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-2">
              {workshopGuides.length} guides
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-2">
              Progress saved locally
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-2">
              Vehicle-aware scope
            </span>
          </div>
        </div>
      </header>

      <section className="mt-5 rounded-[2rem] border border-white/10 bg-[#111111] p-5 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <label className="flex min-h-12 flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 xl:max-w-md">
            <Search className="size-4 text-white/30" />
            <span className="sr-only">Search guides</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search oil, lights, battery, tools…"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/25"
            />
          </label>
          <div
            className="flex gap-2 overflow-x-auto pb-1"
            aria-label="Guide categories"
          >
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`min-h-11 shrink-0 rounded-full border px-4 text-xs transition ${category === item ? "border-[#ff667a]/40 bg-[#e72d45] text-white" : "border-white/10 text-white/45 hover:border-white/20 hover:text-white"}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleGuides.map((guide, index) => {
          const record = progress.find(
            (item) =>
              item.vehicleId === vehicleId && item.guideSlug === guide.slug,
          );
          const completion = record
            ? Math.round(
                (record.completedSteps.length / guide.steps.length) * 100,
              )
            : 0;
          return (
            <GuideCard
              key={guide.slug}
              guide={guide}
              vehicleId={vehicleId}
              number={workshopGuides.indexOf(guide) + 1 || index + 1}
              completion={completion}
              status={evaluateGuideGovernance(guide, reviews).status}
            />
          );
        })}
      </section>

      {visibleGuides.length === 0 && (
        <div className="mt-5 rounded-[2rem] border border-white/10 bg-[#111111] px-6 py-16 text-center text-white/45">
          No guide matches that filter yet.
        </div>
      )}

      {inspectionGuides.length > 0 && (
        <details className="group mt-5 rounded-[2rem] border border-white/10 bg-[#111111] p-5 sm:p-7">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
            <span>
              <span className="block text-xs tracking-[0.14em] text-[#ff667a] uppercase">
                Known-problem checks
              </span>
              <span className="mt-2 block text-xl font-medium">
                {inspectionGuides.length} inspection checklists
              </span>
            </span>
            <ArrowRight className="size-5 text-white/35 transition group-open:rotate-90" />
          </summary>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {inspectionGuides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/garage/${vehicleId}/guides/${guide.slug}`}
                className="rounded-2xl border border-white/8 bg-black/15 p-5 transition hover:border-white/20"
              >
                <p className="text-sm font-medium">{guide.title}</p>
                <p className="mt-2 text-xs leading-5 text-white/35">
                  {guide.summary}
                </p>
              </Link>
            ))}
          </div>
        </details>
      )}

      <aside className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-300/15 bg-emerald-300/6 p-5 text-sm leading-6 text-white/45">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-200" />
        CapCar keeps the quick guide readable, while vehicle scope, source state
        and stop conditions stay one tap away. Completing a guide records your
        progress; it does not certify a repair.
      </aside>
    </div>
  );
}
function GuideCard({
  guide,
  vehicleId,
  number,
  completion,
  status,
}: {
  guide: InstallationGuide;
  vehicleId: string;
  number: number;
  completion: number;
  status: string;
}) {
  return (
    <Link
      href={`/garage/${vehicleId}/guides/${guide.slug}`}
      className="group flex min-h-72 flex-col rounded-[1.7rem] border border-white/10 bg-[#111111] p-5 transition hover:-translate-y-1 hover:border-[#ff667a]/35 hover:bg-[#141212]"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="grid size-11 place-items-center rounded-xl border border-[#ff667a]/15 bg-[#e72d45]/10 font-mono text-xs text-[#ff8898]">
          {String(number).padStart(2, "0")}
        </span>
        <span className="text-[10px] tracking-[0.13em] text-white/30 uppercase">
          {guide.category ?? "Guide"} · {status}
        </span>
      </div>
      <h2 className="mt-6 text-xl font-medium tracking-[-0.025em]">
        {guide.title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-white/40">{guide.summary}</p>
      <div className="mt-5 flex flex-wrap gap-2 text-[11px] text-white/40">
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="size-3" /> {guide.estimatedMinutes} min
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Wrench className="size-3" /> {guide.difficulty}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <PlayCircle className="size-3" /> Video
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Images className="size-3" /> Photos
        </span>
      </div>
      <div className="mt-auto pt-6">
        {completion > 0 && (
          <div className="mb-4">
            <div className="mb-2 flex justify-between text-[10px] text-white/30">
              <span>Progress</span>
              <span>{completion}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-[#ff667a]"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
        )}
        <span className="inline-flex items-center gap-2 text-sm text-white/55 group-hover:text-white">
          Open guide <ArrowRight className="size-4" />
        </span>
      </div>
    </Link>
  );
}
