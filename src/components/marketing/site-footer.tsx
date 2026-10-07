"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { CapcarWordmark } from "@/components/brand/capcar-wordmark";
import { LanguageSelector } from "@/components/i18n/language-selector";

export function SiteFooter() {
  const t = useTranslations("Footer");
  const l = useTranslations("Launch");
  const groups = [
    {
      title: t("explore"),
      links: [
        [t("parts"), "/parts-search"],
        [t("conceptStudio"), "/studio"],
        [t("soundStudio"), "/sound-studio"],
        [t("roadbook"), "/roadbook"],
        [t("aiPlanner"), "/ai"],
        [t("marketplace"), "/marketplace"],
      ],
    },
    {
      title: "CapCar",
      links: [
        [l("nav.how"), "/#platform"],
        [l("nav.projects"), "/#projects"],
        [t("roadmap"), "/roadmap"],
        [t("faq"), "/#faq"],
      ],
    },
    {
      title: l("nav.legal"),
      links: [
        [t("privacy"), "/privacy"],
        [t("terms"), "/terms"],
        [t("imprint"), "/imprint"],
      ],
    },
  ];
  return (
    <footer className="capcar-editorial-grid border-t border-white/8 bg-[#0b2326] px-5 py-14 text-[#e8e6d7] sm:px-8 sm:py-16">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="col-span-2 md:col-span-1">
          <Link
            href="/"
            aria-label={t("home")}
            className="inline-block rounded focus-visible:outline-2"
          >
            <CapcarWordmark glow={false} />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-7 text-[#e8e6d7]/55">
            {t("tagline")}
          </p>
          <Link
            href="/register"
            className="mt-5 inline-flex min-h-11 items-center rounded-full border border-[#e8e6d7]/15 px-4 text-sm font-semibold transition hover:border-[#bf8269]/60 hover:bg-white/5 focus-visible:outline-2"
          >
            {l("start")} →
          </Link>
        </div>
        {groups.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="mb-3 text-xs font-semibold tracking-widest text-[#bf8269] uppercase">
              {group.title}
            </h2>
            <ul>
              {group.links.map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="inline-flex min-h-11 items-center rounded text-sm text-[#e8e6d7]/55 transition hover:text-[#e8e6d7] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="mx-auto mt-10 flex max-w-[1440px] flex-wrap items-center justify-between gap-5 border-t border-white/10 pt-6">
        <p className="max-w-2xl text-xs leading-6 text-[#e8e6d7]/45">
          {t("safety")}
        </p>
        <LanguageSelector compact />
      </div>
    </footer>
  );
}
