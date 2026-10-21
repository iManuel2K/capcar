"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import {
  getCarModel,
  type CarModel,
} from "@/features/visualizer/car-model-catalog";
import type { createCarModelRenderer } from "./car-model-renderer";

export interface InteractiveCarModelProps {
  modelId: string;
  autoStart?: boolean;
  autoRotate?: boolean;
  presentation?: "studio" | "floating";
  paint?: string | null;
  label?: string;
  posterUrl?: string;
}
export const studioButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#0e2d30]/25 px-4 py-2 text-sm font-medium transition hover:bg-[#0e2d30]/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6d0101] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none";

export function InteractiveCarModel({
  modelId,
  paint,
  label,
  posterUrl,
  autoStart = false,
  autoRotate = false,
  presentation = "studio",
}: InteractiveCarModelProps) {
  const t = useTranslations("CarStudio");
  const model = getCarModel(modelId);
  if (!model) return <p role="status">{t("unavailable")}</p>;
  return (
    <ModelViewer
      key={model.id}
      model={model}
      paint={paint}
      label={label}
      posterUrl={posterUrl}
      autoStart={autoStart}
      autoRotate={autoRotate}
      presentation={presentation}
    />
  );
}

function ModelViewer({
  model,
  paint,
  label,
  posterUrl,
  autoStart,
  autoRotate,
  presentation,
}: {
  model: CarModel;
  autoStart: boolean;
  autoRotate: boolean;
  presentation: "studio" | "floating";
  paint?: string | null;
  label?: string;
  posterUrl?: string;
}) {
  const t = useTranslations("CarStudio");
  const [active, setActive] = useState(autoStart);
  const [rotating, setRotating] = useState(
    () =>
      autoRotate &&
      !(
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
      ),
  );
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
        viewer = createCarModelRenderer(host.current, fail, {
          transparent: presentation === "floating",
        });
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
  }, [active, model, attempt, presentation]);
  const ready = phase === "ready";
  const floating = presentation === "floating";
  useEffect(() => {
    runtime.current?.rotation?.(ready && rotating);
  }, [ready, rotating]);
  return (
    <section
      aria-label={label ?? t("modelLabel", { model: model.name })}
      data-model-id={model.id}
      data-model-state={phase}
      data-presentation={presentation}
    >
      {!floating && (
        <p className="mb-3 text-xs font-semibold tracking-widest uppercase">
          {ready ? t("rotateHint") : t("freeModel")}
        </p>
      )}
      <div
        className={
          floating
            ? "relative isolate aspect-[16/9]"
            : "relative isolate aspect-[4/3] overflow-hidden rounded-2xl bg-[#e2e4da] sm:aspect-[16/10]"
        }
      >
        {(!active || !ready) && (
          <Image
            src={posterUrl ?? `/models/cars/previews/${model.id}.webp`}
            alt={t("posterAlt", { model: model.name })}
            unoptimized
            fill
            sizes="(max-width: 1024px) 100vw, 800px"
            className="object-contain"
            preload={model.id === "bmw-m3-e30"}
          />
        )}
        <div
          ref={host}
          className="absolute inset-0 touch-pan-y [&>canvas]:!h-full [&>canvas]:!w-full [&>canvas]:touch-pan-y"
          style={{ visibility: ready ? "visible" : "hidden" }}
        />
      </div>
      {!active && (
        <div className="mt-4 flex justify-start">
          <button
            type="button"
            className={`${studioButton} border-transparent bg-[#0e2d30] text-[#f3f1e7] shadow-lg hover:bg-[#19464a]`}
            onClick={() => setActive(true)}
          >
            {t("load")} <span aria-hidden="true">↗</span>
          </button>
        </div>
      )}
      <p
        role="status"
        aria-live="polite"
        className="mt-3 min-h-5 text-xs leading-5 text-[#0e2d30]/80"
      >
        {phase === "idle"
          ? t("idle")
          : phase === "loading"
            ? t("loading", { model: model.name })
            : phase === "ready"
              ? t("ready")
              : t("error")}
      </p>
      {active && (
        <div
          className="mt-3 flex flex-wrap gap-2"
          aria-label={t("cameraControls")}
        >
          {(["perspective", "front", "side", "rear"] as const).map((view) => (
            <button
              type="button"
              className={studioButton}
              key={view}
              disabled={!ready}
              onClick={() => {
                setRotating(false);
                runtime.current?.rotation?.(false);
                runtime.current?.camera(view);
              }}
            >
              {t(`camera.${view}`)}
            </button>
          ))}
          <button
            type="button"
            className={studioButton}
            disabled={!ready}
            aria-pressed={rotating}
            onClick={() => setRotating((value) => !value)}
          >
            {t(rotating ? "pauseRotation" : "autoRotation")}
          </button>
          {!floating && (
            <>
              {" "}
              <button
                type="button"
                className={studioButton}
                disabled={!ready}
                onClick={() => runtime.current?.zoom("in")}
              >
                {t("zoomIn")}
              </button>
              <button
                type="button"
                className={studioButton}
                disabled={!ready}
                onClick={() => runtime.current?.zoom("out")}
              >
                {t("zoomOut")}
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
                    setExportMessage(t("exported"));
                  } catch {
                    setExportMessage(t("exportError"));
                  }
                }}
              >
                {t("saveImage")}
              </button>
              <button
                type="button"
                className={studioButton}
                onClick={() => {
                  setActive(false);
                  setPhase("idle");
                }}
              >
                {t("stop")}
              </button>
            </>
          )}
          {phase === "error" && (
            <button
              type="button"
              className={studioButton}
              onClick={() => setAttempt((value) => value + 1)}
            >
              {t("retry")}
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
        {t("modelBy")}{" "}
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
          {t("originalModel")}
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
        . {t("optimized")}{" "}
        <a
          className="underline underline-offset-2"
          href="/models/cars/ATTRIBUTION.md"
        >
          {t("credits")}
        </a>
        .
      </p>
    </section>
  );
}
