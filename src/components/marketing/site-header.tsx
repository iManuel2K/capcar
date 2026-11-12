"use client";

import { usePathname } from "next/navigation";

import { MarketingHeader } from "@/components/marketing/marketing-header";

import { localizePublicPathname } from "@/features/seo/public-metadata";
import seasonal from "./autumn-navigation.module.css";

const additionalPublicPages = new Set([
  "/international-parts",
  "/launch",
  "/marketplace",
  "/specialists/apply",
  "/verified-work",
]);

export function SiteHeader() {
  const pathname = usePathname() ?? "/";

  // Workspace and sign-in routes provide their own navigation.
  return pathname.startsWith("/garage") ||
    pathname === "/login" ||
    pathname === "/autumn" ? null : (
    <>
      {pathname !== "/" &&
        pathname !== "/en" &&
        (localizePublicPathname(pathname, "en") !== null ||
          additionalPublicPages.has(pathname)) && (
          <span className={seasonal.pageMarker} data-autumn-public hidden />
        )}
      <MarketingHeader />
    </>
  );
}
