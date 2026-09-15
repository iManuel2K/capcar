import type { RoadbookVenue } from "@/features/roadbook/roadbook-schema";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";

export type RoadbookReadinessCheck = {
  key: "identity" | "access" | "noise" | "roadLegal";
  state: "ready" | "check" | "blocked";
};

export function evaluateRoadbookReadiness(
  vehicle: Vehicle | undefined,
  venue: RoadbookVenue,
): RoadbookReadinessCheck[] {
  const checks: RoadbookReadinessCheck[] = [];
  checks.push({
    key: "identity",
    state: vehicle ? "ready" : "check",
  });
  checks.push({
    key: "access",
    state:
      venue.accessStatus === "unknown"
        ? "check"
        : venue.category === "autobahn_context"
          ? "check"
          : "ready",
  });
  if (venue.noiseLimitDb !== undefined)
    checks.push({ key: "noise", state: "check" });
  if (
    venue.category === "scenic_route" ||
    venue.category === "autobahn_context" ||
    venue.requirements.requiresRoadLegal === true
  )
    checks.push({ key: "roadLegal", state: "check" });
  return checks;
}
