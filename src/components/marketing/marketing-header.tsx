"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { CapcarWordmark } from "@/components/brand/capcar-wordmark";
import { LanguageSelector } from "@/components/i18n/language-selector";
import { GlobalPartsSearch } from "@/components/parts/global-parts-search";

const navigation = [
  { label: "platform", href: "/#platform" },
  { label: "projects", href: "/#projects" },
  { label: "fitment", href: "/#fitment" },
  { label: "roadmap", href: "/roadmap" },
  { label: "faq", href: "/#faq" },
] as const;

export function MarketingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const t = useTranslations("Navigation");

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  return (
    <>
      <header className="mx-auto flex h-18 w-full max-w-[1500px] items-center justify-between px-5 text-[#0e2d30] sm:h-20 sm:px-8">
        <Link
          href="/"
          aria-label={t("home")}
          className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6d0101]"
        >
          <CapcarWordmark glow={false} />
        </Link>

        <nav
          aria-label={t("main")}
          className="hidden items-center gap-5 text-sm text-[#0e2d30]/62 md:flex"
        >
          {navigation.map((item) => (
            <Link
              key={item.label}
              className="transition hover:text-[#6d0101]"
              href={item.href}
            >
              {t(item.label)}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <GlobalPartsSearch />
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageSelector compact />
          <Link
            href="/register"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#0e2d30] px-4 text-sm font-medium text-[#e8e6d7] transition hover:-translate-y-0.5 hover:bg-[#6d0101]"
          >
            {t("buildYourCar")} <ArrowRight className="size-4" />
          </Link>
        </div>

        <button
          type="button"
          aria-label={t("open")}
          aria-expanded={menuOpen}
          aria-controls="mobile-marketing-navigation"
          onClick={() => setMenuOpen(true)}
          className="grid size-11 place-items-center rounded-full border border-[#0e2d30]/12 text-[#0e2d30] transition hover:bg-[#0e2d30]/5 md:hidden"
        >
          <Menu className="size-5" />
        </button>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label={t("closeBackdrop")}
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-[#050306]/48 backdrop-blur-sm"
          />
          <div
            id="mobile-marketing-navigation"
            role="dialog"
            aria-modal="true"
            aria-label={t("mobile")}
            className="absolute top-0 right-0 flex h-full w-[82%] max-w-sm flex-col rounded-l-[1.75rem] bg-[#e8e6d7] p-5 text-[#0e2d30] shadow-[-30px_0_90px_rgba(5,3,6,0.24)]"
          >
            <div className="flex items-center justify-between border-b border-[#0e2d30]/10 pb-5">
              <CapcarWordmark glow={false} />
              <button
                type="button"
                aria-label={t("close")}
                onClick={() => setMenuOpen(false)}
                className="grid size-10 place-items-center rounded-full bg-[#0e2d30]/6 transition hover:bg-[#0e2d30]/10"
              >
                <X className="size-4" />
              </button>
            </div>

            <nav aria-label={t("mobileMain")} className="mt-4">
              {navigation.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-15 items-center justify-between border-b border-[#0e2d30]/10 text-lg font-medium tracking-[-0.02em]"
                >
                  {t(item.label)}
                  <ChevronRight className="size-4 text-[#0e2d30]/45" />
                </Link>
              ))}
            </nav>

            <div className="mt-6">
              <p className="mb-2 text-xs font-semibold tracking-[0.12em] text-[#0e2d30]/50 uppercase">
                {t("globalSearch")}
              </p>
              <GlobalPartsSearch expanded />
            </div>

            <div className="mt-auto border-t border-[#0e2d30]/10 pt-5">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="inline-flex min-h-11 items-center text-sm font-medium"
              >
                {t("signIn")}
              </Link>
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0e2d30] px-5 text-sm font-semibold text-[#e8e6d7]"
              >
                {t("buildYourCar")} <ArrowRight className="size-4" />
              </Link>
              <div className="mt-4">
                <LanguageSelector />
              </div>
              <p className="mt-4 text-xs leading-5 text-[#0e2d30]/45">
                {t("privacyNote")}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
