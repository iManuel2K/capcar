"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  Clock3,
  Disc3,
  Droplets,
  FileCheck2,
  Filter,
  Gauge,
  Lightbulb,
  PackageSearch,
  Search,
  ShoppingBag,
  Sparkles,
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

const categoryVisual: Record<
  PartCategory,
  { icon: typeof Wrench; accent: string }
> = {
  Service: { icon: Droplets, accent: "text-sky-300" },
  Brakes: { icon: Disc3, accent: "text-red-300" },
  Suspension: { icon: Gauge, accent: "text-violet-300" },
  Wheels: { icon: Disc3, accent: "text-zinc-200" },
  Exterior: { icon: Sparkles, accent: "text-rose-300" },
  Lighting: { icon: Lightbulb, accent: "text-amber-200" },
  Performance: { icon: Wrench, accent: "text-[#ff667a]" },
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
  const [providerName, setProviderName] = useState("CapCar catalogue demo");
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
          className="mt-5 inline-flex rounded-xl bg-[#e72d45] px-5 py-3 text-sm font-semibold text-[#07101d]"
        >
          Return to garage
        </Link>
      </div>
    );

  return (
    <div className="pb-24 sm:pb-0">
      <Link
        href="/international-parts"
        className="mb-5 inline-flex rounded-xl border border-[#e72d45]/40 px-4 py-3 text-sm text-[#ff667a]"
      >
        Search Germany & international offers ↗
      </Link>
      <Link
        href={`/garage/${vehicleId}`}
        className="mb-7 inline-flex items-center gap-2 text-sm text-white/45 hover:text-white"
      >
        <ArrowLeft className="size-4" /> {vehicle.productionYear} {vehicle.make}{" "}
        {vehicle.model}
      </Link>

      <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#111111] p-6 sm:p-9 lg:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_20%,rgba(231,45,69,0.16),transparent_28%)]" />
        <div className="relative">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#ff667a] uppercase">
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

      <section className="mt-5 grid gap-3 sm:grid-cols-3">
        <ReadinessStat
          icon={CheckCircle2}
          label="Vehicle context"
          value={`${vehicle.platform} · ${vehicle.engineCode}`}
          tone="green"
        />
        <ReadinessStat
          icon={PackageSearch}
          label="Demo catalogue"
          value={`${providerResults.length || 16} prepared products`}
          tone="red"
        />
        <ReadinessStat
          icon={ShoppingBag}
          label="Comparison depth"
          value="3 offers per product"
          tone="amber"
        />
      </section>

      <section className="sticky top-20 z-30 mt-5 rounded-2xl border border-white/10 bg-[#111111]/95 p-4 shadow-xl backdrop-blur-xl sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <label className="relative">
            <span className="sr-only">Search parts</span>
            <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/30" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search lights, brakes, part number…"
              className="min-h-12 w-full rounded-xl border border-white/10 bg-[#0d0d0d] pr-4 pl-11 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#e72d45]/60"
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
              className="min-h-12 min-w-48 rounded-xl border border-white/10 bg-[#0d0d0d] pr-9 pl-11 text-sm text-white/70 outline-none"
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
              className="min-h-12 min-w-52 rounded-xl border border-white/10 bg-[#0d0d0d] pr-9 pl-11 text-sm text-white/70 outline-none"
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
            source={source}
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
  source,
  vehicleId,
}: {
  part: CatalogPart;
  status: FitmentStatus;
  conditions: number;
  source: "demo" | "external";
  vehicleId: string;
}) {
  const content = fitmentContent[status];
  const StatusIcon = content.icon;
  const visual = categoryVisual[part.category];
  const CategoryIcon = visual.icon;
  return (
    <Link
      href={`/garage/${vehicleId}/parts/${part.id}`}
      className="group overflow-hidden rounded-[2rem] border border-white/10 bg-[#111111] transition hover:-translate-y-1 hover:border-white/20"
    >
      <div className="relative min-h-48 overflow-hidden bg-[radial-gradient(circle_at_72%_42%,rgba(231,45,69,0.22),transparent_34%),#0d0d0d] p-6">
        <span className="absolute top-5 left-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[11px] font-semibold tracking-[0.12em] text-white/60 uppercase">
          <CategoryIcon className={`size-3.5 ${visual.accent}`} />{" "}
          {part.category}
        </span>
        <span className="absolute top-5 right-5 text-xs text-white/30">
          {part.partNumber}
        </span>
        <CategoryIcon
          className={`absolute right-[10%] bottom-[10%] size-28 rotate-[-12deg] opacity-[0.08] ${visual.accent}`}
        />
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
        <div className="mt-5 grid grid-cols-3 gap-2">
          <MiniSpec
            icon={ShoppingBag}
            label={source === "demo" ? "3 demo offers" : "Offers ready"}
          />
          <MiniSpec icon={Clock3} label={`${part.installationMinutes} min`} />
          <MiniSpec icon={FileCheck2} label={`${part.documents.length} docs`} />
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs ${content.className}`}
          >
            <StatusIcon className="size-3.5" /> {content.label}
            {conditions > 0 && ` · ${conditions}`}
          </span>
          <div className="flex items-center gap-4">
            <span className="text-right">
              <span className="block text-[10px] tracking-[0.1em] text-white/30 uppercase">
                from
              </span>
              <span className="font-medium">
                {formatEuro(part.estimatedPrice)}
              </span>
            </span>
            <ArrowRight className="size-4 text-white/35 transition group-hover:translate-x-1 group-hover:text-white" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function MiniSpec({
  icon: Icon,
  label,
}: {
  icon: typeof Wrench;
  label: string;
}) {
  return (
    <span className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-white/8 bg-white/[0.025] px-2 text-center text-[11px] text-white/50">
      <Icon className="size-3.5 shrink-0 text-[#ff667a]" /> {label}
    </span>
  );
}

function ReadinessStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Wrench;
  label: string;
  value: string;
  tone: "green" | "red" | "amber";
}) {
  const toneClass = {
    green: "bg-emerald-300/10 text-emerald-200",
    red: "bg-[#e72d45]/12 text-[#ff667a]",
    amber: "bg-amber-300/10 text-amber-200",
  }[tone];
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-[#111111] p-4">
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-xl ${toneClass}`}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold tracking-[0.12em] text-white/35 uppercase">
          {label}
        </p>
        <p className="mt-1 truncate text-sm font-medium text-white/80">
          {value}
        </p>
      </div>
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
