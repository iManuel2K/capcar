import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { pageMetadata } from "./public-metadata";

describe("route metadata", () => {
  it("publishes the production sitemap without including private pages", () => {
    expect(robots().sitemap).toBe("https://capcar.dev/sitemap.xml");
    const disallow = robots().rules;
    expect(JSON.stringify(disallow)).not.toContain('"/login"');
    expect(JSON.stringify(disallow)).not.toContain('"/system"');
    const urls = sitemap().map((route) => route.url);
    expect(urls).toContain("https://capcar.dev/roadbook");
    expect(urls).not.toContain("https://capcar.dev/system");
    expect(urls).not.toContain("https://capcar.dev/login");
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
