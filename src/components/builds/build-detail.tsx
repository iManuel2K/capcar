"use client";

import { useLocale } from "next-intl";
import { isAppLocale } from "@/i18n/config";
import { buildProgressCopy } from "@/features/builds/build-progress-copy";
import styles from "./build-progress.module.css";
import { trackAnalytics } from "@/features/analytics/client";
import { activateGarage } from "@/features/onboarding/activation";
import { useGarageCopy } from "@/features/onboarding/use-garage-copy";
import { actualItemCost } from "@/features/builds/build-costs";

import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CircleGauge,
  Eye,
  Gauge,
  Plus,
  ShieldCheck,
  Wrench,
  X,
} from "lucide-react";
import { useState, useSyncExternalStore } from "react";

import {
  phaseForItem,
  planningForBuild,
} from "@/features/builds/build-planning";
import {
  buildItemInputSchema,
  buildPriorities,
  buildStages,
  buildStatuses,
  type BuildItemStatus,
  type BuildStage,
} from "@/features/builds/build-schema";
import {
  announceBuildChange,
  createBuildItem,
  updateBuildItemStatus,
  updateBuildStatus,
} from "@/features/builds/build-storage";
import { useBuildState } from "@/features/builds/use-builds";
import { useVehicles } from "@/features/vehicles/use-vehicles";
import { BuildJourneyPanel } from "./build-journey-panel";
import { BuildWorkbench } from "./build-workbench";
import { ConnectedBuildPlanner } from "./connected-build-planner";
import { BuildStoryPanel, BuildTaskCompletion } from "./build-story-panel";

const stageContent: Record<
  BuildStage,
  { number: string; title: string; description: string; icon: typeof Wrench }
> = {
  foundation: {
    number: "01",
    title: "Foundation",
    description: "Maintenance and known issues first.",
    icon: ShieldCheck,
  },
  handling: {
    number: "02",
    title: "Handling",
    description: "Tyres, brakes and suspension.",
    icon: CircleGauge,
  },
  appearance: {
    number: "03",
    title: "Appearance",
    description: "The visual direction and finish.",
    icon: Eye,
  },
  performance: {
    number: "04",
    title: "Performance",
    description: "Supporting hardware before power.",
    icon: Gauge,
  },
};

export function BuildDetail({
  vehicleId,
  buildId,
}: {
  vehicleId: string;
  buildId: string;
}) {
  const copy = useGarageCopy();
  const locale = useLocale();
  const progressCopy = buildProgressCopy[isAppLocale(locale) ? locale : "en"];
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const { vehicles } = useVehicles();
  const state = useBuildState();
  const vehicle = vehicles.find((candidate) => candidate.id === vehicleId);
  const build = state.builds.find(
    (candidate) =>
      candidate.id === buildId && candidate.vehicleId === vehicleId,
  );
  const items = state.items.filter((item) => item.buildId === buildId);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    title: "",
    note: "",
    phaseId: "",
    priority: "next",
    estimatedCost: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState("");

  if (!hydrated)
    return (
      <div className="min-h-[680px] animate-pulse rounded-[2rem] bg-white/[0.04]" />
    );
  if (!vehicle || !build)
    return (
      <div className="py-32 text-center">
        <p className="text-muted-foreground">Build not found.</p>
        <Link
          href={`/garage/${vehicleId}/builds`}
          className="bg-primary text-primary-foreground mt-5 inline-flex rounded-xl px-5 py-3 text-sm font-semibold"
        >
          Return to builds
        </Link>
      </div>
    );

  const planning = planningForBuild(build);

  function submitItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const selectedPhaseId = form.phaseId || planning.currentPhaseId;
    const legacyStage = buildStages.includes(selectedPhaseId as BuildStage)
      ? (selectedPhaseId as BuildStage)
      : "appearance";
    const result = buildItemInputSchema.safeParse({
      buildId,
      ...form,
      phaseId: selectedPhaseId,
      stage: legacyStage,
      status: "planned",
    });
    if (!result.success) {
      const next: Record<string, string> = {};
      for (const issue of result.error.issues)
        next[String(issue.path[0])] ??= issue.message;
      setErrors(next);
      return;
    }
    try {
      createBuildItem(result.data, window.localStorage);
      trackAnalytics("build_item_added");
      activateGarage(vehicleId, "modification");
      announceBuildChange();
      setSaveError("");
    } catch {
      setSaveError(
        "Could not save this modification. Your input is still here; check browser storage and try again.",
      );
      return;
    }
    setForm({
      title: "",
      note: "",
      phaseId: "",
      priority: "next",
      estimatedCost: "",
    });
    setErrors({});
    setAdding(false);
  }

  function changeItemStatus(itemId: string, status: BuildItemStatus) {
    try {
      updateBuildItemStatus(itemId, status, window.localStorage);
      announceBuildChange();
      setSaveError("");
    } catch (caught) {
      setSaveError(
        caught instanceof Error
          ? caught.message
          : "Status was not saved. Check browser storage and try again.",
      );
    }
  }

  function changeBuildStatus(status: (typeof buildStatuses)[number]) {
    try {
      updateBuildStatus(buildId, status, window.localStorage);
      announceBuildChange();
      setSaveError("");
    } catch {
      setSaveError(
        "Build status was not saved. Check browser storage and try again.",
      );
    }
  }

  return (
    <div className="pb-24 sm:pb-0">
      <Link
        href={`/garage/${vehicleId}/builds`}
        className="text-muted-foreground hover:text-foreground mb-7 inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="size-4" /> All builds
      </Link>

      <header className="bg-card relative overflow-hidden rounded-[2rem] border border-white/10 p-6 sm:p-9 lg:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_25%,rgba(184,199,217,0.18),transparent_30%)]" />
        <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
              {build.goal} · {vehicle.productionYear} {vehicle.make}{" "}
              {vehicle.model}
            </p>
            <h1 className="mt-4 text-4xl font-medium tracking-[-0.05em] sm:text-7xl">
              {build.name}
            </h1>
            <p className="text-muted-foreground mt-5 max-w-2xl text-base leading-7">
              {build.description}
            </p>
          </div>
          <div>
            <p className="mb-3 text-xs tracking-[0.12em] text-white/65 uppercase">
              Build status
            </p>
            <div
              className={styles.statuses}
              role="group"
              aria-label="Build status"
            >
              {buildStatuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => changeBuildStatus(status)}
                  className={styles.status}
                  data-status={status}
                  aria-pressed={build.status === status}
                >
                  {progressCopy.statuses[status]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {saveError && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-red-300/30 p-4 text-red-200"
        >
          {saveError}
        </p>
      )}
      <BuildJourneyPanel build={build} items={items} />
      <BuildStoryPanel build={build} items={items} />
      <details className="mt-5 rounded-2xl border border-white/15 p-5">
        <summary className="cursor-pointer py-2 text-sm text-white/80">
          {copy.optional}
        </summary>
        <ConnectedBuildPlanner build={build} items={items} />
        <BuildWorkbench vehicle={vehicle} buildId={buildId} />
      </details>

      <section className="mt-5 grid gap-4 sm:grid-cols-2">
        <Link
          href={`/garage/${vehicleId}/builds/${buildId}/visualize`}
          className="group bg-card hover:border-primary/35 rounded-[2rem] border border-white/10 p-6 transition"
        >
          <Eye className="text-primary size-5" />
          <h2 className="mt-5 text-xl font-medium">Visualize this build</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Explore available 3D references and save a visual direction for this
            build.
          </p>
        </Link>
        <Link
          href={`/garage/${vehicleId}/builds/${buildId}/compatibility`}
          className="group bg-card hover:border-primary/35 rounded-[2rem] border border-white/10 p-6 transition"
        >
          <ShieldCheck className="text-primary size-5" />
          <h2 className="mt-5 text-xl font-medium">Check compatibility</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Surface fitment gaps, dependencies and part interactions.
          </p>
        </Link>
      </section>

      <div className="mt-5 flex items-center justify-between gap-5">
        <div>
          <p className="text-primary text-xs tracking-[0.14em] uppercase">
            Roadmap
          </p>
          <h2 className="mt-2 text-2xl font-medium tracking-[-0.025em]">
            Build in the right order.
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="bg-primary text-primary-foreground inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-semibold"
        >
          <Plus className="size-4" /> Add modification
        </button>
      </div>

      {adding && (
        <form
          onSubmit={submitItem}
          className="border-primary/25 bg-card mt-5 rounded-[2rem] border p-5 sm:p-7"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Add a concept modification</h3>
              <p className="text-muted-foreground mt-1 text-xs">
                Record an estimate, then compare live offers and check fitment
                evidence.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAdding(false)}
              aria-label="Close modification form"
              className="text-muted-foreground grid size-9 place-items-center rounded-lg hover:bg-white/5"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Modification" error={errors.title}>
              <input
                className={inputClass}
                placeholder="Dark rear lights"
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
              />
            </Field>
            <Field label="Build phase" error={errors.phaseId}>
              <select
                className={inputClass}
                value={form.phaseId || planning.currentPhaseId}
                onChange={(event) =>
                  setForm({ ...form, phaseId: event.target.value })
                }
              >
                {[...planning.phases]
                  .sort((left, right) => left.order - right.order)
                  .map((phase) => (
                    <option key={phase.id} value={phase.id}>
                      {phase.title}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="Priority">
              <select
                className={inputClass}
                value={form.priority}
                onChange={(event) =>
                  setForm({ ...form, priority: event.target.value })
                }
              >
                {buildPriorities.map((priority) => (
                  <option key={priority}>{priority}</option>
                ))}
              </select>
            </Field>
            <Field
              label="Estimated cost"
              hint="EUR"
              error={errors.estimatedCost}
            >
              <input
                className={inputClass}
                inputMode="numeric"
                placeholder="320"
                value={form.estimatedCost}
                onChange={(event) =>
                  setForm({ ...form, estimatedCost: event.target.value })
                }
              />
            </Field>
            <div className="md:col-span-2 xl:col-span-4">
              <Field label="Note" hint="Optional">
                <input
                  className={inputClass}
                  placeholder="What still needs verification?"
                  value={form.note}
                  onChange={(event) =>
                    setForm({ ...form, note: event.target.value })
                  }
                />
              </Field>
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              className="bg-primary text-primary-foreground inline-flex min-h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold"
            >
              <Check className="size-4" /> Add to roadmap
            </button>
          </div>
        </form>
      )}

      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        {[...planning.phases]
          .sort((left, right) => left.order - right.order)
          .map((phase, index) => {
            const content = stageContent[phase.id as BuildStage] ?? {
              number: String(index + 1).padStart(2, "0"),
              title: phase.title,
              description: "A custom phase in this build plan.",
              icon: Wrench,
            };
            const StageIcon = content.icon;
            const stageItems = items.filter(
              (item) => phaseForItem(item, planning)?.id === phase.id,
            );
            return (
              <article
                key={phase.id}
                className="bg-card overflow-hidden rounded-[2rem] border border-white/10"
              >
                <header className="flex items-start justify-between gap-4 border-b border-white/8 p-5 sm:p-7">
                  <div>
                    <p className="text-primary text-xs">{content.number}</p>
                    <h3 className="mt-2 text-xl font-medium">{phase.title}</h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {content.description}
                    </p>
                  </div>
                  <span className="text-muted-foreground grid size-10 place-items-center rounded-xl border border-white/8 bg-white/[0.03]">
                    <StageIcon className="size-4" />
                  </span>
                </header>
                <div className="divide-y divide-white/8">
                  {stageItems.map((item) => (
                    <div key={item.id} className="p-5 sm:p-6">
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-white/85">
                              {item.title}
                            </p>
                            <span className="text-muted-foreground rounded-full border border-white/8 px-2 py-1 text-[10px]">
                              {item.priority}
                            </span>
                          </div>
                          {item.note && (
                            <p className="text-muted-foreground mt-2 text-sm leading-6">
                              {item.note}
                            </p>
                          )}
                          <p className="text-muted-foreground mt-3 text-sm">
                            {copy.planned}:{" "}
                            {item.estimatedCostKnown === false
                              ? copy.moneyUnknown
                              : formatEuro(item.estimatedCost)}
                          </p>
                          <p className="mt-2 text-sm text-white/65">
                            {copy.actual}:{" "}
                            {actualItemCost(item) === undefined
                              ? copy.moneyUnknown
                              : formatEuro(actualItemCost(item)!)}
                          </p>
                          {item.selectedOfferId && (
                            <p className="text-primary mt-2 text-xs">
                              {item.merchantName} offer saved · observed{" "}
                              {item.deliveredPrice?.toFixed(2)} EUR incl. quoted
                              shipping · fitment evidence attached
                            </p>
                          )}
                          {item.selectedOfferUrl && (
                            <a
                              href={item.selectedOfferUrl}
                              target="_blank"
                              rel="sponsored noopener noreferrer"
                              className="mt-2 inline-flex min-h-11 items-center text-sm underline"
                            >
                              Review saved retailer offer
                            </a>
                          )}
                          {item.status === "planned" && (
                            <Link
                              href={`/garage/${vehicleId}/builds/${buildId}/parts?item=${encodeURIComponent(item.id)}`}
                              className="text-foreground mt-2 inline-flex min-h-11 items-center text-sm underline"
                            >
                              Compare offers for this modification →
                            </Link>
                          )}
                        </div>
                      </div>
                      <BuildTaskCompletion
                        vehicleId={vehicleId}
                        item={item}
                        onStatusChange={changeItemStatus}
                      />
                    </div>
                  ))}
                  {stageItems.length === 0 && (
                    <div className="text-muted-foreground p-7 text-sm">
                      No modifications in this stage yet.
                    </div>
                  )}
                </div>
              </article>
            );
          })}
      </section>

      <aside className="border-primary/15 bg-primary/6 text-muted-foreground mt-5 flex items-start gap-3 rounded-2xl border p-5 text-sm leading-6">
        <ShieldCheck className="text-primary mt-0.5 size-4 shrink-0" />
        <p>
          This is a planning roadmap. “Planned” does not mean compatible,
          road-legal or safe. Confirm the exact engine, part number and approval
          documents before purchasing. Stage totals are planning estimates;
          record paid amounts in the purchase workflow to update Cost Analytics
          once.
        </p>
      </aside>
    </div>
  );
}

const inputClass =
  "mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60";

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="text-muted-foreground block text-xs">
      <span>{label}</span>
      {hint && <span className="text-muted-foreground ml-2">{hint}</span>}
      {children}
      {error && <span className="mt-1.5 block text-red-300">{error}</span>}
    </label>
  );
}
function formatEuro(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}
