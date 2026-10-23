"use client";

import Image from "next/image";
import { Pause } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./homepage.module.css";

export function BuildTransformation({
  eager = false,
  autoPlay = false,
  compact = false,
}: {
  eager?: boolean;
  autoPlay?: boolean;
  compact?: boolean;
}) {
  const t = useTranslations("Launch.visual");
  const [reveal, setReveal] = useState(autoPlay ? 0 : 40);
  const [loaded, setLoaded] = useState([false, false]);
  const [stopped, setStopped] = useState(false);
  const [finished, setFinished] = useState(false);
  const frame = useRef(0);
  const figure = useRef<HTMLElement>(null);
  const id = useId();
  const pause = () => {
    cancelAnimationFrame(frame.current);
    setStopped(true);
  };

  useEffect(() => {
    if (!autoPlay || stopped || !loaded.every(Boolean)) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return;
    let started = false;
    let start: number | undefined;
    const tick = (time: number) => {
      start ??= time;
      const progress = Math.min(Math.max((time - start - 180) / 3200, 0), 1);
      // Ease in and out without a snap at either end; one pass, never a loop.
      const eased = progress * progress * (3 - 2 * progress);
      setReveal(Math.round(eased * 1000) / 10);
      if (progress < 1) frame.current = requestAnimationFrame(tick);
      else setFinished(true);
    };
    const begin = () => {
      if (started || document.hidden || motion.matches) return;
      started = true;
      frame.current = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame.current);
      setStopped(true);
    };
    const visibility = () => {
      if (document.hidden) stop();
    };
    motion.addEventListener("change", stop);
    document.addEventListener("visibilitychange", visibility);
    const observer =
      typeof IntersectionObserver === "undefined"
        ? undefined
        : new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) begin();
              else if (started) stop();
            },
            { threshold: 0.25 },
          );
    if (figure.current && observer) observer.observe(figure.current);
    else begin();
    return () => {
      cancelAnimationFrame(frame.current);
      observer?.disconnect();
      motion.removeEventListener("change", stop);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [autoPlay, loaded, stopped]);

  const select = (value: number) => {
    pause();
    setReveal(value);
  };
  const presets = [
    { value: 0, label: t("current") },
    ...(!compact ? [{ value: 50, label: "50 / 50" }] : []),
    { value: 100, label: t("concept") },
  ];
  return (
    <figure
      ref={figure}
      className={`min-w-0 ${compact ? styles.heroComparison : ""}`}
      onPointerDownCapture={pause}
      onFocusCapture={pause}
      onKeyDownCapture={pause}
    >
      {!compact && (
        <div
          className={styles.comparisonPresets}
          role="group"
          aria-label={t("label")}
        >
          {presets.map((preset) => (
            <button
              key={preset.value}
              type="button"
              aria-pressed={reveal === preset.value}
              onClick={() => select(preset.value)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
      <div className="bg-card relative aspect-video overflow-hidden rounded-xl">
        <Image
          src="/capcar-hero-bmw-garage.png"
          alt={t("alt")}
          fill
          sizes="(min-width: 1600px) 880px, (min-width: 900px) 55vw, 100vw"
          quality={72}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          onLoad={() => setLoaded(([a, b]) => (a ? [a, b] : [true, b]))}
          onError={pause}
          className="object-contain"
        />
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - reveal}% 0 0)` }}
          aria-hidden="true"
        >
          <Image
            src="/capcar-hero-bmw-vision.png"
            alt=""
            fill
            sizes="(min-width: 1600px) 880px, (min-width: 900px) 55vw, 100vw"
            quality={72}
            loading={eager ? "eager" : "lazy"}
            fetchPriority={eager ? "high" : "auto"}
            onLoad={() => setLoaded(([a, b]) => (b ? [a, b] : [a, true]))}
            onError={pause}
            className="object-contain"
          />
        </div>
        <span
          aria-hidden="true"
          className="bg-primary/75 pointer-events-none absolute inset-y-0 w-px"
          style={{ left: `${reveal}%` }}
        />
      </div>
      {compact && (
        <div
          className={styles.comparisonEndpoints}
          role="group"
          aria-label={t("label")}
        >
          {presets.map((preset) => (
            <button
              key={preset.value}
              type="button"
              aria-pressed={reveal === preset.value}
              onClick={() => select(preset.value)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
      <div
        className={`flex items-center gap-3 text-xs ${compact ? styles.heroRange : "mt-2"}`}
      >
        <label htmlFor={id} className="sr-only">
          {t("label")}
        </label>
        <input
          id={id}
          type="range"
          step="0.1"
          dir="ltr"
          min="0"
          max="100"
          value={reveal}
          onChange={(event) => select(Number(event.target.value))}
          aria-valuetext={t("value", { value: reveal })}
          className="accent-primary focus-visible:outline-primary h-12 min-w-0 flex-1 cursor-ew-resize touch-pan-y focus-visible:outline-2 focus-visible:outline-offset-2"
        />
        {autoPlay ? (
          <button
            type="button"
            onClick={pause}
            disabled={stopped || finished}
            aria-label={stopped || finished ? t("motionStopped") : t("pause")}
            className={styles.comparisonPause}
          >
            <Pause size={18} aria-hidden="true" />
          </button>
        ) : (
          <output htmlFor={id} className="min-w-20 text-right tabular-nums">
            {t("value", { value: reveal })}
          </output>
        )}
      </div>
      <figcaption
        className={
          compact
            ? styles.comparisonCaption
            : "mt-1 text-xs leading-5 opacity-85"
        }
      >
        {compact ? t("shortNote") : t("note")}
      </figcaption>
    </figure>
  );
}
