import { describe, expect, it } from "vitest";

import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { journalArticles } from "@/features/journal/articles";
import { locales } from "@/i18n/config";

import { pageMetadata, PUBLIC_INDEXABLE_ROUTES } from "./public-metadata";

describe("route metadata", () => {
  it("publishes public language variants without private pages", () => {
    expect(robots().sitemap).toBe("https://capcar.dev/sitemap.xml");
    const disallow = robots().rules;
    expect(JSON.stringify(disallow)).not.toContain('"/login"');
    expect(JSON.stringify(disallow)).not.toContain('"/system"');

    const entries = sitemap();
    const urls = entries.map((route) => route.url);
    expect(entries).toHaveLength(
      PUBLIC_INDEXABLE_ROUTES.length * locales.length +
        (journalArticles.length + 1) * locales.length,
    );
    expect(urls).toContain("https://capcar.dev/roadbook");
    expect(urls).toContain("https://capcar.dev/de/roadbook");
    expect(urls).toContain("https://capcar.dev/ja/roadbook");
    expect(urls).toContain("https://capcar.dev/ai");
    expect(urls).toContain("https://capcar.dev/de/ai");
    expect(urls).toContain("https://capcar.dev/project-car-planner");
    expect(urls).toContain("https://capcar.dev/ja/car-maintenance-tracker");
    expect(new Set(urls).size).toBe(urls.length);
    expect(
      urls.some(
        (url) =>
          new URL(url).pathname === "/en" ||
          (new URL(url).pathname.startsWith("/en/") &&
            !url.includes("/en/journal")),
      ),
    ).toBe(false);
    expect(urls).not.toContain("https://capcar.dev/system");
    expect(urls).not.toContain("https://capcar.dev/login");

    for (const entry of entries) {
      const isJournal = entry.url.includes("/journal");
      if (new URL(entry.url).pathname.endsWith("/pricing")) {
        expect(entry.lastModified).toBe("2026-10-26");
      } else {
        expect(entry.lastModified).toMatch(/^2026-10-(16|17|21)$/);
      }
      expect(entry).not.toHaveProperty("changeFrequency");
      expect(entry).not.toHaveProperty("priority");
      if (isJournal) {
        expect(entry.url).toMatch(
          /^https:\/\/capcar\.dev\/(en|de|el|sq|ja)\/journal/,
        );
      }
      expect(entry.alternates?.languages?.de).toMatch(
        /^https:\/\/capcar\.dev\/de/,
      );
      expect(entry.alternates?.languages?.["x-default"]).toMatch(
        /^https:\/\/capcar\.dev\//,
      );
    }
  });

  it("keeps canonical URLs and indexing directives independent", () => {
    const metadata = pageMetadata(
      "/login",
      "Sign in · CapCar",
      "Sign in to CapCar.",
      { index: false, follow: true },
    );
    expect(metadata.alternates?.canonical).toBe("https://capcar.dev/login");
    expect(metadata.openGraph?.url).toBe("https://capcar.dev/login");
    expect(metadata.openGraph?.description).toBe("Sign in to CapCar.");
    expect(metadata.twitter?.description).toBe("Sign in to CapCar.");
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });
});
