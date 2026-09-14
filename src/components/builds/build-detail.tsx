"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CircleGauge,
  Eye,
  Gauge,
  Layers3,
  Plus,
  ShieldCheck,
  Sparkles,
  WalletCards,
  Wrench,
  X,
} from "lucide-react";
import { useState, useSyncExternalStore } from "react";

import { getBuildMetrics } from "@/features/builds/build-metrics";
import {
  buildItemInputSchema,
  buildItemStatuses,
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
    stage: "appearance",
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
        <p className="text-white/45">Build not found.</p>
        <Link
          href={`/garage/${vehicleId}/builds`}
          className="mt-5 inline-flex rounded-xl bg-[#e72d45] px-5 py-3 text-sm font-semibold text-[#07101d]"
        >
          Return to builds
        </Link>
      </div>
    );

  const metrics = getBuildMetrics(build, items);

  function submitItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = buildItemInputSchema.safeParse({
      buildId,
      ...form,
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
      stage: "appearance",
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
    } catch {
      setSaveError(
        "Status was not saved. Check browser storage and try again.",
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
        className="mb-7 inline-flex items-center gap-2 text-sm text-white/45 hover:text-white"
      >
        <ArrowLeft className="size-4" /> All builds
      </Link>

      <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#111111] p-6 sm:p-9 lg:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_25%,rgba(231,45,69,0.18),transparent_30%)]" />
        <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-[#ff667a] uppercase">
              {build.goal} · {vehicle.productionYear} {vehicle.make}{" "}
              {vehicle.model}
            </p>
            <h1 className="mt-4 text-4xl font-medium tracking-[-0.05em] sm:text-7xl">
              {build.name}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/50">
              {build.description}
            </p>
          </div>
          <div>
            <p className="mb-3 text-xs tracking-[0.12em] text-white/30 uppercase">
              Build status
            </p>
            <div className="flex flex-wrap gap-2">
              {buildStatuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => changeBuildStatus(status)}
                  className={`rounded-full border px-3.5 py-2 text-xs capitalize ${build.status === status ? "border-[#e72d45]/50 bg-[#e72d45]/12 text-[#bad1ff]" : "border-white/10 text-white/40"}`}
                >
                  {status.replace("_", " ")}
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
      <BuildWorkbench vehicle={vehicle} buildId={buildId} />
      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Budget"
          value={formatEuro(build.budget)}
          icon={WalletCards}
        />
        <MetricCard
          label="Planned total"
          value={formatEuro(metrics.plannedTotal)}
          icon={Layers3}
        />
        <MetricCard
          label="Installed estimate"
          value={formatEuro(metrics.installedSpend)}
          icon={Check}
        />
        <MetricCard
          label="Remaining"
          value={formatEuro(metrics.remainingBudget)}
          icon={Sparkles}
          warning={metrics.remainingBudget < 0}
        />
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2">
        <Link
          href={`/garage/${vehicleId}/builds/${buildId}/visualize`}
          className="group rounded-[2rem] border border-white/10 bg-[#111111] p-6 transition hover:border-[#e72d45]/35"
        >
          <Eye className="size-5 text-[#ff667a]" />
          <h2 className="mt-5 text-xl font-medium">Visualize this build</h2>
          <p className="mt-2 text-sm leading-6 text-white/40">
            Explore available 3D references and save a visual direction for this
            build.
          </p>
        </Link>
        <Link
          href={`/garage/${vehicleId}/builds/${buildId}/compatibility`}
          className="group rounded-[2rem] border border-white/10 bg-[#111111] p-6 transition hover:border-[#e72d45]/35"
        >
          <ShieldCheck className="size-5 text-[#ff667a]" />
          <h2 className="mt-5 text-xl font-medium">Check compatibility</h2>
          <p className="mt-2 text-sm leading-6 text-white/40">
            Surface fitment gaps, dependencies and part interactions.
          </p>
        </Link>
      </section>

      <section className="mt-5 rounded-[2rem] border border-white/10 bg-[#111111] p-5 sm:p-7">
        <div className="flex items-center justify-between gap-5">
          <div>
            <p className="text-xs tracking-[0.12em] text-white/30 uppercase">
              Overall progress
            </p>
            <p className="mt-2 text-xl font-medium">
              {metrics.progress}% installed
            </p>
          </div>
          <span className="text-sm text-white/35">
            {items.filter((item) => item.status === "installed").length} /{" "}
            {items.length} items
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Installed modifications"
          aria-valuenow={metrics.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-5 h-2 overflow-hidden rounded-full bg-white/8"
        >
          <div
            className="h-full rounded-full bg-[#e72d45] transition-all"
            style={{ width: `${metrics.progress}%` }}
          />
        </div>
      </section>

      <div className="mt-5 flex items-center justify-between gap-5">
        <div>
          <p className="text-xs tracking-[0.14em] text-[#ff667a] uppercase">
            Roadmap
          </p>
          <h2 className="mt-2 text-2xl font-medium tracking-[-0.025em]">
            Build in the right order.
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-[#e72d45] px-4 text-sm font-semibold text-[#07101d]"
        >
          <Plus className="size-4" /> Add modification
        </button>
      </div>

      {adding && (
        <form
          onSubmit={submitItem}
          className="mt-5 rounded-[2rem] border border-[#e72d45]/25 bg-[#121813] p-5 sm:p-7"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Add a concept modification</h3>
              <p className="mt-1 text-xs text-white/35">
                Record an estimate, then compare live offers and check fitment
                evidence.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAdding(false)}
              aria-label="Close modification form"
              className="grid size-9 place-items-center rounded-lg text-white/40 hover:bg-white/5"
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
            <Field label="Stage" error={errors.stage}>
              <select
                className={inputClass}
                value={form.stage}
                onChange={(event) =>
                  setForm({ ...form, stage: event.target.value })
                }
              >
                {buildStages.map((stage) => (
                  <option key={stage}>{stage}</option>
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
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#e72d45] px-5 text-sm font-semibold text-[#07101d]"
            >
              <Check className="size-4" /> Add to roadmap
            </button>
          </div>
        </form>
      )}

      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        {buildStages.map((stage) => {
          const content = stageContent[stage];
          const StageIcon = content.icon;
          const stageItems = items.filter((item) => item.stage === stage);
          return (
            <article
              key={stage}
              className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#111111]"
            >
              <header className="flex items-start justify-between gap-4 border-b border-white/8 p-5 sm:p-7">
                <div>
                  <p className="text-xs text-[#ff667a]">{content.number}</p>
                  <h3 className="mt-2 text-xl font-medium">{content.title}</h3>
                  <p className="mt-1 text-sm text-white/35">
                    {content.description}
                  </p>
                </div>
                <span className="grid size-10 place-items-center rounded-xl border border-white/8 bg-white/[0.03] text-white/45">
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
                          <span className="rounded-full border border-white/8 px-2 py-1 text-[10px] text-white/35">
                            {item.priority}
                          </span>
                        </div>
                        {item.note && (
                          <p className="mt-2 text-sm leading-6 text-white/35">
                            {item.note}
                          </p>
                        )}
                        <p className="mt-3 text-sm text-white/55">
                          {formatEuro(item.estimatedCost)}
                        </p>
                        {item.selectedOfferId && (
                          <p className="mt-2 text-xs text-[#c98f72]">
                            {item.merchantName} offer saved · observed{" "}
                            {item.deliveredPrice?.toFixed(2)} EUR incl. quoted
                            shipping · fitment unverified
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
                            className="mt-2 inline-flex min-h-11 items-center text-sm text-[#eee7d8] underline"
                          >
                            Compare offers for this modification →
                          </Link>
                        )}
                      </div>
                      <select
                        aria-label={`Status for ${item.title}`}
                        disabled={Boolean(item.workbench?.purchase)}
                        value={item.status}
                        onChange={(event) =>
                          changeItemStatus(
                            item.id,
                            event.target.value as BuildItemStatus,
                          )
                        }
                        className="min-h-10 rounded-xl border border-white/10 bg-[#0d0d0d] px-3 text-xs text-white/65 capitalize outline-none"
                      >
                        {buildItemStatuses.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
                {stageItems.length === 0 && (
                  <div className="p-7 text-sm text-white/30">
                    No modifications in this stage yet.
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </section>

      <aside className="mt-5 flex items-start gap-3 rounded-2xl border border-[#e72d45]/15 bg-[#e72d45]/6 p-5 text-sm leading-6 text-white/40">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#ff667a]" />
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
  "mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#0d0d0d] px-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#e72d45]/60";

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
    <label className="block text-xs text-white/55">
      <span>{label}</span>
      {hint && <span className="ml-2 text-white/25">{hint}</span>}
      {children}
      {error && <span className="mt-1.5 block text-red-300">{error}</span>}
    </label>
  );
}
function MetricCard({
  label,
  value,
  icon: Icon,
  warning = false,
}: {
  label: string;
  value: string;
  icon: typeof WalletCards;
  warning?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111111] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/40">{label}</p>
        <Icon
          className={`size-4 ${warning ? "text-red-200" : "text-[#ff667a]"}`}
        />
      </div>
      <p
        className={`mt-8 text-3xl font-medium tracking-[-0.035em] ${warning ? "text-red-200" : ""}`}
      >
        {value}
      </p>
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
