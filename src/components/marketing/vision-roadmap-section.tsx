"use client";

import { Check, Circle, Sparkles } from "lucide-react";
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
    items: ["Core Garage", "Fitment Engine v1", "Budget Tracker"],
    current: false,
  },
  {
    phase: "Phase 2",
    state: "Beta",
    items: [
      "Vehicle Passport",
      "Wishlist Manager",
      "Cost Analytics",
      "Diagnostic Logs",
      "Specialist Directory",
    ],
    current: true,
  },
  {
    phase: "Phase 3",
    state: "v1.0 Public",
    items: [
      "Verified Shop Stamps",
      "Direct Merchant Checkout",
      "Community Marketplace",
      "OBD-II Scanning",
    ],
    current: false,
  },
] as const;

export function VisionRoadmapSection() {
  const [selected, setSelected] = useState<(typeof tools)[number]>(tools[4]);

  return (
    <section className="border-y border-white/8 bg-[#0e2d30] text-[#e8e6d7]">
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

        <div className="mt-5 grid overflow-hidden rounded-[1.75rem] border border-white/12 sm:rounded-[2.25rem] lg:grid-cols-3">
          {phases.map((phase) => (
            <article
              key={phase.phase}
              className={`relative min-h-72 border-t border-white/8 p-6 first:border-t-0 sm:p-8 lg:border-t-0 lg:border-l lg:first:border-l-0 ${phase.current ? "bg-[radial-gradient(circle_at_80%_0%,rgba(231,45,69,0.24),transparent_35%),#24090a]" : "bg-[#153b3e]"}`}
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-white/30 uppercase">
                  {phase.phase}
                </p>
                {phase.current && (
                  <span className="rounded-full border border-[#bf8269]/35 bg-[#6d0101]/55 px-3 py-1 text-[10px] font-semibold tracking-[0.1em] text-[#e8e6d7] uppercase">
                    Current
                  </span>
                )}
              </div>
              <h3 className="mt-6 text-2xl font-medium tracking-[-0.035em]">
                {phase.state}
              </h3>
              <ul className="mt-8 space-y-3">
                {phase.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm text-white/50"
                  >
                    <span
                      className={`grid size-5 place-items-center rounded-full ${phase.current ? "bg-[#6d0101]/15 text-[#bf8269]" : "bg-white/5 text-white/30"}`}
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
      </div>
    </section>
  );
}
