"use client";

import { useRef } from "react";

import {
  roadbookMapModes,
  type RoadbookMapMode,
} from "@/features/roadbook/roadbook-schema";

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
  const moveFocus = (index: number, direction: -1 | 1) =>
    buttons.current[
      (index + direction + roadbookMapModes.length) % roadbookMapModes.length
    ]?.focus();

  return (
    <section
      aria-labelledby="roadbook-style-title"
      className="roadbook-style-picker"
    >
      <div className="roadbook-style-picker__intro">
        <h2 id="roadbook-style-title" className="roadbook-style-picker__title">
          Nine city styles
        </h2>
        <p className="roadbook-style-picker__description">
          From bright daylight to Tokyo night, your map in your look.
        </p>
        {compatibility && (
          <p className="roadbook-style-picker__description" role="status">
            {compatibilityLabel}
          </p>
        )}
      </div>
      <div
        role="radiogroup"
        aria-label={label}
        className="roadbook-style-chips"
      >
        {roadbookMapModes.map((value, index) => {
          const selected = value === mode;
          return (
            <button
              key={value}
              ref={(node) => {
                buttons.current[index] = node;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(value)}
              onKeyDown={(event) => {
                if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                  event.preventDefault();
                  moveFocus(index, -1);
                }
                if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                  event.preventDefault();
                  moveFocus(index, 1);
                }
              }}
              className={`roadbook-style-chip ${selected ? "is-selected" : ""}`}
            >
              <span>{labels[value]}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
