"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { CapcarWordmark } from "@/components/brand/capcar-wordmark";
import { LanguageSelector } from "@/components/i18n/language-selector";
import { GlobalPartsSearch } from "@/components/parts/global-parts-search";

const navigation = [
  { label: "how", href: "/#platform" },
  { label: "projects", href: "/#projects" },
  { label: "parts", href: "/parts-search" },
  { label: "ai", href: "/ai" },
] as const;

export function MarketingHeader() {
  const pathname = usePathname() ?? "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const t = useTranslations("Navigation");
  const l = useTranslations("Launch");
  const footer = useTranslations("Footer");
  const explore = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!explore.current?.contains(event.target as Node))
        explore.current?.removeAttribute("open");
    };
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape" && explore.current?.open) {
        explore.current.removeAttribute("open");
        explore.current.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("click", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", escape);
    };
  }, []);
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
      <header className="sticky top-0 z-[80] border-b border-[#0e2d30]/10 bg-[#ebe9dc]/92 text-[#0e2d30] shadow-[0_12px_40px_rgba(14,45,48,0.055)] backdrop-blur-2xl">
        <div className="mx-auto flex h-[4.75rem] w-full max-w-[1440px] items-center justify-between gap-5 px-5 sm:h-20 sm:px-8">
          <Link
            href="/"
            aria-label={t("home")}
            className="shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6d0101]"
          >
            <CapcarWordmark glow={false} />
          </Link>

          <nav
            aria-label={t("main")}
            className="hidden items-center gap-0.5 rounded-full border border-[#0e2d30]/8 bg-white/20 p-1 text-sm text-[#0e2d30]/68 xl:flex"
          >
            {navigation.map((item) => (
              <Link
                key={item.label}
                aria-current={active(item.href) ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-full px-3 transition focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  active(item.href)
                    ? "bg-white/70 font-medium text-[#0e2d30] shadow-[0_2px_12px_rgba(14,45,48,.07)]"
                    : "hover:bg-[#0e2d30]/5 hover:text-[#6d0101]"
                }`}
                href={item.href}
              >
                {l(`nav.${item.label}`)}
              </Link>
            ))}
            <details ref={explore} className="relative z-40">
              <summary className="flex min-h-11 cursor-pointer list-none items-center gap-1 rounded-full px-3 transition hover:bg-[#0e2d30]/5 focus-visible:outline-2 [&::-webkit-details-marker]:hidden">
                {l("nav.explore")}
                <ChevronDown className="size-3" aria-hidden="true" />
              </summary>
              <div className="absolute top-[calc(100%+.5rem)] right-0 min-w-60 rounded-2xl border border-[#0e2d30]/14 bg-[#f5f2e8] p-2 shadow-[0_24px_70px_rgba(14,45,48,0.18)]">
                {[
                  ["conceptStudio", "/studio"],
                  ["soundStudio", "/sound-studio"],
                  ["roadbook", "/roadbook"],
                  ["aiPlanner", "/ai"],
                  ["marketplace", "/marketplace"],
                  ["roadmap", "/roadmap"],
                  ["faq", "/#faq"],
                ].map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active(href) ? "page" : undefined}
                    onClick={() => explore.current?.removeAttribute("open")}
                    className={`flex min-h-11 items-center rounded-xl px-3 transition focus-visible:outline-2 ${
                      active(href)
                        ? "bg-[#0e2d30] text-[#e8e6d7]"
                        : "hover:bg-[#0e2d30]/6"
                    }`}
                  >
                    {footer(label)}
                  </Link>
                ))}
              </div>
            </details>
          </nav>

          <div className="hidden 2xl:block">
            <GlobalPartsSearch />
          </div>
          <div className="hidden items-center gap-2 xl:flex">
            <LanguageSelector compact />
            <Link
              href="/login"
              aria-current={pathname === "/login" ? "page" : undefined}
              className="inline-flex min-h-11 items-center rounded-full px-3 text-sm transition hover:bg-[#0e2d30]/5 focus-visible:outline-2"
            >
              {t("signIn")}
            </Link>
            <Link
              href="/register"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#0e2d30] px-5 text-sm font-medium text-[#e8e6d7] shadow-[0_10px_25px_rgba(14,45,48,.16)] transition hover:-translate-y-0.5 hover:bg-[#6d0101]"
            >
              {l("start")} <ArrowRight className="size-4" />
            </Link>
          </div>

          <button
            ref={opener}
            type="button"
            aria-label={t("open")}
            aria-expanded={menuOpen}
            aria-controls="mobile-marketing-navigation"
            onClick={() => setMenuOpen(true)}
            className="grid size-11 place-items-center rounded-full border border-[#0e2d30]/12 text-[#0e2d30] transition hover:bg-[#0e2d30]/5 xl:hidden"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      {menuOpen && (
        <dialog
          ref={drawer}
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
            className="absolute top-0 right-0 flex h-full w-[min(92%,24rem)] flex-col overflow-y-auto overscroll-contain rounded-l-[1.75rem] bg-[#e8e6d7] p-5 text-[#0e2d30] shadow-[-30px_0_90px_rgba(5,3,6,0.24)]"
          >
            <div className="flex items-center justify-between border-b border-[#0e2d30]/10 pb-5">
              <CapcarWordmark glow={false} />
              <button
                type="button"
                aria-label={t("close")}
                data-close
                onClick={() => setMenuOpen(false)}
                className="grid size-11 shrink-0 place-items-center rounded-full bg-[#0e2d30]/6 transition hover:bg-[#0e2d30]/10"
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
                  {l(`nav.${item.label}`)}
                  <ChevronRight className="size-4 text-[#0e2d30]/45" />
                </Link>
              ))}
              {[
                ["conceptStudio", "/studio"],
                ["soundStudio", "/sound-studio"],
                ["roadbook", "/roadbook"],
                ["aiPlanner", "/ai"],
                ["marketplace", "/marketplace"],
                ["roadmap", "/roadmap"],
                ["faq", "/#faq"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-12 items-center justify-between border-b border-[#0e2d30]/10 text-base focus-visible:outline-2"
                >
                  {footer(label)}
                  <ChevronRight className="size-4" aria-hidden="true" />
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
                {l("start")} <ArrowRight className="size-4" />
              </Link>
              <div className="mt-4">
                <LanguageSelector direction="up" />
              </div>
              <p className="mt-4 text-xs leading-5 text-[#0e2d30]/45">
                {t("privacyNote")}
              </p>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}
