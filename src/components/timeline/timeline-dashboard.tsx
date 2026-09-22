"use client";

import {
  BadgeEuro,
  CalendarDays,
  CarFront,
  CheckCircle2,
  Clock3,
  Layers3,
  ShoppingBag,
  Wrench,
  ScanLine,
  type LucideIcon,
} from "lucide-react";
import { useState, useSyncExternalStore } from "react";

import {
  timelineCategories,
  type TimelineCategory,
} from "@/features/timeline/vehicle-timeline";
import { useVehicleTimeline } from "@/features/timeline/use-vehicle-timeline";
import { useVehicles } from "@/features/vehicles/use-vehicles";

const categoryContent: Record<
  TimelineCategory,
  { label: string; icon: LucideIcon; color: string }
> = {
  vehicle: { label: "Vehicle", icon: CarFront, color: "text-[#9ec2ff]" },
  maintenance: {
    label: "Maintenance",
    icon: Wrench,
    color: "text-emerald-200",
  },
  build: { label: "Build", icon: Layers3, color: "text-violet-200" },
  offer: { label: "Offer", icon: ShoppingBag, color: "text-amber-200" },
  installation: {
    label: "Installation",
    icon: CheckCircle2,
    color: "text-cyan-200",
  },
  diagnostic: {
    label: "Diagnostic",
    icon: ScanLine,
    color: "text-red-200",
  },
};

export function TimelineDashboard({ vehicleId }: { vehicleId: string }) {
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const { vehicles } = useVehicles();
  const events = useVehicleTimeline(vehicleId);
  const [filter, setFilter] = useState<"all" | TimelineCategory>("all");
  const vehicle = vehicles.find((candidate) => candidate.id === vehicleId);

  if (!hydrated)
    return (
      <div className="min-h-[720px] animate-pulse rounded-[2rem] bg-white/[0.04]" />
    );
  if (!vehicle)
    return (
      <div className="py-32 text-center text-white/45">Vehicle not found.</div>
    );

  const visible =
    filter === "all"
      ? events
      : events.filter((event) => event.category === filter);
  const completedCount = events.filter(
    (event) =>
      event.category === "maintenance" || event.category === "installation",
  ).length;
  const plannedCount = events.filter(
    (event) => event.category === "build",
  ).length;
  const recordedSpend = events
    .filter((event) => event.category === "offer")
    .reduce((sum, event) => sum + parseEuro(event.value), 0);

  return (
    <div className="pb-24 sm:pb-0">
      <header className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_82%_18%,rgba(231,45,69,0.18),transparent_28%),#111111] p-6 sm:p-10">
        <p className="text-xs font-semibold tracking-[0.15em] text-[#ff667a] uppercase">
          {vehicle.productionYear} {vehicle.make} {vehicle.model} ·{" "}
          {vehicle.platform}
        </p>
        <h1 className="mt-4 text-4xl font-medium tracking-[-0.05em] sm:text-7xl">
          One history for the car.
        </h1>
        <p className="mt-5 max-w-2xl leading-7 text-white/45">
          Maintenance, build plans, selected demo offers and completed guided
          workflows—combined automatically from your local CapCar records.
        </p>
      </header>

      <section className="mt-5 grid gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={CheckCircle2}
          label="Completed records"
          value={String(completedCount)}
        />
        <SummaryCard
          icon={Layers3}
          label="Build records"
          value={String(plannedCount)}
        />
        <SummaryCard
          icon={BadgeEuro}
          label="Selected demo total"
          value={formatEuro(recordedSpend)}
        />
      </section>

      <section className="mt-5 rounded-[2rem] border border-white/10 bg-[#111111] p-5 sm:p-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-xs tracking-[0.14em] text-white/30 uppercase">
              Vehicle timeline
            </p>
            <h2 className="mt-2 text-2xl font-medium">Newest activity first</h2>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <FilterButton
              active={filter === "all"}
              onClick={() => setFilter("all")}
            >
              All
            </FilterButton>
            {timelineCategories.map((category) => (
              <FilterButton
                key={category}
                active={filter === category}
                onClick={() => setFilter(category)}
              >
                {categoryContent[category].label}
              </FilterButton>
            ))}
          </div>
        </div>

        {visible.length > 0 ? (
          <div className="mt-8">
            {visible.map((event, index) => {
              const content = categoryContent[event.category];
              const Icon = content.icon;
              return (
                <article
                  key={event.id}
                  className="relative grid grid-cols-[44px_1fr] gap-4 pb-8 last:pb-0"
                >
                  {index < visible.length - 1 && (
                    <div className="absolute top-11 bottom-0 left-[21px] w-px bg-white/8" />
                  )}
                  <div className="relative z-10 grid size-11 place-items-center rounded-xl border border-white/10 bg-[#0d0d0d]">
                    <Icon className={`size-4 ${content.color}`} />
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.022] p-5">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <p className="text-[11px] tracking-[0.12em] text-white/30 uppercase">
                          {content.label}
                        </p>
                        <h3 className="mt-2 font-medium text-white/85">
                          {event.title}
                        </h3>
                      </div>
                      <time className="flex shrink-0 items-center gap-1.5 text-xs text-white/30">
                        <CalendarDays className="size-3.5" />
                        {formatDate(event.occurredAt)}
                      </time>
                    </div>
                    <div className="mt-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                      <p className="max-w-2xl text-sm leading-6 text-white/40">
                        {event.detail}
                      </p>
                      {event.value && (
                        <span className="shrink-0 text-sm font-medium text-white/65">
                          {event.value}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-white/10 py-20 text-center">
            <Clock3 className="mx-auto size-7 text-white/20" />
            <p className="mt-4 text-sm text-white/35">
              No records in this category yet.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#111111] p-5">
      <Icon className="size-4 text-[#ff667a]" />
      <p className="mt-5 text-2xl font-medium">{value}</p>
      <p className="mt-1 text-xs text-white/35">{label}</p>
    </article>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3.5 py-2 text-xs ${active ? "border-[#e72d45]/40 bg-[#e72d45]/12 text-[#bad1ff]" : "border-white/10 text-white/35"}`}
    >
      {children}
    </button>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatEuro(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function parseEuro(value?: string) {
  if (!value) return 0;
  const normalized = value
    .replace(/[^\d,.-]/g, "")
    .replaceAll(".", "")
    .replace(",", ".");
  return Number(normalized) || 0;
}
