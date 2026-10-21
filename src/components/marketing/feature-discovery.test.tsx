import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FeatureDiscovery } from "./feature-discovery";
import { featureDiscoveryCopy } from "@/features/marketing/feature-discovery-copy";
import { locales, type AppLocale } from "@/i18n/config";

const context = vi.hoisted(() => ({ locale: "en" as AppLocale }));
vi.mock("next-intl", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next-intl")>()),
  useLocale: () => context.locale,
  useTranslations: () => (key: string) => key,
}));
afterEach(cleanup);

describe("public feature discovery", () => {
  it.each(locales)(
    "keeps %s feature journeys localized and links to working account actions",
    (locale) => {
      context.locale = locale;
      for (const feature of ["planner", "maintenance"] as const) {
        const copy = featureDiscoveryCopy[locale];
        render(<FeatureDiscovery locale={locale} feature={feature} />);
        const main = screen.getByRole("main");
        expect(
          within(main).getByRole("heading", { level: 1 }),
        ).toHaveTextContent(copy[feature].title);
        expect(
          within(main).getByRole("link", { name: copy.create }),
        ).toHaveAttribute(
          "href",
          `/garage/new?goal=${feature === "planner" ? "modify" : "maintain"}`,
        );
        expect(
          within(main).getByRole("link", { name: copy.demo }),
        ).toHaveAttribute(
          "href",
          `${locale === "en" ? "/" : `/${locale}`}#live-demo`,
        );
        expect(
          within(main).getByRole("link", { name: copy.read }),
        ).toHaveAttribute(
          "href",
          `/${locale}/journal/${feature === "planner" ? "build-plan-first-job" : "bmw-diy-wartung-dokumentieren"}`,
        );
        expect(within(main).getByText(copy.example)).toBeVisible();
        expect(within(main).getByText(copy.account)).toBeVisible();
        expect(within(main).getAllByRole("listitem")).toHaveLength(3);
        const opposite =
          feature === "planner"
            ? "car-maintenance-tracker"
            : "project-car-planner";
        expect(
          within(main).getByRole("link", {
            name:
              feature === "planner" ? copy.maintenanceLabel : copy.plannerLabel,
          }),
        ).toHaveAttribute(
          "href",
          `${locale === "en" ? "" : `/${locale}`}/${opposite}`,
        );
        cleanup();
      }
    },
  );
});
