"use client";

import { useState } from "react";
import Link from "next/link";
import { conceptPresets } from "@/features/visualizer/concept-studio";
import { ConceptStudio } from "./concept-studio";
import { IconicGallery } from "./iconic-gallery";
import { useTranslations } from "next-intl";

const budgets = ["€1,200–2,400", "€600–1,500", "€1,800–3,500"];

export function ShowcaseBuilds() {
  const t = useTranslations("StudioUi");
  const data = useTranslations("ShowcaseData");
  const [selected, setSelected] = useState(0);
  const preset = conceptPresets[selected];
  const storyKey = `s${selected + 1}`;
  const parts = ["p1", "p2", "p3"].map((key) => data(`${storyKey}.${key}`));
  const steps = ["x1", "x2", "x3"].map((key) => data(`${storyKey}.${key}`));
  return (
    <section aria-label={data("label")} className="my-10">
      <IconicGallery />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-widest uppercase">{t("collection")}</p>
          <h2 className="mt-2 text-3xl font-medium">{t("three")}</h2>
        </div>
        <Link
          href="/sound-studio"
          className="inline-flex min-h-11 items-center underline"
        >
          {t("sound")}
        </Link>
      </div>
      <div
        className="mb-6 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3"
        aria-label={t("chooseShowcase")}
      >
        {conceptPresets.map((item, index) => (
          <button
            type="button"
            key={item.name}
            aria-pressed={index === selected}
            onClick={() => setSelected(index)}
            className={`min-h-36 min-w-64 flex-1 snap-start rounded-2xl border p-6 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none ${selected === index ? "border-[#0e2d30] bg-[#0e2d30] text-[#e8e6d7]" : "border-[#0e2d30]/25"}`}
          >
            <span className="text-xs">
              0{index + 1} / {t("original")}
            </span>
            <span className="mt-4 block text-xl font-medium">{item.name}</span>
            <span className="mt-2 block text-sm">
              {data(`s${index + 1}.brief`)}
            </span>
          </button>
        ))}
      </div>
      <ConceptStudio
        key={preset.name}
        initialConcept={preset.value}
        storageKey="capcar.visual-direction.v1"
      />
      <div className="mt-6 grid gap-6 rounded-2xl border border-[#0e2d30]/20 p-6 md:grid-cols-3">
        <div>
          <h3 className="font-semibold">{preset.name}</h3>
          <p className="mt-3 text-sm leading-6">{data(`${storyKey}.brief`)}</p>
          <p className="mt-3 font-medium">{budgets[selected]}</p>
          <p className="text-xs leading-5">{t("planningRange")}</p>
        </div>
        <div>
          <h3 className="font-semibold">{t("partsResearch")}</h3>
          {parts.map((part) => (
            <Link
              key={part}
              className="flex min-h-11 items-center underline"
              href={`/parts-search?q=${encodeURIComponent(part)}`}
            >
              {part} →
            </Link>
          ))}
          <p className="text-xs">{t("verify")}</p>
        </div>
        <div>
          <h3 className="font-semibold">{t("sequence")}</h3>
          <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm leading-6">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
