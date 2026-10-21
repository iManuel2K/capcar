"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { useEffect, useState, useSyncExternalStore } from "react";
import { isAppLocale } from "@/i18n/config";
import { analyticsUI } from "@/features/analytics/ui";
import {
  ANALYTICS_CONSENT_EVENT,
  ANALYTICS_SETTINGS_EVENT,
  analyticsConfigured,
  analyticsConsent,
  analyticsPath,
  setAnalyticsConsent,
  trackAnalytics,
} from "@/features/analytics/client";

function subscribe(callback: () => void) {
  window.addEventListener(ANALYTICS_CONSENT_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(ANALYTICS_CONSENT_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function AnalyticsProvider() {
  const locale = useLocale();
  const t = analyticsUI[isAppLocale(locale) ? locale : "en"];
  const pathname = usePathname();
  const consent = useSyncExternalStore(subscribe, analyticsConsent, () => null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const configured = analyticsConfigured();

  useEffect(() => {
    if (consent !== "granted") return;
    trackAnalytics("$pageview");
    const path = analyticsPath(pathname);
    if (/\/journal\/[^/]+$/.test(path))
      trackAnalytics("journal_article_viewed", {
        article_slug: path.split("/").at(-1)!,
      });
    if (/^\/garage\/[^/]+\/guides\/[^/]+\/?$/.test(pathname))
      trackAnalytics("guide_opened");
  }, [pathname, consent, locale]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const link =
        event.target instanceof Element ? event.target.closest("a") : null;
      if (!link) return;
      const current = analyticsPath(window.location.pathname);
      if (!/\/journal\/[^/]+$/.test(current)) return;
      const url = new URL(link.href, window.location.origin);
      if (url.origin !== window.location.origin) return;
      const props = { article_slug: current.split("/").at(-1)! };
      if (url.pathname === "/register")
        trackAnalytics("journal_signup_clicked", props);
    }
    const open = () => setSettingsOpen(true);
    document.addEventListener("click", onClick);
    window.addEventListener(ANALYTICS_SETTINGS_EVENT, open);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener(ANALYTICS_SETTINGS_EVENT, open);
    };
  }, []);

  if (!configured) return null;
  function choose(granted: boolean) {
    setAnalyticsConsent(granted);
    setSettingsOpen(false);
  }

  return (
    <>
      {(consent === null || settingsOpen) && (
        <section
          aria-label={t.title}
          className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[100] mx-auto max-h-[calc(100dvh-6.5rem)] max-w-xl overflow-y-auto rounded-2xl border border-[#405856]/25 bg-[#f5f2e8] p-4 text-[#0e2d30] shadow-2xl sm:inset-x-auto sm:right-5 sm:bottom-5"
        >
          <h2 className="text-base font-semibold">{t.title}</h2>
          <details className="mt-1">
            <summary className="flex min-h-11 cursor-pointer items-center rounded text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e2d30]">
              {t.details}
            </summary>
            <p className="mt-1 text-sm leading-6">{t.description}</p>
            <Link
              href="/privacy"
              className="mt-1 inline-flex min-h-11 items-center rounded text-sm underline"
            >
              {t.privacy}
            </Link>
          </details>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => choose(false)}
              className="min-h-11 flex-1 rounded-xl border border-[#0e2d30]/30 px-4 py-2 text-sm font-semibold"
            >
              {t.decline}
            </button>
            <button
              type="button"
              onClick={() => choose(true)}
              className="min-h-11 flex-1 rounded-xl border border-[#0e2d30]/30 px-4 py-2 text-sm font-semibold"
            >
              {t.accept}
            </button>
          </div>
        </section>
      )}
    </>
  );
}

export function AnalyticsSettingsButton() {
  const locale = useLocale();
  const t = analyticsUI[isAppLocale(locale) ? locale : "en"];
  if (!analyticsConfigured()) return null;
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(ANALYTICS_SETTINGS_EVENT))}
      className="inline-flex min-h-11 items-center rounded text-sm underline"
    >
      {t.settings}
    </button>
  );
}
