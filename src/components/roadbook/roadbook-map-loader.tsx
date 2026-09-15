"use client";

import dynamic from "next/dynamic";

const RoadbookExperience = dynamic(
  () =>
    import("@/components/roadbook/roadbook-experience").then(
      (module) => module.RoadbookExperience,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-[calc(100dvh-4.5rem)] min-h-[38rem] place-items-center bg-[#0b0e0c] text-white">
        <div className="size-8 animate-spin rounded-full border-2 border-white/15 border-t-[#e72d45]" />
      </div>
    ),
  },
);

export function RoadbookMapLoader() {
  return <RoadbookExperience />;
}
