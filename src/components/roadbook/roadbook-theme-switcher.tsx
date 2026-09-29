"use client";

import { useEffect, useRef, type CSSProperties } from "react";

import {
  roadbookMapModes,
  type RoadbookMapMode,
} from "@/features/roadbook/roadbook-schema";
import { ROADBOOK_MAP_STYLES } from "@/features/roadbook/roadbook-map-style";

export function RoadbookThemeSwitcher({
  mode,
  onChange,
  label,
  labels,
  headline,
  description,
  compatibility,
  compatibilityLabel,
}: {
  mode: RoadbookMapMode;
  onChange: (mode: RoadbookMapMode) => void;
  label: string;
  labels: Record<RoadbookMapMode, string>;
  headline: string;
  description: string;
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
    buttons.current[next]?.focus();
    onChange(roadbookMapModes[next]);
  };

  return (
    <section
      aria-labelledby="roadbook-style-title"
      className="roadbook-style-picker"
    >
      <div className="roadbook-style-picker__intro">
        <h2 id="roadbook-style-title" className="roadbook-style-picker__title">
          {headline}
        </h2>
        <p className="roadbook-style-picker__description">{description}</p>
        {compatibility && (
          <p className="roadbook-style-picker__description" role="status">
            {compatibilityLabel}
          </p>
        )}
      </div>
      <div
        ref={rail}
        role="radiogroup"
        aria-label={label}
        className="roadbook-style-chips"
      >
        {roadbookMapModes.map((value, index) => {
          const selected = value === mode;
          const swatch = ROADBOOK_MAP_STYLES[value].swatch;
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
              style={
                {
                  "--roadbook-chip-land": swatch[0],
                  "--roadbook-chip-road": swatch[1],
                  "--roadbook-chip-water": swatch[2],
                } as CSSProperties
              }
            >
              <span
                className="roadbook-style-chip__swatch"
                aria-hidden="true"
              />
              <span>{labels[value]}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
