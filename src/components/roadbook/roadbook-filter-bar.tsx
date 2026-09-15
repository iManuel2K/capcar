"use client";

import {
  FlagTriangleRight,
  Gauge,
  Milestone,
  Mountain,
  Route,
  TestTubeDiagonal,
} from "lucide-react";

import type { RoadbookCategory } from "@/features/roadbook/roadbook-schema";

const filters = [
  { value: "drift_circuit", icon: Route },
  { value: "drag_acceleration", icon: Gauge },
  { value: "track_day", icon: FlagTriangleRight },
  { value: "proving_ground", icon: TestTubeDiagonal },
  { value: "scenic_route", icon: Mountain },
  { value: "autobahn_context", icon: Milestone },
] as const;

export function RoadbookFilterBar({
  selected,
  onChange,
  label,
  labels,
}: {
  selected: RoadbookCategory[];
  onChange: (categories: RoadbookCategory[]) => void;
  label: string;
  labels: Record<RoadbookCategory, string>;
}) {
  function toggle(category: RoadbookCategory) {
    onChange(
      selected.includes(category)
        ? selected.filter((value) => value !== category)
        : [...selected, category],
    );
  }

  return (
    <div
      aria-label={label}
      className="flex max-w-full [scrollbar-width:none] gap-2 overflow-x-auto rounded-2xl border border-white/12 bg-[#09100d]/88 p-2 shadow-2xl backdrop-blur-xl [&::-webkit-scrollbar]:hidden"
    >
      {filters.map(({ value, icon: Icon }) => {
        const active = selected.includes(value);
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(value)}
            className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-medium transition ${
              active
                ? "bg-[#e72d45] text-white shadow-lg"
                : "bg-white/[0.055] text-white/62 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon className="size-3.5" aria-hidden="true" />
            {labels[value]}
          </button>
        );
      })}
    </div>
  );
}
