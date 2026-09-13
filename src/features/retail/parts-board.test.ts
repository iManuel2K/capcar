import { describe, expect, it } from "vitest";
import { addToBoard, observePrice } from "./parts-board";
const item = {
  id: "ebay-1",
  title: "BMW rear light",
  price: 100,
  currency: "EUR",
  shipping: null,
  country: "DE",
  condition: "Used",
  url: "https://www.ebay.de/itm/123",
  affiliate: false,
};
const input = {
  query: "BMW rear light",
  market: "DE",
  destination: "DE",
  condition: "all",
  sort: "bestMatch",
  page: 0,
} as const;
describe("parts comparison observations", () => {
  it("keeps market, destination and currency separate", () => {
    const first = addToBoard([], item, input, "2026-09-13T12:00:00.000Z");
    const next = addToBoard(
      first,
      { ...item, currency: "GBP" },
      input,
      "2026-09-13T12:00:00.000Z",
    );
    expect(next).toHaveLength(2);
    expect(
      observePrice(
        first[0],
        { ...item, currency: "GBP", price: 20 },
        "2026-09-14T12:00:00.000Z",
      ),
    ).toBe(first[0]);
  });
  it("ignores stale observations and records actual price changes only", () => {
    const entry = addToBoard([], item, input, "2026-09-13T12:00:00.000Z")[0];
    expect(
      observePrice(entry, { ...item, price: 1 }, "2026-09-12T12:00:00.000Z"),
    ).toBe(entry);
    expect(
      observePrice(entry, { ...item, price: 90 }, "2026-09-14T12:00:00.000Z")
        .history,
    ).toHaveLength(2);
  });
  it("rejects unsafe merchant links restored from storage", () => {
    expect(() =>
      addToBoard(
        [],
        { ...item, url: "https://evil.example/ebay.de" },
        input,
        "2026-09-13T12:00:00.000Z",
      ),
    ).toThrow();
  });
});
