"use client";

import Link from "next/link";
import { MaintenanceRepairPlans } from "@/components/diagnostics/repair-plan";
import {
  AlertTriangle,
  ArrowLeft,
  BatteryCharging,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  CircleGauge,
  Clock3,
  Droplets,
  Filter,
  Gauge,
  Info,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";

import type {
  MaintenanceStatus,
  MaintenanceTask,
} from "@/features/maintenance/maintenance-schema";
import { getMaintenanceStatus } from "@/features/maintenance/maintenance-status";
import {
  announceMaintenanceChange,
  completeMaintenanceTask,
  loadSampleMaintenanceHistory,
} from "@/features/maintenance/maintenance-storage";
import { useMaintenanceTasks } from "@/features/maintenance/use-maintenance-tasks";
import { useVehicles } from "@/features/vehicles/use-vehicles";

type FilterStatus = "all" | MaintenanceStatus;

const statusContent: Record<
  MaintenanceStatus,
  { label: string; className: string; icon: typeof Check }
> = {
  unknown: {
    label: "History needed",
    className: "border-white/10 bg-white/[0.04] text-white/55",
    icon: Clock3,
  },
  overdue: {
    label: "Due now",
    className: "border-red-300/20 bg-red-300/10 text-red-200",
    icon: AlertTriangle,
  },
  soon: {
    label: "Due soon",
    className: "border-amber-300/20 bg-amber-300/10 text-amber-200",
    icon: CalendarClock,
  },
  good: {
    label: "Up to date",
    className: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
    icon: CheckCircle2,
  },
};

const categoryIcons: Record<MaintenanceTask["category"], typeof CircleGauge> = {
  Engine: Gauge,
  Fluids: Droplets,
  Filters: Filter,
  Brakes: CircleDot,
  Tyres: CircleGauge,
  Electrical: BatteryCharging,
  Inspection: RotateCcw,
};

export function MaintenanceDashboard({ vehicleId }: { vehicleId: string }) {
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const { vehicles } = useVehicles();
  const vehicle = vehicles.find((candidate) => candidate.id === vehicleId);
  const tasks = useMaintenanceTasks(vehicleId);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [activeTaskKey, setActiveTaskKey] = useState<string>();
  const [completedDate, setCompletedDate] = useState("");
  const [completedMileage, setCompletedMileage] = useState("");
  const [formError, setFormError] = useState("");
  const [savedTask, setSavedTask] = useState<string>();

  const withStatus = useMemo(
    () =>
      tasks.map((task) => ({
        task,
        status: getMaintenanceStatus(task, vehicle?.mileage ?? 0),
      })),
    [tasks, vehicle?.mileage],
  );
  const counts = useMemo(
    () => ({
      unknown: withStatus.filter((item) => item.status === "unknown").length,
      overdue: withStatus.filter((item) => item.status === "overdue").length,
      soon: withStatus.filter((item) => item.status === "soon").length,
      good: withStatus.filter((item) => item.status === "good").length,
    }),
    [withStatus],
  );
  const visible =
    filter === "all"
      ? withStatus
      : withStatus.filter((item) => item.status === filter);

  if (!hydrated) return <MaintenanceSkeleton />;

  if (!vehicle) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center text-center">
        <Wrench className="size-7 text-white/40" />
        <h1 className="mt-6 text-3xl font-medium">Vehicle not found</h1>
        <Link
          href="/garage"
          className="mt-7 rounded-xl bg-[#e72d45] px-5 py-3 text-sm font-semibold text-[#07101d]"
        >
          Return to garage
        </Link>
      </div>
    );
  }

  const currentMileage = vehicle.mileage;

  function openRecord(task: MaintenanceTask) {
    setActiveTaskKey(task.key);
    setCompletedDate(
      task.record?.lastCompletedDate ?? new Date().toISOString().slice(0, 10),
    );
    setCompletedMileage(
      String(task.record?.lastCompletedMileage ?? vehicle?.mileage ?? 0),
    );
    setFormError("");
    setSavedTask(undefined);
  }

  function submitRecord(
    event: React.FormEvent<HTMLFormElement>,
    task: MaintenanceTask,
  ) {
    event.preventDefault();
    const mileage = Number(completedMileage);
    const today = new Date().toISOString().slice(0, 10);

    if (!completedDate) {
      setFormError("Choose the service date.");
      return;
    }
    if (completedDate > today) {
      setFormError("The service date cannot be in the future.");
      return;
    }
    if (!Number.isInteger(mileage) || mileage < 0 || mileage > 2_000_000) {
      setFormError("Enter a valid vehicle mileage.");
      return;
    }

    completeMaintenanceTask(
      {
        vehicleId,
        taskKey: task.key,
        completedDate,
        completedMileage: mileage,
      },
      window.localStorage,
    );
    announceMaintenanceChange();
    setActiveTaskKey(undefined);
    setSavedTask(task.key);
  }

  function loadExample() {
    const accepted = window.confirm(
      "Add sample maintenance history to this local vehicle? Existing records for five demo tasks will be updated.",
    );
    if (!accepted) return;
    loadSampleMaintenanceHistory(
      vehicleId,
      currentMileage,
      window.localStorage,
    );
    announceMaintenanceChange();
  }

  return (
    <div className="pb-24 sm:pb-0">
      <MaintenanceRepairPlans vehicleId={vehicleId} />
      <Link
        href={`/garage/${vehicleId}`}
        className="mb-7 inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-white"
      >
        <ArrowLeft className="size-4" /> {vehicle.productionYear} {vehicle.make}{" "}
        {vehicle.model}
      </Link>

      <header className="grid gap-8 rounded-[2rem] border border-white/10 bg-[#111111] p-6 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-[#ff667a] uppercase">
            Maintenance
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-medium tracking-[-0.05em] text-balance sm:text-6xl">
            Keep the baseline clear.
          </h1>
          <p className="mt-5 max-w-2xl leading-7 text-white/50">
            Build reliable history for your {vehicle.platform}. Record what was
            done, then CapCar calculates the next planning target.
          </p>
        </div>
        {counts.unknown > 0 && (
          <button
            type="button"
            onClick={loadExample}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white/65 transition hover:bg-white/[0.08] hover:text-white"
          >
            <Sparkles className="size-4 text-[#ff667a]" /> Use sample history
          </button>
        )}
      </header>

      <section
        aria-label="Maintenance summary"
        className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <SummaryCard
          label="History needed"
          value={counts.unknown}
          icon={Clock3}
          tone="neutral"
        />
        <SummaryCard
          label="Due now"
          value={counts.overdue}
          icon={AlertTriangle}
          tone="red"
        />
        <SummaryCard
          label="Due soon"
          value={counts.soon}
          icon={CalendarClock}
          tone="amber"
        />
        <SummaryCard
          label="Up to date"
          value={counts.good}
          icon={CheckCircle2}
          tone="green"
        />
      </section>

      <section className="mt-5 overflow-hidden rounded-[2rem] border border-white/10 bg-[#111111]">
        <div className="flex flex-col justify-between gap-5 border-b border-white/8 p-5 sm:flex-row sm:items-center sm:p-7">
          <div>
            <h2 className="text-xl font-medium">Maintenance checklist</h2>
            <p className="mt-1 text-sm text-white/40">
              {visible.length} of {tasks.length} items shown
            </p>
          </div>
          <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
            {(["all", "unknown", "overdue", "soon", "good"] as const).map(
              (status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFilter(status)}
                  className={`shrink-0 rounded-full border px-3.5 py-2 text-xs transition ${
                    filter === status
                      ? "border-[#e72d45]/50 bg-[#e72d45]/12 text-[#b9d1ff]"
                      : "border-white/8 text-white/40 hover:text-white/70"
                  }`}
                >
                  {status === "all" ? "All" : statusContent[status].label}
                </button>
              ),
            )}
          </div>
        </div>

        <div className="divide-y divide-white/8">
          {visible.map(({ task, status }) => (
            <MaintenanceTaskRow
              key={task.id}
              task={task}
              status={status}
              active={activeTaskKey === task.key}
              justSaved={savedTask === task.key}
              completedDate={completedDate}
              completedMileage={completedMileage}
              formError={formError}
              onOpen={() => openRecord(task)}
              onClose={() => setActiveTaskKey(undefined)}
              onDateChange={setCompletedDate}
              onMileageChange={setCompletedMileage}
              onSubmit={(event) => submitRecord(event, task)}
            />
          ))}
          {visible.length === 0 && (
            <div className="px-6 py-16 text-center">
              <Check className="mx-auto size-6 text-white/30" />
              <p className="mt-4 text-white/50">Nothing in this status.</p>
            </div>
          )}
        </div>
      </section>

      <aside className="mt-5 flex items-start gap-3 rounded-2xl border border-[#e72d45]/15 bg-[#e72d45]/6 p-5 text-sm leading-6 text-white/45">
        <Info className="mt-0.5 size-4 shrink-0 text-[#ff667a]" />
        <p>
          These intervals are CapCar planning defaults, not verified
          manufacturer service specifications. Always check the exact owner
          documentation and trusted technical data for your vehicle before
          servicing it.
        </p>
      </aside>
    </div>
  );
}

function MaintenanceTaskRow({
  task,
  status,
  active,
  justSaved,
  completedDate,
  completedMileage,
  formError,
  onOpen,
  onClose,
  onDateChange,
  onMileageChange,
  onSubmit,
}: {
  task: MaintenanceTask;
  status: MaintenanceStatus;
  active: boolean;
  justSaved: boolean;
  completedDate: string;
  completedMileage: string;
  formError: string;
  onOpen: () => void;
  onClose: () => void;
  onDateChange: (value: string) => void;
  onMileageChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const content = statusContent[status];
  const StatusIcon = content.icon;
  const CategoryIcon = categoryIcons[task.category];

  return (
    <article className="p-5 sm:p-7">
      <div className="grid gap-5 md:grid-cols-[auto_1fr_auto] md:items-center">
        <span className="grid size-11 place-items-center rounded-2xl border border-white/8 bg-white/[0.035] text-white/55">
          <CategoryIcon className="size-4.5" />
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium text-white/90">{task.title}</h3>
            {task.criticality === "safety" && (
              <span className="inline-flex items-center gap-1 text-[11px] text-red-200/70">
                <ShieldAlert className="size-3" /> Safety
              </span>
            )}
          </div>
          <p className="mt-1.5 text-sm leading-6 text-white/40">
            {task.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/30">
            <span>{task.category}</span>
            {task.intervalKm && (
              <span>Every {task.intervalKm.toLocaleString("en-US")} km</span>
            )}
            {task.intervalMonths && (
              <span>Every {task.intervalMonths} months</span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 md:justify-end">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs ${content.className}`}
          >
            <StatusIcon className="size-3.5" /> {content.label}
          </span>
          <button
            type="button"
            onClick={onOpen}
            aria-label={`Record service for ${task.title}`}
            className="grid size-10 place-items-center rounded-xl border border-white/10 text-white/45 transition hover:bg-white/[0.06] hover:text-white"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {task.record && !active && (
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/6 pt-4 text-xs text-white/35">
          <span>Last: {formatDate(task.record.lastCompletedDate)}</span>
          <span>
            {task.record.lastCompletedMileage.toLocaleString("en-US")} km
          </span>
          {task.record.nextDueDate && (
            <span>Next date: {formatDate(task.record.nextDueDate)}</span>
          )}
          {task.record.nextDueMileage && (
            <span>
              Next mileage: {task.record.nextDueMileage.toLocaleString("en-US")}{" "}
              km
            </span>
          )}
        </div>
      )}

      {justSaved && !active && (
        <p className="mt-4 flex items-center gap-2 text-xs text-emerald-200/70">
          <Check className="size-3.5" /> Service record saved locally.
        </p>
      )}

      {active && (
        <form
          onSubmit={onSubmit}
          className="mt-6 rounded-2xl border border-[#e72d45]/20 bg-[#e72d45]/6 p-4 sm:p-5"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Record completed work</p>
              <p className="mt-1 text-xs text-white/35">
                This recalculates the next planning target.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close form"
              className="grid size-9 place-items-center rounded-lg text-white/40 hover:bg-white/5 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-xs text-white/55">
              Completed date
              <input
                type="date"
                required
                value={completedDate}
                onChange={(event) => onDateChange(event.target.value)}
                className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#0d0d0d] px-3 text-sm text-white outline-none focus:border-[#e72d45]/60"
              />
            </label>
            <label className="text-xs text-white/55">
              Vehicle mileage
              <input
                type="number"
                min="0"
                max="2000000"
                required
                value={completedMileage}
                onChange={(event) => onMileageChange(event.target.value)}
                className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#0d0d0d] px-3 text-sm text-white outline-none focus:border-[#e72d45]/60"
              />
            </label>
          </div>
          {formError && (
            <p className="mt-3 text-xs text-red-200">{formError}</p>
          )}
          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#e72d45] px-4 text-sm font-semibold text-[#07101d]"
            >
              <Check className="size-4" /> Save record
            </button>
          </div>
        </form>
      )}
    </article>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof Check;
  tone: "neutral" | "red" | "amber" | "green";
}) {
  const tones = {
    neutral: "text-white/45",
    red: "text-red-200",
    amber: "text-amber-200",
    green: "text-emerald-200",
  };
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111111] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/40">{label}</p>
        <Icon className={`size-4 ${tones[tone]}`} />
      </div>
      <p className="mt-8 text-4xl font-medium tracking-[-0.04em]">{value}</p>
    </div>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00.000Z`));
}

function MaintenanceSkeleton() {
  return (
    <div aria-label="Loading maintenance" className="animate-pulse">
      <div className="h-4 w-40 rounded bg-white/10" />
      <div className="mt-7 h-64 rounded-[2rem] bg-white/[0.04]" />
      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-36 rounded-2xl bg-white/[0.04]" />
        ))}
      </div>
    </div>
  );
}
