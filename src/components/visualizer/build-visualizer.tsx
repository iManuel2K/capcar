"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import {
  ArrowLeft,
  Armchair,
  CarFront,
  Check,
  Eye,
  Layers3,
  Paintbrush,
  Rotate3D,
  Save,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useState, useSyncExternalStore } from "react";

import { VehicleModelStage } from "@/components/visualizer/vehicle-model-stage";
import { ExhaustSoundStudio } from "@/components/visualizer/exhaust-sound-studio";
import { InteriorStage } from "@/components/visualizer/interior-stage";
import { ReferenceConfigurator } from "@/components/visualizer/reference-configurator";
import { SketchfabInteriorStage } from "@/components/visualizer/sketchfab-interior-stage";
import {
  visualExhausts,
  tipFinishes,
  rearAeroOptions,
  caliperColors,
  discOptions,
  trimOptions,
  interiorOptions,
  studioModelIds,
} from "@/features/visualizer/build-visual-schema";
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
import { vehicleReferenceFor } from "@/features/visualizer/vehicle-reference-catalog";
import { useVehicles } from "@/features/vehicles/use-vehicles";
import {
  carModels,
  matchCarModel,
} from "@/features/visualizer/car-model-catalog";

const InteractiveCarModel = dynamic(
  () =>
    import("@/components/visualizer/interactive-car-model").then(
      (module) => module.InteractiveCarModel,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex min-h-80 items-center justify-center rounded-[2rem] border border-white/10 bg-[#111111] text-sm text-white/70"
        role="status"
      >
        <LoadingIndicator />
      </div>
    ),
  },
);

const modelPaints: Record<BuildVisual["paint"], string> = {
  "factory-black": "#242a2d",
  "alpine-white": "#dddcd4",
  "estoril-blue": "#2870c6",
  "deep-green": "#31594c",
};

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
  const [saveError, setSaveError] = useState("");
  const [previewMode, setPreviewMode] = useState<"current" | "concept">(
    "concept",
  );
  const [view, setView] = useState<
    "auto" | "model" | "photo" | "exterior" | "reference" | "interior"
  >("auto");
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

  const reference = vehicleReferenceFor(vehicle.platform);
  const matchedModel = matchCarModel(vehicle);
  const selectedModel =
    carModels.find((model) => model.id === visual.studioModelId) ??
    matchedModel;
  const isVehicleModel = selectedModel?.id === matchedModel?.id;
  const canPreviewModelPaint = Boolean(selectedModel?.paintMaterials.length);
  const viewOptions = reference
    ? (["model", "photo", "exterior", "reference", "interior"] as const)
    : (["model", "photo", "exterior", "interior"] as const);
  const activeView =
    view === "auto"
      ? selectedModel
        ? "model"
        : reference
          ? "reference"
          : "photo"
      : view;

  function updateVisual(changes: Partial<BuildVisual>) {
    setPreviewMode("concept");
    try {
      saveBuildVisual(
        { ...visual, ...changes, vehicleId, buildId },
        window.localStorage,
      );
      announceBuildVisualChange();
      setSaveError("");
    } catch {
      setSaveError(
        "Your visual changes could not be saved. Check browser storage and try again.",
      );
    }
  }

  return (
    <div className="pb-24 sm:pb-0">
      {saveError && (
        <p
          role="alert"
          className="mb-4 rounded-xl border border-red-300/30 p-4 text-red-200"
        >
          {saveError}
        </p>
      )}
      <Link
        href={`/garage/${vehicleId}/builds/${buildId}`}
        className="mb-7 inline-flex items-center gap-2 text-sm text-white/45 hover:text-white"
      >
        <ArrowLeft className="size-4" /> Build roadmap
      </Link>
      <header className="rounded-[2rem] border border-white/10 bg-[#111111] p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[#e72d45]/25 bg-[#e72d45]/10 px-3 py-1.5 text-[10px] text-[#a9c7ff] uppercase">
            Build Studio · Visual parts & sound
          </span>
          <span className="rounded-full border border-amber-300/20 bg-amber-300/8 px-3 py-1.5 text-[10px] text-amber-100/65 uppercase">
            Not fitment proof
          </span>
        </div>
        <p className="mt-3 text-sm font-semibold text-[#ff667a]">
          {vehicle.productionYear} {vehicle.make} {vehicle.model} · {build.name}
        </p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight">
          Explore your build.
        </h1>
      </header>

      <section className="relative mt-5">
        <div className="mb-3 flex flex-wrap gap-3">
          <div className="inline-flex flex-wrap rounded-xl border border-white/10 bg-[#111111] p-1">
            {viewOptions.map((candidate) => (
              <button
                key={candidate}
                type="button"
                onClick={() => setView(candidate)}
                aria-pressed={activeView === candidate}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs capitalize ${activeView === candidate ? "bg-white font-semibold text-black" : "text-white/40"}`}
              >
                {candidate === "exterior" || candidate === "photo" ? (
                  <CarFront className="size-3.5" />
                ) : candidate === "reference" || candidate === "model" ? (
                  <Rotate3D className="size-3.5" />
                ) : (
                  <Armchair className="size-3.5" />
                )}
                {candidate === "model"
                  ? "3D model"
                  : candidate === "reference"
                    ? "3D reference"
                    : candidate === "exterior"
                      ? "Stylized concept"
                      : candidate}
              </button>
            ))}
          </div>
          {activeView !== "reference" &&
            activeView !== "photo" &&
            (activeView !== "model" || canPreviewModelPaint) && (
              <div className="inline-flex rounded-xl border border-white/10 bg-[#111111] p-1">
                {(["current", "concept"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPreviewMode(mode)}
                    aria-pressed={previewMode === mode}
                    className={`rounded-lg px-4 py-2 text-xs capitalize ${previewMode === mode ? "bg-[#e72d45] font-semibold text-[#07101d]" : "text-white/40"}`}
                  >
                    {activeView === "model"
                      ? mode === "current"
                        ? "Original model"
                        : "Paint preview"
                      : mode === "current"
                        ? "Current baseline"
                        : "Dream concept"}
                  </button>
                ))}
              </div>
            )}
        </div>
        {activeView === "model" ? (
          selectedModel ? (
            <div className="space-y-3">
              <div className="rounded-[2rem] border border-white/10 bg-[#f3f1e7] p-3 text-[#0e2d30] sm:p-5">
                <InteractiveCarModel
                  key={selectedModel.id}
                  modelId={selectedModel.id}
                  paint={
                    canPreviewModelPaint
                      ? previewMode === "current"
                        ? null
                        : modelPaints[visual.paint]
                      : undefined
                  }
                  label={selectedModel.name}
                />
              </div>
              <p className="px-1 text-sm leading-6 text-white/70">
                {isVehicleModel
                  ? `${selectedModel.name} · Matched to your vehicle generation. Model details may differ from your exact trim.`
                  : `${selectedModel.name} · A reference you selected, not a model of your own vehicle.`}{" "}
                {canPreviewModelPaint
                  ? "Paint is a material preview; verify parts and clearance separately."
                  : "Original materials are preserved; verify parts and clearance separately."}
              </p>
            </div>
          ) : (
            <div className="rounded-[2rem] border border-white/10 bg-[#0b2528] p-7 sm:p-10">
              <Rotate3D className="size-8 text-[#ff667a]" />
              <h2 className="mt-4 text-2xl font-medium">
                Choose a model to explore.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">
                Your exact vehicle generation is not in the free model library
                yet. Choose one of the 25 cars below as an explicit visual
                reference, or use your vehicle photo and stylized concept.
              </p>
            </div>
          )
        ) : activeView === "reference" && reference ? (
          <div className="space-y-3">
            <ReferenceConfigurator
              english
              key={`${vehicleId}-${buildId}`}
              id={reference.modelUid}
              name={`${reference.title} · ${reference.yearLabel}`}
              image={reference.previewImage}
              storageKey={`${vehicleId}.${buildId}.${reference.modelUid}`}
              savedConfiguration={
                visual.reference?.modelUid === reference.modelUid
                  ? visual.reference
                  : undefined
              }
              onSaveConfiguration={(configuration) =>
                updateVisual({
                  reference: {
                    ...configuration,
                    modelUid: reference.modelUid,
                  },
                })
              }
            />
            <p className="px-4 text-xs text-white/65">
              <a
                href={reference.sourceUrl}
                className="underline"
                target="_blank"
                rel="noreferrer"
              >
                {reference.title} by {reference.creator}
              </a>{" "}
              · Visual reference, edited material tints. Model coverage varies
              by vehicle; modifications do not verify fitment.
            </p>
          </div>
        ) : activeView === "photo" ? (
          <div className="overflow-hidden rounded-[2rem] border border-white/15 bg-[#0b2528]">
            {vehicle.imageUrl && (
              <div className="relative aspect-[16/10] sm:aspect-video">
                <Image
                  src={vehicle.imageUrl}
                  alt={`${vehicle.make} ${vehicle.model} vehicle image`}
                  fill
                  sizes="(max-width: 768px) 100vw, 1100px"
                  className="object-contain"
                />
              </div>
            )}
            <div className="p-6">
              <h2 className="text-xl font-medium">Start with your car.</h2>
              <p className="mt-2 text-sm leading-6 text-white/70">
                {selectedModel
                  ? "Your vehicle photo and the interactive model are separate views. Open 3D model to explore your saved model reference."
                  : reference
                    ? "Your vehicle image and the 3D reference are separate views. A reference model may differ from your exact trim."
                    : "No realistic 3D reference is currently mapped to this vehicle. Your plan still works; the stylized concept is available as an optional illustration."}
              </p>
            </div>
          </div>
        ) : activeView === "exterior" ? (
          <VehicleModelStage
            vehicle={vehicle}
            visual={previewMode === "current" ? currentVisual : visual}
            label={
              previewMode === "current" ? "Current baseline" : "Dream concept"
            }
          />
        ) : reference ? (
          <SketchfabInteriorStage reference={reference} />
        ) : (
          <InteriorStage
            visual={previewMode === "current" ? currentVisual : visual}
            label={
              previewMode === "current" ? "Current baseline" : "Dream concept"
            }
          />
        )}
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-[2rem] border border-white/10 bg-[#111111] p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.14em] text-white/30 uppercase">
                Visual configuration
              </p>
              <h2 className="mt-2 text-2xl font-medium">
                {activeView === "model"
                  ? "Your model reference"
                  : activeView === "reference"
                    ? "Explore the base car"
                    : "Shape the concept"}
              </h2>
            </div>
            <span className="inline-flex items-center gap-2 text-xs text-emerald-200/70">
              <Save className="size-3.5" /> Saved locally
            </span>
          </div>
          <div className="mt-7 space-y-7">
            {activeView === "model" ? (
              <>
                <div>
                  <label
                    htmlFor="garage-studio-model"
                    className="block text-sm font-medium text-white/85"
                  >
                    Free model library
                  </label>
                  <select
                    id="garage-studio-model"
                    value={visual.studioModelId ?? ""}
                    onChange={(event) => {
                      updateVisual({
                        studioModelId: studioModelIds.find(
                          (id) => id === event.target.value,
                        ),
                      });
                      setView("model");
                    }}
                    className="mt-3 min-h-12 w-full rounded-xl border border-white/20 bg-[#171717] px-4 text-sm text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff667a]"
                  >
                    <option value="">
                      {matchedModel
                        ? `Vehicle match · ${matchedModel.name}`
                        : "Choose a reference model"}
                    </option>
                    {carModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-3 text-sm leading-6 text-white/65">
                    All 25 models are free. Your selection is saved with this
                    build. Choosing another car changes only the visual
                    reference.
                  </p>
                </div>
                {canPreviewModelPaint ? (
                  <>
                    <OptionGroup
                      label="Paint preview"
                      icon={Paintbrush}
                      options={visualPaints}
                      value={visual.paint}
                      onChange={(paint) => updateVisual({ paint })}
                    />
                  </>
                ) : selectedModel ? (
                  <p className="rounded-xl border border-white/10 p-4 text-sm leading-6 text-white/70">
                    This model keeps its original materials. Use Stylized
                    concept to explore paint, wheels and stance on an
                    illustrative body.
                  </p>
                ) : null}
              </>
            ) : activeView === "photo" ? (
              <div className="text-sm leading-6 text-white/75">
                <p>
                  Keep your vehicle photo as the starting point, or choose a
                  free interactive model to explore a direction.
                </p>
                <button
                  type="button"
                  onClick={() => setView("model")}
                  className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 px-4 font-medium text-white"
                >
                  <Rotate3D className="size-4" /> Browse 25 free models
                </button>
              </div>
            ) : activeView === "reference" ? (
              <div className="rounded-2xl border border-[#e72d45]/15 bg-[#e72d45]/6 p-5 text-sm leading-6 text-white/55">
                This external model is an additional body and cabin reference.
                Use its own controls to save material tints, or open 3D model
                for CapCar’s free model library and saved paint previews.
              </div>
            ) : (
              <>
                <p className="text-sm leading-6 text-amber-100/70">
                  Generic {activeView} concepts only. Parts are not
                  dimensionally verified, purchasable product replicas or proof
                  of road approval.
                </p>
                {previewMode === "current" && (
                  <p className="text-sm text-[#ff667a]">
                    Showing the factory-style reference. Switch to Dream concept
                    to see your selections; this baseline is not a scan of your
                    actual car.
                  </p>
                )}
                {activeView === "exterior" ? (
                  <>
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
                    <OptionGroup
                      label="Exhaust tips"
                      icon={Sparkles}
                      options={visualExhausts}
                      value={visual.exhaust}
                      onChange={(exhaust) => updateVisual({ exhaust })}
                    />
                    <OptionGroup
                      label="Tip finish"
                      icon={Paintbrush}
                      options={tipFinishes}
                      value={visual.tipFinish}
                      onChange={(tipFinish) => updateVisual({ tipFinish })}
                    />
                    <OptionGroup
                      label="Rear spoiler / wing"
                      icon={Layers3}
                      options={rearAeroOptions}
                      value={visual.rearAero}
                      onChange={(rearAero) => updateVisual({ rearAero })}
                    />
                    <OptionGroup
                      label="Brake caliper color"
                      icon={Paintbrush}
                      options={caliperColors}
                      value={visual.calipers}
                      onChange={(calipers) => updateVisual({ calipers })}
                    />
                    <OptionGroup
                      label="Brake discs"
                      icon={Eye}
                      options={discOptions}
                      value={visual.discs}
                      onChange={(discs) => updateVisual({ discs })}
                    />
                    <OptionGroup
                      label="Side skirts"
                      icon={Layers3}
                      options={trimOptions}
                      value={visual.skirts}
                      onChange={(skirts) => updateVisual({ skirts })}
                    />
                    <OptionGroup
                      label="Rear diffuser"
                      icon={Layers3}
                      options={trimOptions}
                      value={visual.diffuser}
                      onChange={(diffuser) => updateVisual({ diffuser })}
                    />
                    <OptionGroup
                      label="Mirror caps"
                      icon={Paintbrush}
                      options={["body", "black"] as const}
                      value={visual.mirrors}
                      onChange={(mirrors) => updateVisual({ mirrors })}
                    />
                  </>
                ) : (
                  <>
                    <OptionGroup
                      label="Seat style"
                      icon={Armchair}
                      options={interiorOptions.seatStyle}
                      value={visual.seatStyle}
                      onChange={(seatStyle) => updateVisual({ seatStyle })}
                    />
                    <OptionGroup
                      label="Upholstery"
                      icon={Paintbrush}
                      options={interiorOptions.upholstery}
                      value={visual.upholstery}
                      onChange={(upholstery) => updateVisual({ upholstery })}
                    />
                    <OptionGroup
                      label="Dashboard trim"
                      icon={Sparkles}
                      options={interiorOptions.cabinTrim}
                      value={visual.cabinTrim}
                      onChange={(cabinTrim) => updateVisual({ cabinTrim })}
                    />
                    <OptionGroup
                      label="Steering wheel"
                      icon={Layers3}
                      options={interiorOptions.steeringWheel}
                      value={visual.steeringWheel}
                      onChange={(steeringWheel) =>
                        updateVisual({ steeringWheel })
                      }
                    />
                    <OptionGroup
                      label="Display"
                      icon={Eye}
                      options={interiorOptions.cabinScreen}
                      value={visual.cabinScreen}
                      onChange={(cabinScreen) => updateVisual({ cabinScreen })}
                    />
                    <OptionGroup
                      label="Ambient light"
                      icon={Sparkles}
                      options={interiorOptions.ambientLight}
                      value={visual.ambientLight}
                      onChange={(ambientLight) =>
                        updateVisual({ ambientLight })
                      }
                    />
                    <OptionGroup
                      label="Pedals"
                      icon={Layers3}
                      options={interiorOptions.pedals}
                      value={visual.pedals}
                      onChange={(pedals) => updateVisual({ pedals })}
                    />
                    <OptionGroup
                      label="Floor mats"
                      icon={Paintbrush}
                      options={interiorOptions.floorMats}
                      value={visual.floorMats}
                      onChange={(floorMats) => updateVisual({ floorMats })}
                    />
                    <OptionGroup
                      label="Gear knob"
                      icon={Sparkles}
                      options={interiorOptions.gearKnob}
                      value={visual.gearKnob}
                      onChange={(gearKnob) => updateVisual({ gearKnob })}
                    />
                    <OptionGroup
                      label="Driving side"
                      icon={Armchair}
                      options={interiorOptions.drivingSide}
                      value={visual.drivingSide}
                      onChange={(drivingSide) => updateVisual({ drivingSide })}
                    />
                  </>
                )}
              </>
            )}
          </div>
        </article>

        <aside className="rounded-[2rem] border border-white/10 bg-[#111111] p-6 sm:p-8">
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
            className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#e72d45] px-4 text-sm font-semibold text-[#07101d]"
          >
            Check build compatibility
          </Link>
        </aside>
      </section>

      <ExhaustSoundStudio key={vehicle.id} vehicle={vehicle} />
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
        <Icon className="size-4 text-[#ff667a]" /> {label}
      </legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            className={`rounded-xl border px-3.5 py-2 text-sm ${value === option ? "border-[#e72d45]/45 bg-[#e72d45]/12 text-[#bad1ff]" : "border-white/10 text-white/60"}`}
          >
            {optionLabels[option] ?? option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
