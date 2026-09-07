"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Layers3,
  Plus,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";

import { VehicleArt } from "@/components/garage/vehicle-art";
import { getBuildMetrics } from "@/features/builds/build-metrics";
import {
  announceBuildChange,
  createStealthRearBuild,
} from "@/features/builds/build-storage";
import { useBuildState } from "@/features/builds/use-builds";
import { useVehicles } from "@/features/vehicles/use-vehicles";

export function BuildsOverview({ vehicleId }: { vehicleId: string }) {
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const router = useRouter();
  const { vehicles } = useVehicles();
  const { builds, items } = useBuildState();
  const vehicle = vehicles.find((candidate) => candidate.id === vehicleId);
  const vehicleBuilds = builds.filter((build) => build.vehicleId === vehicleId);

  if (!hydrated)
    return (
      <div className="min-h-[600px] animate-pulse rounded-[2rem] bg-white/[0.04]" />
    );
  if (!vehicle) return <MissingVehicle />;

  function loadSample() {
    const existing = vehicleBuilds.find(
      (build) => build.name === "Stealth Rear",
    );
    if (existing) {
      router.push(`/garage/${vehicleId}/builds/${existing.id}`);
      return;
    }
    const build = createStealthRearBuild(vehicleId, window.localStorage);
    announceBuildChange();
    router.push(`/garage/${vehicleId}/builds/${build.id}`);
  }

  return (
    <div className="pb-24 sm:pb-0">
      <Link
        href={`/garage/${vehicleId}`}
        className="mb-7 inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-white"
      >
        <ArrowLeft className="size-4" /> {vehicle.productionYear} BMW{" "}
        {vehicle.model}
      </Link>

      <header className="grid gap-8 rounded-[2rem] border border-white/10 bg-[#111111] p-6 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-[#ff667a] uppercase">
            Build studio
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-medium tracking-[-0.05em] text-balance sm:text-6xl">
            Turn the vision into stages.
          </h1>
          <p className="mt-5 max-w-2xl leading-7 text-white/50">
            Plan coherent modifications, understand the complete budget and keep
            the order of work visible.
          </p>
        </div>
        <Link
          href={`/garage/${vehicleId}/builds/new`}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#e72d45] px-5 text-sm font-semibold text-[#07101d]"
        >
          <Plus className="size-4" /> New build
        </Link>
      </header>

      {vehicleBuilds.length === 0 ? (
        <section className="mt-5 grid overflow-hidden rounded-[2rem] border border-white/10 bg-[#111111] lg:grid-cols-[1.15fr_0.85fr]">
          <VehicleArt
            label={`${vehicle.productionYear} BMW ${vehicle.model}`}
          />
          <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
            <span className="grid size-11 place-items-center rounded-2xl bg-[#e72d45] text-[#07101d]">
              <Layers3 className="size-5" />
            </span>
            <h2 className="mt-7 text-2xl font-medium">
              Create the first direction
            </h2>
            <p className="mt-3 leading-7 text-white/45">
              Start from a goal and budget. Individual products, prices and
              fitment will connect to the plan in later epics.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/garage/${vehicleId}/builds/new`}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#e72d45] px-5 text-sm font-semibold text-[#07101d]"
              >
                Create a build <ArrowRight className="size-4" />
              </Link>
              <button
                type="button"
                onClick={loadSample}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 text-sm text-white/65"
              >
                <Sparkles className="size-4 text-[#ff667a]" /> Load Stealth Rear
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section className="mt-5 grid gap-5 xl:grid-cols-2">
          {vehicleBuilds.map((build) => {
            const buildItems = items.filter(
              (item) => item.buildId === build.id,
            );
            const metrics = getBuildMetrics(build, buildItems);
            return (
              <Link
                key={build.id}
                href={`/garage/${vehicleId}/builds/${build.id}`}
                className="group overflow-hidden rounded-[2rem] border border-white/10 bg-[#111111] transition hover:-translate-y-1 hover:border-white/20"
              >
                <div className="relative min-h-60 overflow-hidden bg-[radial-gradient(circle_at_68%_45%,rgba(231,45,69,0.24),transparent_30%),#0d0d0d] p-7">
                  <div className="absolute top-7 right-7 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-white/50">
                    {build.goal}
                  </div>
                  <div className="absolute right-[10%] bottom-[22%] left-[10%] h-20 rounded-[50%] bg-[#e72d45]/10 blur-3xl" />
                  <div className="absolute right-7 bottom-7 left-7">
                    <p className="text-xs tracking-[0.14em] text-white/35 uppercase">
                      {build.status.replace("_", " ")}
                    </p>
                    <h2 className="mt-2 text-3xl font-medium tracking-[-0.035em]">
                      {build.name}
                    </h2>
                  </div>
                </div>
                <div className="grid gap-px bg-white/8 sm:grid-cols-3">
                  <BuildStat
                    label="Planned"
                    value={formatEuro(metrics.plannedTotal)}
                  />
                  <BuildStat label="Budget" value={formatEuro(build.budget)} />
                  <BuildStat label="Installed" value={`${metrics.progress}%`} />
                </div>
                <div className="flex items-center justify-between p-6 text-sm text-white/40">
                  <span>{buildItems.length} modifications</span>
                  <ArrowRight className="size-4 transition group-hover:translate-x-1 group-hover:text-white" />
                </div>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={loadSample}
            className="min-h-40 rounded-[2rem] border border-dashed border-white/12 p-8 text-left text-white/45 transition hover:border-[#e72d45]/35 hover:text-white/70"
          >
            <Sparkles className="size-5 text-[#ff667a]" />
            <span className="mt-5 block font-medium">
              Open sample Stealth Rear build
            </span>
            <span className="mt-2 block text-sm">
              A fast way to test stages, costs and statuses.
            </span>
          </button>
        </section>
      )}

      <aside className="mt-5 flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.025] p-5 text-sm leading-6 text-white/40">
        <WalletCards className="mt-0.5 size-4 shrink-0 text-[#ff667a]" />
        <p>
          All modifications are concepts until Epic 07 verifies exact part
          fitment. Costs are your planning estimates, not live merchant offers.
        </p>
      </aside>
    </div>
  );
}

function BuildStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#111111] p-5">
      <p className="text-[11px] tracking-[0.12em] text-white/30 uppercase">
        {label}
      </p>
      <p className="mt-2 font-medium text-white/75">{value}</p>
    </div>
  );
}

function MissingVehicle() {
  return (
    <div className="mx-auto py-32 text-center">
      <p className="text-white/45">Vehicle not found.</p>
      <Link
        href="/garage"
        className="mt-5 inline-flex rounded-xl bg-[#e72d45] px-5 py-3 text-sm font-semibold text-[#07101d]"
      >
        Return to garage
      </Link>
    </div>
  );
}

function formatEuro(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}
