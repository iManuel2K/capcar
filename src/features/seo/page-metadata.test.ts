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
      PUBLIC_INDEXABLE_ROUTES.length * (locales.length + 1) +
        journalArticles.length +
        1,
    );
    expect(urls).toContain("https://capcar.dev/roadbook");
    expect(urls).toContain("https://capcar.dev/de/roadbook");
    expect(urls).toContain("https://capcar.dev/ja/roadbook");
    expect(urls).not.toContain("https://capcar.dev/ai");
    expect(urls).not.toContain("https://capcar.dev/system");
    expect(urls).not.toContain("https://capcar.dev/login");

    for (const entry of entries) {
      const isJournal = entry.url.includes("/journal");
      expect(entry.lastModified).toBe(isJournal ? "2026-10-17" : "2026-10-16");
      expect(entry).not.toHaveProperty("changeFrequency");
      expect(entry).not.toHaveProperty("priority");
      if (isJournal) {
        expect(entry.url).toMatch(/^https:\/\/capcar\.dev\/de\/journal/);
        expect(entry.alternates).toBeUndefined();
        continue;
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
