"use client";

import {
  Camera,
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
  { value: "car_photo_spot", icon: Camera },
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
      className="flex max-w-full [scrollbar-width:none] gap-1.5 overflow-x-auto rounded-xl border border-white/12 bg-[#09100d]/88 p-1.5 shadow-2xl backdrop-blur-xl sm:gap-2 sm:rounded-2xl sm:p-2 [&::-webkit-scrollbar]:hidden"
    >
      {filters.map(({ value, icon: Icon }) => {
        const active = selected.includes(value);
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(value)}
            className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-medium transition sm:min-h-10 sm:gap-2 sm:rounded-xl sm:px-3 sm:text-xs ${
              active
                ? "bg-[#e72d45] text-white shadow-lg"
                : "bg-white/[0.055] text-white/62 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon aria-hidden="true" className="size-3.5" />
            {labels[value]}
          </button>
        );
      })}
    </div>
  );
}
