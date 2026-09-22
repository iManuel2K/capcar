import { describe, expect, it } from "vitest";

import { defaultLocale, isAppLocale, locales } from "@/i18n/config";

describe("locale configuration", () => {
  it("supports every CapCar language", () => {
    expect(locales).toEqual(["en", "de", "el", "sq", "ja"]);
  });

  it("rejects unsupported and empty locale values", () => {
    expect(isAppLocale(defaultLocale)).toBe(true);
    expect(isAppLocale("fr")).toBe(false);
    expect(isAppLocale(undefined)).toBe(false);
  });
});
