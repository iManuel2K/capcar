"use client";

import { usePathname } from "next/navigation";

import { MarketingHeader } from "@/components/marketing/marketing-header";

export function SiteHeader() {
  const pathname = usePathname() ?? "/";

  // The cinematic homepage and workspace routes provide their own navigation.
  return pathname.startsWith("/garage") ||
    pathname === "/login" ||
    pathname === "/" ||
    pathname === "/en" ||
    pathname === "/autumn" ? null : (
    <MarketingHeader />
  );
}
