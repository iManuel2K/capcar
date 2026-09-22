import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  canonicalMetadata,
  PUBLIC_INDEXABLE_ROUTES,
  PUBLIC_SITE_URL,
} from "./public-metadata";

describe("public metadata", () => {
  it("defines unique indexable routes without inventing a standalone FAQ", () => {
    expect(new Set(PUBLIC_INDEXABLE_ROUTES).size).toBe(
      PUBLIC_INDEXABLE_ROUTES.length,
    );
    expect(PUBLIC_INDEXABLE_ROUTES).not.toContain("/faq");
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

  it("creates self-referencing canonical metadata", () => {
    expect(PUBLIC_SITE_URL.href).toBe("https://capcar.dev/");

    for (const route of PUBLIC_INDEXABLE_ROUTES) {
      expect(canonicalMetadata(route)).toEqual({
        alternates: { canonical: route || "/" },
      });
    }
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
      expect(messages.Metadata.siteTitle, file).toMatch(/^CapCar\b/);
    }

    expect(readFileSync("src/app/layout.tsx", "utf8")).toContain(
      'template: "%s · CapCar"',
    );
  });
});
