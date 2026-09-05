"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  FileWarning,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { useSyncExternalStore } from "react";

import { installationGuides } from "@/features/guides/guide-catalog";
import { evaluateGuideGovernance } from "@/features/guides/guide-governance";
import { useGuideReviews } from "@/features/guides/use-guide-reviews";
import { evaluateFitment } from "@/features/parts/fitment";
import { findCatalogPart } from "@/features/parts/part-catalog";
import { useVehicles } from "@/features/vehicles/use-vehicles";

export function GuideLibrary({ vehicleId }: { vehicleId: string }) {
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const { vehicles } = useVehicles();
  const reviews = useGuideReviews();
  const vehicle = vehicles.find((candidate) => candidate.id === vehicleId);

  if (!hydrated)
    return (
      <div className="min-h-[680px] animate-pulse rounded-[2rem] bg-white/[0.04]" />
    );
  if (!vehicle)
    return (
      <div className="py-32 text-center text-white/45">Vehicle not found.</div>
    );

  return (
    <div className="pb-24 sm:pb-0">
      <Link
        href={`/garage/${vehicleId}`}
        className="mb-7 inline-flex items-center gap-2 text-sm text-white/45 hover:text-white"
      >
        <ArrowLeft className="size-4" /> Vehicle overview
      </Link>
      <header className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_84%_16%,rgba(116,167,255,0.18),transparent_30%),#111512] p-6 sm:p-10">
        <p className="text-xs font-semibold tracking-[0.15em] text-[#8ab7ff] uppercase">
          Epic 14 · Guide trust system
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
          Every instruction shows its evidence state.
        </h1>
        <p className="mt-5 max-w-2xl leading-7 text-white/45">
          Draft, reviewed and verified are different things. Capcar blocks a
          verified label until dated authoritative sources and vehicle
          applicability are attached.
        </p>
      </header>

      <section className="mt-5 grid gap-5 xl:grid-cols-3">
        {installationGuides.map((guide) => {
          const governance = evaluateGuideGovernance(guide, reviews);
          const part = findCatalogPart(guide.partId);
          const fitment = part ? evaluateFitment(part, vehicle) : undefined;
          return (
            <Link
              key={guide.slug}
              href={`/garage/${vehicleId}/guides/${guide.slug}`}
              className="group flex flex-col rounded-[2rem] border border-white/10 bg-[#111512] p-6 transition hover:-translate-y-1 hover:border-white/20"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-[#74a7ff]/10 text-[#8ab7ff]">
                  <BookOpenCheck className="size-5" />
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/20 bg-amber-300/8 px-2.5 py-1 text-[10px] text-amber-100/70 uppercase">
                  <FileWarning className="size-3" /> {governance.status}
                </span>
              </div>
              <p className="mt-7 text-xs tracking-[0.12em] text-white/30 uppercase">
                Revision {guide.revision}
              </p>
              <h2 className="mt-2 text-2xl font-medium tracking-[-0.03em]">
                {guide.title}
              </h2>
              <p className="mt-4 text-sm leading-6 text-white/40">
                {guide.summary}
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs text-white/40">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1.5">
                  <Clock3 className="size-3" /> {guide.estimatedMinutes} min
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1.5">
                  <Wrench className="size-3" /> {guide.difficulty}
                </span>
              </div>
              <div className="mt-5 rounded-xl border border-white/8 bg-black/10 p-4 text-xs leading-5 text-white/40">
                {fitment?.status === "mismatch" ? (
                  <span className="flex gap-2 text-red-200/70">
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0" /> Demo
                    fitment mismatch for this profile.
                  </span>
                ) : (
                  <span className="flex gap-2">
                    <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-white/25" />
                    {governance.label}
                  </span>
                )}
              </div>
              <span className="mt-6 inline-flex items-center gap-2 text-sm text-white/55 group-hover:text-white xl:mt-auto xl:pt-6">
                Open guide <ArrowRight className="size-4" />
              </span>
            </Link>
          );
        })}
      </section>

      <aside className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-300/15 bg-emerald-300/6 p-5 text-sm leading-6 text-white/45">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-200" />
        The system is ready for licensed sources later. The current guides
        correctly remain drafts because no authoritative technical documents are
        attached.
      </aside>
    </div>
  );
}
