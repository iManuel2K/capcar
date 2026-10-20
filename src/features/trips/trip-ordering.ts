import type { TripPlan } from "@/features/trips/trip-planner";
import type { TripRoute } from "@/features/trips/trip-route";

export function preserveExplicitStopOrder(inputMode: "prompt" | "places", prompt: string) {
  return inputMode === "places" ||
    /\b(?:then|after that|do not reorder|don.t reorder|keep (?:the|this|my) order|preserve (?:the|this|my) order|in (?:this|that|the specified|exact) order|danach|dann|reihenfolge|nacheinander|pastaj)\b|→|->|μετά|σειρά|順|それから/i.test(prompt);
}

// Bounded local improvement over directed road durations. Never move endpoints,
// overnight stays, stops across day boundaries, or stops across an overnight stay.
export function orderStopsByTravelTime<T extends { day: number; kind: string }>(
  stops: T[], matrix: Array<Array<number | null>>,
): T[] {
  const count = stops.length;
  if (count < 4 || matrix.length !== count ||
      matrix.some(row => row.length !== count ||
        row.some(value => value !== null && (!Number.isFinite(value) || value < 0)))) return stops;
  const cost = (order: number[]) => order.slice(1).reduce((total, index, position) =>
    total + (matrix[order[position]][index] ?? Infinity), 0);
  let order = stops.map((_, index) => index);
  const groups: number[] = [];
  let group = 0;
  for (let index = 0; index < count; index += 1) {
    const fixed = index === 0 || index === count - 1 || stops[index].kind === "overnight";
    if (index > 0 && stops[index].day !== stops[index - 1].day) group += 1;
    if (fixed) { groups[index] = -1; group += 1; }
    else groups[index] = group;
  }
  let currentCost = cost(order);
  for (let pass = 0; pass < 32; pass += 1) {
    let best = order;
    let bestCost = currentCost;
    for (let from = 1; from < count - 2; from += 1) {
      for (let to = from + 1; to < count - 1; to += 1) {
        if (groups[from] < 0 || groups[from] !== groups[to]) continue;
        const reversed = [...order.slice(0, from), ...order.slice(from, to + 1).reverse(), ...order.slice(to + 1)];
        const swapped = [...order];
        [swapped[from], swapped[to]] = [swapped[to], swapped[from]];
        for (const candidate of [reversed, swapped]) {
          const candidateCost = cost(candidate);
          if (Number.isFinite(candidateCost) && candidateCost + 1 < bestCost) {
            best = candidate;
            bestCost = candidateCost;
          }
        }
      }
    }
    if (best === order) break;
    order = best;
    currentCost = bestCost;
  }
  return order.map(index => stops[index]);
}

export function alignTripPlanWithRoute(plan: TripPlan, route: TripRoute): TripPlan {
  if (route.ordering?.status !== "optimized" || route.stops.length !== plan.stops.length) return plan;
  const indices = route.stops.map(stop => stop.sourceIndex);
  if (indices.some(index => index === undefined || !plan.stops[index]) ||
      new Set(indices).size !== plan.stops.length) return plan;
  const stops = indices.map(index => plan.stops[index!]);
  const days = plan.days.map((day, dayIndex) => {
    const dailyStops = stops.filter(stop => stop.day === dayIndex + 1);
    if (!dailyStops.length) return day;
    const names = dailyStops.map(stop => stop.name);
    return { ...day, waypoints: names, routeIdea: names.join(" → ").slice(0, 700) };
  });
  // Old morning/afternoon labels may no longer fit an automatically moved stop.
  const alignedStops = stops.map(stop => {
    const day = days[stop.day - 1];
    const position = stops.filter(item => item.day === stop.day).indexOf(stop) + 1;
    return { ...stop, timing: day ? `${day.date} · #${position}` : stop.timing };
  });
  return { ...plan, days, stops: alignedStops, distanceKm: Math.round(route.distanceKm),
    drivingHours: Math.round(route.durationMinutes / 6) / 10 };
}
