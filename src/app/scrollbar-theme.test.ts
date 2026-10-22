import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/app/globals.css", "utf8");
describe("CapCar native scrollbar theme", () => {
  it("reuses the Obsidian Chrome palette and supports both scrollbar APIs", () => {
    expect(css).toContain("--capcar-scrollbar-track: var(--background)");
    expect(css).toContain("--capcar-scrollbar-thumb: var(--input)");
    expect(css).toContain(
      "scrollbar-color: var(--capcar-scrollbar-thumb) var(--capcar-scrollbar-track)",
    );
    expect(css).toContain("@supports selector(::-webkit-scrollbar)");
    expect(css).toContain("::-webkit-scrollbar-thumb:hover");
    expect(css).toContain("::-webkit-scrollbar-thumb:active");
  });
  it("does not hide scrollbars, animate them or force desktop sizing onto phones", () => {
    expect(css).not.toMatch(/scrollbar-width:\s*(?:none|thin)/);
    expect(css).toContain(
      "(pointer: fine) and (min-width: 640px) and (forced-colors: none)",
    );
    expect(css).toContain("min-height: 44px");
    expect(css).toContain("border-radius: 999px");
    expect(css).toMatch(
      /@media \(forced-colors: active\)[\s\S]*?scrollbar-color: auto !important;[\s\S]*?scrollbar-width: auto !important;/,
    );
  });
  it("removes low-contrast local overrides without changing map-chip scrolling", () => {
    const rail = readFileSync(
      "src/components/garage/garage-showroom.module.css",
      "utf8",
    );
    const sidebar = readFileSync(
      "src/components/garage/garage-sidebar.tsx",
      "utf8",
    );
    expect(rail).not.toContain("scrollbar-color:");
    expect(sidebar).not.toContain("[scrollbar-color:");
    for (const file of [
      "src/app/roadbook/roadbook.css",
      "src/app/ai/trip-map.css",
    ]) {
      expect(readFileSync(file, "utf8")).toContain("scrollbar-width: none");
    }
  });
});
