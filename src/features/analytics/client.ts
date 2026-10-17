import type { PostHog } from "posthog-js/dist/module.no-external";

export const ANALYTICS_CONSENT_KEY = "capcar.analytics-consent.v1";
export const ANALYTICS_CONSENT_EVENT = "capcar:analytics-consent";
export const ANALYTICS_SETTINGS_EVENT = "capcar:analytics-settings";
export type AnalyticsEvent =
  | "$pageview"
  | "journal_article_viewed"
  | "journal_checklist_downloaded"
  | "journal_signup_clicked"
  | "signup_submitted"
  | "login_completed"
  | "vehicle_added"
  | "build_item_added"
  | "guide_opened"
  | "trip_plan_created";

type Properties = Record<string, string>;
let client: PostHog | undefined;
let loading: Promise<PostHog> | undefined;

export function analyticsConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN &&
    process.env.NEXT_PUBLIC_POSTHOG_HOST,
  );
}

export function analyticsConsent(): "granted" | "denied" | null {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem(ANALYTICS_CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function analyticsAllowed() {
  return analyticsConsent() === "granted" && navigator.doNotTrack !== "1";
}

// Never transmit vehicle IDs, passport tokens, auth query strings or trip names.
export function analyticsPath(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const locale = /^(en|de|el|sq|ja)$/.test(parts[0] ?? "")
    ? parts.shift()
    : undefined;
  if (parts[0] === "journal") {
    const articles = [
      "bmw-wochenendprojekt-planen",
      "bmw-wartung-ohne-garage",
      "bmw-diy-wartung-dokumentieren",
      "ruesselsheim-rheingau-tagesausflug",
    ];
    return `/${locale ? `${locale}/` : ""}journal${articles.includes(parts[1]) ? `/${parts[1]}` : ""}`;
  }
  const safeRoots = [
    "garage",
    "register",
    "login",
    "ai",
    "roadbook",
    "parts-search",
    "studio",
    "sound-studio",
    "movie-cars",
    "marketplace",
    "privacy",
    "terms",
    "imprint",
    "roadmap",
    "guides",
    "builds",
    "specialists",
    "faq",
  ];
  const root = safeRoots.includes(parts[0])
    ? parts[0]
    : parts.length
      ? ":private"
      : "";
  const detail = parts.length > 1 ? "/:detail" : "";
  return `/${locale ? `${locale}/` : ""}${root}${detail}`;
}

export function analyticsContext(): Properties {
  const url = new URL(window.location.href);
  const properties: Properties = {
    $current_url: `${url.origin}${analyticsPath(url.pathname)}`,
    $pathname: analyticsPath(url.pathname),
    locale: document.documentElement.lang || "en",
  };
  for (const key of [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
  ]) {
    const value = url.searchParams.get(key);
    if (value && /^[a-zA-Z0-9_-]{1,100}$/.test(value)) properties[key] = value;
  }
  return properties;
}

const allowedProperties = new Set([
  "token",
  "distinct_id",
  "$device_id",
  "$session_id",
  "$window_id",
  "$lib",
  "$lib_version",
  "$browser",
  "$browser_version",
  "$os",
  "$os_version",
  "$device_type",
  "$screen_height",
  "$screen_width",
  "$viewport_height",
  "$viewport_width",
  "$current_url",
  "$pathname",
  "locale",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "article_slug",
]);

async function getClient() {
  if (client) return client;
  loading ??= import("posthog-js/dist/module.no-external")
    .then(({ default: posthog }) => {
      if (!analyticsAllowed())
        throw new Error("Analytics permission withdrawn");
      client = posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        ui_host: "https://us.posthog.com",
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        disable_session_recording: true,
        disable_surveys: true,
        advanced_disable_flags: true,
        disable_external_dependency_loading: true,
        capture_exceptions: false,
        person_profiles: "never",
        respect_dnt: true,
        save_referrer: false,
        save_campaign_params: false,
        before_send: (event) => {
          if (!event || !analyticsAllowed()) return null;
          event.properties = Object.fromEntries(
            Object.entries(event.properties).filter(([key]) =>
              allowedProperties.has(key),
            ),
          );
          return event;
        },
      });
      if (!client) throw new Error("Analytics could not be initialized");
      return client;
    })
    .catch((error: unknown) => {
      loading = undefined;
      throw error;
    });
  return loading;
}

export function trackAnalytics(
  event: AnalyticsEvent,
  properties: Properties = {},
) {
  if (!analyticsConfigured() || !analyticsAllowed()) return;
  const context = analyticsContext();
  void getClient()
    .then((posthog) => {
      // Consent may have been withdrawn while the SDK was downloading.
      if (!analyticsAllowed()) {
        posthog.opt_out_capturing();
        return;
      }
      if (posthog.has_opted_out_capturing())
        posthog.opt_in_capturing({ captureEventName: false });
      posthog.capture(event, { ...context, ...properties });
    })
    .catch(() => {
      /* Analytics must never interrupt the app. */
    });
}

export function setAnalyticsConsent(granted: boolean) {
  try {
    localStorage.setItem(ANALYTICS_CONSENT_KEY, granted ? "granted" : "denied");
  } catch {
    return;
  }
  if (!granted && client) client.opt_out_capturing();
  window.dispatchEvent(new Event(ANALYTICS_CONSENT_EVENT));
}
