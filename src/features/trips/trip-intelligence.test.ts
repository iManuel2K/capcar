import { describe, expect, it } from "vitest";
import {
  assessTripSchedule,
  extractTripDetails,
  suggestTripBrief,
} from "./trip-intelligence";

describe("short trip briefs", () => {
  it("interprets tomorrow across a month boundary without guessing a location", () => {
    expect(suggestTripBrief("Peja tomorrow", "2026-10-31")).toEqual({
      duration: 1,
      startDate: "2026-11-01",
    });
    expect(suggestTripBrief("somewhere quiet nearby", "2026-10-25")).toEqual({
      duration: undefined,
      startDate: undefined,
    });
  });
  it("keeps Sunday on Sunday and supports localized day-trip hints", () => {
    expect(suggestTripBrief("Sunday drive with friends", "2026-10-25")).toEqual(
      { duration: 1, startDate: "2026-10-25" },
    );
    expect(suggestTripBrief("morgen nach Mainz", "2026-10-25")).toEqual({
      duration: 1,
      startDate: "2026-10-26",
    });
    expect(suggestTripBrief("明日の日帰り旅行", "2026-10-25")).toEqual({
      duration: 1,
      startDate: "2026-10-26",
    });
  });
  it("extracts explicit details without treating destinations or passenger counts as departure or duration", () => {
    expect(
      extractTripDetails(
        "Starting from Rüsselsheim am Main to Mainz. 2 days, 4 hours per day",
      ),
    ).toMatchObject({
      origin: "Rüsselsheim am Main",
      duration: 2,
      hoursPerDay: 4,
    });
    expect(extractTripDetails("Visit Pristina with 5 people")).toMatchObject({
      origin: undefined,
      duration: undefined,
    });
    expect(
      extractTripDetails("Wir starten in Frankfurt mit Freunden. 2 Tage"),
    ).toMatchObject({ origin: "Frankfurt", duration: 2 });
  });
  it.each([
    [
      "i am in frankfurt. i have a 7 seater and i will drive to pristina. 2 days in Kosovo.",
      "frankfurt",
    ],
    ["I'm in Frankfurt and will drive to Pristina", "Frankfurt"],
    [
      "We’re currently in Rüsselsheim am Main. Drive to Mainz",
      "Rüsselsheim am Main",
    ],
    ["Wir sind gerade in Frankfurt und fahren nach Mainz", "Frankfurt"],
    ["I am in Frankfurt. We are starting from Mainz to Pristina", "Mainz"],
  ])("recognizes the departure in %s", (prompt, origin) => {
    expect(extractTripDetails(prompt).origin).toBe(origin);
  });
  it("does not use a destination or another person's location as the start", () => {
    expect(
      extractTripDetails("I will drive to Pristina. My friend is in Frankfurt")
        .origin,
    ).toBeUndefined();
  });
  it("counts visits and rest breaks instead of checking driving time alone", () => {
    expect(
      assessTripSchedule({
        drivingMinutes: 120,
        stopKinds: ["food", "photo", "fuel"],
        days: 1,
        hoursPerDay: 3,
      }),
    ).toMatchObject({
      fits: false,
      totalMinutes: 240,
      visitMinutes: 105,
      breakMinutes: 15,
    });
    expect(
      assessTripSchedule({
        drivingMinutes: 60,
        stopKinds: ["nature"],
        days: 1,
        hoursPerDay: 3,
      }).fits,
    ).toBe(true);
  });
});
