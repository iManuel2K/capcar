import type { Metadata } from "next";

export const PUBLIC_SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://capcar.dev",
);

export const PUBLIC_INDEXABLE_ROUTES = [
  "",
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
): Pick<Metadata, "alternates"> {
  return { alternates: { canonical: route || "/" } };
}
