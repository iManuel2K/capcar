import type { MetadataRoute } from "next";

import {
  PUBLIC_CONTENT_LAST_MODIFIED,
  PUBLIC_INDEXABLE_ROUTES,
  PUBLIC_SITE_URL,
  localizedPublicUrl,
  publicLanguageAlternates,
} from "@/features/seo/public-metadata";
import { locales } from "@/i18n/config";

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_INDEXABLE_ROUTES.flatMap((route) => {
    const alternates = { languages: publicLanguageAlternates(route) };
    const shared = {
      lastModified: PUBLIC_CONTENT_LAST_MODIFIED,
      alternates,
    };

    return [
      {
        url: new URL(route || "/", PUBLIC_SITE_URL).toString(),
        ...shared,
      },
      ...locales.map((locale) => ({
        url: localizedPublicUrl(route, locale),
        ...shared,
      })),
    ];
  });
}
