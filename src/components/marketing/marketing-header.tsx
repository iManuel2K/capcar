"use client";

import Link from "next/link";
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
] as const;

export function MarketingHeader() {
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
          className="hidden items-center gap-5 text-sm text-[#0e2d30]/75 xl:flex"
        >
          {navigation.map((item) => (
            <Link
              key={item.label}
              className="inline-flex min-h-11 items-center rounded transition hover:text-[#6d0101] focus-visible:outline-2 focus-visible:outline-offset-4"
              href={item.href}
            >
              {l(`nav.${item.label}`)}
            </Link>
          ))}
          <details ref={explore} className="relative z-40">
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-1 rounded focus-visible:outline-2 [&::-webkit-details-marker]:hidden">
              {l("nav.explore")}
              <ChevronDown className="size-3" aria-hidden="true" />
            </summary>
            <div className="absolute top-full right-0 min-w-56 rounded-xl border border-[#0e2d30]/20 bg-[#f5f2e8] p-2 shadow-lg">
              {[
                ["conceptStudio", "/studio"],
                ["soundStudio", "/sound-studio"],
                ["marketplace", "/marketplace"],
                ["roadmap", "/roadmap"],
                ["faq", "/#faq"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => explore.current?.removeAttribute("open")}
                  className="flex min-h-11 items-center rounded-lg px-3 hover:bg-[#0e2d30]/5 focus-visible:outline-2"
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
            className="inline-flex min-h-11 items-center rounded px-2 text-sm focus-visible:outline-2"
          >
            {t("signIn")}
          </Link>
          <Link
            href="/register"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#0e2d30] px-4 text-sm font-medium text-[#e8e6d7] transition hover:-translate-y-0.5 hover:bg-[#6d0101]"
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
      </header>

      {menuOpen && (
        <dialog
          ref={drawer}
          aria-label={t("mobile")}
          onCancel={(event) => {
            event.preventDefault();
            setMenuOpen(false);
          }}
          className="fixed inset-0 z-50 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-transparent p-0 backdrop:bg-transparent"
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
