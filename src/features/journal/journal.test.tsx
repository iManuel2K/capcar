import { readFileSync, existsSync } from "node:fs";
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { generateMetadata } from "@/app/[locale]/journal/[articleSlug]/page";
import { JournalContent } from "@/components/journal/journal-content";
import { journalArticles, journalArticlePath } from "./articles";

afterEach(cleanup);

describe("the public German ownership journal", () => {
  it("publishes only existing German articles in search, with self-referencing metadata", async () => {
    const entries = sitemap().filter((item) => item.url.includes("/journal"));
    expect(entries).toHaveLength(5);
    for (const article of journalArticles) {
      const metadata = await generateMetadata({
        params: Promise.resolve({ locale: "de", articleSlug: article.slug }),
      });
      expect(metadata.alternates?.canonical).toBe(
        `https://capcar.dev${journalArticlePath(article.slug)}`,
      );
      expect(metadata.alternates?.languages).toBeUndefined();
      expect(
        entries.some((entry) => entry.url === metadata.alternates?.canonical),
      ).toBe(true);
      expect(existsSync(`public${article.image}`)).toBe(true);
      const download = readFileSync(
        `public/downloads/journal/${article.download}`,
        "utf8",
      );
      expect(download).toContain(article.title);
      expect(download).not.toContain("### Instagram");
      expect(article.body).not.toContain("Redaktionsnotizen");
    }
  });

  it("rejects nonexistent articles and untranslated language paths", async () => {
    for (const params of [
      { locale: "de", articleSlug: "does-not-exist" },
      { locale: "en", articleSlug: journalArticles[0].slug },
    ]) {
      await expect(
        generateMetadata({ params: Promise.resolve(params) }),
      ).rejects.toThrow();
    }
  });

  it("renders source links and worksheet tables without interpreting arbitrary HTML", () => {
    const { container } = render(
      <JournalContent
        text={
          "## Quelle\n\n[Besucherinformation](https://www.eltville.de/)\n\n<script>alert(1)</script>\n\n| Feld | Eintrag |\n| --- | --- |\n| Kilometerstand | |"
        }
      />,
    );
    expect(
      screen.getByRole("link", { name: "Besucherinformation" }),
    ).toHaveAttribute("href", "https://www.eltville.de/");
    expect(
      screen.getByRole("columnheader", { name: "Feld" }),
    ).toBeInTheDocument();
    expect(container.querySelector("script")).toBeNull();
    expect(screen.getByText("<script>alert(1)</script>")).toBeInTheDocument();
  });
});
