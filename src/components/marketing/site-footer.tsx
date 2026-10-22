"use client";
import { AnalyticsSettingsButton } from "@/components/analytics/analytics-provider";
import Link from "@/components/i18n/public-link";
import { useLocale, useTranslations } from "next-intl";
import { CapcarWordmark } from "@/components/brand/capcar-wordmark";
import { LanguageSelector } from "@/components/i18n/language-selector";
import { journalPath, resolveJournalLocale } from "@/features/journal/routes";
import { journalUI } from "@/features/journal/ui";
import { HomepageLink } from "./homepage-link";
import { featureDiscoveryCopy } from "@/features/marketing/feature-discovery-copy";
import { homepageCopy } from "@/features/marketing/homepage-copy";
import styles from "./homepage.module.css";

export function SiteFooter() {
  const journalLocale = resolveJournalLocale(useLocale());
  const journal = journalUI[journalLocale];
  const features = featureDiscoveryCopy[journalLocale];
  const t = useTranslations("Footer");
  const l = useTranslations("Launch");
  const groups = [
    {
      title: t("explore"),
      links: [
        [features.plannerLabel, "/project-car-planner"],
        [features.maintenanceLabel, "/car-maintenance-tracker"],
        [t("parts"), "/connected-parts"],
        [t("conceptStudio"), "/studio"],
        [t("soundStudio"), "/sound-studio"],
        [t("movieCars"), "/movie-cars"],
        [t("roadbook"), "/roadbook"],
        [t("aiPlanner"), "/ai"],
        [t("marketplace"), "/marketplace"],
      ],
    },
    {
      title: "CapCar",
      links: [
        [
          l("nav.how"),
          journalLocale === "en" ? "/platform" : `/${journalLocale}/platform`,
        ],
        [l("nav.projects"), "/#projects"],
        [t("roadmap"), "/roadmap"],
        [journal.label, journalPath(journalLocale)],
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
    <footer className="capcar-editorial-grid bg-background text-foreground border-t border-white/8 px-5 py-14 sm:px-8 sm:py-16">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="col-span-2 md:col-span-1">
          <Link
            href="/"
            aria-label={t("home")}
            className="inline-block rounded focus-visible:outline-2"
          >
            <CapcarWordmark glow={false} />
          </Link>
          <p className="text-muted-foreground mt-4 max-w-xs text-sm leading-7">
            {t("tagline")}
          </p>
          <HomepageLink
            href="/garage/new"
            placement="footer"
            className={`${styles.primary} mt-5`}
          >
            {homepageCopy[journalLocale].create} →
          </HomepageLink>
        </div>
        {groups.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="text-primary mb-3 text-xs font-semibold tracking-widest uppercase">
              {group.title}
            </h2>
            <ul>
              {group.links.map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-muted-foreground hover:text-foreground inline-flex min-h-11 items-center rounded text-sm transition hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
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
        <p className="text-muted-foreground max-w-2xl text-xs leading-6">
          {t("safety")}
        </p>
        <AnalyticsSettingsButton />
        <LanguageSelector compact />
      </div>
    </footer>
  );
}
