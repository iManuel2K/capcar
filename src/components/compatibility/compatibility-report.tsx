"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Ban,
  CheckCircle2,
  CircleHelp,
  Eye,
  FileQuestion,
  GitMerge,
  PackageCheck,
  Scale,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { useSyncExternalStore } from "react";

import { useBuildState } from "@/features/builds/use-builds";
import {
  evaluateBuildCompatibility,
  type CompatibilityFinding,
  type CompatibilitySeverity,
} from "@/features/compatibility/compatibility-engine";
import { useVehicles } from "@/features/vehicles/use-vehicles";

const severityContent: Record<
  CompatibilitySeverity,
  { label: string; icon: LucideIcon; className: string }
> = {
  block: {
    label: "Block",
    icon: Ban,
    className: "border-red-300/20 bg-red-300/8 text-red-200",
  },
  review: {
    label: "Review",
    icon: AlertTriangle,
    className: "border-amber-300/20 bg-amber-300/8 text-amber-100/75",
  },
  info: {
    label: "Information",
    icon: CircleHelp,
    className: "border-[#e72d45]/20 bg-[#e72d45]/8 text-[#a9c7ff]",
  },
};

const categoryIcons: Record<CompatibilityFinding["category"], LucideIcon> = {
  fitment: PackageCheck,
  interaction: GitMerge,
  dependency: ArrowRight,
  legal: Scale,
  data: FileQuestion,
};

export function CompatibilityReport({
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

  if (!hydrated)
    return (
      <div className="min-h-[720px] animate-pulse rounded-[2rem] bg-white/[0.04]" />
    );
  if (!vehicle || !build)
    return (
      <div className="py-32 text-center text-white/45">Build not found.</div>
    );

  const report = evaluateBuildCompatibility({ vehicle, items });
  const blocked = report.findings.filter(
    (finding) => finding.severity === "block",
  ).length;
  const reviews = report.findings.filter(
    (finding) => finding.severity === "review",
  ).length;
  const status =
    report.status === "blocked"
      ? {
          label: "Build blocked",
          detail: "At least one structured mismatch must be resolved.",
          icon: Ban,
          className: "border-red-300/25 bg-red-300/8 text-red-100",
        }
      : report.status === "review_required"
        ? {
            label: "Review required",
            detail: "Open questions remain before purchase or installation.",
            icon: AlertTriangle,
            className: "border-amber-300/25 bg-amber-300/8 text-amber-100",
          }
        : {
            label: "Ready for the next check",
            detail: "No known demo rule blocked the current configuration.",
            icon: CheckCircle2,
            className:
              "border-emerald-300/25 bg-emerald-300/8 text-emerald-100",
          };
  const StatusIcon = status.icon;

  return (
    <div className="pb-24 sm:pb-0">
      <Link
        href={`/garage/${vehicleId}/builds/${buildId}`}
        className="mb-7 inline-flex items-center gap-2 text-sm text-white/45 hover:text-white"
      >
        <ArrowLeft className="size-4" /> Build roadmap
      </Link>
      <header className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_84%_15%,rgba(231,45,69,0.18),transparent_30%),#111111] p-6 sm:p-10">
        <p className="text-xs font-semibold tracking-[0.15em] text-[#ff667a] uppercase">
          Epic 16 · Build compatibility
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
          Check the combination, not only each part.
        </h1>
        <p className="mt-5 max-w-2xl leading-7 text-white/45">
          {build.name} · {vehicle.productionYear} {vehicle.make} {vehicle.model}
          . The report joins fitment rules, missing data, dependencies and
          part-to-part interactions.
        </p>
      </header>

      <section className="mt-5 grid gap-4 md:grid-cols-[1.35fr_0.65fr_0.65fr]">
        <article className={`rounded-[2rem] border p-6 ${status.className}`}>
          <StatusIcon className="size-5" />
          <h2 className="mt-6 text-2xl font-medium">{status.label}</h2>
          <p className="mt-2 text-sm opacity-60">{status.detail}</p>
        </article>
        <Metric label="Blocking findings" value={String(blocked)} />
        <Metric label="Reviews needed" value={String(reviews)} />
      </section>

      <section className="mt-5 rounded-[2rem] border border-white/10 bg-[#111111] p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs tracking-[0.14em] text-white/30 uppercase">
              Findings
            </p>
            <h2 className="mt-2 text-2xl font-medium">
              {report.findings.length} checks surfaced
            </h2>
          </div>
          <p className="text-xs text-white/30">
            {report.structuredItems} structured · {report.unstructuredItems}{" "}
            manual items
          </p>
        </div>
        <div className="mt-7 space-y-3">
          {report.findings.map((finding) => {
            const severity = severityContent[finding.severity];
            const SeverityIcon = severity.icon;
            const CategoryIcon = categoryIcons[finding.category];
            return (
              <article
                key={finding.id}
                className="rounded-2xl border border-white/8 bg-black/10 p-5"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/8 text-white/35">
                      <CategoryIcon className="size-4" />
                    </span>
                    <div>
                      <p className="font-medium text-white/80">
                        {finding.title}
                      </p>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-white/40">
                        {finding.detail}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border px-2.5 py-1 text-[10px] uppercase ${severity.className}`}
                  >
                    <SeverityIcon className="size-3" /> {severity.label}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2">
        <Link
          href={`/garage/${vehicleId}/parts`}
          className="group rounded-[2rem] border border-white/10 bg-[#111111] p-6 hover:border-white/20"
        >
          <PackageCheck className="size-5 text-[#ff667a]" />
          <h2 className="mt-5 text-xl font-medium">Review catalogue parts</h2>
          <p className="mt-2 text-sm text-white/40">
            Replace manual items or mismatches with structured alternatives.
          </p>
        </Link>
        <Link
          href={`/garage/${vehicleId}/builds/${buildId}/visualize`}
          className="group rounded-[2rem] border border-white/10 bg-[#111111] p-6 hover:border-white/20"
        >
          <Eye className="size-5 text-[#ff667a]" />
          <h2 className="mt-5 text-xl font-medium">Return to concept</h2>
          <p className="mt-2 text-sm text-white/40">
            Adjust the visual direction while keeping technical claims separate.
          </p>
        </Link>
      </section>

      <aside className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-300/15 bg-amber-300/6 p-5 text-sm leading-6 text-white/45">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-200" />
        This is a conservative demo rule engine, not a fitment guarantee, legal
        approval or safety certification. Resolve every review with
        authoritative vehicle and product data.
      </aside>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-[2rem] border border-white/10 bg-[#111111] p-6">
      <p className="text-4xl font-medium tracking-[-0.04em]">{value}</p>
      <p className="mt-3 text-xs text-white/35">{label}</p>
    </article>
  );
}
