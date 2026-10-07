"use client";

import { SiteFooter } from "@/components/marketing/site-footer";
import Link from "next/link";
import { BadgeCheck, Search, Store, Wrench } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
export const fieldClass =
  "mt-2 block min-h-12 w-full rounded-xl border border-[#0e2d30]/16 bg-white/55 p-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,.45)] outline-none transition focus:border-[#6d0101]/45 focus:bg-white";
export const actionClass =
  "min-h-11 rounded-xl border border-[#0e2d30]/18 bg-white/30 px-4 py-2 text-sm font-medium transition hover:border-[#0e2d30]/35 hover:bg-white/55 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4";
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
    <div className="capcar-paper-grid min-h-dvh bg-[#ebe9dc] text-[#0e2d30]">
      <main className="px-5 py-8 sm:px-8 sm:py-12">
        <div className="mx-auto max-w-[1280px] break-words">
          <nav
            aria-label={t("label")}
            className="flex max-w-full gap-1 overflow-x-auto rounded-2xl border border-[#0e2d30]/10 bg-white/45 p-1.5 text-sm shadow-[0_14px_40px_rgba(14,45,48,.06)] backdrop-blur"
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
          <div className="mt-12 mb-9 h-1 w-12 rounded-full bg-[#6d0101]" />
          <h1 className="mb-10 max-w-4xl text-4xl leading-[.98] font-medium tracking-[-0.05em] sm:text-6xl">
            {t(titleKey)}
          </h1>
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
