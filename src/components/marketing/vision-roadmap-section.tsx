"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bike,
  CalendarDays,
  CarFront,
  Check,
  Circle,
  Gauge,
  ScanLine,
  Sparkles,
  Waves,
  WandSparkles,
} from "lucide-react";
import { useState } from "react";

const tools = [
  {
    name: "Forum threads",
    x: 20,
    y: 32,
    detail: "Useful experience, but difficult to verify or turn into a plan.",
  },
  {
    name: "Excel spreadsheets",
    x: 34,
    y: 56,
    detail: "Structured costs without fitment or installation context.",
  },
  {
    name: "Generic notes apps",
    x: 18,
    y: 70,
    detail: "Flexible capture with no vehicle-specific intelligence.",
  },
  {
    name: "Parts retailers",
    x: 62,
    y: 40,
    detail: "Strong catalogues that stop at the point of purchase.",
  },
  {
    name: "Capcar",
    x: 84,
    y: 82,
    detail: "One record for planning, fitment, cost and completed work.",
  },
] as const;

const phases = [
  {
    phase: "Phase 1",
    state: "Alpha",
    label: "Foundation",
    description: "The essential structure for a dependable digital garage.",
    items: ["Core Garage", "Fitment Engine v1", "Budget Tracker"],
    current: false,
    next: false,
    icon: Gauge,
  },
  {
    phase: "Phase 2",
    state: "Beta",
    label: "Current release",
    description: "A complete record for ownership, maintenance and builds.",
    items: [
      "Vehicle Passport",
      "Wishlist Manager",
      "Cost Analytics",
      "Diagnostic Logs",
      "Specialist Directory",
    ],
    current: true,
    next: false,
    icon: ScanLine,
  },
  {
    phase: "Phase 3",
    state: "v1.0 Public",
    label: "The visual release",
    description:
      "A more cinematic garage with interactive vehicles, sound and recognizable demo builds.",
    items: [
      "Interactive Vehicle Models",
      "Iconic Movie Car Demos",
      "Engine & Exhaust Sound Studio",
      "3D Homepage Visualizer",
      "OBD-II Scanning",
      "Verified Shop Stamps",
      "Direct Merchant Checkout",
      "Community Marketplace",
    ],
    current: false,
    next: true,
    icon: CarFront,
  },
  {
    phase: "Phase 4",
    state: "Intelligent Garage",
    label: "Discovery & AI",
    description:
      "Move from managing a build to discovering where it can go next.",
    items: [
      "Nearby & Destination Events",
      "AI Build Ideas",
      "AI Visual Concepts",
      "Personalized Upgrade Paths",
    ],
    current: false,
    next: false,
    icon: WandSparkles,
  },
  {
    phase: "Phase 5",
    state: "Capcar v3",
    label: "The universal garage",
    description:
      "One place for every machine, board and project you care about.",
    items: [
      "Motorcycle Garages",
      "Bicycle Garages",
      "Surfboard Quivers",
      "Cross-Project Collections",
    ],
    current: false,
    next: false,
    icon: Bike,
  },
] as const;

export function VisionRoadmapSection() {
  const [selected, setSelected] = useState<(typeof tools)[number]>(tools[4]);

  return (
    <section
      id="roadmap"
      className="scroll-mt-20 border-y border-white/8 bg-[#0e2d30] text-[#e8e6d7]"
    >
      <div className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 sm:py-32">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-[#bf8269] uppercase">
              The vision
            </p>
            <h2 className="mt-5 max-w-4xl text-5xl leading-[0.9] font-medium tracking-[-0.06em] sm:text-7xl lg:text-8xl">
              From Plan to Road. No Guesswork.
            </h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-white/48 lg:justify-self-end lg:text-lg lg:leading-8">
            Car building is fragmented across forums, spreadsheets, and
            guesswork. Capcar unifies vision, fitment validation, and execution
            into one seamless digital record.
          </p>
        </div>

        <div className="mt-14 grid overflow-hidden rounded-[1.75rem] border border-white/12 bg-[#153b3e] shadow-[0_28px_100px_rgba(4,12,8,0.26)] sm:mt-20 sm:rounded-[2.25rem] lg:grid-cols-[0.7fr_1.3fr]">
          <div className="flex flex-col justify-between border-b border-white/8 p-6 sm:p-9 lg:border-r lg:border-b-0">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.16em] text-white/35 uppercase">
                Positioning matrix
              </p>
              <h3 className="mt-3 text-2xl font-medium tracking-[-0.035em] sm:text-3xl">
                Built for the complete job.
              </h3>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/42">
                Select a point to compare where each tool stops—and where Capcar
                connects the work.
              </p>
            </div>
            <div className="mt-10 rounded-2xl border border-white/8 bg-white/[0.025] p-5">
              <div className="flex items-center gap-2">
                {selected.name === "Capcar" ? (
                  <Sparkles className="size-4 text-[#bf8269]" />
                ) : (
                  <Circle className="size-3.5 text-white/35" />
                )}
                <p className="font-medium">{selected.name}</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/42">
                {selected.detail}
              </p>
            </div>
          </div>

          <div className="relative min-h-[420px] p-6 sm:min-h-[560px] sm:p-10">
            <div className="absolute inset-x-8 top-8 bottom-14 border-b border-l border-white/16 sm:inset-x-14 sm:top-12 sm:bottom-16">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:25%_25%]" />
              <div className="absolute top-1/2 right-0 left-0 border-t border-dashed border-white/10" />
              <div className="absolute top-0 bottom-0 left-1/2 border-l border-dashed border-white/10" />
              {tools.map((tool) => {
                const capcar = tool.name === "Capcar";
                return (
                  <button
                    key={tool.name}
                    type="button"
                    onClick={() => setSelected(tool)}
                    aria-pressed={selected.name === tool.name}
                    className={`absolute -translate-x-1/2 translate-y-1/2 rounded-full border transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#bf8269] ${
                      capcar
                        ? "z-10 border-[#e8e6d7]/55 bg-[#e8e6d7] px-4 py-2 text-xs font-semibold text-[#050306] shadow-[0_0_12px_rgba(232,230,215,0.18)] hover:scale-[1.03]"
                        : selected.name === tool.name
                          ? "border-white/35 bg-[#292929] px-3 py-2 text-[10px] text-white"
                          : "border-white/12 bg-[#171717] px-3 py-2 text-[10px] text-white/55 hover:border-white/28 hover:text-white"
                    }`}
                    style={{ left: `${tool.x}%`, bottom: `${tool.y}%` }}
                  >
                    {tool.name}
                  </button>
                );
              })}
            </div>
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.12em] text-white/28 uppercase">
              Fitment &amp; execution · Basic → Advanced
            </span>
            <span className="absolute top-1/2 -left-15 hidden -rotate-90 text-[10px] tracking-[0.12em] whitespace-nowrap text-white/28 uppercase sm:block">
              Structure &amp; clarity · Generic → Purpose-built
            </span>
          </div>
        </div>

        <div className="mt-20 flex items-end justify-between gap-8 sm:mt-28">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-[#bf8269] uppercase">
              Product roadmap
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl leading-[0.94] font-medium tracking-[-0.055em] sm:text-6xl">
              The garage keeps expanding.
            </h2>
          </div>
          <div className="hidden max-w-sm lg:block">
            <p className="text-sm leading-6 text-white/42">
              Public direction, shaped by what drivers want to build next.
            </p>
            <Link
              href="/roadmap"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#e8e6d7] transition hover:text-[#bf8269]"
            >
              Explore the full roadmap <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="mt-10 grid overflow-hidden rounded-[1.75rem] border border-white/12 sm:rounded-[2.25rem] lg:grid-cols-6">
          {phases.map((phase) => (
            <article
              key={phase.phase}
              className={`group relative min-h-80 border-t border-white/8 p-6 first:border-t-0 sm:p-8 lg:col-span-2 lg:border-t-0 lg:border-l lg:first:border-l-0 ${phase.phase === "Phase 4" ? "lg:col-span-3 lg:border-t" : ""} ${phase.phase === "Phase 5" ? "lg:col-span-3 lg:border-t" : ""} ${phase.current ? "bg-[radial-gradient(circle_at_80%_0%,rgba(231,45,69,0.24),transparent_35%),#24090a]" : phase.next ? "bg-[radial-gradient(circle_at_82%_4%,rgba(191,130,105,0.22),transparent_30%),#183f42]" : "bg-[#153b3e]"}`}
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-white/30 uppercase">
                  {phase.phase}
                </p>
                {phase.current ? (
                  <span className="rounded-full border border-[#bf8269]/35 bg-[#6d0101]/55 px-3 py-1 text-[10px] font-semibold tracking-[0.1em] text-[#e8e6d7] uppercase">
                    Current
                  </span>
                ) : phase.next ? (
                  <span className="rounded-full border border-[#bf8269]/35 bg-[#bf8269]/12 px-3 py-1 text-[10px] font-semibold tracking-[0.1em] text-[#e8e6d7] uppercase">
                    Coming next
                  </span>
                ) : (
                  <phase.icon className="size-4 text-white/25 transition group-hover:text-[#bf8269]" />
                )}
              </div>
              <h3 className="mt-6 text-2xl font-medium tracking-[-0.035em]">
                {phase.state}
              </h3>
              <p className="mt-2 text-[11px] font-semibold tracking-[0.13em] text-[#bf8269] uppercase">
                {phase.label}
              </p>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/42">
                {phase.description}
              </p>
              <ul
                className={`mt-7 grid gap-3 ${phase.next ? "sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2" : ""}`}
              >
                {phase.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm text-white/50"
                  >
                    <span
                      className={`grid size-5 place-items-center rounded-full ${phase.current || phase.next ? "bg-[#6d0101]/15 text-[#bf8269]" : "bg-white/5 text-white/30"}`}
                    >
                      <Check className="size-3" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <Link
          href="/roadmap"
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-white/12 text-sm font-medium text-white/72 lg:hidden"
        >
          Explore the full roadmap <ArrowRight className="size-4" />
        </Link>

        <div className="mt-5 grid gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.025] p-5 text-sm text-white/45 sm:grid-cols-3 sm:p-6">
          <span className="flex items-center gap-3">
            <CalendarDays className="size-4 text-[#bf8269]" /> Events connect
            the community.
          </span>
          <span className="flex items-center gap-3">
            <Sparkles className="size-4 text-[#bf8269]" /> AI makes new ideas
            visible.
          </span>
          <span className="flex items-center gap-3">
            <Waves className="size-4 text-[#bf8269]" /> One garage, beyond cars.
          </span>
        </div>
      </div>
    </section>
  );
}
