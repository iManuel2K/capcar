import { ArrowRight, BadgeCheck } from "lucide-react";
import Link from "@/components/i18n/public-link";
import type { AppLocale } from "@/i18n/config";
import { pricingCopy } from "@/features/marketing/pricing-copy";
import { SiteFooter } from "./site-footer";
import shared from "./homepage.module.css";
import styles from "./pricing-section.module.css";

// CapCar implementation of the public 21st Pricing Section reference's card layout.
// See design-system/capcar/pages/pricing.md for source/access details.
export function PricingSection({ locale }: { locale: AppLocale }) {
  const c = pricingCopy[locale];
  return (
    <div className={shared.page}>
      <main id="main-content" className={styles.main}>
        <section aria-labelledby="pricing-title" className={styles.section}>
          <header className={styles.heading}>
            <h1 id="pricing-title" className={shared.pageTitle}>
              {c.title}
            </h1>
            <p>{c.description}</p>
          </header>
          <article aria-labelledby="pricing-plan" className={styles.plan}>
            <h2 id="pricing-plan">CapCar</h2>
            <p className={styles.price}>{c.price}</p>
            <p className={styles.description}>{c.planDescription}</p>
            <ul className={styles.features}>
              {c.features.map((feature) => (
                <li key={feature}>
                  <BadgeCheck size={20} aria-hidden="true" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/garage/new"
              className={`${shared.primary} ${styles.action}`}
            >
              {c.action}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </article>
          <p className={styles.note}>{c.note}</p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
