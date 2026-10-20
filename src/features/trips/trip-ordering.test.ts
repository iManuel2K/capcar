import { describe, expect, it } from "vitest";
import { alignTripPlanWithRoute, orderStopsByTravelTime, preserveExplicitStopOrder } from "@/features/trips/trip-ordering";
import type { TripPlan } from "@/features/trips/trip-planner";
import type { TripRoute } from "@/features/trips/trip-route";

const positions = [0, 2, 1, 3, 4];
const matrix = positions.map(a => positions.map(b => Math.abs(a - b) * 100));
const stops = () => positions.map((_, index) => ({ id: index, day: 1, kind: "photo" }));

describe("automatic trip stop ordering", () => {
  it("removes backtracking and keeps endpoints and every visit", () => {
    const input = stops();
    const ordered = orderStopsByTravelTime(input, matrix);
    expect(ordered.map(stop => stop.id)).toEqual([0, 2, 1, 3, 4]);
    expect(new Set(ordered).size).toBe(input.length);
    expect(input.map(stop => stop.id)).toEqual([0, 1, 2, 3, 4]);
  });
  it("keeps overnight stays and day boundaries fixed", () => {
    const input = stops();
    input[2].kind = "overnight";
    expect(orderStopsByTravelTime(input, matrix)[2]).toBe(input[2]);
    input[2].kind = "photo";
    input[2].day = 2; input[3].day = 2; input[4].day = 2;
    expect(orderStopsByTravelTime(input, matrix).map(stop => stop.day)).toEqual([1, 1, 2, 2, 2]);
  });
  it("does not invent travel times for unavailable or malformed matrices", () => {
    const input = stops();
    expect(orderStopsByTravelTime(input, [[0]])).toBe(input);
    expect(orderStopsByTravelTime(input, matrix.map(row => row.map(() => null)))).toEqual(input);
    expect(orderStopsByTravelTime(input, matrix.map(row => row.map(() => -1)))).toBe(input);
  });
  it("never increases directed road travel time", () => {
    for (let seed = 1; seed <= 40; seed += 1) {
      let state = seed;
      const random = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
      const size = 4 + Math.floor(random() * 12);
      const input = Array.from({ length: size }, (_, id) => ({ id, day: 1, kind: "photo" }));
      const durations = input.map((_, i) => input.map((_, j) => i === j ? 0 : 1 + Math.round(random() * 1000)));
      const cost = (values: typeof input) => values.slice(1).reduce((sum, stop, index) => sum + durations[values[index].id][stop.id], 0);
      const ordered = orderStopsByTravelTime(input, durations);
      expect(cost(ordered)).toBeLessThanOrEqual(cost(input));
      expect(ordered[0]).toBe(input[0]);
      expect(ordered.at(-1)).toBe(input.at(-1));
      expect(new Set(ordered).size).toBe(size);
    }
  });
  it("preserves manual places and explicit language sequences", () => {
    expect(preserveExplicitStopOrder("places", "")).toBe(true);
    for (const prompt of ["Mainz then Wiesbaden", "in this order: Mainz, Bonn", "Mainz → Bonn", "Mainz, danach Bonn"]) {
      expect(preserveExplicitStopOrder("prompt", prompt)).toBe(true);
    }
    expect(preserveExplicitStopOrder("prompt", "A scenic weekend in the Black Forest")).toBe(false);
  });
  it("aligns the detailed itinerary with the map without dropping repeated visits", () => {
    const input = {
      stops: stops().map((stop, index) => ({ ...stop, name: "Stop " + index, mapQuery: index === 4 ? "Start" : "Place " + index, timing: "Morning", reason: "Visit" })),
      days: [{ date: "2026-10-23", waypoints: ["Old order"], routeIdea: "Old order" }],
    } as unknown as TripPlan;
    const route = {
      ordering: { status: "optimized" }, distanceKm: 100, durationMinutes: 120,
      stops: [0, 2, 1, 3, 4].map(sourceIndex => ({ sourceIndex })),
    } as unknown as TripRoute;
    const aligned = alignTripPlanWithRoute(input, route);
    expect(aligned.stops.map(stop => stop.name)).toEqual(["Stop 0", "Stop 2", "Stop 1", "Stop 3", "Stop 4"]);
    expect(aligned.days[0].waypoints).toEqual(aligned.stops.map(stop => stop.name));
    expect(aligned.days[0].routeIdea).toBe(aligned.stops.map(stop => stop.name).join(" → "));
    expect(aligned.stops[1].timing).toBe("2026-10-23 · #2");
    expect(aligned.drivingHours).toBe(2);
    expect(alignTripPlanWithRoute(input, { ...route, stops: route.stops.slice(1) })).toBe(input);
  });
});
