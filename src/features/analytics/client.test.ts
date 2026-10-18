import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PostHogConfig } from "posthog-js/dist/module.no-external";

const sdk = vi.hoisted(() => ({
  init: vi.fn(),
  capture: vi.fn(),
  opt_out_capturing: vi.fn(),
  opt_in_capturing: vi.fn(),
  has_opted_out_capturing: vi.fn(() => false),
}));
vi.mock("posthog-js/dist/module.no-external", () => ({ default: sdk }));

import {
  ANALYTICS_CONSENT_KEY,
  analyticsContext,
  analyticsPath,
  setAnalyticsConsent,
  trackAnalytics,
} from "./client";

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN", "phc_test");
  vi.stubEnv("NEXT_PUBLIC_POSTHOG_HOST", "https://us.i.posthog.com");
  Object.defineProperty(navigator, "doNotTrack", {
    configurable: true,
    value: "0",
  });
  window.history.replaceState(
    {},
    "",
    "/en/journal/bmw-wochenendprojekt-planen",
  );
  sdk.init.mockReturnValue(sdk);
});

describe("privacy-preserving analytics", () => {
  it("does not load the SDK or send events before consent, after refusal, or with Do Not Track", async () => {
    trackAnalytics("$pageview");
    setAnalyticsConsent(false);
    trackAnalytics("vehicle_added");
    setAnalyticsConsent(true);
    Object.defineProperty(navigator, "doNotTrack", {
      configurable: true,
      value: "1",
    });
    trackAnalytics("$pageview");
    await Promise.resolve();
    expect(sdk.init).not.toHaveBeenCalled();
    expect(sdk.capture).not.toHaveBeenCalled();
  });

  it("redacts private route IDs and auth queries while retaining known article slugs", () => {
    expect(analyticsPath("/garage/my-private-vin/guides/oil")).toBe(
      "/garage/:detail",
    );
    expect(analyticsPath("/passport/secret-token")).toBe("/:private/:detail");
    expect(analyticsPath("/ja/journal/bmw-wochenendprojekt-planen")).toBe(
      "/ja/journal/bmw-wochenendprojekt-planen",
    );
    window.history.replaceState(
      {},
      "",
      "/auth/callback?code=secret&email=owner@example.com&utm_source=instagram",
    );
    const context = analyticsContext();
    expect(context.$current_url).not.toMatch(/secret|owner|callback/);
    expect(context.utm_source).toBe("instagram");
    expect(context.email).toBeUndefined();
  });

  it("captures allowed actions after consent and filters sensitive SDK properties", async () => {
    setAnalyticsConsent(true);
    trackAnalytics("vehicle_added");
    await vi.waitFor(() =>
      expect(sdk.capture).toHaveBeenCalledWith(
        "vehicle_added",
        expect.objectContaining({ locale: "en" }),
      ),
    );
    const config = sdk.init.mock.calls[0][1] as PostHogConfig;
    expect(config).toMatchObject({
      autocapture: false,
      disable_session_recording: true,
      person_profiles: "never",
      respect_dnt: true,
    });
    const event = {
      event: "vehicle_added",
      properties: {
        email: "owner@example.com",
        $initial_current_url: "secret",
        $set: { email: "secret" },
        distinct_id: "random-browser",
        locale: "en",
      },
    };
    const filtered = (
      config.before_send as (input: unknown) => {
        properties: Record<string, unknown>;
      }
    )(event);
    expect(filtered.properties).toEqual({
      distinct_id: "random-browser",
      locale: "en",
    });
    setAnalyticsConsent(false);
    expect(localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBe("denied");
    expect(
      (config.before_send as (event: unknown) => unknown)(event),
    ).toBeNull();
    expect(sdk.opt_out_capturing).toHaveBeenCalled();
    sdk.capture.mockClear();
    trackAnalytics("trip_plan_created");
    await Promise.resolve();
    expect(sdk.capture).not.toHaveBeenCalled();
  });
});
