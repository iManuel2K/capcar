import type { Vehicle } from "@/features/vehicles/vehicle-schema";

// Shared symptom checks, NOT model defect or failure-frequency claims. Keep
// these separate from the engine/generation-matched research catalog.
export const commonChecks = [
  {
    id: "tyres",
    difficulty: "easy",
    sourceLabel: "DEKRA",
    sourceUrl: "https://www.dekra.de/de/reifendruck-pruefen/",
  },
  {
    id: "wipers",
    difficulty: "easy",
    sourceLabel: "HELLA",
    sourceUrl:
      "https://hella-wiperblades.com/de/article/scheibenwischer-wechseln",
  },
  {
    id: "starting",
    difficulty: "observe",
    sourceLabel: "ADAC",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/reparatur-pflege-wartung/wartung-inspektion/autobatterie-leer/",
  },
  {
    id: "lights",
    difficulty: "manual",
    sourceLabel: "ADAC",
    sourceUrl:
      "https://www.adac.de/rund-ums-fahrzeug/ausstattung-technik-zubehoer/licht-und-beleuchtung/gluehbirnen-wechseln/",
  },
] as const;
export type CommonCheckId = (typeof commonChecks)[number]["id"];
export function commonChecksForVehicle(
  vehicle: Pick<Vehicle, "make" | "model">,
) {
  // A display concept is not a production vehicle with an owner service manual.
  return vehicle.make.trim().toUpperCase() === "NISSAN" &&
    vehicle.model.trim().toUpperCase() === "Z PROTO"
    ? []
    : commonChecks;
}
