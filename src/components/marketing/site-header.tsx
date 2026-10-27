"use client";

import { usePathname } from "next/navigation";

import { MarketingHeader } from "@/components/marketing/marketing-header";

export function SiteHeader() {
  const pathname = usePathname() ?? "/";

  // Garage and login supply their own navigation within their dedicated layouts.
  return pathname.startsWith("/garage") || pathname === "/login" ? null : (
    <MarketingHeader />
  );
}
