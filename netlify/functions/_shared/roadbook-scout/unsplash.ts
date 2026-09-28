import { stableFingerprint } from "./hash";
import type { DiscoveryCandidate, PhotoTarget } from "./types";

type UnsplashPhoto = {
  id: string;
  width: number;
  height: number;
  color: string | null;
  description: string | null;
  alt_description: string | null;
  urls: { raw: string; full: string; regular: string; small: string };
  links: { html: string; download_location: string };
  user: { name: string; links: { html: string } };
  location?: { name?: string | null; country?: string | null } | null;
};

type UnsplashSearchResponse = { results?: UnsplashPhoto[] };

function referralUrl(value: string) {
  const url = new URL(value);
  url.searchParams.set("utm_source", "capcar");
  url.searchParams.set("utm_medium", "referral");
  return url.toString();
}

export async function searchUnsplashTarget(
  target: PhotoTarget,
  accessKey: string,
  page: number,
  signal: AbortSignal,
): Promise<DiscoveryCandidate | undefined> {
  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", target.query);
  url.searchParams.set("orientation", "landscape");
  url.searchParams.set("content_filter", "high");
  url.searchParams.set("per_page", "10");
  url.searchParams.set("page", String(page));

  const response = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${accessKey}`,
      "Accept-Version": "v1",
    },
    signal,
  });
  if (!response.ok) {
    throw new Error(`Unsplash returned ${response.status}`);
  }

  const body = (await response.json()) as UnsplashSearchResponse;
  const photo = body.results?.find((item) => item.width > item.height);
  if (!photo) return undefined;
  const title =
    photo.alt_description?.trim() ||
    photo.description?.trim() ||
    `${target.region} scenic automotive reference`;

  return {
    kind: "image",
    fingerprint: await stableFingerprint("unsplash", photo.id),
    sourceKey: target.key,
    title: title.slice(0, 200),
    sourceUrl: referralUrl(photo.links.html),
    countryCode: target.countryCode,
    region: target.region,
    confidence: photo.location?.name ? 0.72 : 0.58,
    payload: {
      provider: "unsplash",
      photoId: photo.id,
      query: target.query,
      target: {
        key: target.key,
        region: target.region,
        countryCode: target.countryCode,
        latitude: target.latitude,
        longitude: target.longitude,
      },
      image: {
        url: photo.urls.regular,
        smallUrl: photo.urls.small,
        fullUrl: photo.urls.full,
        width: photo.width,
        height: photo.height,
        color: photo.color,
        alt: title.slice(0, 300),
      },
      photographer: {
        name: photo.user.name,
        profileUrl: referralUrl(photo.user.links.html),
      },
      unsplashUrl: referralUrl(photo.links.html),
      downloadLocation: photo.links.download_location,
      providerLocation: photo.location ?? null,
      license: "Unsplash License",
      context: "representative",
      requiresHumanReview: true,
    },
  };
}
