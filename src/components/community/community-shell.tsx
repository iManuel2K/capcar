"use client";

import { SiteFooter } from "@/components/marketing/site-footer";
import Link from "next/link";
import { BadgeCheck, Search, Store, Wrench } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
export const fieldClass =
  "mt-2 block min-h-11 w-full rounded-xl border border-[#0e2d30]/30 bg-white/40 p-3 text-sm";
export const actionClass =
  "min-h-11 rounded-xl border border-[#0e2d30]/30 px-4 py-2 text-sm font-medium disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4";
export function CommunityShell({
  titleKey,
  children,
}: {
  titleKey: "connectedTitle" | "marketplaceTitle" | "verifiedTitle";
  children: React.ReactNode;
}) {
  const t = useTranslations("Community");
  const expansion = useTranslations("Expansion");
  const pathname = usePathname();
  const links = [
    { href: "/marketplace", label: t("marketplace"), icon: Store },
    { href: "/connected-parts", label: t("retailSearch"), icon: Search },
    { href: "/verified-work", label: t("verifiedWork"), icon: BadgeCheck },
    { href: "/specialists", label: expansion("specialists"), icon: Wrench },
  ];
  return (
    <div className="min-h-dvh bg-[#e8e6d7] text-[#0e2d30]">
      <main className="px-5 py-8">
        <div className="mx-auto max-w-6xl break-words">
          <nav
            aria-label={t("label")}
            className="flex max-w-full gap-1 overflow-x-auto rounded-2xl border border-[#0e2d30]/10 bg-white/28 p-1.5 text-sm"
          >
            {links.map(({ href, label, icon: Icon }) => {
              const selected =
                pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={selected ? "page" : undefined}
                  className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3.5 transition ${
                    selected
                      ? "bg-[#0e2d30] text-[#e8e6d7] shadow-sm"
                      : "text-[#0e2d30]/62 hover:bg-[#0e2d30]/6 hover:text-[#0e2d30]"
                  }`}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </Link>
              );
            })}
          </nav>
          <h1 className="mt-12 mb-8 max-w-4xl text-4xl font-medium tracking-tight sm:text-6xl">
            {t(titleKey)}
          </h1>
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
