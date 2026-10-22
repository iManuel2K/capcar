"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./homepage.module.css";

export function BuildTransformation({ eager = false }: { eager?: boolean }) {
  const t = useTranslations("Launch.visual");
  const [reveal, setReveal] = useState(40);
  const id = useId();
  return (
    <figure className="min-w-0">
      <div
        className={styles.comparisonPresets}
        role="group"
        aria-label={t("label")}
      >
        {[
          { value: 0, label: t("current") },
          { value: 50, label: "50 / 50" },
          { value: 100, label: t("concept") },
        ].map((preset) => (
          <button
            key={preset.value}
            type="button"
            aria-pressed={reveal === preset.value}
            onClick={() => setReveal(preset.value)}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className="bg-card relative aspect-video overflow-hidden rounded-xl">
        <Image
          src="/capcar-hero-bmw-garage.png"
          alt={t("alt")}
          fill
          sizes="(min-width: 1600px) 880px, (min-width: 900px) 55vw, 100vw"
          quality={72}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
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
            className="object-contain"
          />
        </div>
        <span
          aria-hidden="true"
          className="bg-background/75 pointer-events-none absolute inset-y-0 w-px"
          style={{ left: `${reveal}%` }}
        />
      </div>
      <div className="mt-2 flex items-center gap-3 text-xs">
        <label htmlFor={id} className="sr-only">
          {t("label")}
        </label>
        <input
          id={id}
          type="range"
          dir="ltr"
          min="0"
          max="100"
          value={reveal}
          onChange={(event) => setReveal(Number(event.target.value))}
          aria-valuetext={t("value", { value: reveal })}
          className="accent-primary focus-visible:outline-primary h-11 min-w-0 flex-1 cursor-ew-resize touch-pan-y focus-visible:outline-2 focus-visible:outline-offset-2"
        />
        <output htmlFor={id} className="min-w-20 text-right tabular-nums">
          {t("value", { value: reveal })}
        </output>
      </div>
      <figcaption className="mt-1 text-xs leading-5 opacity-85">
        {t("note")}
      </figcaption>
    </figure>
  );
}
