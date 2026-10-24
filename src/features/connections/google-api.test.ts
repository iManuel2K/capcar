import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getGooglePlanningContext } from "./google-api";

function mockCalendar(pages: Record<string, object>) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string | URL) => {
      const url = new URL(input);
      if (url.pathname.includes("/calendar/v3/")) {
        const page = pages[url.searchParams.get("pageToken") ?? ""];
        if (!page) throw new Error("Unexpected calendar page");
        return Response.json(page);
      }
      if (url.pathname === "/gmail/v1/users/me/messages") {
        return Response.json({ messages: [] });
      }
      throw new Error("Unexpected Google request");
    }),
  );
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-24T12:00:00Z"));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("Google calendar planning context", () => {
  it("preserves local dates and every occupied day of an all-day event", async () => {
    mockCalendar({
      "": {
        timeZone: "Europe/Berlin",
        items: [
          {
            id: "early",
            start: { dateTime: "2026-11-01T00:30:00+01:00" },
            end: { dateTime: "2026-11-01T01:30:00+01:00" },
          },
          {
            id: "away",
            start: { date: "2026-11-02" },
            end: { date: "2026-11-04" },
          },
        ],
      },
    });

    const context = await getGooglePlanningContext("test-token");

    expect(context.busyDates).toEqual([
      "2026-11-01",
      "2026-11-02",
      "2026-11-03",
    ]);
  });

  it("includes busy dates after the first calendar result page", async () => {
    mockCalendar({
      "": {
        timeZone: "Europe/Berlin",
        nextPageToken: "second-page",
        items: [
          {
            id: "first",
            start: { date: "2026-11-01" },
            end: { date: "2026-11-02" },
          },
        ],
      },
      "second-page": {
        timeZone: "Europe/Berlin",
        items: [
          {
            id: "second",
            start: { date: "2026-11-05" },
            end: { date: "2026-11-06" },
          },
        ],
      },
    });

    const context = await getGooglePlanningContext("test-token");

    expect(context.busyDates).toEqual(["2026-11-01", "2026-11-05"]);
    expect(context.calendarEventCount).toBe(2);
  });

  it("handles DST, exclusive midnight ends, and overlapping overnight events", async () => {
    mockCalendar({
      "": {
        timeZone: "Europe/Berlin",
        items: [
          {
            id: "dst",
            start: { dateTime: "2026-10-25T00:30:00+02:00" },
            end: { dateTime: "2026-10-26T00:00:00+01:00" },
          },
          {
            id: "overnight",
            start: { dateTime: "2026-11-05T23:30:00+01:00" },
            end: { dateTime: "2026-11-06T01:00:00+01:00" },
          },
          {
            id: "overlap",
            start: { date: "2026-11-06" },
            end: { date: "2026-11-07" },
          },
        ],
      },
    });

    const context = await getGooglePlanningContext("test-token");

    expect(context.busyDates).toEqual([
      "2026-10-25",
      "2026-11-05",
      "2026-11-06",
    ]);
  });

  it("uses the calendar timezone when a timed event is returned in UTC", async () => {
    mockCalendar({
      "": {
        timeZone: "America/Los_Angeles",
        items: [
          {
            id: "utc",
            start: { dateTime: "2026-11-10T01:30:00Z" },
            end: { dateTime: "2026-11-10T02:30:00Z" },
          },
        ],
      },
    });

    expect((await getGooglePlanningContext("test-token")).busyDates).toEqual([
      "2026-11-09",
    ]);
  });

  it("clips a long-running event to the requested planning window", async () => {
    mockCalendar({
      "": {
        timeZone: "UTC",
        items: [
          {
            id: "long-running",
            start: { date: "2000-01-01" },
            end: { date: "2100-01-01" },
          },
        ],
      },
    });

    const { busyDates } = await getGooglePlanningContext("test-token");

    expect(busyDates).toHaveLength(121);
    expect(busyDates[0]).toBe("2026-10-24");
    expect(busyDates.at(-1)).toBe("2027-02-21");
  });

  it("rejects an incomplete calendar when the page limit is reached", async () => {
    mockCalendar(
      Object.fromEntries(
        ["", "page-2", "page-3", "page-4"].map((token, index) => [
          token,
          {
            timeZone: "UTC",
            items: [],
            nextPageToken: `page-${index + 2}`,
          },
        ]),
      ),
    );

    await expect(getGooglePlanningContext("test-token")).rejects.toThrow(
      "Calendar sync exceeded its supported event count.",
    );
  });
});
