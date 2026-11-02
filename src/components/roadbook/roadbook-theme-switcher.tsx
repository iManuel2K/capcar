"use client";

import { useEffect, useRef } from "react";
import {
  Check,
  Landmark,
  Map,
  MoonStar,
  Mountain,
  Sailboat,
  Snowflake,
  Sun,
  TreePalm,
  Trees,
  Waves,
} from "lucide-react";

import {
  roadbookMapModes,
  type RoadbookMapMode,
} from "@/features/roadbook/roadbook-schema";

const styleIcons = {
  konstanz: Waves,
  reykjavik: Snowflake,
  lissabon: Sun,
  wien: Landmark,
  zurich: Mountain,
  venedig: Sailboat,
  kyoto: Trees,
  marrakesch: TreePalm,
  tokyo: MoonStar,
};

export function RoadbookThemeSwitcher({
  mode,
  onChange,
  label,
  labels,
  compatibility,
  compatibilityLabel,
}: {
  mode: RoadbookMapMode;
  onChange: (mode: RoadbookMapMode) => void;
  label: string;
  labels: Record<RoadbookMapMode, string>;
  compatibility: boolean;
  compatibilityLabel: string;
}) {
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const rail = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const active = buttons.current[roadbookMapModes.indexOf(mode)];
    const container = rail.current;
    if (!active || !container || typeof container.scrollTo !== "function")
      return;
    const left =
      active.offsetLeft - (container.clientWidth - active.clientWidth) / 2;
    container.scrollTo({
      left: Math.max(0, left),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, [mode]);

  const choose = (index: number) => {
    const next = (index + roadbookMapModes.length) % roadbookMapModes.length;
    buttons.current[next]?.focus({ preventScroll: true });
    onChange(roadbookMapModes[next]);
  };

  return (
    <section aria-label={label} className="roadbook-style-picker">
      <div className="roadbook-style-picker__heading">
        <span>
          <Map size={15} aria-hidden="true" />
          {label}
        </span>
        <strong>
          <Check size={14} aria-hidden="true" />
          {labels[mode]}
        </strong>
      </div>
      <div
        ref={rail}
        role="radiogroup"
        aria-label={label}
        className="roadbook-style-chips"
      >
        {roadbookMapModes.map((value, index) => {
          const selected = value === mode;
          const Icon = styleIcons[value];
          return (
            <button
              key={value}
              ref={(node) => {
                buttons.current[index] = node;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(value)}
              onKeyDown={(event) => {
                if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                  event.preventDefault();
                  choose(index - 1);
                }
                if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                  event.preventDefault();
                  choose(index + 1);
                }
                if (event.key === "Home") {
                  event.preventDefault();
                  choose(0);
                }
                if (event.key === "End") {
                  event.preventDefault();
                  choose(roadbookMapModes.length - 1);
                }
              }}
              className={`roadbook-style-chip ${selected ? "is-selected" : ""}`}
            >
              <Icon size={20} strokeWidth={1.6} aria-hidden="true" />
              <span>{labels[value]}</span>
            </button>
          );
        })}
      </div>
      {compatibility && (
        <p className="roadbook-style-picker__status" role="status">
          {compatibilityLabel}
        </p>
      )}
    </section>
  );
}
