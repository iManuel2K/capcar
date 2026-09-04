"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  CircleHelp,
  Clock3,
  FileText,
  Gauge,
  Layers3,
  PackageCheck,
  Plus,
  ShieldAlert,
  ShoppingBag,
  Wrench,
} from "lucide-react";
import { useState, useSyncExternalStore } from "react";

import { announceBuildChange } from "@/features/builds/build-storage";
import { useBuildState } from "@/features/builds/use-builds";
import { addCatalogPartToBuild } from "@/features/parts/add-part-to-build";
import { evaluateFitment, type FitmentStatus } from "@/features/parts/fitment";
import { findCatalogPart } from "@/features/parts/part-catalog";
import { useVehicles } from "@/features/vehicles/use-vehicles";

const fitmentContent: Record<
  FitmentStatus,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  match: {
    label: "Structured demo match",
    className: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
    icon: CheckCircle2,
  },
  conditional: {
    label: "Conditional demo match",
    className: "border-amber-300/20 bg-amber-300/10 text-amber-200",
    icon: AlertTriangle,
  },
  unverified: {
    label: "Not enough data",
    className: "border-white/10 bg-white/[0.04] text-white/50",
    icon: CircleHelp,
  },
  mismatch: {
    label: "Demo mismatch",
    className: "border-red-300/20 bg-red-300/10 text-red-200",
    icon: ShieldAlert,
  },
};

export function PartDetail({
  vehicleId,
  partId,
}: {
  vehicleId: string;
  partId: string;
}) {
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const { vehicles } = useVehicles();
  const buildState = useBuildState();
  const vehicle = vehicles.find((candidate) => candidate.id === vehicleId);
  const part = findCatalogPart(partId);
  const vehicleBuilds = buildState.builds.filter(
    (build) => build.vehicleId === vehicleId,
  );
  const [selectedBuildId, setSelectedBuildId] = useState("");
  const [message, setMessage] = useState("");

  if (!hydrated)
    return (
      <div className="min-h-[680px] animate-pulse rounded-[2rem] bg-white/[0.04]" />
    );
  if (!vehicle || !part)
    return (
      <div className="py-32 text-center">
        <p className="text-white/45">Part or vehicle not found.</p>
        <Link
          href={`/garage/${vehicleId}/parts`}
          className="mt-5 inline-flex rounded-xl bg-[#74a7ff] px-5 py-3 text-sm font-semibold text-[#07101d]"
        >
          Return to parts
        </Link>
      </div>
    );

  const resolvedPart = part;

  const fitment = evaluateFitment(part, vehicle);
  const content = fitmentContent[fitment.status];
  const StatusIcon = content.icon;
  const alreadyAdded = selectedBuildId
    ? buildState.items.some(
        (item) =>
          item.buildId === selectedBuildId && item.catalogPartId === part.id,
      )
    : false;

  function addToBuild() {
    if (!selectedBuildId || fitment.status === "mismatch" || alreadyAdded)
      return;
    addCatalogPartToBuild(resolvedPart, selectedBuildId, window.localStorage);
    announceBuildChange();
    setMessage("Added to the selected build as a planned concept.");
  }

  return (
    <div className="pb-24 sm:pb-0">
      <Link
        href={`/garage/${vehicleId}/parts`}
        className="mb-7 inline-flex items-center gap-2 text-sm text-white/45 hover:text-white"
      >
        <ArrowLeft className="size-4" /> All parts
      </Link>

      <section className="grid overflow-hidden rounded-[2rem] border border-white/10 bg-[#111512] lg:grid-cols-[0.92fr_1.08fr]">
        <div className="relative min-h-[420px] overflow-hidden bg-[radial-gradient(circle_at_50%_48%,rgba(116,167,255,0.25),transparent_30%),#0d110f] p-7">
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[11px] tracking-[0.12em] text-white/45 uppercase">
            Demo product
          </span>
          <Wrench className="absolute top-1/2 left-1/2 size-52 -translate-x-1/2 -translate-y-1/2 rotate-[-20deg] text-white/[0.07]" />
          <div className="absolute right-7 bottom-7 left-7 flex items-end justify-between gap-5">
            <div>
              <p className="text-sm text-white/35">
                {part.category} · {part.quality}
              </p>
              <p className="mt-2 text-xs text-white/25">{part.partNumber}</p>
            </div>
            <p className="text-3xl font-medium tracking-[-0.035em]">
              {formatEuro(part.estimatedPrice)}
            </p>
          </div>
        </div>
        <div className="flex flex-col p-6 sm:p-10 lg:p-12">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#8ab7ff] uppercase">
            {part.brand}
          </p>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.045em] text-balance sm:text-6xl">
            {part.name}
          </h1>
          <p className="mt-5 leading-7 text-white/45">{part.summary}</p>
          <div className="mt-7">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs ${content.className}`}
            >
              <StatusIcon className="size-3.5" /> {content.label}
            </span>
          </div>
          <div className="mt-9 grid gap-3 sm:grid-cols-2">
            <Spec icon={Gauge} label="Difficulty" value={part.difficulty} />
            <Spec
              icon={Clock3}
              label="Estimated time"
              value={`${part.installationMinutes} min`}
            />
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-white/10 bg-[#111512] p-6 sm:p-8">
          <p className="text-xs tracking-[0.14em] text-white/30 uppercase">
            Fitment evidence
          </p>
          <h2 className="mt-2 text-2xl font-medium">Why this result appears</h2>
          <div className="mt-6 divide-y divide-white/8 overflow-hidden rounded-2xl border border-white/8">
            {fitment.checks.map((check) => (
              <div
                key={check.label}
                className="grid gap-3 p-4 sm:grid-cols-[130px_1fr_auto] sm:items-center"
              >
                <span className="text-xs text-white/35">{check.label}</span>
                <span className="text-sm text-white/65">
                  Expected {check.expected} · Your car {check.actual}
                </span>
                <span
                  className={
                    check.matched ? "text-emerald-200" : "text-red-200"
                  }
                >
                  {check.matched ? (
                    <Check className="size-4" />
                  ) : (
                    <AlertTriangle className="size-4" />
                  )}
                </span>
              </div>
            ))}
          </div>
          {fitment.conditions.length > 0 && (
            <div className="mt-6">
              <p className="text-xs tracking-[0.12em] text-amber-200/70 uppercase">
                Still verify
              </p>
              <ul className="mt-3 space-y-2">
                {fitment.conditions.map((condition) => (
                  <li
                    key={condition}
                    className="flex items-start gap-2 text-sm leading-6 text-white/45"
                  >
                    <AlertTriangle className="mt-1 size-3.5 shrink-0 text-amber-200" />{" "}
                    {condition}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside className="rounded-[2rem] border border-white/10 bg-[#111512] p-6 sm:p-8">
          <p className="text-xs tracking-[0.14em] text-white/30 uppercase">
            Add to roadmap
          </p>
          <h2 className="mt-2 text-2xl font-medium">Connect part to build</h2>
          <p className="mt-4 text-sm leading-6 text-white/40">
            This creates a planned modification using the demo price and correct
            build stage.
          </p>
          {vehicleBuilds.length > 0 ? (
            <>
              <select
                value={selectedBuildId}
                onChange={(event) => {
                  setSelectedBuildId(event.target.value);
                  setMessage("");
                }}
                className="mt-6 min-h-12 w-full rounded-xl border border-white/10 bg-[#0d110f] px-4 text-sm text-white/70 outline-none"
              >
                <option value="">Select a build</option>
                {vehicleBuilds.map((build) => (
                  <option key={build.id} value={build.id}>
                    {build.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={
                  !selectedBuildId ||
                  fitment.status === "mismatch" ||
                  alreadyAdded
                }
                onClick={addToBuild}
                className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#74a7ff] px-4 text-sm font-semibold text-[#07101d] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <Plus className="size-4" />{" "}
                {alreadyAdded ? "Already in this build" : "Add as planned"}
              </button>
              {message && (
                <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-emerald-200/70">
                  <PackageCheck className="mt-0.5 size-3.5 shrink-0" />{" "}
                  {message}
                </p>
              )}
            </>
          ) : (
            <Link
              href={`/garage/${vehicleId}/builds/new`}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#74a7ff] px-4 text-sm font-semibold text-[#07101d]"
            >
              <Layers3 className="size-4" /> Create a build first
            </Link>
          )}
        </aside>
      </section>

      <section className="mt-5 grid gap-5 md:grid-cols-2">
        <InfoCard
          icon={ShoppingBag}
          title="Required items"
          items={
            part.requiredItems.length > 0
              ? part.requiredItems
              : ["No additional items listed in demo data"]
          }
        />
        <InfoCard icon={FileText} title="Documents" items={part.documents} />
      </section>

      <aside className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-300/15 bg-amber-300/6 p-5 text-sm leading-6 text-white/45">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-200" />
        <p>
          This is fictional catalogue data for UX testing. Do not buy or install
          a product based on this page. Verify the OE number, vehicle options,
          dimensions, safety procedure and legal documentation from
          authoritative sources.
        </p>
      </aside>
    </div>
  );
}

function Spec({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
      <Icon className="size-4 text-[#8ab7ff]" />
      <p className="mt-5 text-[11px] tracking-[0.12em] text-white/30 uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm text-white/70">{value}</p>
    </div>
  );
}
function InfoCard({
  icon: Icon,
  title,
  items,
}: {
  icon: typeof ShoppingBag;
  title: string;
  items: string[];
}) {
  return (
    <article className="rounded-[2rem] border border-white/10 bg-[#111512] p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <Icon className="size-4 text-[#8ab7ff]" />
        <h2 className="font-medium">{title}</h2>
      </div>
      <ul className="mt-6 space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 text-sm leading-6 text-white/45"
          >
            <Check className="mt-1 size-3.5 shrink-0 text-white/30" /> {item}
          </li>
        ))}
      </ul>
    </article>
  );
}
function formatEuro(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}
