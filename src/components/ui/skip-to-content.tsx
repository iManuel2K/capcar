"use client";
import { useTranslations } from "next-intl";
export function SkipToContent() {
  const t = useTranslations("Hardening.Accessibility");
  return (
    <a
      href="#main-content"
      className="fixed top-3 left-3 z-[200] -translate-y-24 rounded-xl bg-[#0e2d30] px-5 py-3 text-white focus:translate-y-0 focus:outline-2 focus:outline-offset-4"
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
