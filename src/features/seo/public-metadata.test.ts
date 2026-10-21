import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { locales } from "@/i18n/config";

import {
  canonicalMetadata,
  localizePublicPathname,
  localizedPublicUrl,
  PUBLIC_INDEXABLE_ROUTES,
  PUBLIC_SITE_URL,
  publicLanguageAlternates,
  publicHref,
} from "./public-metadata";

describe("public metadata", () => {
  it("defines unique indexable routes without private or invented pages", () => {
    expect(new Set(PUBLIC_INDEXABLE_ROUTES).size).toBe(
      PUBLIC_INDEXABLE_ROUTES.length,
    );
    expect(PUBLIC_INDEXABLE_ROUTES).not.toContain("/faq");
    expect(PUBLIC_INDEXABLE_ROUTES).toContain("/ai");
    expect(PUBLIC_INDEXABLE_ROUTES).toEqual(
      expect.arrayContaining([
        "",
        "/roadbook",
        "/roadmap",
        "/privacy",
        "/terms",
        "/imprint",
      ]),
    );
  });

  it("creates self-referencing canonicals and complete language alternates", () => {
    expect(PUBLIC_SITE_URL.href).toBe("https://capcar.dev/");

    for (const route of PUBLIC_INDEXABLE_ROUTES) {
      const url = new URL(route || "/", PUBLIC_SITE_URL).toString();
      const metadata = canonicalMetadata(route);
      expect(metadata.alternates?.canonical).toBe(url);
      expect(metadata.openGraph?.url).toBe(url);
      expect(metadata.alternates?.languages).toEqual(
        publicLanguageAlternates(route),
      );
      for (const locale of locales) {
        expect(metadata.alternates?.languages?.[locale]).toBe(
          localizedPublicUrl(route, locale),
        );
      }
    }
  });

  it("maps the language selector to locale-specific public URLs", () => {
    expect(localizePublicPathname("/", "de")).toBe("/de");
    expect(localizePublicPathname("/roadbook", "ja")).toBe("/ja/roadbook");
    expect(localizePublicPathname("/sq/roadbook", "en")).toBe("/roadbook");
    expect(localizePublicPathname("/garage", "de")).toBeNull();
  });

  it("localizes public links without dropping query strings or anchors", () => {
    expect(
      publicHref("/connected-parts?q=N43&utm_source=journal#results", "de"),
    ).toBe("/de/connected-parts?q=N43&utm_source=journal#results");
    expect(publicHref("/en/platform", "en")).toBe("/platform");
    expect(publicHref("/#faq", "ja")).toBe("/ja#faq");
    expect(publicHref("/en/journal/build-plan-first-job", "el")).toBe(
      "/el/journal/build-plan-first-job",
    );
    expect(publicHref("/garage/new?goal=modify", "de")).toBe(
      "/garage/new?goal=modify",
    );
    expect(publicHref("https://retailer.example/parts", "de")).toBe(
      "https://retailer.example/parts",
    );
    expect(publicHref("//retailer.example/parts", "de")).toBe(
      "//retailer.example/parts",
    );
  });

  it("keeps intentional FAQ navigation on the homepage section", () => {
    const navigation = [
      "src/components/marketing/marketing-header.tsx",
      "src/components/marketing/site-footer.tsx",
    ]
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");

    expect(navigation).toContain('"/#faq"');
    expect(navigation).not.toMatch(/["']\/faq["']/);
  });

  it("uses CapCar casing in global metadata for every locale", () => {
    const messageFiles = [
      "messages/public/en.json",
      "messages/public/de.json",
      "messages/public/el.json",
      "messages/public/sq.json",
      "messages/public/ja.json",
    ];

    for (const file of messageFiles) {
      const messages = JSON.parse(readFileSync(file, "utf8")) as {
        Metadata: { siteTitle: string };
      };
      expect(messages.Metadata.siteTitle, file).toMatch(/^CapCar — /);
    }

    expect(readFileSync("src/app/layout.tsx", "utf8")).toContain(
      'template: "%s · CapCar"',
    );
  });
});
