"use client";

import { Check, ChevronDown, Palette } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { RoadbookMapMode } from "@/features/roadbook/roadbook-schema";

const modes = [
  { value: "konstanz", swatch: "bg-[#a8c2bf]" },
  { value: "reykjavik", swatch: "bg-[#35515b]" },
  { value: "lissabon", swatch: "bg-[#cc8d61]" },
  { value: "wien", swatch: "bg-[#d9cfbd]" },
  { value: "zurich", swatch: "bg-[#aeb8b8]" },
  { value: "venedig", swatch: "bg-[#608d86]" },
  { value: "kyoto", swatch: "bg-[#786a51]" },
  { value: "marrakesch", swatch: "bg-[#9d5d3b]" },
  { value: "tokyo", swatch: "bg-[#071a1c]" },
] as const;

export function RoadbookThemeSwitcher({
  mode,
  onChange,
  label,
  labels,
  placement = "bottom",
}: {
  mode: RoadbookMapMode;
  onChange: (mode: RoadbookMapMode) => void;
  label: string;
  labels: Record<RoadbookMapMode, string>;
  placement?: "top" | "bottom";
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={`${label}: ${labels[mode]}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex h-12 items-center gap-2 rounded-2xl border border-white/12 bg-[#09100d]/88 px-3 text-xs font-semibold text-white/78 shadow-2xl backdrop-blur-xl transition hover:border-white/20 hover:text-white"
      >
        <Palette aria-hidden="true" className="size-4 text-[#ff667a]" />
        <span className="hidden sm:inline">{labels[mode]}</span>
        <ChevronDown
          aria-hidden="true"
          className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={label}
          className={`absolute right-0 z-50 w-[min(22rem,calc(100vw-1.5rem))] rounded-2xl border border-white/12 bg-[#09100d]/96 p-2 shadow-2xl backdrop-blur-2xl ${
            placement === "top"
              ? "top-[calc(100%+0.5rem)]"
              : "bottom-[calc(100%+0.5rem)]"
          }`}
        >
          <div className="mb-2 px-2 pt-1 text-[10px] font-semibold tracking-[0.15em] text-white/38 uppercase">
            {label}
          </div>
          <div className="grid grid-cols-3 gap-1">
            {modes.map(({ value, swatch }) => (
              <button
                key={value}
                type="button"
                role="option"
                aria-selected={mode === value}
                onClick={() => {
                  onChange(value);
                  setOpen(false);
                }}
                className={`flex min-h-11 items-center gap-2 rounded-xl px-2.5 text-left text-[11px] transition ${
                  mode === value
                    ? "bg-white/12 text-white"
                    : "text-white/58 hover:bg-white/7 hover:text-white"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`size-3 shrink-0 rounded-full border border-white/20 ${swatch}`}
                />
                <span className="min-w-0 flex-1 truncate">{labels[value]}</span>
                {mode === value && (
                  <Check aria-hidden="true" className="size-3 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
