"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Eye,
  Layers3,
  Paintbrush,
  Save,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useState, useSyncExternalStore } from "react";

import { VehicleModelStage } from "@/components/visualizer/vehicle-model-stage";
import { useBuildState } from "@/features/builds/use-builds";
import {
  announceBuildVisualChange,
  saveBuildVisual,
} from "@/features/visualizer/build-visual-storage";
import {
  createDefaultBuildVisual,
  visualAero,
  visualLighting,
  visualPaints,
  visualStances,
  visualWheels,
  type BuildVisual,
} from "@/features/visualizer/build-visual-schema";
import { useBuildVisuals } from "@/features/visualizer/use-build-visuals";
import { useVehicles } from "@/features/vehicles/use-vehicles";

const optionLabels: Record<string, string> = {
  "factory-black": "Factory black",
  "alpine-white": "Alpine white",
  "estoril-blue": "Estoril blue",
  "deep-green": "Deep green",
  factory: "Factory",
  graphite: "Graphite",
  "silver-mesh": "Silver mesh",
  stock: "Stock",
  sport: "Sport",
  low: "Low",
  dark: "Dark",
};

export function BuildVisualizer({
  vehicleId,
  buildId,
}: {
  vehicleId: string;
  buildId: string;
}) {
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const { vehicles } = useVehicles();
  const state = useBuildState();
  const visuals = useBuildVisuals();
  const [previewMode, setPreviewMode] = useState<"current" | "concept">(
    "concept",
  );
  const vehicle = vehicles.find((candidate) => candidate.id === vehicleId);
  const build = state.builds.find(
    (candidate) =>
      candidate.id === buildId && candidate.vehicleId === vehicleId,
  );
  const items = state.items.filter((item) => item.buildId === buildId);
  const visual =
    visuals.find((candidate) => candidate.buildId === buildId) ??
    createDefaultBuildVisual(vehicleId, buildId);
  const currentVisual = createDefaultBuildVisual(vehicleId, buildId);

  if (!hydrated)
    return (
      <div className="min-h-[720px] animate-pulse rounded-[2rem] bg-white/[0.04]" />
    );
  if (!vehicle || !build)
    return (
      <div className="py-32 text-center text-white/45">Build not found.</div>
    );

  function updateVisual(changes: Partial<BuildVisual>) {
    saveBuildVisual(
      { ...visual, ...changes, vehicleId, buildId },
      window.localStorage,
    );
    announceBuildVisualChange();
  }

  return (
    <div className="pb-24 sm:pb-0">
      <Link
        href={`/garage/${vehicleId}/builds/${buildId}`}
        className="mb-7 inline-flex items-center gap-2 text-sm text-white/45 hover:text-white"
      >
        <ArrowLeft className="size-4" /> Build roadmap
      </Link>
      <header className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_84%_15%,rgba(116,167,255,0.2),transparent_30%),#111512] p-6 sm:p-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[#74a7ff]/25 bg-[#74a7ff]/10 px-3 py-1.5 text-[10px] text-[#a9c7ff] uppercase">
            Epic 24 · Interactive 3D studio
          </span>
          <span className="rounded-full border border-amber-300/20 bg-amber-300/8 px-3 py-1.5 text-[10px] text-amber-100/65 uppercase">
            Not fitment proof
          </span>
        </div>
        <p className="mt-7 text-xs font-semibold tracking-[0.14em] text-[#8ab7ff] uppercase">
          {vehicle.productionYear} BMW {vehicle.model} · {build.name}
        </p>
        <h1 className="mt-3 max-w-4xl text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
          Orbit the build before buying.
        </h1>
      </header>

      <section className="mt-5">
        <div className="mb-3 inline-flex rounded-xl border border-white/10 bg-[#111512] p-1">
          {(["current", "concept"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setPreviewMode(mode)}
              className={`rounded-lg px-4 py-2 text-xs capitalize ${previewMode === mode ? "bg-[#74a7ff] font-semibold text-[#07101d]" : "text-white/40"}`}
            >
              {mode === "current" ? "Current baseline" : "Dream concept"}
            </button>
          ))}
        </div>
        <VehicleModelStage
          vehicle={vehicle}
          visual={previewMode === "current" ? currentVisual : visual}
          label={
            previewMode === "current" ? "Current baseline" : "Dream concept"
          }
        />
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-[2rem] border border-white/10 bg-[#111512] p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.14em] text-white/30 uppercase">
                Visual configuration
              </p>
              <h2 className="mt-2 text-2xl font-medium">Shape the concept</h2>
            </div>
            <span className="inline-flex items-center gap-2 text-xs text-emerald-200/70">
              <Save className="size-3.5" /> Saved locally
            </span>
          </div>
          <div className="mt-7 space-y-7">
            <OptionGroup
              label="Paint"
              icon={Paintbrush}
              options={visualPaints}
              value={visual.paint}
              onChange={(paint) => updateVisual({ paint })}
            />
            <OptionGroup
              label="Wheels"
              icon={Sparkles}
              options={visualWheels}
              value={visual.wheels}
              onChange={(wheels) => updateVisual({ wheels })}
            />
            <OptionGroup
              label="Stance"
              icon={Layers3}
              options={visualStances}
              value={visual.stance}
              onChange={(stance) => updateVisual({ stance })}
            />
            <OptionGroup
              label="Lighting"
              icon={Eye}
              options={visualLighting}
              value={visual.lighting}
              onChange={(lighting) => updateVisual({ lighting })}
            />
            <OptionGroup
              label="Aero"
              icon={Sparkles}
              options={visualAero}
              value={visual.aero}
              onChange={(aero) => updateVisual({ aero })}
            />
          </div>
        </article>

        <aside className="rounded-[2rem] border border-white/10 bg-[#111512] p-6 sm:p-8">
          <p className="text-xs tracking-[0.14em] text-white/30 uppercase">
            Connected roadmap
          </p>
          <h2 className="mt-2 text-2xl font-medium">
            {items.length} build items
          </h2>
          <p className="mt-4 text-sm leading-6 text-white/40">
            The concept belongs to this build. Visual choices do not
            automatically claim that a catalogue product fits.
          </p>
          <ul className="mt-6 space-y-3">
            {items.slice(0, 5).map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-2 rounded-xl border border-white/8 p-3 text-sm text-white/50"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-white/25" />
                <span>
                  {item.title}
                  <small className="mt-1 block text-white/25">
                    {item.stage} · {item.status}
                  </small>
                </span>
              </li>
            ))}
          </ul>
          <Link
            href={`/garage/${vehicleId}/builds/${buildId}/compatibility`}
            className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#74a7ff] px-4 text-sm font-semibold text-[#07101d]"
          >
            Check build compatibility
          </Link>
        </aside>
      </section>

      <aside className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-300/15 bg-amber-300/6 p-5 text-sm leading-6 text-white/45">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-200" />
        The studio now uses real 3D projection, millimetre scene units and
        model-provider accuracy gates. The included body mesh remains reference
        geometry until a licensed, dimensionally verified asset is connected.
        Wheel offset, ride height and parts still require fitment verification.
      </aside>
    </div>
  );
}

function OptionGroup<T extends string>({
  label,
  icon: Icon,
  options,
  value,
  onChange,
}: {
  label: string;
  icon: typeof Eye;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="flex items-center gap-2 text-sm text-white/55">
        <Icon className="size-4 text-[#8ab7ff]" /> {label}
      </legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-xl border px-3.5 py-2 text-xs ${value === option ? "border-[#74a7ff]/45 bg-[#74a7ff]/12 text-[#bad1ff]" : "border-white/10 text-white/35"}`}
          >
            {optionLabels[option] ?? option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
