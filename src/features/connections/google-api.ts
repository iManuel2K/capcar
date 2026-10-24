import { z } from "zod";

import type { GoogleConnectionEnvironment } from "@/features/connections/google-connection";
import { googleRedirectUri } from "@/features/connections/google-connection";

const googleTokenSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().int().positive(),
  refresh_token: z.string().min(1).optional(),
  scope: z.string().optional(),
  token_type: z.string().optional(),
});

const googleUserSchema = z.object({
  email: z.email(),
  name: z.string().optional(),
});

const calendarEventsSchema = z.object({
  timeZone: z.string(),
  nextPageToken: z.string().optional(),
  items: z
    .array(
      z.object({
        id: z.string(),
        summary: z.string().optional(),
        start: z.object({
          date: z.string().optional(),
          dateTime: z.string().optional(),
        }),
        end: z
          .object({
            date: z.string().optional(),
            dateTime: z.string().optional(),
          })
          .optional(),
      }),
    )
    .default([]),
});

const gmailListSchema = z.object({
  messages: z.array(z.object({ id: z.string() })).default([]),
});

const gmailMessageSchema = z.object({
  id: z.string(),
  payload: z.object({
    headers: z
      .array(z.object({ name: z.string(), value: z.string() }))
      .default([]),
  }),
});

export type GoogleTokens = z.infer<typeof googleTokenSchema>;

async function googleRequest<T>(
  input: string | URL,
  schema: z.ZodType<T>,
  init: RequestInit = {},
) {
  const response = await fetch(input, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) {
    throw new Error(`Google request failed with status ${response.status}.`);
  }
  return schema.parse(await response.json());
}

export async function exchangeGoogleCode(
  code: string,
  verifier: string,
  environment: GoogleConnectionEnvironment,
) {
  return googleRequest(
    "https://oauth2.googleapis.com/token",
    googleTokenSchema,
    {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        code_verifier: verifier,
        client_id: environment.GOOGLE_OAUTH_CLIENT_ID,
        client_secret: environment.GOOGLE_OAUTH_CLIENT_SECRET,
        redirect_uri: googleRedirectUri(environment),
        grant_type: "authorization_code",
      }),
    },
  );
}

export async function refreshGoogleAccessToken(
  refreshToken: string,
  environment: GoogleConnectionEnvironment,
) {
  return googleRequest(
    "https://oauth2.googleapis.com/token",
    googleTokenSchema,
    {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: environment.GOOGLE_OAUTH_CLIENT_ID,
        client_secret: environment.GOOGLE_OAUTH_CLIENT_SECRET,
        grant_type: "refresh_token",
      }),
    },
  );
}

function authorization(accessToken: string) {
  return { authorization: `Bearer ${accessToken}` };
}

export function getGoogleUser(accessToken: string) {
  return googleRequest(
    "https://openidconnect.googleapis.com/v1/userinfo",
    googleUserSchema,
    { headers: authorization(accessToken) },
  );
}

export async function revokeGoogleToken(accessToken: string) {
  const response = await fetch("https://oauth2.googleapis.com/revoke", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ token: accessToken }),
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok)
    throw new Error(
      `Google token revocation failed with status ${response.status}.`,
    );
}

function calendarBusyDates(
  calendar: z.infer<typeof calendarEventsSchema>,
  from: Date,
  through: Date,
) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: calendar.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const dateOnly = (value: Date) => {
    const parts = formatter.formatToParts(value);
    return ["year", "month", "day"]
      .map((type) => parts.find((part) => part.type === type)!.value)
      .join("-");
  };
  const firstDate = dateOnly(from);
  const lastDate = dateOnly(new Date(through.valueOf() - 1));
  const busy = new Set<string>();
  for (const event of calendar.items) {
    if (!event.start.date && !event.start.dateTime) continue;
    const start = event.start.date ?? dateOnly(new Date(event.start.dateTime!));
    // Google's end is exclusive, including midnight and all-day boundaries.
    const end = event.end?.date
      ? new Date(Date.parse(`${event.end.date}T00:00:00Z`) - 1)
          .toISOString()
          .slice(0, 10)
      : event.end?.dateTime
        ? dateOnly(new Date(Date.parse(event.end.dateTime) - 1))
        : start;
    // Work in civil dates so DST cannot skip or duplicate a calendar day.
    // Clamp long-running events to the same bounded window requested from Google.
    let day = start < firstDate ? firstDate : start;
    const last = end > lastDate ? lastDate : end;
    while (day <= last) {
      busy.add(day);
      const next = new Date(`${day}T00:00:00Z`);
      next.setUTCDate(next.getUTCDate() + 1);
      day = next.toISOString().slice(0, 10);
    }
  }
  return [...busy].sort();
}

async function getPlanningCalendar(url: URL, accessToken: string) {
  let result: z.infer<typeof calendarEventsSchema> | undefined;
  // Bound provider work; never describe a truncated calendar as conflict-free.
  for (let page = 0; page < 4; page++) {
    const calendar = await googleRequest(url, calendarEventsSchema, {
      headers: authorization(accessToken),
    });
    result ??= { timeZone: calendar.timeZone, items: [] };
    result.items.push(...calendar.items);
    if (!calendar.nextPageToken) return result;
    url.searchParams.set("pageToken", calendar.nextPageToken);
  }
  throw new Error("Calendar sync exceeded its supported event count.");
}

export async function getGooglePlanningContext(accessToken: string) {
  const now = new Date();
  const horizon = new Date(now);
  horizon.setUTCDate(horizon.getUTCDate() + 120);
  const calendarUrl = new URL(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
  );
  calendarUrl.searchParams.set("timeMin", now.toISOString());
  calendarUrl.searchParams.set("timeMax", horizon.toISOString());
  calendarUrl.searchParams.set("singleEvents", "true");
  calendarUrl.searchParams.set("orderBy", "startTime");
  calendarUrl.searchParams.set("maxResults", "2500");
  calendarUrl.searchParams.set(
    "fields",
    "timeZone,nextPageToken,items(id,summary,start(date,dateTime),end(date,dateTime))",
  );

  const [calendar, gmail] = await Promise.all([
    getPlanningCalendar(calendarUrl, accessToken),
    googleRequest(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=30&includeSpamTrash=false",
      gmailListSchema,
      { headers: authorization(accessToken) },
    ),
  ]);
  const messages = await Promise.all(
    gmail.messages.map((message) =>
      googleRequest(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(message.id)}?format=metadata&metadataHeaders=Subject&metadataHeaders=Date`,
        gmailMessageSchema,
        { headers: authorization(accessToken) },
      ),
    ),
  );
  const travelPattern =
    /trip|travel|booking|reservation|hotel|flight|road|ferry|rental|reise|fahrt|buchung|reservierung|hotel|flug|fähre|udhët|rezerv|ταξίδ|κράτηση/i;
  const mailSignals = messages
    .map((message) => {
      const headers = Object.fromEntries(
        message.payload.headers.map((header) => [
          header.name.toLowerCase(),
          header.value,
        ]),
      );
      return {
        subject: headers.subject || "Travel-related message",
        date: headers.date,
      };
    })
    .filter((message) => travelPattern.test(message.subject))
    .slice(0, 8);

  return {
    busyDates: calendarBusyDates(calendar, now, horizon),
    calendarEventCount: calendar.items.length,
    mailSignals,
    mailScannedCount: messages.length,
  };
}

const calendarEventInputSchema = z.object({
  summary: z.string().trim().min(2).max(200),
  description: z.string().trim().max(4000),
  startDate: z.iso.date(),
  endDate: z.iso.date(),
});

export type CalendarEventInput = z.infer<typeof calendarEventInputSchema>;

export async function createGoogleCalendarEvent(
  accessToken: string,
  input: CalendarEventInput,
) {
  const value = calendarEventInputSchema.parse(input);
  return googleRequest(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    z.object({ id: z.string(), htmlLink: z.url().optional() }),
    {
      method: "POST",
      headers: {
        ...authorization(accessToken),
        "content-type": "application/json",
      },
      body: JSON.stringify({
        summary: value.summary,
        description: value.description,
        start: { date: value.startDate },
        end: { date: value.endDate },
        transparency: "transparent",
        source: { title: "CapCar", url: "https://capcar.dev/ai" },
      }),
    },
  );
}
