import { isJournalRoute } from "@/features/journal/routes";
import type { Metadata } from "next";

import { isAppLocale, type AppLocale, locales } from "@/i18n/config";

export const PUBLIC_SITE_URL = new URL("https://capcar.dev");
export const PUBLIC_SITE_NAME = "CapCar — Digital Garage";
export const HOMEPAGE_LAST_MODIFIED = "2026-10-19";
export const PUBLIC_CONTENT_LAST_MODIFIED = "2026-10-16";

export const PUBLIC_INDEXABLE_ROUTES = [
  "",
  "/connected-parts",
  "/imprint",
  "/movie-cars",
  "/parts-search",
  "/privacy",
  "/roadbook",
  "/roadmap",
  "/sound-studio",
  "/specialists",
  "/studio",
  "/terms",
] as const;

export type PublicIndexableRoute = (typeof PUBLIC_INDEXABLE_ROUTES)[number];

export function isPublicIndexableRoute(
  value: string,
): value is PublicIndexableRoute {
  return PUBLIC_INDEXABLE_ROUTES.includes(value as PublicIndexableRoute);
}

export function localizedPublicPath(
  route: PublicIndexableRoute,
  locale: AppLocale,
) {
  return `/${locale}${route}`;
}

export function localizedPublicUrl(
  route: PublicIndexableRoute,
  locale: AppLocale,
) {
  return new URL(
    localizedPublicPath(route, locale),
    PUBLIC_SITE_URL,
  ).toString();
}

export function publicLanguageAlternates(route: PublicIndexableRoute) {
  return {
    ...Object.fromEntries(
      locales.map((locale) => [locale, localizedPublicUrl(route, locale)]),
    ),
    "x-default": new URL(route || "/", PUBLIC_SITE_URL).toString(),
  };
}

export function localizePublicPathname(
  pathname: string,
  locale: AppLocale,
): string | null {
  const segments = pathname.split(/[?#]/, 1)[0].split("/").filter(Boolean);
  const routeSegments = isAppLocale(segments[0]) ? segments.slice(1) : segments;
  const route = routeSegments.length ? `/${routeSegments.join("/")}` : "";

  if (isJournalRoute(route)) return `/${locale}${route}`;
  return isPublicIndexableRoute(route)
    ? localizedPublicPath(route, locale)
    : null;
}

export function canonicalMetadata(
  route: PublicIndexableRoute,
): Pick<Metadata, "alternates" | "openGraph"> {
  const url = new URL(route || "/", PUBLIC_SITE_URL).toString();
  return {
    alternates: {
      canonical: url,
      languages: publicLanguageAlternates(route),
    },
    openGraph: { url },
  };
}

export function localizedMetadata(
  metadata: Metadata,
  route: PublicIndexableRoute,
  locale: AppLocale,
): Metadata {
  const url = localizedPublicUrl(route, locale);
  const openGraph = metadata.openGraph ?? {};

  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical: url,
      languages: publicLanguageAlternates(route),
    },
    openGraph: { ...openGraph, url },
  };
}

/** Full route-specific share metadata; indexing is deliberately independent. */
export function pageMetadata(
  route: string,
  title: string,
  description: string,
  robots?: Metadata["robots"],
): Metadata {
  const url = new URL(route, PUBLIC_SITE_URL).toString();
  const publicRoute = isPublicIndexableRoute(route) ? route : null;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      ...(publicRoute
        ? { languages: publicLanguageAlternates(publicRoute) }
        : {}),
    },
    openGraph: {
      title,
      description,
      url,
      siteName: PUBLIC_SITE_NAME,
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
    ...(robots ? { robots } : {}),
  };
}
