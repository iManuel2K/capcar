import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  AnalyticsProvider,
  AnalyticsSettingsButton,
} from "./analytics-provider";
import { ANALYTICS_CONSENT_KEY } from "@/features/analytics/client";

const sdk = vi.hoisted(() => ({
  init: vi.fn(),
  capture: vi.fn(),
  opt_out_capturing: vi.fn(),
  has_opted_out_capturing: vi.fn(() => false),
}));
vi.mock("posthog-js/dist/module.no-external", () => ({ default: sdk }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/en/journal/bmw-wochenendprojekt-planen",
}));
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN", "phc_test");
  vi.stubEnv("NEXT_PUBLIC_POSTHOG_HOST", "https://us.i.posthog.com");
  window.history.replaceState(
    {},
    "",
    "/en/journal/bmw-wochenendprojekt-planen",
  );
  sdk.init.mockReturnValue(sdk);
});
afterEach(cleanup);

it("allows declining without loading analytics and lets readers reopen settings", async () => {
  render(
    <>
      <AnalyticsProvider />
      <AnalyticsSettingsButton />
    </>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Decline analytics" }));
  expect(localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBe("denied");
  expect(
    screen.queryByRole("button", { name: "Allow analytics" }),
  ).not.toBeInTheDocument();
  expect(sdk.init).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Analytics settings" }));
  fireEvent.click(screen.getByRole("button", { name: "Allow analytics" }));
  await waitFor(() =>
    expect(sdk.capture).toHaveBeenCalledWith(
      "journal_article_viewed",
      expect.objectContaining({ article_slug: "bmw-wochenendprojekt-planen" }),
    ),
  );
  fireEvent.click(screen.getByRole("button", { name: "Analytics settings" }));
  fireEvent.click(screen.getByRole("button", { name: "Decline analytics" }));
  expect(sdk.opt_out_capturing).toHaveBeenCalled();
});

it("hides the prompt when analytics is not configured", () => {
  vi.stubEnv("NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN", "");
  render(<AnalyticsProvider />);
  expect(
    screen.queryByRole("button", { name: "Allow analytics" }),
  ).not.toBeInTheDocument();
});

it("keeps the mobile notice in document flow with equally accessible choices and full disclosures", () => {
  render(<AnalyticsProvider />);
  const notice = screen.getByRole("region", {
    name: "Optional usage analytics",
  });
  expect(notice.className).toContain("relative");
  expect(notice.className).toContain("sm:fixed");
  expect(notice.className).not.toMatch(/(?:^| )fixed(?: |$)/);
  expect(screen.getByText(/PostHog \(US\)/)).toBeVisible();
  const details = notice.querySelector("details")!;
  expect(details).not.toHaveAttribute("open");
  fireEvent.click(screen.getByText("How analytics works"));
  expect(details).toHaveAttribute("open");
  expect(screen.getByRole("link", { name: "Privacy notice" })).toHaveAttribute(
    "href",
    "/privacy",
  );
  expect(screen.getByRole("button", { name: "Allow analytics" })).toBeVisible();
  expect(
    screen.getByRole("button", { name: "Decline analytics" }),
  ).toBeVisible();
  expect(sdk.init).not.toHaveBeenCalled();
});
