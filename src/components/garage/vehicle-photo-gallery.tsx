"use client";

import Image from "next/image";
import { Camera, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const project318Photos = [
  {
    src: "/capcar-bmw-current-side.webp",
    label: "Side profile",
    alt: "Black BMW E90 side profile beneath an urban bridge",
    position: "center 54%",
  },
  {
    src: "/capcar-bmw-current-front-wide.webp",
    label: "Front view",
    alt: "Black BMW E90 front view between two urban bridges",
    position: "center 58%",
  },
  {
    src: "/capcar-bmw-current-front-close.webp",
    label: "Front detail",
    alt: "Close front view of the black BMW E90",
    position: "center 62%",
  },
  {
    src: "/capcar-bmw-current-rear-night.webp",
    label: "Rear at night",
    alt: "Rear view of the black BMW E90 beneath a bridge at night",
    position: "center 58%",
  },
] as const;

export function VehiclePhotoGallery({ label }: { label: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = project318Photos[activeIndex];

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0b0b0b]">
      <div className="group relative min-h-[330px] overflow-hidden sm:min-h-[430px] lg:min-h-[500px]">
        {project318Photos.map((photo, index) => (
          <Image
            key={photo.src}
            src={photo.src}
            alt={index === activeIndex ? photo.alt : ""}
            fill
            priority={index === 0}
            sizes="(min-width: 1024px) 58vw, 100vw"
            style={{ objectPosition: photo.position }}
            className={`object-cover transition duration-700 ease-out ${
              index === activeIndex
                ? "scale-100 opacity-100"
                : "pointer-events-none scale-[1.025] opacity-0"
            }`}
          />
        ))}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(5,5,5,0.72),transparent_44%),linear-gradient(to_right,rgba(5,5,5,0.22),transparent_45%)]" />
        <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full border border-white/12 bg-black/55 px-3 py-1.5 text-[10px] font-semibold tracking-[0.12em] text-white/75 uppercase backdrop-blur-md sm:top-5 sm:left-5">
          <Camera className="size-3" /> Current vehicle
        </div>
        <div className="absolute right-4 bottom-4 left-4 flex items-end justify-between gap-4 sm:right-5 sm:bottom-5 sm:left-5">
          <div>
            <p className="text-xs text-white/50">{label}</p>
            <p className="mt-1 text-lg font-medium text-white">
              {active.label}
            </p>
          </div>
          <span className="hidden items-center gap-1.5 rounded-full border border-emerald-300/20 bg-black/45 px-3 py-1.5 text-[10px] text-emerald-200 backdrop-blur sm:inline-flex">
            <CheckCircle2 className="size-3" /> 4 current photos
          </span>
        </div>
      </div>

      <div
        aria-label="Vehicle photos"
        className="grid grid-cols-4 gap-2 border-t border-white/8 bg-[#101010] p-2 sm:gap-3 sm:p-3"
      >
        {project318Photos.map((photo, index) => (
          <button
            key={photo.src}
            type="button"
            aria-label={`Show ${photo.label.toLowerCase()}`}
            aria-pressed={index === activeIndex}
            onClick={() => setActiveIndex(index)}
            className={`group relative min-h-16 overflow-hidden rounded-xl border transition sm:min-h-20 ${
              index === activeIndex
                ? "border-[#e72d45] ring-2 ring-[#e72d45]/20"
                : "border-white/8 opacity-60 hover:opacity-100"
            }`}
          >
            <Image
              src={photo.src}
              alt=""
              fill
              sizes="(min-width: 1024px) 12vw, 25vw"
              style={{ objectPosition: photo.position }}
              className="object-cover transition duration-300 group-hover:scale-105"
            />
            <span className="absolute inset-x-0 bottom-0 truncate bg-black/65 px-2 py-1 text-[9px] text-white/75 backdrop-blur-sm sm:text-[10px]">
              {photo.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function isProject318Vehicle(vehicle: {
  make: string;
  model: string;
  platform: string;
}) {
  return (
    vehicle.make.toLowerCase() === "bmw" &&
    vehicle.model.toLowerCase() === "318i" &&
    vehicle.platform.toUpperCase() === "E90"
  );
}
