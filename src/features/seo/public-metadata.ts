import type { Metadata } from "next";

export const PUBLIC_SITE_URL = new URL("https://capcar.dev");

export const PUBLIC_INDEXABLE_ROUTES = [
  "",
  "/ai",
  "/connected-parts",
  "/imprint",
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

export function canonicalMetadata(
  route: PublicIndexableRoute,
): Pick<Metadata, "alternates" | "openGraph"> {
  const url = new URL(route || "/", PUBLIC_SITE_URL).toString();
  return { alternates: { canonical: url }, openGraph: { url } };
}

/** Full route-specific share metadata; indexing is deliberately independent. */
export function pageMetadata(
  route: string,
  title: string,
  description: string,
  robots?: Metadata["robots"],
): Metadata {
  const url = new URL(route, PUBLIC_SITE_URL).toString();
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "CapCar", type: "website" },
    twitter: { card: "summary_large_image", title, description },
    ...(robots ? { robots } : {}),
  };
}
