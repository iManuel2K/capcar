import { z } from "zod";

export const conceptSchema = z.object({
  model: z.enum(["sedan-sports", "hatchback-sports"]),
  paint: z.enum(["petrol", "cream", "clay", "red"]),
  stance: z.enum(["stock", "sport"]),
  spoiler: z.boolean(),
});
export type Concept = z.infer<typeof conceptSchema>;
export const paints = {
  petrol: "#0e2d30",
  cream: "#e8e6d7",
  clay: "#bf8269",
  red: "#6d0101",
};
export const defaultConcept: Concept = {
  model: "sedan-sports",
  paint: "petrol",
  stance: "stock",
  spoiler: true,
};
export const conceptPresets: {
  name: string;
  description: string;
  value: Concept;
}[] = [
  {
    name: "Midnight pursuit",
    description: "A restrained noir-inspired sports sedan.",
    value: { ...defaultConcept, stance: "sport" },
  },
  {
    name: "Desert getaway",
    description: "Warm clay and a compact silhouette, inspired by road cinema.",
    value: {
      model: "hatchback-sports",
      paint: "clay",
      stance: "stock",
      spoiler: false,
    },
  },
  {
    name: "Crimson chase",
    description: "Dark red, a lower body and a rear wing.",
    value: { ...defaultConcept, paint: "red", stance: "sport" },
  },
];
