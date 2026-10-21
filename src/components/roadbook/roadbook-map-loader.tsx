"use client";

import dynamic from "next/dynamic";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

const RoadbookExperience = dynamic(
  () =>
    import("@/components/roadbook/roadbook-experience").then(
      (module) => module.RoadbookExperience,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-[calc(100dvh-4.5rem)] min-h-[38rem] place-items-center bg-[#0b0e0c] text-white">
        <LoadingIndicator />
      </div>
    ),
  },
);

export function RoadbookMapLoader() {
  return <RoadbookExperience />;
}
