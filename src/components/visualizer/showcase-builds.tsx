"use client";

import { useState } from "react";
import Link from "next/link";
import { conceptPresets } from "@/features/visualizer/concept-studio";
import { ConceptStudio } from "./concept-studio";
import { IconicGallery } from "./iconic-gallery";

const stories = [
  {
    brief:
      "A late-night sedan: restrained paint, a lower silhouette and a clean rear profile.",
    parts: ["Sport suspension", "Rear spoiler", "Wheel alignment"],
    budget: "€1,200–2,400",
    steps: [
      "Baseline service and tyre inspection",
      "Verify suspension approval and clearance",
      "Install, align and document",
    ],
  },
  {
    brief:
      "A compact weekend escape car with warm paint and everyday ground clearance.",
    parts: ["Paint protection", "Touring tyres", "Brake service kit"],
    budget: "€600–1,500",
    steps: [
      "Inspect tyres, brakes and cooling",
      "Confirm tyre sizes against vehicle documents",
      "Record service and take new photos",
    ],
  },
  {
    brief:
      "A dark-red road-cinema study built around stance and a deliberate rear wing.",
    parts: ["Sport suspension", "Rear wing", "Brake upgrade"],
    budget: "€1,800–3,500",
    steps: [
      "Establish a healthy mechanical baseline",
      "Confirm approval, axle loads and mounting requirements",
      "Specialist installation and inspection",
    ],
  },
];

export function ShowcaseBuilds() {
  const [selected, setSelected] = useState(0);
  const preset = conceptPresets[selected];
  const story = stories[selected];
  return (
    <section aria-label="Showcase builds" className="my-10">
      <IconicGallery />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-widest uppercase">
            Capcar collection / 01—03
          </p>
          <h2 className="mt-2 text-3xl font-medium">
            Three directions. Your starting point.
          </h2>
        </div>
        <Link
          href="/sound-studio"
          className="inline-flex min-h-11 items-center underline"
        >
          Open sound library →
        </Link>
      </div>
      <div
        className="mb-6 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3"
        aria-label="Choose a showcase"
      >
        {conceptPresets.map((item, index) => (
          <button
            type="button"
            key={item.name}
            aria-pressed={index === selected}
            onClick={() => setSelected(index)}
            className={`min-h-36 min-w-64 flex-1 snap-start rounded-2xl border p-6 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none ${selected === index ? "border-[#0e2d30] bg-[#0e2d30] text-[#e8e6d7]" : "border-[#0e2d30]/25"}`}
          >
            <span className="text-xs">0{index + 1} / Original concept</span>
            <span className="mt-4 block text-xl font-medium">{item.name}</span>
            <span className="mt-2 block text-sm">{item.description}</span>
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
          <p className="mt-3 text-sm leading-6">{story.brief}</p>
          <p className="mt-3 font-medium">{story.budget}</p>
          <p className="text-xs leading-5">
            Illustrative planning range, not live pricing. No installation or
            inspection claimed.
          </p>
        </div>
        <div>
          <h3 className="font-semibold">Parts research</h3>
          {story.parts.map((part) => (
            <Link
              key={part}
              className="flex min-h-11 items-center underline"
              href={`/parts-search?q=${encodeURIComponent(part)}`}
            >
              {part} →
            </Link>
          ))}
          <p className="text-xs">
            Select your real vehicle and verify fitment before buying.
          </p>
        </div>
        <div>
          <h3 className="font-semibold">Proposed build sequence</h3>
          <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm leading-6">
            {story.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
