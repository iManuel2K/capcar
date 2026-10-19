import { describe, expect, it } from "vitest";
import { homepageCopy } from "./homepage-copy";
describe("homepage translations", () => {
  it.each(["de", "el", "sq", "ja"] as const)(
    "has complete, nonempty natural %s copy",
    (locale) => {
      expect(Object.keys(homepageCopy[locale]).sort()).toEqual(
        Object.keys(homepageCopy.en).sort(),
      );
      expect(
        Object.values(homepageCopy[locale]).every(
          (text) => text.trim().length > 0,
        ),
      ).toBe(true);
      expect(homepageCopy[locale].headline).not.toBe(homepageCopy.en.headline);
      expect(homepageCopy[locale].maintainAccess).not.toBe(
        homepageCopy.en.maintainAccess,
      );
      expect(homepageCopy[locale].drivesAccess).not.toBe(
        homepageCopy.en.drivesAccess,
      );
    },
  );
});
