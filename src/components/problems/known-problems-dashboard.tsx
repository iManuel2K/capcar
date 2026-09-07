"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, BadgeCheck, CircleAlert, Database, Search, ShieldCheck, Wrench } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

import { hasEngineSpecificCoverage, problemsForVehicle, type ProblemEvidence } from "@/features/problems/problem-catalog";
import { useVehicles } from "@/features/vehicles/use-vehicles";

const evidenceLabels: Record<ProblemEvidence, string> = {
  "inspection-data": "Inspection data",
  "technical-bulletin": "Technical bulletin",
};

export function KnownProblemsDashboard({ vehicleId }: { vehicleId: string }) {
  const hydrated = useSyncExternalStore(() => () => undefined, () => true, () => false);
  const { vehicles } = useVehicles();
  const [system, setSystem] = useState("All");
  const vehicle = vehicles.find((candidate) => candidate.id === vehicleId);
  if (!hydrated) return <div className="min-h-[620px] animate-pulse rounded-[2rem] bg-white/[0.04]" />;
  if (!vehicle) return <div className="py-32 text-center text-white/45">Vehicle not found.</div>;

  const problems = problemsForVehicle(vehicle);
  const systems = ["All", ...new Set(problems.map((problem) => problem.system))];
  const visible = system === "All" ? problems : problems.filter((problem) => problem.system === system);
  const engineUnknown = /UNKNOWN|UNCONFIRMED|NOT KNOWN/.test(vehicle.engineCode.toUpperCase());

  return (
    <div className="pb-24 sm:pb-0">
      <Link href={`/garage/${vehicleId}`} className="mb-7 inline-flex items-center gap-2 text-sm text-white/45 hover:text-white">
        <ArrowLeft className="size-4" /> Vehicle overview
      </Link>

      <header className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#111111]">
        <div className="grid gap-7 p-6 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs tracking-[0.14em] text-[#ff667a] uppercase">Model watchlist · sourced</p>
            <h1 className="mt-3 text-4xl font-medium tracking-[-0.045em] sm:text-5xl">Know what to watch.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/50">
              Evidence matched to your {vehicle.productionYear} BMW {vehicle.model}, {vehicle.platform} and confirmed engine details. This is inspection guidance—not a diagnosis or a prediction that your car will fail.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-4">
            <p className="text-xs text-white/35 uppercase">Matched records</p>
            <p className="mt-1 text-3xl font-medium">{problems.length}</p>
          </div>
        </div>
      </header>

      {engineUnknown && hasEngineSpecificCoverage(vehicle.platform) && (
        <aside className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-300/15 bg-amber-300/6 p-5 text-sm leading-6 text-amber-50/70">
          <CircleAlert className="mt-0.5 size-4 shrink-0" /> Confirm the engine code from the vehicle documents or a verified VIN source to unlock engine-specific bulletins. Capcar has intentionally hidden uncertain matches.
        </aside>
      )}

      <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.34fr]">
        <div>
          {problems.length > 0 ? <>
            <div className="mb-4 flex flex-wrap gap-2" aria-label="Filter by system">
              {systems.map((candidate) => <button key={candidate} type="button" onClick={() => setSystem(candidate)} aria-pressed={system === candidate}
                className={`rounded-xl border px-3.5 py-2 text-sm ${system === candidate ? "border-[#e72d45]/45 bg-[#e72d45]/12 text-[#bad1ff]" : "border-white/10 text-white/50"}`}>{candidate}</button>)}
            </div>
            <div className="space-y-4">
              {visible.map((problem) => (
                <article key={problem.id} className="rounded-[1.75rem] border border-white/10 bg-[#111111] p-6 sm:p-7">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-white/6 px-2.5 py-1 text-white/50">{problem.system}</span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-300/8 px-2.5 py-1 text-emerald-100/65"><BadgeCheck className="size-3" /> {evidenceLabels[problem.evidence]}</span>
                      </div>
                      <h2 className="mt-4 text-2xl font-medium tracking-tight">{problem.title}</h2>
                      <p className="mt-2 text-sm text-white/35">Applies to: {problem.applicability}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1.5 text-xs ${problem.severity === "service-soon" ? "bg-amber-300/10 text-amber-100/70" : "bg-[#e72d45]/10 text-[#a9c7ff]"}`}>{problem.severity === "service-soon" ? "Inspect if symptoms appear" : "Monitor"}</span>
                  </div>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div><p className="text-xs tracking-wider text-white/30 uppercase">Possible symptoms</p><ul className="mt-3 space-y-2 text-sm leading-6 text-white/55">{problem.symptoms.map((symptom) => <li key={symptom} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-white/25" />{symptom}</li>)}</ul></div>
                    <div><p className="text-xs tracking-wider text-white/30 uppercase">Next check</p><p className="mt-3 text-sm leading-6 text-white/55">{problem.nextCheck}</p></div>
                  </div>
                  <a href={problem.sourceUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm text-[#ff667a] hover:text-[#bdd3ff]">{problem.sourceLabel}<ArrowUpRight className="size-3.5" /></a>
                </article>
              ))}
            </div>
          </> : <div className="rounded-[2rem] border border-white/10 bg-[#111111] p-8 text-center">
            <Database className="mx-auto size-6 text-white/30" /><h2 className="mt-4 text-2xl font-medium">Coverage is being verified.</h2><p className="mx-auto mt-3 max-w-lg leading-7 text-white/45">No source-reviewed records match this exact platform yet. That does not mean the vehicle has no known issues.</p>
          </div>}
        </div>

        <aside className="space-y-4">
          <div className="rounded-[1.75rem] border border-white/10 bg-[#111111] p-6">
            <ShieldCheck className="size-5 text-emerald-200" /><h2 className="mt-4 text-lg font-medium">Check official recalls</h2><p className="mt-3 text-sm leading-6 text-white/45">Recall status is VIN-specific. Capcar does not guess it from the model year.</p>
            <a href="https://vehiclerecall.bmwgroup.com/index.html?brand=bmw&language=de&market=de" target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-black">BMW recall lookup<ArrowUpRight className="size-3.5" /></a>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-[#111111] p-6">
            <Wrench className="size-5 text-[#ff667a]" /><h2 className="mt-4 text-lg font-medium">Act on evidence</h2><div className="mt-4 grid gap-2">
              <Link href={`/garage/${vehicleId}/maintenance`} className="rounded-xl border border-white/10 px-4 py-3 text-sm text-white/55 hover:text-white">Open maintenance</Link>
              <Link href={`/garage/${vehicleId}/parts`} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-white/55 hover:text-white"><Search className="size-3.5" /> Research parts after diagnosis</Link>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
