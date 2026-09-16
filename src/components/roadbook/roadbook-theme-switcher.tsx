"use client";

import { MoonStar, PanelsTopLeft, Ruler, SunMedium } from "lucide-react";

import type { RoadbookMapMode } from "@/features/roadbook/roadbook-schema";

const modes = [
  { value: "workshop_cream", icon: SunMedium },
  { value: "petrol_night", icon: MoonStar },
  { value: "blueprint", icon: Ruler },
  { value: "touring_clay", icon: PanelsTopLeft },
] as const;

export function RoadbookThemeSwitcher({
  mode,
  onChange,
  label,
  labels,
}: {
  mode: RoadbookMapMode;
  onChange: (mode: RoadbookMapMode) => void;
  label: string;
  labels: Record<RoadbookMapMode, string>;
}) {
  return (
    <div
      aria-label={label}
      className="flex rounded-2xl border border-white/12 bg-[#09100d]/88 p-1.5 shadow-2xl backdrop-blur-xl"
    >
      {modes.map(({ value, icon: Icon }) => (
        <button
          key={value}
          type="button"
          title={labels[value]}
          aria-label={labels[value]}
          aria-pressed={mode === value}
          onClick={() => onChange(value)}
          className={`grid size-10 place-items-center rounded-xl transition ${
            mode === value
              ? "bg-[#f2ecdf] text-[#0e2d30]"
              : "text-white/55 hover:bg-white/8 hover:text-white"
          }`}
        >
          <Icon aria-hidden="true" className="size-4" />
        </button>
      ))}
    </div>
  );
}
