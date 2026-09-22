import type { MetadataRoute } from "next";
import {
  PUBLIC_INDEXABLE_ROUTES,
  PUBLIC_SITE_URL,
} from "@/features/seo/public-metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_INDEXABLE_ROUTES.map((path) => ({
    url: new URL(path || "/", PUBLIC_SITE_URL).toString(),
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/roadmap" ? 0.7 : 0.4,
  }));
}
