import { z } from "zod";

import { requestExternalProvider } from "@/features/providers/external-json-provider";

export const tripPlannerRequestSchema = z.object({
  vehicle: z.string().trim().min(2).max(120),
  region: z.string().trim().min(2).max(120),
  startDate: z.iso.date(),
  duration: z.number().int().min(2).max(5),
  pace: z.enum(["scenic", "balanced", "driving"]),
  interests: z
    .array(z.enum(["roads", "food", "photography", "culture", "nature"]))
    .max(5),
  useConnectedContext: z.boolean().default(false),
});

const tripDaySchema = z.object({
  date: z.iso.date(),
  title: z.string(),
  drivingWindow: z.string(),
  routeIdea: z.string(),
  highlight: z.string(),
  evening: z.string(),
});

export const tripPlanSchema = z.object({
  provider: z.string(),
  source: z.enum(["deterministic", "external"]),
  title: z.string(),
  summary: z.string(),
  days: z.array(tripDaySchema).min(2).max(5),
  checklist: z.array(z.string()).min(3).max(12),
  contextNotes: z.array(z.string()).max(8),
  verificationNote: z.string(),
});

export type TripPlannerRequest = z.infer<typeof tripPlannerRequestSchema>;
export type TripPlan = z.infer<typeof tripPlanSchema>;

export type ConnectedPlanningContext = {
  busyDates: string[];
  mailSignals: Array<{ subject: string; date?: string }>;
};

type TripPlannerEnvironment = Record<string, string | undefined>;

export function getTripPlannerStatus(
  environment: TripPlannerEnvironment = process.env,
) {
  const external = environment.CAPCAR_TRIP_PLANNER_MODE === "external";
  return {
    mode: external ? ("external" as const) : ("deterministic" as const),
    configured:
      !external ||
      Boolean(
        environment.CAPCAR_TRIP_PLANNER_ENDPOINT &&
        environment.CAPCAR_TRIP_PLANNER_API_KEY,
      ),
    providerName:
      environment.CAPCAR_TRIP_PLANNER_PROVIDER_NAME ||
      (external ? "External AI planner" : "CapCar route composer"),
  };
}

function addDays(date: string, amount: number) {
  const value = new Date(`${date}T12:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + amount);
  return value.toISOString().slice(0, 10);
}

function deterministicPlan(
  request: TripPlannerRequest,
  context?: ConnectedPlanningContext,
): TripPlan {
  const paceCopy = {
    scenic: {
      driving: "2–3 relaxed driving hours",
      route:
        "Choose the slower secondary roads and leave room for two unplanned viewpoint stops.",
    },
    balanced: {
      driving: "3–4 driving hours with long breaks",
      route:
        "Mix one memorable road section with a comfortable transfer and a proper lunch stop.",
    },
    driving: {
      driving: "4–5 focused driving hours",
      route:
        "Build the day around two strong road sections, separated by fuel, food and recovery time.",
    },
  }[request.pace];
  const interestCopy: Record<TripPlannerRequest["interests"][number], string> =
    {
      roads: "a road worth waking up early for",
      food: "a regional lunch stop with easy parking",
      photography: "golden-hour light at a legal car-photo location",
      culture: "a compact old-town or industrial-heritage stop",
      nature: "a short walk or quiet viewpoint away from through traffic",
    };
  const interests = request.interests.length
    ? request.interests.map((interest) => interestCopy[interest])
    : [interestCopy.roads, interestCopy.nature];
  const dayShapes = [
    {
      title: "Settle into the region",
      routeIdea: `Enter ${request.region} by a quieter approach road rather than the fastest motorway route.`,
      evening: "Check in before dark, refuel, and keep the first evening easy.",
    },
    {
      title: "The main scenic loop",
      routeIdea: `Create a circular Roadbook route through ${request.region}, with a weather-safe shortcut back to the base.`,
      evening:
        "Park the car, review the next day's weather, and save the best stops to the Roadbook.",
    },
    {
      title: "A slower final chapter",
      routeIdea: `Use a different side of ${request.region} for the return, avoiding a simple repeat of the arrival road.`,
      evening:
        "Arrive home with fuel and time left instead of stretching the final leg.",
    },
    {
      title: "Deepen the route",
      routeIdea: `Add one remote section in ${request.region}, but keep a direct fallback route for weather or fatigue.`,
      evening:
        "Leave the car parked and make the evening about the place, not more kilometres.",
    },
    {
      title: "One last road",
      routeIdea: `Pick a short signature road in ${request.region} before joining the efficient route home.`,
      evening:
        "Finish early enough to unpack and record the trip in the Garage.",
    },
  ];
  const days = Array.from({ length: request.duration }, (_, index) => {
    const shape =
      index === request.duration - 1
        ? dayShapes[2]
        : (dayShapes[index] ?? dayShapes[3]);
    return {
      date: addDays(request.startDate, index),
      title: `Day ${index + 1} · ${shape.title}`,
      drivingWindow: paceCopy.driving,
      routeIdea: `${shape.routeIdea} ${paceCopy.route}`,
      highlight: interests[index % interests.length],
      evening: shape.evening,
    };
  });
  const contextNotes: string[] = [];
  if (context) {
    const conflicts = days.filter((day) =>
      context.busyDates.includes(day.date),
    );
    contextNotes.push(
      conflicts.length
        ? `Calendar sync found existing events on ${conflicts.map((day) => day.date).join(", ")}; keep those days flexible.`
        : "Calendar sync found no dated conflicts across this trip window.",
    );
    if (context.mailSignals.length) {
      contextNotes.push(
        `Mail sync found ${context.mailSignals.length} recent travel or booking signal${context.mailSignals.length === 1 ? "" : "s"}; review them before confirming the route.`,
      );
    } else {
      contextNotes.push("Mail sync found no recent travel or booking signals.");
    }
  }
  return {
    provider: "CapCar route composer",
    source: "deterministic",
    title: `${request.vehicle} · ${request.region}`,
    summary: `A ${request.duration}-day ${request.pace} outline that treats the car as part of the weekend, without turning every day into an endurance drive.`,
    days,
    checklist: [
      `Check tyres, pressures, fluids, lights and the spare/repair kit on ${request.vehicle}.`,
      "Confirm seasonal road closures, access rules, parking and weather 24 hours before departure.",
      "Download the route for offline use and keep an efficient fallback for every scenic section.",
      "Book accommodation only after confirming that overnight parking suits the vehicle.",
      "Keep fuel, tolls, low-emission zones and recovery cover in the trip budget.",
    ],
    contextNotes,
    verificationNote:
      "This is a planning draft, not live navigation. Verify roads, opening hours, legal access and current conditions before driving.",
  };
}

export async function planScenicTrip(
  request: TripPlannerRequest,
  context?: ConnectedPlanningContext,
  environment: TripPlannerEnvironment = process.env,
): Promise<TripPlan> {
  const status = getTripPlannerStatus(environment);
  if (status.mode === "deterministic")
    return deterministicPlan(request, context);
  if (!status.configured)
    throw new Error("External trip planner is not fully configured.");
  const response = await requestExternalProvider<
    TripPlannerRequest & { connectedContext?: ConnectedPlanningContext },
    TripPlan
  >(
    {
      endpoint: environment.CAPCAR_TRIP_PLANNER_ENDPOINT!,
      apiKey: environment.CAPCAR_TRIP_PLANNER_API_KEY!,
    },
    { ...request, connectedContext: context },
  );
  return tripPlanSchema.parse({
    ...response,
    provider: status.providerName,
    source: "external",
  });
}
