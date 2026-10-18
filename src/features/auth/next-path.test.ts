import { expect, it } from "vitest";
import { safeAuthNext } from "./next-path";
it("preserves the Journal action while rejecting external and browser-normalized redirect escapes", () => {
  const next = "/garage/journal?article=build-plan-first-job&locale=de";
  expect(safeAuthNext(next)).toBe(next);
  for (const value of [
    undefined,
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/\nevil",
    [next],
  ])
    expect(safeAuthNext(value)).toBe("/garage");
});
