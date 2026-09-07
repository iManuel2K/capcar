"use client";

import {
  BadgeCheck,
  CalendarClock,
  CarFront,
  Check,
  CircleGauge,
  Gauge,
  Layers3,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";

const tabs = [
  { id: "garage", label: "Garage", icon: CarFront },
  { id: "build", label: "Build", icon: Layers3 },
  { id: "service", label: "Service", icon: Wrench },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function ProductDashboardPreview() {
  const [activeTab, setActiveTab] = useState<TabId>("garage");
  const [mileage, setMileage] = useState(147920);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      window.requestAnimationFrame(() => setMileage(148200));
      return;
    }
    const start = performance.now();
    let frame = 0;
    const animate = (now: number) => {
      const progress = Math.min(1, (now - start) / 950);
      setMileage(Math.round(147920 + 280 * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = window.requestAnimationFrame(animate);
    };
    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <section
      id="live-demo"
      aria-labelledby="live-demo-title"
      className="relative border-b border-white/8 bg-[#0b0b0b] px-5 py-14 sm:px-8 sm:py-24"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-56 max-w-4xl bg-[radial-gradient(ellipse_at_top,rgba(231,45,69,0.12),transparent_68%)]" />
      <div className="relative mx-auto max-w-[1500px]">
        <div className="grid gap-6 lg:grid-cols-[0.72fr_1fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-[#ff667a] uppercase">
              Live product preview
            </p>
            <h2
              id="live-demo-title"
              className="mt-4 max-w-3xl text-4xl leading-[0.94] font-medium tracking-[-0.055em] sm:text-7xl sm:leading-[0.92]"
            >
              The complete build, at a glance.
            </h2>
          </div>
          <p className="max-w-lg text-base leading-7 text-white/44 lg:justify-self-end">
            Budget, mileage, fitment and maintenance stay connected to the car
            they belong to.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#101010] shadow-[0_32px_100px_rgba(0,0,0,0.38)] sm:mt-14 sm:rounded-[2.25rem]">
          <div className="flex flex-col gap-4 border-b border-white/8 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-[#e72d45]/14 text-[#ff667a]">
                <CarFront className="size-4" />
              </span>
              <div>
                <p className="text-sm font-medium">Project 318</p>
                <p className="text-[11px] text-white/32">
                  BMW E90 · Private garage
                </p>
              </div>
            </div>
            <div className="flex rounded-full border border-white/8 bg-black/25 p-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={activeTab === id}
                  onClick={() => setActiveTab(id)}
                  className={`inline-flex min-h-9 flex-1 items-center justify-center gap-2 rounded-full px-3 text-xs transition sm:flex-none ${
                    activeTab === id
                      ? "bg-white text-black"
                      : "text-white/42 hover:text-white"
                  }`}
                >
                  <Icon className="size-3.5" /> {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-px bg-white/8 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="bg-[#101010] p-5 sm:p-8">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.14em] text-white/28 uppercase">
                    Current mileage
                  </p>
                  <p className="mt-2 text-4xl font-medium tracking-[-0.045em] tabular-nums sm:text-5xl">
                    {mileage.toLocaleString("en-US")}
                    <span className="ml-2 text-sm tracking-normal text-white/32">
                      km
                    </span>
                  </p>
                </div>
                <span className="rounded-full border border-emerald-300/18 bg-emerald-300/8 px-3 py-1.5 text-[11px] text-emerald-200">
                  Synced
                </span>
              </div>

              <div className="mt-10 rounded-2xl border border-white/8 bg-black/22 p-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] tracking-[0.13em] text-white/28 uppercase">
                      Build budget
                    </p>
                    <p className="mt-2 text-2xl font-medium">€804 spent</p>
                  </div>
                  <p className="text-sm text-white/38">€1,200 total</p>
                </div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full w-[67%] origin-left rounded-full bg-gradient-to-r from-[#a91f33] to-[#ff4e65] motion-safe:animate-[capcar-budget-fill_1.1s_ease-out_both]" />
                </div>
                <div className="mt-4 flex justify-between text-xs text-white/32">
                  <span>67% allocated</span>
                  <span>€396 remaining</span>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <MiniMetric icon={Layers3} label="Parts" value="8 planned" />
                <MiniMetric icon={Gauge} label="Stage" value="2 of 4" />
                <MiniMetric
                  icon={BadgeCheck}
                  label="Fitment"
                  value="7 checked"
                />
              </div>
            </div>

            <div className="bg-[#0d0d0d] p-5 sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.14em] text-white/28 uppercase">
                    Next attention
                  </p>
                  <h3 className="mt-2 text-xl font-medium">Service overview</h3>
                </div>
                <CalendarClock className="size-5 text-[#ff667a]" />
              </div>
              <div className="mt-6 space-y-2">
                <ServiceRow label="Brake fluid" value="Due now" tone="red" />
                <ServiceRow label="Engine oil" value="1,800 km" tone="amber" />
                <ServiceRow
                  label="Cabin filter"
                  value="Complete"
                  tone="green"
                />
              </div>
              <div className="mt-6 rounded-2xl border border-white/8 bg-[#141414] p-5">
                <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.13em] text-white/28 uppercase">
                  <CircleGauge className="size-3.5 text-[#ff667a]" /> Fitment
                  status
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <StatusBadge tone="green">Direct bolt-on</StatusBadge>
                  <StatusBadge tone="amber">1 condition</StatusBadge>
                </div>
                <p className="mt-4 text-xs leading-5 text-white/36">
                  Selected rear lamps match the E90 sedan. Connector revision
                  still needs confirmation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-black/18 p-4">
      <Icon className="size-4 text-[#ff667a]" />
      <p className="mt-5 text-[10px] tracking-[0.1em] text-white/28 uppercase">
        {label}
      </p>
      <p className="mt-1 text-xs font-medium text-white/70">{value}</p>
    </div>
  );
}

function ServiceRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "red" | "amber" | "green";
}) {
  const colors = {
    red: "text-[#ff667a] bg-[#e72d45]",
    amber: "text-amber-200 bg-amber-300",
    green: "text-emerald-200 bg-emerald-300",
  };
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/8 bg-[#141414] px-4 py-3.5">
      <span className="flex items-center gap-3 text-sm text-white/72">
        <span
          className={`size-1.5 rounded-full ${colors[tone].split(" ")[1]}`}
        />
        {label}
      </span>
      <span className={`text-xs ${colors[tone].split(" ")[0]}`}>{value}</span>
    </div>
  );
}

export function StatusBadge({
  tone,
  children,
}: {
  tone: "green" | "amber" | "red";
  children: React.ReactNode;
}) {
  const styles = {
    green: "border-emerald-300/20 bg-emerald-300/9 text-emerald-200",
    amber: "border-amber-300/20 bg-amber-300/9 text-amber-200",
    red: "border-red-300/20 bg-red-300/9 text-red-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium ${styles[tone]}`}
    >
      <Check className="size-3" /> {children}
    </span>
  );
}
