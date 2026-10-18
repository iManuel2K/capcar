import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as intl from "next-intl";
import { JournalPreview } from "./journal-preview";
import { SiteFooter } from "@/components/marketing/site-footer";
import { locales } from "@/i18n/config";
import { journalUI } from "@/features/journal/ui";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("localized Journal discovery", () => {
  for (const locale of locales)
    it(`uses ${locale} for homepage cards and the footer link`, () => {
      vi.spyOn(intl, "useLocale").mockReturnValue(locale);
      const { container } = render(
        <>
          <JournalPreview />
          <SiteFooter />
        </>,
      );
      expect(
        screen.getByRole("heading", {
          name: journalUI[locale].headline.replace("\n", " "),
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", {
          name: journalUI[locale].label,
        }),
      ).toHaveAttribute("href", `/${locale}/journal`);
      const links = Array.from(
        container.querySelectorAll('a[href*="/journal"]'),
      );
      expect(links.length).toBeGreaterThanOrEqual(4);
      for (const link of links)
        expect(link.getAttribute("href")).toMatch(
          new RegExp(`^/${locale}/journal`),
        );
      expect(container.textContent).not.toContain("Journal (DE)");
    });
});
