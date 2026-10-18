"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  getCarModel,
  type CarModel,
} from "@/features/visualizer/car-model-catalog";
import type { createCarModelRenderer } from "./car-model-renderer";

export interface InteractiveCarModelProps {
  modelId: string;
  paint?: string | null;
  label?: string;
}
export const studioButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#0e2d30]/25 px-4 py-2 text-sm font-medium transition hover:bg-[#0e2d30]/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6d0101] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none";

export function InteractiveCarModel({
  modelId,
  paint,
  label,
}: InteractiveCarModelProps) {
  const model = getCarModel(modelId);
  if (!model)
    return (
      <p role="status">
        This car model is not in the free library. Choose another reference.
      </p>
    );
  return (
    <ModelViewer key={model.id} model={model} paint={paint} label={label} />
  );
}

function ModelViewer({
  model,
  paint,
  label,
}: {
  model: CarModel;
  paint?: string | null;
  label?: string;
}) {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  );
  const [attempt, setAttempt] = useState(0);
  const [exportMessage, setExportMessage] = useState("");
  const host = useRef<HTMLDivElement>(null);
  const runtime = useRef<ReturnType<typeof createCarModelRenderer> | null>(
    null,
  );
  const latestPaint = useRef(paint);
  useEffect(() => {
    latestPaint.current = paint;
    runtime.current?.paint(paint);
  }, [paint]);
  useEffect(() => {
    if (!active || !host.current) return;
    let cancelled = false;
    let failed = false;
    let viewer: ReturnType<typeof createCarModelRenderer> | undefined;
    setPhase("loading");
    const fail = () => {
      failed = true;
      if (!cancelled) setPhase("error");
    };
    import("./car-model-renderer")
      .then(async ({ createCarModelRenderer }) => {
        if (cancelled || !host.current) return;
        viewer = createCarModelRenderer(host.current, fail);
        runtime.current = viewer;
        await viewer.load(model);
        if (!cancelled && !failed) {
          viewer.paint(latestPaint.current);
          setPhase("ready");
        }
      })
      .catch(fail);
    return () => {
      cancelled = true;
      viewer?.dispose();
      if (runtime.current === viewer) runtime.current = null;
    };
  }, [active, model, attempt]);
  const ready = phase === "ready";
  return (
    <section
      aria-label={label ?? `${model.name} interactive model`}
      data-model-id={model.id}
      data-model-state={phase}
    >
      <div className="relative isolate aspect-[4/3] overflow-hidden rounded-2xl bg-[#e2e4da] sm:aspect-[16/10]">
        {!active && (
          <Image
            src={`/models/cars/previews/${model.id}.webp`}
            alt={`${model.name} 3D model preview`}
            unoptimized
            fill
            sizes="(max-width: 1024px) 100vw, 800px"
            className="object-contain"
            priority={model.id === "bmw-m3-e30"}
          />
        )}
        <div
          ref={host}
          className="absolute inset-0 touch-pan-y [&>canvas]:!h-full [&>canvas]:!w-full [&>canvas]:touch-pan-y"
        />
        {!active && (
          <div className="absolute inset-x-0 bottom-5 flex justify-center px-4">
            <button
              type="button"
              className={`${studioButton} border-transparent bg-[#0e2d30] text-[#f3f1e7] shadow-lg hover:bg-[#19464a]`}
              onClick={() => setActive(true)}
            >
              Load interactive 3D <span aria-hidden="true">↗</span>
            </button>
          </div>
        )}
        {active && !ready && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#e2e4da]/90 p-6 text-center">
            <p className="max-w-xs text-sm leading-6">
              {phase === "error"
                ? "3D could not start. Try again, or stop 3D to see the preview."
                : `Loading ${model.name}…`}
            </p>
          </div>
        )}
        <span className="pointer-events-none absolute top-4 left-4 rounded-full bg-[#f3f1e7]/95 px-3 py-1.5 text-[10px] font-semibold tracking-widest uppercase">
          {ready ? "Drag to rotate · 360°" : "Free 3D model"}
        </span>
      </div>
      <p
        role="status"
        aria-live="polite"
        className="mt-3 min-h-5 text-xs leading-5 text-[#0e2d30]/80"
      >
        {phase === "idle"
          ? "No account needed. The 3D viewer downloads only after you press load."
          : phase === "loading"
            ? "Loading the selected car only. Slower connections may take a moment."
            : phase === "ready"
              ? "Model ready. Drag to rotate, or use the camera and zoom buttons."
              : "3D is unavailable. Your selection is kept; retry or use the preview."}
      </p>
      {active && (
        <div
          className="mt-3 flex flex-wrap gap-2"
          aria-label="3D camera controls"
        >
          {(["perspective", "front", "side", "rear"] as const).map((view) => (
            <button
              type="button"
              className={studioButton}
              key={view}
              disabled={!ready}
              onClick={() => runtime.current?.camera(view)}
            >
              {view === "perspective"
                ? "Reset view"
                : `${view[0].toUpperCase()}${view.slice(1)} view`}
            </button>
          ))}
          <button
            type="button"
            className={studioButton}
            disabled={!ready}
            onClick={() => runtime.current?.zoom("in")}
          >
            Zoom in
          </button>
          <button
            type="button"
            className={studioButton}
            disabled={!ready}
            onClick={() => runtime.current?.zoom("out")}
          >
            Zoom out
          </button>
          <button
            type="button"
            className={studioButton}
            disabled={!ready}
            onClick={() => {
              try {
                const url = runtime.current?.snapshot();
                if (!url) throw new Error("No image available");
                const link = document.createElement("a");
                link.href = url;
                link.download = `capcar-${model.id}.png`;
                link.click();
                setExportMessage(
                  "Image downloaded. Keep the model credit when sharing.",
                );
              } catch {
                setExportMessage(
                  "Image could not be saved. Try your device’s screenshot tool.",
                );
              }
            }}
          >
            Save image
          </button>
          <button
            type="button"
            className={studioButton}
            onClick={() => {
              setActive(false);
              setPhase("idle");
            }}
          >
            Stop 3D
          </button>
          {phase === "error" && (
            <button
              type="button"
              className={studioButton}
              onClick={() => setAttempt((value) => value + 1)}
            >
              Retry
            </button>
          )}
        </div>
      )}
      {exportMessage && (
        <p className="mt-3 text-xs" role="status">
          {exportMessage}
        </p>
      )}
      <p className="mt-4 text-xs leading-5 text-[#0e2d30]/80">
        Model by{" "}
        <a
          className="underline underline-offset-2"
          href={model.authorUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {model.author}
        </a>{" "}
        ·{" "}
        <a
          className="underline underline-offset-2"
          href={model.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Original model
        </a>{" "}
        ·{" "}
        <a
          className="underline underline-offset-2"
          href={model.licenseUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {model.license}
        </a>
        . Optimized for CapCar.{" "}
        <a
          className="underline underline-offset-2"
          href="/models/cars/ATTRIBUTION.md"
        >
          Credits & changes
        </a>
        .
      </p>
    </section>
  );
}
