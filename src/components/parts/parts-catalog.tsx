"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  Filter,
  PackageSearch,
  Search,
  SlidersHorizontal,
  Wrench,
} from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import type { FitmentStatus } from "@/features/parts/fitment";
import {
  partCategories,
  type CatalogPart,
  type PartCategory,
} from "@/features/parts/part-catalog";
import type {
  PartSearchResponse,
  ProviderPartResult,
} from "@/features/providers/provider-contracts";
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
    label: "Conditional",
    className: "border-amber-300/20 bg-amber-300/10 text-amber-200",
    icon: AlertTriangle,
  },
  unverified: {
    label: "Unverified",
    className: "border-white/10 bg-white/[0.04] text-white/50",
    icon: CircleHelp,
  },
  mismatch: {
    label: "Demo mismatch",
    className: "border-red-300/20 bg-red-300/10 text-red-200",
    icon: AlertTriangle,
  },
};

export function PartsCatalog({ vehicleId }: { vehicleId: string }) {
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const { vehicles } = useVehicles();
  const vehicle = vehicles.find((candidate) => candidate.id === vehicleId);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | PartCategory>("All");
  const [fitment, setFitment] = useState<"all" | FitmentStatus>("all");
  const [providerResults, setProviderResults] = useState<ProviderPartResult[]>(
    [],
  );
  const [providerName, setProviderName] = useState("Capcar catalogue demo");
  const [source, setSource] = useState<"demo" | "external">("demo");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!vehicle) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/catalog/search", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            vehicle: {
              vin: vehicle.vin,
              make: vehicle.make,
              model: vehicle.model,
              productionYear: vehicle.productionYear,
              platform: vehicle.platform,
              bodyStyle: vehicle.bodyStyle,
              engineCode: vehicle.engineCode,
              transmission: vehicle.transmission,
            },
            query,
            category,
          }),
          signal: controller.signal,
        });
        const body = (await response.json()) as
          PartSearchResponse | { error?: string };
        if (!response.ok || !("results" in body))
          throw new Error(
            "error" in body && body.error
              ? body.error
              : "Catalogue search failed.",
          );
        setProviderResults(body.results);
        setProviderName(body.provider);
        setSource(body.source);
      } catch (caught) {
        if (controller.signal.aborted) return;
        setProviderResults([]);
        setError(
          caught instanceof Error ? caught.message : "Catalogue search failed.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 220);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [category, query, vehicle]);

  const results = useMemo(() => {
    return providerResults.filter(
      ({ fitment: result }) => fitment === "all" || result.status === fitment,
    );
  }, [fitment, providerResults]);

  if (!hydrated)
    return (
      <div className="min-h-[650px] animate-pulse rounded-[2rem] bg-white/[0.04]" />
    );
  if (!vehicle)
    return (
      <div className="py-32 text-center">
        <p className="text-white/45">Vehicle not found.</p>
        <Link
          href="/garage"
          className="mt-5 inline-flex rounded-xl bg-[#74a7ff] px-5 py-3 text-sm font-semibold text-[#07101d]"
        >
          Return to garage
        </Link>
      </div>
    );

  return (
    <div className="pb-24 sm:pb-0">
      <Link
        href={`/garage/${vehicleId}`}
        className="mb-7 inline-flex items-center gap-2 text-sm text-white/45 hover:text-white"
      >
        <ArrowLeft className="size-4" /> {vehicle.productionYear} BMW{" "}
        {vehicle.model}
      </Link>

      <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#111512] p-6 sm:p-9 lg:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_20%,rgba(116,167,255,0.16),transparent_28%)]" />
        <div className="relative">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#8ab7ff] uppercase">
            Parts catalogue · {source} source
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-medium tracking-[-0.05em] text-balance sm:text-6xl">
            Search with the vehicle already in context.
          </h1>
          <p className="mt-5 max-w-2xl leading-7 text-white/50">
            Every result explains what matched, what remains conditional and
            what still needs authoritative verification.
          </p>
        </div>
      </header>

      <section className="sticky top-20 z-30 mt-5 rounded-2xl border border-white/10 bg-[#111512]/95 p-4 shadow-xl backdrop-blur-xl sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <label className="relative">
            <span className="sr-only">Search parts</span>
            <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/30" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search lights, brakes, part number…"
              className="min-h-12 w-full rounded-xl border border-white/10 bg-[#0d110f] pr-4 pl-11 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#74a7ff]/60"
            />
          </label>
          <label className="relative">
            <span className="sr-only">Category</span>
            <Filter className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/30" />
            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as "All" | PartCategory)
              }
              className="min-h-12 min-w-48 rounded-xl border border-white/10 bg-[#0d110f] pr-9 pl-11 text-sm text-white/70 outline-none"
            >
              <option>All</option>
              {partCategories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="relative">
            <span className="sr-only">Fitment status</span>
            <SlidersHorizontal className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/30" />
            <select
              value={fitment}
              onChange={(event) =>
                setFitment(event.target.value as "all" | FitmentStatus)
              }
              className="min-h-12 min-w-52 rounded-xl border border-white/10 bg-[#0d110f] pr-9 pl-11 text-sm text-white/70 outline-none"
            >
              <option value="all">All evidence states</option>
              <option value="match">Structured match</option>
              <option value="conditional">Conditional</option>
              <option value="mismatch">Mismatch</option>
            </select>
          </label>
        </div>
      </section>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-white/40">
          {loading ? "Searching provider…" : `${results.length} products`} ·{" "}
          {providerName}
        </p>
        <p className="hidden text-xs text-white/30 sm:block">
          Vehicle: {vehicle.platform} · {vehicle.engineCode} ·{" "}
          {vehicle.bodyStyle}
        </p>
      </div>

      <section className="mt-4 grid gap-5 xl:grid-cols-2">
        {results.map(({ part, fitment: result }) => (
          <PartCard
            key={part.id}
            part={part}
            status={result.status}
            conditions={result.conditions.length}
            vehicleId={vehicleId}
          />
        ))}
      </section>

      {error && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-300/15 bg-red-300/6 p-5 text-sm text-red-100/70">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" /> {error}
        </div>
      )}

      {!loading && !error && results.length === 0 && (
        <div className="mt-5 rounded-[2rem] border border-dashed border-white/12 py-20 text-center">
          <PackageSearch className="mx-auto size-7 text-white/30" />
          <h2 className="mt-5 text-xl font-medium">No catalogue results</h2>
          <p className="mt-2 text-sm text-white/35">
            Try another term or reset the filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("All");
              setFitment("all");
            }}
            className="mt-6 rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60"
          >
            Reset filters
          </button>
        </div>
      )}

      <aside className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-300/15 bg-amber-300/6 p-5 text-sm leading-6 text-white/45">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-200" />
        <p>
          {source === "demo"
            ? "Prototype catalogue only. "
            : "External provider result. "}
          A match is not purchase advice, guaranteed fitment or road approval.
          Confirm OE numbers, option codes, dimensions and documentation before
          buying.
        </p>
      </aside>
    </div>
  );
}

function PartCard({
  part,
  status,
  conditions,
  vehicleId,
}: {
  part: CatalogPart;
  status: FitmentStatus;
  conditions: number;
  vehicleId: string;
}) {
  const content = fitmentContent[status];
  const StatusIcon = content.icon;
  return (
    <Link
      href={`/garage/${vehicleId}/parts/${part.id}`}
      className="group overflow-hidden rounded-[2rem] border border-white/10 bg-[#111512] transition hover:-translate-y-1 hover:border-white/20"
    >
      <div className="relative min-h-52 overflow-hidden bg-[radial-gradient(circle_at_65%_45%,rgba(116,167,255,0.2),transparent_32%),#0d110f] p-6">
        <span className="absolute top-5 left-5 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[11px] tracking-[0.12em] text-white/40 uppercase">
          {part.category}
        </span>
        <span className="absolute top-5 right-5 text-xs text-white/30">
          {part.partNumber}
        </span>
        <Wrench className="absolute right-[12%] bottom-[15%] size-24 rotate-[-18deg] text-white/[0.06]" />
        <div className="absolute right-6 bottom-6 left-6">
          <p className="text-sm text-white/35">
            {part.brand} · {part.quality}
          </p>
          <h2 className="mt-2 text-2xl font-medium tracking-[-0.025em]">
            {part.name}
          </h2>
        </div>
      </div>
      <div className="p-6">
        <p className="text-sm leading-6 text-white/40">{part.summary}</p>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs ${content.className}`}
          >
            <StatusIcon className="size-3.5" /> {content.label}
            {conditions > 0 && ` · ${conditions}`}
          </span>
          <div className="flex items-center gap-4">
            <span className="font-medium">
              {formatEuro(part.estimatedPrice)}
            </span>
            <ArrowRight className="size-4 text-white/35 transition group-hover:translate-x-1 group-hover:text-white" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function formatEuro(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}
