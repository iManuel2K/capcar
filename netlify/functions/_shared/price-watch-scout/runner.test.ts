import { describe, expect, it } from "vitest";

import { priceWatchRunKey } from "./runner";

describe("priceWatchRunKey", () => {
  it.each([
    ["2026-10-06T00:00:00.000Z", "price-watch-2026-10-06-00"],
    ["2026-10-06T05:59:59.999Z", "price-watch-2026-10-06-00"],
    ["2026-10-06T06:00:00.000Z", "price-watch-2026-10-06-06"],
    ["2026-10-06T17:59:59.999Z", "price-watch-2026-10-06-12"],
    ["2026-10-06T23:59:59.999Z", "price-watch-2026-10-06-18"],
  ])("buckets %s without relying on server-local time", (value, expected) => {
    expect(priceWatchRunKey(new Date(value))).toBe(expected);
  });
});
