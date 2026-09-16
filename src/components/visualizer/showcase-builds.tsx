"use client";

import { useState, useEffect } from "react";

export interface ConceptSpec {
  model: "sedan-sports" | "hatchback-sports";
  paint: "petrol" | "cream" | "clay" | "red";
  stance: "stock" | "sport";
  spoiler: boolean;
}

export interface ConceptStudioProps {
  initialConcept?: ConceptSpec;
  storageKey?: string;
}

const defaultConcept: ConceptSpec = {
  model: "sedan-sports",
  paint: "petrol",
  stance: "stock",
  spoiler: false,
};

export function ConceptStudio({
  initialConcept = defaultConcept,
  storageKey = "capcar.visual-direction.v1",
}: ConceptStudioProps) {
  const [concept, setConcept] = useState<ConceptSpec>(initialConcept);

  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setConcept(JSON.parse(saved));
      }
    } catch {
      // Fallback to initialConcept on invalid JSON
    }
  }, [storageKey]);

  const updateConcept = (updates: Partial<ConceptSpec>) => {
    const updated = { ...concept, ...updates };
    setConcept(updated);
    if (storageKey && typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (err) {
        console.warn("Failed to store concept state:", err);
      }
    }
  };

  return (
    <div className="rounded-2xl border border-[#0e2d30]/20 bg-[#0e2d30]/5 p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-[#0e2d30]">
            Concept Studio
          </h3>
          <p className="text-xs text-neutral-600">
            Customize visual direction and vehicle stance
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium tracking-wider text-[#0e2d30] uppercase">
          <span>{concept.model}</span>
          <span>•</span>
          <span>{concept.paint}</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Model Selection */}
        <div>
          <label className="mb-2 block text-xs font-semibold text-neutral-500 uppercase">
            Model
          </label>
          <div className="flex gap-2">
            {(["sedan-sports", "hatchback-sports"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => updateConcept({ model: m })}
                className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium capitalize transition ${
                  concept.model === m
                    ? "border-[#0e2d30] bg-[#0e2d30] text-white"
                    : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400"
                }`}
              >
                {m.replace("-", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Paint Selection */}
        <div>
          <label className="mb-2 block text-xs font-semibold text-neutral-500 uppercase">
            Paint Finish
          </label>
          <div className="flex gap-2">
            {(["petrol", "cream", "clay", "red"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => updateConcept({ paint: p })}
                className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium capitalize transition ${
                  concept.paint === p
                    ? "border-[#0e2d30] bg-[#0e2d30] text-white"
                    : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Stance Selection */}
        <div>
          <label className="mb-2 block text-xs font-semibold text-neutral-500 uppercase">
            Stance
          </label>
          <div className="flex gap-2">
            {(["stock", "sport"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => updateConcept({ stance: s })}
                className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium capitalize transition ${
                  concept.stance === s
                    ? "border-[#0e2d30] bg-[#0e2d30] text-white"
                    : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Aero Package */}
        <div>
          <label className="mb-2 block text-xs font-semibold text-neutral-500 uppercase">
            Aero Package
          </label>
          <button
            type="button"
            onClick={() => updateConcept({ spoiler: !concept.spoiler })}
            className={`w-full rounded-lg border px-3 py-2 text-xs font-medium transition ${
              concept.spoiler
                ? "border-[#0e2d30] bg-[#0e2d30] text-white"
                : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400"
            }`}
          >
            {concept.spoiler ? "Spoiler Active" : "Clean Decklid"}
          </button>
        </div>
      </div>
    </div>
  );
}
