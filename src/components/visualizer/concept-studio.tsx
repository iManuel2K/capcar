"use client";

import { useEffect, useRef, useState } from "react";
import {
  conceptSchema,
  conceptPresets,
  defaultConcept,
  paints,
  type Concept,
} from "@/features/visualizer/concept-studio";
import type { createConceptRenderer } from "./concept-renderer";

const button =
  "min-h-11 rounded-full border border-[#0e2d30]/30 px-4 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6d0101] disabled:opacity-40";

export interface ConceptStudioProps {
  initialConcept?: Concept;
  storageKey?: string;
}

export function ConceptStudio({
  initialConcept = defaultConcept,
  storageKey = "capcar.visual-direction.v1",
}: ConceptStudioProps) {
  const [value, setValue] = useState<Concept>(() => ({ ...initialConcept }));
  const [storageMessage, setStorageMessage] = useState("");
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState(
    "Choose a direction, then load the interactive model.",
  );
  const [attempt, setAttempt] = useState(0);
  const host = useRef<HTMLDivElement>(null);
  const runtime = useRef<ReturnType<typeof createConceptRenderer> | null>(null);
  const latest = useRef(value);
  useEffect(() => {
    latest.current = value;
    runtime.current?.update(value);
  }, [value]);
  useEffect(() => {
    if (!active || !host.current) return;
    let cancelled = false;
    const fail = () => {
      if (!cancelled)
        setStatus(
          "3D is unavailable. Stop 3D and retry, or keep exploring the configuration below.",
        );
    };
    setStatus("Loading concept model…");
    import("./concept-renderer")
      .then(async ({ createConceptRenderer }) => {
        if (cancelled || !host.current) return;
        runtime.current = createConceptRenderer(host.current, fail);
        await runtime.current.load(latest.current);
        if (!cancelled) {
          runtime.current?.update(latest.current);
          setStatus("Model ready. Drag to orbit, or use the camera buttons.");
        }
      })
      .catch(fail);
    return () => {
      cancelled = true;
      runtime.current?.dispose();
      runtime.current = null;
    };
  }, [active, value.model, attempt]);
  return (
    <div className="overflow-hidden rounded-3xl border border-[#0e2d30]/20 bg-[#f3f1e7] text-[#0e2d30]">
      <div className="grid lg:grid-cols-[1.5fr_1fr]">
        <div className="min-w-0 p-5 sm:p-8">
          <p className="text-xs font-semibold tracking-widest uppercase">
            Concept lab · stylized 3D
          </p>
          <div
            ref={host}
            className="relative my-5 h-64 overflow-hidden rounded-2xl bg-[#dfdfd2] sm:h-96"
          >
            {!active && (
              <div className="flex h-full flex-col items-center justify-center gap-4 px-5 text-center">
                <p className="text-3xl font-medium tracking-tight">
                  Your next direction.
                </p>
                <p className="max-w-xs text-sm">
                  Two original generic silhouettes. No vehicle data or account
                  required.
                </p>
                <button className={button} onClick={() => setActive(true)}>
                  Load interactive 3D
                </button>
              </div>
            )}
          </div>
          <p role="status" className="min-h-12 text-sm leading-6">
            {status}
          </p>
          {active && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className={button}
                onClick={() => runtime.current?.zoom("in")}
              >
                Zoom in
              </button>
              <button
                className={button}
                onClick={() => runtime.current?.zoom("out")}
              >
                Zoom out
              </button>
              {(["front", "side", "rear"] as const).map((view) => (
                <button
                  key={view}
                  className={button}
                  onClick={() => runtime.current?.camera(view)}
                >
                  {view[0].toUpperCase() + view.slice(1)} view
                </button>
              ))}
              <button
                className={button}
                onClick={() => {
                  setActive(false);
                  setStatus(
                    "3D stopped. Your configuration is kept until you leave this page.",
                  );
                }}
              >
                Stop 3D
              </button>
              <button
                className={button}
                onClick={() => setAttempt((n) => n + 1)}
              >
                Retry
              </button>
            </div>
          )}
        </div>
        <div className="space-y-6 border-t border-[#0e2d30]/15 p-5 sm:p-8 lg:border-t-0 lg:border-l">
          <label className="block text-sm font-semibold">
            Silhouette
            <select
              className="mt-2 block min-h-12 w-full rounded-xl border border-[#0e2d30]/30 bg-transparent px-3"
              value={value.model}
              onChange={(event) =>
                setValue({
                  ...value,
                  model: event.target.value as Concept["model"],
                  spoiler: event.target.value === "sedan-sports",
                })
              }
            >
              <option value="sedan-sports">Sports sedan</option>
              <option value="hatchback-sports">Sports hatchback</option>
            </select>
          </label>
          <fieldset>
            <legend className="mb-3 text-sm font-semibold">Body paint</legend>
            <div className="flex flex-wrap gap-2">
              {Object.entries(paints).map(([name, color]) => (
                <button
                  key={name}
                  aria-pressed={value.paint === name}
                  className={`${button} ${value.paint === name ? "ring-2 ring-[#0e2d30]" : ""}`}
                  onClick={() =>
                    setValue({ ...value, paint: name as Concept["paint"] })
                  }
                >
                  <span
                    aria-hidden="true"
                    style={{ backgroundColor: color }}
                    className="mr-2 inline-block size-3 rounded-full border border-black/30"
                  />
                  {name}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-3 text-sm font-semibold">
              Ride height · visual only
            </legend>
            <div className="flex gap-2">
              {(["stock", "sport"] as const).map((stance) => (
                <button
                  key={stance}
                  className={`${button} ${value.stance === stance ? "bg-[#0e2d30] text-[#e8e6d7]" : ""}`}
                  aria-pressed={value.stance === stance}
                  onClick={() => setValue({ ...value, stance })}
                >
                  {stance}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input
              type="checkbox"
              className="size-5 accent-[#0e2d30]"
              checked={value.spoiler}
              disabled={value.model !== "sedan-sports"}
              onChange={(event) =>
                setValue({ ...value, spoiler: event.target.checked })
              }
            />
            Rear spoiler · sedan only
          </label>
          <button
            className={button}
            onClick={() => setValue({ ...initialConcept })}
          >
            Reset configuration
          </button>
          <div className="flex flex-wrap gap-2">
            <button
              className={button}
              onClick={() => {
                try {
                  localStorage.setItem(storageKey, JSON.stringify(value));
                  setStorageMessage("Direction saved on this device.");
                } catch {
                  setStorageMessage("Direction could not be saved.");
                }
              }}
            >
              Save direction
            </button>
            <button
              className={button}
              onClick={() => {
                try {
                  const parsed = conceptSchema.safeParse(
                    JSON.parse(localStorage.getItem(storageKey) ?? "null"),
                  );
                  if (!parsed.success) throw new Error("invalid concept");
                  setValue(parsed.data);
                  setStorageMessage("Saved direction restored.");
                } catch {
                  setStorageMessage("Saved direction could not be read.");
                }
              }}
            >
              Restore direction
            </button>
          </div>
          {storageMessage && (
            <p role="status" className="text-xs leading-5">
              {storageMessage}
            </p>
          )}
          <p className="text-xs leading-6">
            Session-only exploration. Paint, body height and the sedan spoiler
            are supported. Wheels, brakes, interiors and real-world fitment are
            not configurable here.
          </p>
        </div>
      </div>
      <div className="border-t border-[#0e2d30]/15 p-5 sm:p-8">
        <h3 className="text-xl font-medium">Cinema-inspired directions</h3>
        <p className="mt-2 text-sm leading-6">
          Original themes, not film-car replicas. No studio or manufacturer
          affiliation.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {conceptPresets.map((preset) => (
            <button
              key={preset.name}
              className="rounded-2xl border border-[#0e2d30]/25 p-5 text-left focus-visible:outline-2 focus-visible:outline-offset-4"
              onClick={() => setValue({ ...preset.value })}
            >
              <span className="block font-semibold">{preset.name}</span>
              <span className="mt-2 block text-sm leading-6">
                {preset.description}
              </span>
            </button>
          ))}
        </div>
      </div>
      <p className="border-t border-[#0e2d30]/15 px-5 py-4 text-xs leading-6 sm:px-8">
        Models:{" "}
        <a className="underline" href="https://kenney.nl/assets/car-kit">
          Kenney Car Kit
        </a>{" "}
        ·{" "}
        <a className="underline" href="/models/concepts/LICENSE.txt">
          CC0 license
        </a>
        . Stylized concepts are not dimensional, engineering or installation
        guidance.
      </p>
    </div>
  );
}
