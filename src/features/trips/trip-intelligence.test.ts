import { describe, expect, it } from "vitest";
import { assessTripSchedule, suggestTripBrief } from "./trip-intelligence";

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
