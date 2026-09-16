"use client";

import { MapPinned } from "lucide-react";

import type { RoadbookCenter } from "@/features/roadbook/roadbook-client";
import type {
  RoadbookMapMode,
  RoadbookVenue,
} from "@/features/roadbook/roadbook-schema";

const styleIds: Record<RoadbookMapMode, string> = {
  workshop_cream: "light-v11",
  petrol_night: "dark-v11",
  blueprint: "navigation-night-v1",
  touring_clay: "outdoors-v12",
};

export function RoadbookRasterFallback({
  accessToken,
  venues,
  selectedVenue,
  mode,
  center,
  label,
  description,
  onSelect,
}: {
  accessToken: string;
  venues: RoadbookVenue[];
  selectedVenue?: RoadbookVenue;
  mode: RoadbookMapMode;
  center: RoadbookCenter;
  label: string;
  description: string;
  onSelect: (venue: RoadbookVenue) => void;
}) {
  const pins = venues
    .slice(0, 25)
    .map(
      (venue) =>
        `pin-s-${venue.id === selectedVenue?.id ? "e72d45" : "f3f1ec"}(${venue.longitude},${venue.latitude})`,
    )
    .join(",");
  const overlay = pins ? `${pins}/` : "";
  const imageUrl = `https://api.mapbox.com/styles/v1/mapbox/${styleIds[mode]}/static/${overlay}${center.longitude},${center.latitude},7.3,0/1280x800@2x?access_token=${encodeURIComponent(accessToken)}&logo=false&attribution=true`;

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0b0e0c]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="absolute inset-0 size-full object-cover opacity-82"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,16,13,.48),transparent_45%,rgba(7,16,13,.18))]" />

      <div className="absolute top-[10.5rem] right-3 z-10 max-w-[16rem] rounded-xl border border-white/12 bg-[#09100d]/88 p-3 shadow-xl backdrop-blur-xl sm:top-44 sm:right-5">
        <p className="flex items-center gap-2 text-[11px] font-semibold text-white/78">
          <MapPinned className="size-3.5 text-[#ff667a]" /> {label}
        </p>
        <p className="mt-1 hidden text-[10px] leading-4 text-white/42 sm:block">
          {description}
        </p>
      </div>

      {venues.length > 0 && (
        <div className="absolute right-3 bottom-24 left-3 z-10 flex gap-2 overflow-x-auto pb-1 sm:top-1/2 sm:right-5 sm:bottom-auto sm:left-auto sm:max-h-[38vh] sm:w-64 sm:-translate-y-1/2 sm:flex-col sm:overflow-y-auto sm:pr-1">
          {venues.map((venue) => (
            <button
              key={venue.id}
              type="button"
              onClick={() => onSelect(venue)}
              className={`min-h-11 shrink-0 rounded-xl border px-3 text-left text-xs shadow-lg backdrop-blur-xl transition sm:w-full ${
                venue.id === selectedVenue?.id
                  ? "border-[#ff667a]/50 bg-[#e72d45] text-white"
                  : "border-white/12 bg-[#09100d]/88 text-white/72 hover:border-white/25 hover:text-white"
              }`}
            >
              <span className="block max-w-48 truncate font-semibold">
                {venue.name}
              </span>
              <span className="mt-0.5 block text-[9px] tracking-[0.08em] uppercase opacity-55">
                {venue.city || venue.countryCode}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
