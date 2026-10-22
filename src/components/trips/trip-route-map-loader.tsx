"use client";

import dynamic from "next/dynamic";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

import type { TripRoute } from "@/features/trips/trip-route";

const TripRouteMap = dynamic(
  () =>
    import("@/components/trips/trip-route-map").then(
      (module) => module.TripRouteMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="bg-card grid min-h-[34rem] place-items-center">
        <LoadingIndicator />
      </div>
    ),
  },
);

export function TripRouteMapLoader({ route }: { route: TripRoute }) {
  return <TripRouteMap route={route} />;
}
