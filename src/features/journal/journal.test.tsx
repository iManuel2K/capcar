import { existsSync } from "node:fs";
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import {
  generateMetadata,
  generateStaticParams,
} from "@/app/[locale]/journal/[articleSlug]/page";
import { JournalContent } from "@/components/journal/journal-content";
import { getJournalArticles, journalArticlePath } from "./articles";
import { locales } from "@/i18n/config";
import { localizePublicPathname } from "@/features/seo/public-metadata";
import { journalLanguageAlternates } from "./metadata";

afterEach(cleanup);

describe("the multilingual ownership journal", () => {
  it("publishes every translated article and in-app checklist with matching canonicals and language alternates", async () => {
    const entries = sitemap().filter((item) => item.url.includes("/journal"));
    expect(entries).toHaveLength(35);
    expect(generateStaticParams()).toHaveLength(30);
    for (const locale of locales) {
      const articles = getJournalArticles(locale);
      expect(articles).toHaveLength(6);
      for (const article of articles) {
        const metadata = await generateMetadata({
          params: Promise.resolve({ locale, articleSlug: article.slug }),
        });
        expect(metadata.alternates?.canonical).toBe(
          `https://capcar.dev${journalArticlePath(article.slug, locale)}`,
        );
        expect(metadata.alternates?.languages).toEqual(
          journalLanguageAlternates(article.slug),
        );
        expect(
          entries.some((entry) => entry.url === metadata.alternates?.canonical),
        ).toBe(true);
        expect(existsSync(`public${article.image}`)).toBe(true);
        expect(article.body).toContain(
          `/garage/journal?article=${article.slug}&locale=${locale}`,
        );
        expect(article).not.toHaveProperty("download");
        expect(article).not.toHaveProperty("template");
        expect(article.body.match(/^## /gm)?.length).toBe(
          getJournalArticles("de")
            .find((item) => item.slug === article.slug)
            ?.body.match(/^## /gm)?.length,
        );
        if (locale !== "de")
          expect(article.title).not.toBe(
            getJournalArticles("de").find((item) => item.slug === article.slug)
              ?.title,
          );
      }
    }
  });

  it("keeps the article identity when switching between any supported languages", () => {
    for (const source of locales)
      for (const target of locales) {
        expect(localizePublicPathname(`/${source}/journal`, target)).toBe(
          `/${target}/journal`,
        );
        for (const article of getJournalArticles(source)) {
          expect(
            localizePublicPathname(
              journalArticlePath(article.slug, source),
              target,
            ),
          ).toBe(journalArticlePath(article.slug, target));
        }
      }
    expect(localizePublicPathname("/journal/missing", "de")).toBeNull();
  });

  it("rejects missing articles and unsupported locales", async () => {
    for (const params of [
      { locale: "de", articleSlug: "does-not-exist" },
      { locale: "fr", articleSlug: getJournalArticles("en")[0].slug },
    ]) {
      await expect(
        generateMetadata({ params: Promise.resolve(params) }),
      ).rejects.toThrow();
    }
  });

  it("preserves official sources and the example-budget distinction across translations", () => {
    for (const locale of locales) {
      const route = getJournalArticles(locale)[3];
      for (const source of [
        "https://tourismus.wiesbaden.de/",
        "https://www.eltville.de/",
        "https://www.schloesser-hessen.de/",
      ])
        expect(route.body).toContain(source);
      expect(route.body).toMatch(/52[,.]20/);
      expect(route.body).toMatch(/22[,.]20/);
      expect(route.body).toContain("2026");
    }
  });

  it("renders source links and worksheet tables without interpreting arbitrary HTML", () => {
    const { container } = render(
      <JournalContent
        text={
          "[Open CapCar](/garage/journal?article=build-plan-first-job&locale=en)\n\n[Unsafe](//evil.example)\n\n## Quelle\n\n[Besucherinformation](https://www.eltville.de/)\n\n<script>alert(1)</script>\n\n| Feld | Eintrag |\n| --- | --- |\n| Kilometerstand | |"
        }
      />,
    );
    expect(
      screen.getByRole("link", { name: "Besucherinformation" }),
    ).toHaveAttribute("href", "https://www.eltville.de/");
    expect(
      screen.getByRole("columnheader", { name: "Feld" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open CapCar" })).toHaveAttribute(
      "href",
      "/garage/journal?article=build-plan-first-job&locale=en",
    );
    expect(
      screen.queryByRole("link", { name: "Unsafe" }),
    ).not.toBeInTheDocument();
    expect(container.querySelector("script")).toBeNull();
    expect(screen.getByText("<script>alert(1)</script>")).toBeInTheDocument();
  });
});
