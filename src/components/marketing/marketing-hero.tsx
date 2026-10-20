import { BuildTransformation } from "./build-transformation";
import { ArrowRight, Layers3, MapPinned, Wrench } from "lucide-react";
import { homepageCopy } from "@/features/marketing/homepage-copy";
import type { AppLocale } from "@/i18n/config";
import { HomepageLink } from "./homepage-link";
import styles from "./homepage.module.css";

export function MarketingHero({ locale = "en" }: { locale?: AppLocale }) {
  const c = homepageCopy[locale] ?? homepageCopy.en;
  return (
    <section className={styles.hero} aria-labelledby="homepage-title">
      <div className={styles.heroInner}>
        <div>
          <p className={styles.eyebrow}>{c.eyebrow}</p>
          <h1 id="homepage-title" className={styles.headline}>
            {c.headline}
          </h1>
          <p className={styles.description}>{c.description}</p>
          <ul className={styles.capabilities} aria-label={c.usesTitle}>
            {[
              { label: c.maintain, icon: Wrench },
              { label: c.build, icon: Layers3 },
              { label: c.drives, icon: MapPinned },
            ].map(({ label, icon: Icon }) => (
              <li key={label}>
                <Icon size={16} aria-hidden="true" />
                <span>{label}</span>
              </li>
            ))}
          </ul>
          <div className={styles.actions} data-testid="hero-actions">
            <HomepageLink
              href="/garage/new"
              placement="hero"
              className={styles.primary}
            >
              {c.create}
              <ArrowRight size={16} aria-hidden="true" />
            </HomepageLink>
            <HomepageLink href="#live-demo" demo className={styles.secondary}>
              {c.explore}
              <ArrowRight size={15} aria-hidden="true" />
            </HomepageLink>
          </div>
          <p className={styles.support}>{c.support}</p>
          <p className={styles.fine}>{c.account}</p>
        </div>
        <div className={styles.preview} aria-label={c.sample}>
          <div className={styles.previewTop}>
            <span>CAPCAR / BMW 318i</span>
            <span>{c.sample}</span>
          </div>
          <div className={styles.conceptPreview}>
            <BuildTransformation eager />
          </div>
        </div>
      </div>
    </section>
  );
}
