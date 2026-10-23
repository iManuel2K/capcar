import { BuildTransformation } from "./build-transformation";
import { ArrowRight } from "lucide-react";
import { homepageCopy } from "@/features/marketing/homepage-copy";
import type { AppLocale } from "@/i18n/config";
import { HomepageLink } from "./homepage-link";
import styles from "./homepage.module.css";

export function MarketingHero({ locale = "en" }: { locale?: AppLocale }) {
  const c = homepageCopy[locale] ?? homepageCopy.en;
  return (
    <section className={styles.hero} aria-labelledby="homepage-title">
      <div className={`${styles.heroInner} ${styles.focusedHero}`}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{c.eyebrow}</p>
          <h1 id="homepage-title" className={styles.headline}>
            {c.headline}
          </h1>
          <p className={styles.description}>{c.description}</p>
        </div>
        <div className={styles.heroVisual}>
          <BuildTransformation eager autoPlay compact />
        </div>
        <div className={styles.heroCta}>
          <div className={styles.actions} data-testid="hero-actions">
            <HomepageLink
              href="/garage/new"
              placement="hero"
              className={styles.primary}
            >
              {c.create}
              <ArrowRight size={18} aria-hidden="true" />
            </HomepageLink>
            <HomepageLink href="#live-demo" demo className={styles.secondary}>
              {c.explore}
              <ArrowRight size={16} aria-hidden="true" />
            </HomepageLink>
          </div>
        </div>
      </div>
    </section>
  );
}
