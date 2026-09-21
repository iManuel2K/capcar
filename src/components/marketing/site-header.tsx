"use client";

import { usePathname } from "next/navigation";

import { MarketingHeader } from "@/components/marketing/marketing-header";

export function SiteHeader() {
  const pathname = usePathname() ?? "/";

  // The garage has its own compact workspace header and responsive drawer.
  return pathname.startsWith("/garage") ? null : <MarketingHeader />;
}
