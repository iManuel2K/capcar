"use client";

import Image from "next/image";
import { useState } from "react";

const cars = [
  {
    name: "Nissan Skyline R34 GT-R",
    id: "ff8fb2251dfa4bb9979e7022c5a6666c",
    creator: "Lexyc16",
    image: "/showcase/skyline.jpg",
  },
  {
    name: "1975 Porsche 911 Turbo",
    id: "8568d9d14a994b9cae59499f0dbed21e",
    creator: "Lionsharp Studios",
    image: "/showcase/porsche.jpg",
  },
];

export function IconicGallery() {
  const [selected, setSelected] = useState(0);
  const [active, setActive] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const car = cars[selected];
  return (
    <section
      aria-label="Realistic 3D car collection"
      className="overflow-hidden rounded-3xl border border-[#0e2d30]/20 bg-[#101615] text-[#e8e6d7]"
    >
      <div className="flex gap-3 overflow-x-auto p-4">
        {cars.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={index === selected}
            onClick={() => {
              setSelected(index);
              setActive(false);
            }}
            className={`min-h-12 shrink-0 rounded-xl border px-5 text-sm ${selected === index ? "border-[#e8e6d7] bg-[#e8e6d7] text-[#0e2d30]" : "border-white/25"}`}
          >
            {item.name}
          </button>
        ))}
      </div>
      <div className="relative h-[420px] sm:h-[600px]">
        {active ? (
          <iframe
            key={`${car.id}-${attempt}`}
            title={`${car.name} interactive 3D`}
            src={`https://sketchfab.com/models/${car.id}/embed?autostart=1&ui_theme=dark`}
            allow="fullscreen; xr-spatial-tracking"
            allowFullScreen
            className="h-full w-full border-0"
          />
        ) : (
          <>
            <Image
              src={car.image}
              alt={`${car.name} — preview of the interactive model`}
              fill
              sizes="(max-width: 768px) 100vw, 1200px"
              className="object-contain"
            />
            <button
              type="button"
              onClick={() => setActive(true)}
              className="absolute bottom-6 left-1/2 min-h-12 -translate-x-1/2 rounded-xl bg-[#e8e6d7] px-6 font-semibold whitespace-nowrap text-[#0e2d30]"
            >
              Explore in 3D
            </button>
          </>
        )}
      </div>
      <div className="space-y-3 border-t border-white/15 p-5 text-sm leading-6">
        <p>
          Drag to orbit. Pinch or scroll to zoom. Loading 3D connects to
          Sketchfab; no model loads until you choose it.
        </p>
        {active && (
          <p>
            If the viewer stays blank, allow Sketchfab in your privacy settings.{" "}
            <button
              type="button"
              className="min-h-11 underline"
              onClick={() => setAttempt((value) => value + 1)}
            >
              Retry
            </button>
            {" · "}
            <button
              type="button"
              className="min-h-11 underline"
              onClick={() => setActive(false)}
            >
              Show preview
            </button>
          </p>
        )}
        <p>
          <a
            className="underline"
            href={`https://sketchfab.com/3d-models/${car.id}`}
            target="_blank"
            rel="noreferrer"
          >
            {car.name} by {car.creator}
          </a>
          {" · "}
          <a
            className="underline"
            href="https://creativecommons.org/licenses/by/4.0/"
          >
            CC BY 4.0
          </a>
          . Model and preview unmodified.
        </p>
        <p className="text-xs text-white/60">
          Independent creator references, not official Fast &amp; Furious
          replicas or manufacturer endorsements. Reference viewing only: paint
          and parts controls in the sketch lab do not modify these models.
        </p>
      </div>
    </section>
  );
}
