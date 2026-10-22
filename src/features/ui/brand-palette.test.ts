import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { brandPalette } from "./brand-palette";

const css = readFileSync("src/app/globals.css", "utf8");
const root = css.slice(css.indexOf(":root {"), css.indexOf(".dark {"));
function token(name: string): string {
  const value = root.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1];
  if (!value) throw new Error(`Missing theme token ${name}`);
  const alias = value.match(/^var\(--([\w-]+)\)$/);
  return alias ? token(alias[1]) : value;
}
function luminance(hex: string) {
  const [r, g, b] = hex
    .slice(1)
    .match(/../g)!
    .map((v) => {
      const x = parseInt(v, 16) / 255;
      return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
    });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: string, b: string) {
  const light = Math.max(luminance(a), luminance(b));
  const dark = Math.min(luminance(a), luminance(b));
  return (light + 0.05) / (dark + 0.05);
}

describe("Obsidian Chrome accessibility", () => {
  it("keeps normal text, captions and chrome links readable across app surfaces", () => {
    for (const text of [
      "foreground",
      "muted-foreground",
      "primary",
      "destructive",
    ]) {
      for (const surface of ["background", "card", "secondary"]) {
        expect(
          contrast(token(text), token(surface)),
          `${text} on ${surface}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
    expect(
      contrast(token("primary-foreground"), token("primary")),
    ).toBeGreaterThanOrEqual(4.5);
    expect(contrast(token("input"), token("card"))).toBeGreaterThanOrEqual(3);
    expect(contrast(token("ring"), token("card"))).toBeGreaterThanOrEqual(3);
  });
  it("keeps light sections and colored journey accents readable", () => {
    for (const text of ["light-foreground", "light-muted", "light-primary"]) {
      expect(
        contrast(token(text), token("light-surface")),
      ).toBeGreaterThanOrEqual(4.5);
    }
    for (const text of ["warm-accent", "mint-accent", "muted-foreground"]) {
      expect(
        contrast(token(text), token("section-tint")),
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
  it("keeps exported Canvas cards and map route accents aligned with the app", () => {
    for (const [literal, variable] of Object.entries({
      background: "background",
      surface: "card",
      foreground: "foreground",
      muted: "muted-foreground",
      primary: "primary",
      secondary: "secondary",
    })) {
      expect(brandPalette[literal as keyof typeof brandPalette]).toBe(
        token(variable),
      );
    }
  });
});
