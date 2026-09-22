"use client";

import type { CSSProperties } from "react";
import { useRef } from "react";

import { ROADBOOK_MAP_STYLES } from "@/features/roadbook/roadbook-map-style";
import {
  roadbookMapModes,
  type RoadbookMapMode,
} from "@/features/roadbook/roadbook-schema";

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
      <div className="mb-3 px-1">
        <h2
          id="roadbook-style-title"
          className="text-sm font-semibold tracking-[-0.01em] text-white"
        >
          Nine Roadbook styles.
        </h2>
        <p className="mt-0.5 text-[11px] leading-4 text-white/48">
          From clear workshop daylight to Tokyo night, choose how your roads
          should feel.
        </p>
      </div>
      <div
        role="radiogroup"
        aria-label={label}
        className="roadbook-style-chips"
      >
        {roadbookMapModes.map((value, index) => {
          const style = ROADBOOK_MAP_STYLES[value];
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
              title={style.description}
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
              style={
                {
                  "--roadbook-chip-accent": style.accent,
                  "--roadbook-chip-canvas": style.canvas,
                } as CSSProperties
              }
            >
              <span aria-hidden="true" className="roadbook-style-chip__swatch">
                {style.swatch.map((color) => (
                  <i key={color} style={{ background: color }} />
                ))}
              </span>
              <span>{labels[value]}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
