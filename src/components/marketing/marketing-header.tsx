"use client";

import Link from "@/components/i18n/public-link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { CapcarWordmark } from "@/components/brand/capcar-wordmark";
import { LanguageSelector } from "@/components/i18n/language-selector";
import { journalPath, resolveJournalLocale } from "@/features/journal/routes";
import { journalUI } from "@/features/journal/ui";
import { GlobalPartsSearch } from "@/components/parts/global-parts-search";
import { HomepageLink } from "./homepage-link";
import styles from "./homepage.module.css";
import { homepageCopy } from "@/features/marketing/homepage-copy";
import { ExpandableNavigation } from "./expandable-navigation";
import navigationStyles from "./expandable-navigation.module.css";
import { interactionCopy } from "@/features/ui/interaction-copy";
import { publicHref } from "@/features/seo/public-metadata";
import { trapDialogFocus } from "@/components/ui/dialog-focus";
import { useNavigationAuth } from "@/features/auth/use-navigation-auth";

const navigation = [
  { label: "how", href: "/platform" },
  { label: "projects", href: "/#projects" },
  { label: "parts", href: "/connected-parts" },
] as const;

export function MarketingHeader() {
  const { showSignIn, signedIn } = useNavigationAuth();
  const journalLocale = resolveJournalLocale(useLocale());
  const journal = journalUI[journalLocale];
  const home = homepageCopy[journalLocale];
  const garageHref = signedIn ? "/garage" : "/garage/new";
  const garageLabel = signedIn ? home.openGarage : home.create;
  const ui = interactionCopy[journalLocale];
  const links = navigation.map((item) => ({
    ...item,
    href: publicHref(item.href, journalLocale),
  }));
  const pathname = usePathname() ?? "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const t = useTranslations("Navigation");
  const l = useTranslations("Launch");
  const footer = useTranslations("Footer");
  const drawer = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const dialog = drawer.current;
    const trigger = opener.current;
    dialog?.showModal();
    dialog?.querySelector<HTMLButtonElement>("[data-close]")?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      trigger?.focus();
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  const active = (href: string) => {
    if (href.includes("#")) return false;
    const target = href.split("#")[0] || "/";
    return pathname === target || pathname.startsWith(`${target}/`);
  };

  return (
    <>
      <header className="border-foreground/10 bg-background/92 text-foreground sticky top-0 z-[80] border-b shadow-[0_12px_40px_rgba(184,199,217,0.055)] backdrop-blur-2xl [--ring:var(--primary)]">
        <div className="mx-auto flex h-[4.75rem] w-full max-w-[1440px] items-center justify-between gap-5 px-5 sm:h-20 sm:px-8">
          <Link
            href="/"
            aria-label={t("home")}
            className="focus-visible:outline-primary shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            <CapcarWordmark glow={false} />
          </Link>

          <nav
            aria-label={t("main")}
            className="border-foreground/8 text-foreground/68 bg-card/65 hidden items-center gap-0.5 rounded-full border p-1 text-sm xl:flex"
          >
            {links.slice(0, 2).map((item) => (
              <Link
                key={item.label}
                aria-current={active(item.href) ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-full px-3 transition focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  active(item.href)
                    ? "bg-card text-foreground font-medium shadow-[0_2px_12px_rgba(184,199,217,.07)]"
                    : "hover:bg-card/5 hover:text-primary"
                }`}
                href={item.href}
              >
                {l(`nav.${item.label}`)}
              </Link>
            ))}
            <ExpandableNavigation
              sections={[
                {
                  label: ui.garage,
                  description: ui.overview,
                  links: [
                    { href: garageHref, label: garageLabel },
                    { href: "/#projects", label: l("nav.projects") },
                    { href: "/connected-parts", label: l("nav.parts") },
                    { href: "/marketplace", label: footer("marketplace") },
                  ],
                },
                {
                  label: ui.drives,
                  description: ui.journeys,
                  links: [
                    { href: "/roadbook", label: footer("roadbook") },
                    { href: "/ai", label: footer("aiPlanner") },
                    { href: journalPath(journalLocale), label: journal.label },
                  ],
                },
                {
                  label: ui.discover,
                  description: ui.tools,
                  links: [
                    { href: "/studio", label: footer("conceptStudio") },
                    { href: "/sound-studio", label: footer("soundStudio") },
                    { href: "/movie-cars", label: footer("movieCars") },
                    { href: "/roadmap", label: footer("roadmap") },
                    { href: "/#faq", label: footer("faq") },
                  ],
                },
              ]}
            />
          </nav>

          <div className="hidden 2xl:block">
            <GlobalPartsSearch />
          </div>
          <div className="hidden items-center gap-2 xl:flex">
            <LanguageSelector compact />
            {showSignIn && (
              <Link
                href="/login"
                aria-current={pathname === "/login" ? "page" : undefined}
                className="hover:bg-card/5 inline-flex min-h-11 items-center rounded-full px-3 text-sm transition focus-visible:outline-2"
              >
                {t("signIn")}
              </Link>
            )}
            <HomepageLink
              href={garageHref}
              placement="header"
              className={styles.primary}
            >
              {garageLabel} <ArrowRight className="size-4" aria-hidden="true" />
            </HomepageLink>
          </div>

          <button
            ref={opener}
            type="button"
            aria-label={t("open")}
            aria-expanded={menuOpen}
            aria-controls="mobile-marketing-navigation"
            onClick={() => setMenuOpen(true)}
            className="border-foreground/12 text-foreground hover:bg-card/5 grid size-12 place-items-center rounded-full border transition xl:hidden"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      {menuOpen && (
        <dialog
          ref={drawer}
          onKeyDown={trapDialogFocus}
          aria-label={t("mobile")}
          onCancel={(event) => {
            event.preventDefault();
            setMenuOpen(false);
          }}
          className="fixed inset-0 z-[100] m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-transparent p-0 backdrop:bg-transparent"
        >
          <button
            type="button"
            aria-label={t("closeBackdrop")}
            tabIndex={-1}
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-[#050306]/48 backdrop-blur-sm"
          />
          <div
            id="mobile-marketing-navigation"
            className={`${navigationStyles.mobileDrawer} bg-background text-foreground absolute top-0 right-0 flex h-full w-[min(92%,24rem)] flex-col overflow-y-auto overscroll-contain rounded-l-[1.75rem] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[-30px_0_90px_rgba(5,3,6,0.24)]`}
          >
            <div className="border-foreground/10 flex items-center justify-between border-b pb-5">
              <CapcarWordmark glow={false} />
              <button
                type="button"
                aria-label={t("close")}
                data-close
                onClick={() => setMenuOpen(false)}
                className="bg-card/6 hover:bg-card/10 grid size-12 shrink-0 place-items-center rounded-full transition"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="pt-5">
              <HomepageLink
                href={garageHref}
                placement="header"
                onClick={() => setMenuOpen(false)}
                className={`${styles.primary} w-full`}
              >
                {garageLabel}{" "}
                <ArrowRight className="size-4" aria-hidden="true" />
              </HomepageLink>
            </div>

            <nav aria-label={t("mobileMain")} className="mt-4">
              {links.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={active(item.href) ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className="border-foreground/10 flex min-h-15 items-center justify-between border-b text-lg font-medium tracking-[-0.02em]"
                >
                  {l(`nav.${item.label}`)}
                  <ChevronRight className="text-muted-foreground size-4" />
                </Link>
              ))}
              <details className="mt-2">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between text-base font-medium [&::-webkit-details-marker]:hidden">
                  {l("nav.explore")}
                  <ChevronDown className="size-4" aria-hidden="true" />
                </summary>
                <div className="pl-3">
                  {" "}
                  {[
                    ["conceptStudio", "/studio"],
                    ["soundStudio", "/sound-studio"],
                    ["movieCars", "/movie-cars"],
                    ["roadbook", "/roadbook"],
                    ["aiPlanner", "/ai"],
                    ["marketplace", "/marketplace"],
                    ["roadmap", "/roadmap"],
                    ["faq", "/#faq"],
                    ["journal", journalPath(journalLocale)],
                  ].map(([label, href]) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className="border-foreground/10 flex min-h-12 items-center justify-between border-b text-base focus-visible:outline-2"
                    >
                      {label === "journal" ? journal.label : footer(label)}
                      <ChevronRight className="size-4" aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              </details>
            </nav>

            <div className="mt-6">
              <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-[0.12em] uppercase">
                {t("globalSearch")}
              </p>
              <GlobalPartsSearch expanded />
            </div>

            <div className="border-foreground/10 mt-auto border-t pt-5">
              {showSignIn && (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex min-h-11 items-center text-sm font-medium"
                >
                  {t("signIn")}
                </Link>
              )}
              <div className="mt-4">
                <LanguageSelector direction="up" />
              </div>
              <p className="text-muted-foreground mt-4 text-xs leading-5">
                {t("privacyNote")}
              </p>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}
