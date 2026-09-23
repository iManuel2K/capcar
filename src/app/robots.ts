import type { MetadataRoute } from "next";
import { PUBLIC_SITE_URL } from "@/features/seo/public-metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/account",
        "/api/",
        "/auth/",
        "/garage/",
        "/international-parts",
        "/launch",
        "/notifications",
        "/passport/",
        "/reset-password",
      ],
    },
    sitemap: new URL("/sitemap.xml", PUBLIC_SITE_URL).toString(),
  };
}
