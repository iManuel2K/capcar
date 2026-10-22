"use client";

import { SiteFooter } from "@/components/marketing/site-footer";
import Link from "@/components/i18n/public-link";
import { BadgeCheck, Search, Store, Wrench } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import styles from "@/components/marketing/homepage.module.css";
export const fieldClass =
  "mt-2 block min-h-12 w-full rounded-xl border border-foreground/16 bg-card p-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,.45)] outline-none transition focus:border-primary/45 focus:bg-card";
export const actionClass =
  "min-h-11 rounded-xl border border-foreground/18 bg-card px-4 py-2 text-sm font-medium transition hover:border-foreground/35 hover:bg-card disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4";
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
    <div className="capcar-paper-grid bg-background text-foreground min-h-dvh">
      <main className="px-5 py-8 sm:px-8 sm:py-12">
        <div className="mx-auto max-w-[1280px] break-words">
          <nav
            aria-label={t("label")}
            className="border-foreground/10 bg-card flex max-w-full gap-1 overflow-x-auto rounded-2xl border p-1.5 text-sm shadow-[0_14px_40px_rgba(184,199,217,.06)] backdrop-blur"
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
                      ? "bg-card text-foreground shadow-sm"
                      : "text-foreground/62 hover:bg-card/6 hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="bg-primary text-primary-foreground mt-12 mb-9 h-1 w-12 rounded-full" />
          <h1 className={`${styles.pageTitle} mb-8 max-w-4xl`}>
            {t(titleKey)}
          </h1>
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
