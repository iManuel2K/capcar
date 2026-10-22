"use client";
import { useTranslations } from "next-intl";
export function SkipToContent() {
  const t = useTranslations("Hardening.Accessibility");
  return (
    <a
      href="#main-content"
      className="bg-card text-foreground fixed top-3 left-3 z-[200] -translate-y-24 rounded-xl px-5 py-3 focus:translate-y-0 focus:outline-2 focus:outline-offset-4"
      onClick={(event) => {
        const main = document.querySelector("main");
        if (!main) return;
        event.preventDefault();
        main.setAttribute("tabindex", "-1");
        main.focus();
        main.scrollIntoView({ block: "start", behavior: "instant" });
      }}
    >
      {t("skip")}
    </a>
  );
}
