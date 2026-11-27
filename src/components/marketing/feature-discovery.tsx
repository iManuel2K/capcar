import Link from "@/components/i18n/public-link";
import { ArrowRight } from "lucide-react";
import type { AppLocale } from "@/i18n/config";
import { featureDiscoveryCopy } from "@/features/marketing/feature-discovery-copy";
import {
  findJournalArticle,
  journalArticlePath,
} from "@/features/journal/articles";
import { SiteFooter } from "./site-footer";
import shared from "./homepage.module.css";
import styles from "./feature-discovery.module.css";

export function FeatureDiscovery({
  locale,
  feature,
}: {
  locale: AppLocale;
  feature: "planner" | "maintenance";
}) {
  const c = featureDiscoveryCopy[locale];
  const f = c[feature];
  const planner = feature === "planner";
  const relatedArticles = (
    planner
      ? [
          "umbaukosten-auto-gesamtbudget",
          "werkstattangebote-vergleichen-vorlage",
        ]
      : [
          "wartungseintrag-auto-vorlage",
          "warnleuchte-fuer-werkstatt-dokumentieren",
        ]
  ).flatMap((slug) => {
    const article = findJournalArticle(slug, locale);
    return article ? [article] : [];
  });
  return (
    <div className={shared.page}>
      <main id="main-content">
        <section className={styles.hero} aria-labelledby="feature-title">
          <div>
            <p className={shared.eyebrow}>
              CapCar / {planner ? c.plannerLabel : c.maintenanceLabel}
            </p>
            <h1 id="feature-title" className={shared.pageTitle}>
              {f.title}
            </h1>
            <p className={styles.lead}>{f.description}</p>
            <div className={shared.actions}>
              <Link
                href={`/garage/new?goal=${planner ? "modify" : "maintain"}`}
                className={shared.primary}
              >
                {c.create}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link href="#feature-example" className={shared.secondary}>
                {c.demo}
              </Link>
            </div>
            <p className={styles.access}>{c.account}</p>
          </div>
          <section
            id="feature-example"
            className={`${styles.example} scroll-mt-28`}
            aria-labelledby="feature-example-title"
          >
            <h2 id="feature-example-title" className="text-lg font-medium">
              {c.example}
            </h2>
            <dl>
              {f.example.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            {planner && (
              <a
                href={`/journal/templates/capcar-build-sheet-${locale}.csv`}
                download
                className={shared.secondary}
              >
                {c.downloadSheet}
              </a>
            )}
          </section>
        </section>
        <section
          className={shared.section}
          aria-label={planner ? c.plannerLabel : c.maintenanceLabel}
        >
          <ol className={styles.steps}>
            {f.steps.map(([title, text], i) => (
              <li key={title}>
                <span aria-hidden="true">0{i + 1}</span>
                <div>
                  <h2>{title}</h2>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <section className={shared.section} aria-labelledby="feature-next">
          <h2 id="feature-next" className={shared.title}>
            {c.related}
          </h2>
          <div className={styles.links}>
            <Link
              href={journalArticlePath(
                planner
                  ? "build-plan-first-job"
                  : "bmw-diy-wartung-dokumentieren",
                locale,
              )}
            >
              {c.read}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            {relatedArticles.map(({ slug, title }) => (
              <Link key={slug} href={journalArticlePath(slug, locale)}>
                {title}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            ))}
            <Link
              href={
                planner ? "/car-maintenance-tracker" : "/project-car-planner"
              }
            >
              {planner ? c.maintenanceLabel : c.plannerLabel}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
