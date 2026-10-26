/** Shared, provider-independent planning rules. No location or preference inference is hidden. */
export const tripStyles = {
  quick: { hours: 3, stopLimit: 2 },
  scenic: { hours: 6, stopLimit: 4 },
  full: { hours: 9, stopLimit: 6 },
} as const;
export type TripStyle = keyof typeof tripStyles;

export function assessTripSchedule(input: {
  drivingMinutes: number;
  stopKinds: string[];
  days: number;
  hoursPerDay: number;
}) {
  const visitMinutes = input.stopKinds.reduce(
    (sum, kind) =>
      sum +
      (kind === "overnight"
        ? 0
        : kind === "food"
          ? 60
          : kind === "fuel"
            ? 15
            : 30),
    0,
  );
  const breakMinutes = Math.floor(input.drivingMinutes / 120) * 15;
  const totalMinutes = Math.ceil(
    input.drivingMinutes + visitMinutes + breakMinutes,
  );
  const availableMinutes = input.days * input.hoursPerDay * 60;
  return {
    drivingMinutes: Math.ceil(input.drivingMinutes),
    visitMinutes,
    breakMinutes,
    totalMinutes,
    availableMinutes,
    fits: totalMinutes <= availableMinutes,
  };
}

/** Extract only explicitly stated details; never infer a city from a country or destination. */
export function extractTripDetails(prompt: string) {
  const departureMatch = prompt.match(
    /(?:\b(?:starting|departing|leaving|start)\s+(?:from|in|at)|\bfrom|\b(?:starten|start)\s+(?:in|aus)|\b(?:nisemi|nisje)\s+nga|ξεκινάμε\s+από)\s+([\p{L}][\p{L}\p{M} .’'−-]*?)(?=[,.;!?\n]|\s+(?:to|with|for|and|across|nach|mit|für|und|me|drejt)\b|$)/iu,
  );
  // Prefer an explicit departure over a current location elsewhere in the prompt.
  const currentLocationMatch = prompt.match(
    /(?:\b(?:i\s+am|we\s+are|i[’']m|we[’']re)\s+(?:(?:currently|now)\s+)?in|\b(?:ich\s+bin|wir\s+sind)\s+(?:(?:gerade|jetzt)\s+)?in)\s+([\p{L}][\p{L}\p{M} .’'−-]*?)(?=[,.;!?\n]|\s+(?:to|with|for|and|across|nach|mit|für|und)\b|$)/iu,
  );
  const originMatch = departureMatch ?? currentLocationMatch;
  const days = prompt.match(
    /\b([1-5])\s*[- ]?\s*(?:days?|tage?|ditë)\b|([1-5])\s*(?:日間|μέρες|ημέρες)/iu,
  );
  const hours = prompt.match(
    /\b(\d{1,2}(?:\.5)?)\s*[- ]?\s*(?:hours?|hrs?|stunden?|orë)\b/iu,
  );
  const vehicle = prompt.match(/\b\d{1,2}[- ]seater\b/iu)?.[0];
  const duration = days ? Number(days[1] || days[2]) : undefined;
  const h = hours ? Number(hours[1]) : undefined;
  return {
    origin: originMatch?.[1].trim(),
    duration,
    hoursPerDay: h && h <= 12 ? h : undefined,
    vehicle,
  };
}

/** Conservative suggestions only. Never extracts/guesses a location from vague prose. */
export function suggestTripBrief(prompt: string, today: string) {
  const explicitDuration = extractTripDetails(prompt).duration;
  const oneDay =
    /\b(sunday|saturday|tomorrow|today|afternoon|day trip|sonntag|samstag|morgen|heute|tagesausflug|nesër|sot)\b|αύριο|σήμερα|κυριακή|日帰り|明日/u.test(
      prompt.toLowerCase(),
    );

  const date = new Date(`${today}T12:00:00Z`);
  if (/\b(tomorrow|morgen|nesër)\b|αύριο|明日/iu.test(prompt))
    date.setUTCDate(date.getUTCDate() + 1);
  else if (/\b(today|heute|sot)\b|σήμερα/iu.test(prompt)) {
    /* today */
  } else {
    const weekday = /\b(sunday|sonntag)\b|κυριακή/iu.test(prompt)
      ? 0
      : /\b(saturday|samstag)\b/iu.test(prompt)
        ? 6
        : undefined;
    if (weekday === undefined)
      return {
        duration: explicitDuration ?? (oneDay ? 1 : undefined),
        startDate: undefined,
      };
    date.setUTCDate(date.getUTCDate() + ((weekday - date.getUTCDay() + 7) % 7));
  }
  const startDate = date.toISOString().slice(0, 10);
  return { duration: explicitDuration ?? (oneDay ? 1 : undefined), startDate };
}
