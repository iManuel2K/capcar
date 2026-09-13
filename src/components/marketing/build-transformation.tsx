"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { useTranslations } from "next-intl";

export function BuildTransformation({ eager = false }: { eager?: boolean }) {
  const t = useTranslations("Launch.visual");
  const [reveal, setReveal] = useState(40);
  const id = useId();
  return (
    <figure className="min-w-0">
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[#071519]">
        <Image
          src="/capcar-hero-bmw-garage.png"
          alt={t("alt")}
          fill
          sizes="(min-width: 900px) 55vw, 100vw"
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 0 0 ${100 - reveal}%)` }}
          aria-hidden="true"
        >
          <Image
            src="/capcar-hero-bmw-vision.png"
            alt=""
            fill
            sizes="(min-width: 900px) 55vw, 100vw"
            className="object-cover"
          />
        </div>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-px bg-[#e8e6d7]/75"
          style={{ left: `${100 - reveal}%` }}
        />
        <div className="absolute inset-x-0 top-0 flex justify-between gap-3 p-3 text-xs text-white sm:p-4">
          <span className="rounded-md bg-[#071519]/90 px-2 py-1">
            {t("current")}
          </span>
          <span className="rounded-md bg-[#071519]/90 px-2 py-1">
            {t("concept")}
          </span>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-3 text-xs">
        <label htmlFor={id} className="sr-only">
          {t("label")}
        </label>
        <input
          id={id}
          type="range"
          min="0"
          max="100"
          value={reveal}
          onChange={(event) => setReveal(Number(event.target.value))}
          aria-valuetext={t("value", { value: reveal })}
          className="h-11 min-w-0 flex-1 cursor-ew-resize touch-pan-y accent-[#bf8269] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bf8269]"
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
