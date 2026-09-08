import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
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
        "/login",
        "/notifications",
        "/passport/",
        "/register",
        "/reset-password",
        "/system",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
