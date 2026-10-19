"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";

import { localizePublicPathname } from "@/features/seo/public-metadata";
import {
  isAppLocale,
  localeCookie,
  localeLabels,
  locales,
} from "@/i18n/config";

export function LanguageSelector({
  compact = false,
  direction = "down",
  align,
}: {
  compact?: boolean;
  direction?: "up" | "down";
  align?: "start" | "end";
}) {
  const locale = useLocale();
  const t = useTranslations("Language");
  const menuId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [requestedLocale, setRequestedLocale] = useState<
    (typeof locales)[number] | null
  >(null);
  const root = useRef<HTMLDivElement>(null);
  const activeLocale = isAppLocale(locale) ? locale : "en";
  const visibleLocaleLabel = compact
    ? activeLocale.toUpperCase()
    : localeLabels[activeLocale];

  useEffect(() => {
    if (!open) return;
    root.current
      ?.querySelector<HTMLButtonElement>('[aria-checked="true"]')
      ?.focus();

    const closeOnPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        setOpen(false);
        trigger.current?.focus();
      }
    };

    document.addEventListener("pointerdown", closeOnPointerDown);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnPointerDown);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!requestedLocale) return;
    document.cookie = `${localeCookie}=${requestedLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
    document.documentElement.lang = requestedLocale;
    const localizedPath = localizePublicPathname(
      window.location.pathname,
      requestedLocale,
    );
    if (localizedPath && localizedPath !== window.location.pathname) {
      window.location.assign(
        `${localizedPath}${window.location.search}${window.location.hash}`,
      );
      return;
    }
    window.location.reload();
  }, [requestedLocale]);

  function selectLocale(nextLocale: (typeof locales)[number]) {
    if (nextLocale === activeLocale) {
      setOpen(false);
      return;
    }
    setPending(true);
    setRequestedLocale(nextLocale);
  }

  return (
    <div
      ref={root}
      className="relative inline-flex text-sm"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-label={`${visibleLocaleLabel} — ${t("label")}: ${localeLabels[activeLocale]}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onKeyDown={(event) => {
          if (["ArrowDown", "ArrowUp"].includes(event.key)) {
            event.preventDefault();
            setOpen(true);
          }
        }}
        disabled={pending}
        onClick={() => setOpen((current) => !current)}
        className={`relative inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-current/15 bg-current/[0.035] transition hover:-translate-y-0.5 hover:bg-current/[0.07] focus-visible:ring-2 focus-visible:ring-[#6d0101] focus-visible:outline-none disabled:opacity-55 ${compact ? "min-w-16 px-3" : "min-w-32 px-3"}`}
      >
        <Languages aria-hidden="true" className="size-4 shrink-0" />
        {compact ? (
          <span className="text-xs font-semibold uppercase">
            {activeLocale}
          </span>
        ) : (
          <span className="font-medium">{localeLabels[activeLocale]}</span>
        )}
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          onKeyDown={(event) => {
            const buttons = Array.from(
              event.currentTarget.querySelectorAll<HTMLButtonElement>(
                '[role="menuitemradio"]',
              ),
            );
            const index = buttons.indexOf(
              document.activeElement as HTMLButtonElement,
            );
            let next: number;
            if (["ArrowRight", "ArrowDown"].includes(event.key))
              next = (index + 1) % buttons.length;
            else if (["ArrowLeft", "ArrowUp"].includes(event.key))
              next = (index - 1 + buttons.length) % buttons.length;
            else if (event.key === "Home") next = 0;
            else if (event.key === "End") next = buttons.length - 1;
            else return;
            event.preventDefault();
            buttons[next]?.focus();
          }}
          aria-label={t("label")}
          className={`absolute z-[80] flex w-max gap-1 rounded-xl border border-[#0e2d30]/12 bg-[#f3eee2] p-1.5 text-[#0e2d30] shadow-[0_18px_50px_rgba(5,3,6,0.2)] ${direction === "up" ? "bottom-[calc(100%+0.55rem)]" : "top-[calc(100%+0.55rem)]"} ${(align ?? (direction === "up" ? "start" : "end")) === "end" ? "right-0" : "left-0"}`}
        >
          {locales.map((option) => (
            <button
              key={option}
              type="button"
              role="menuitemradio"
              aria-checked={option === activeLocale}
              aria-label={localeLabels[option]}
              disabled={pending}
              onClick={() => selectLocale(option)}
              tabIndex={option === activeLocale ? 0 : -1}
              lang={option}
              className={`min-h-11 min-w-11 rounded-lg px-2 text-xs font-semibold uppercase transition focus-visible:ring-2 focus-visible:ring-[#6d0101] focus-visible:outline-none ${
                option === activeLocale
                  ? "bg-[#0e2d30] text-[#f3eee2]"
                  : "text-[#0e2d30]/62 hover:bg-[#0e2d30]/8 hover:text-[#0e2d30]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
