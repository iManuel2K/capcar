import Image from "next/image";
import { ArrowRight, Check, Layers3, MapPinned, Wrench } from "lucide-react";
import { homepageCopy } from "@/features/marketing/homepage-copy";
import type { AppLocale } from "@/i18n/config";
import { HomepageLink } from "./homepage-link";
import styles from "./homepage.module.css";

export function MarketingHero({ locale = "en" }: { locale?: AppLocale }) {
  const c = homepageCopy[locale] ?? homepageCopy.en;
  const euro = (value: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);
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
        <figure className={styles.preview} aria-label={c.sample}>
          <figcaption className={styles.previewTop}>
            <span>CAPCAR / BMW 318i</span>
            <span>{c.sample}</span>
          </figcaption>
          <div className={styles.car}>
            <Image
              src="/garage/cutouts/bmw-318i.webp"
              alt="BMW 318i · E90 · 2011"
              fill
              sizes="(min-width: 1440px) 650px, (min-width: 761px) 48vw, 100vw"
              quality={75}
              preload
            />
          </div>
          <div className={styles.carTitle}>
            <p>2011 · E90</p>
            <h2>BMW 318i</h2>
          </div>
          <div className={styles.dashboard}>
            <div className={styles.dashboardHead}>
              <strong>{c.project}</strong>
              <span className={styles.badge}>{c.active}</span>
            </div>
            <dl className={styles.stats}>
              <div>
                <dt>{c.budget}</dt>
                <dd>{euro(300)}</dd>
              </div>
              <div>
                <dt>{c.planned}</dt>
                <dd>{euro(30)}</dd>
              </div>
              <div>
                <dt>{c.actual}</dt>
                <dd>{euro(28)}</dd>
              </div>
            </dl>
            <div className={styles.next}>
              <span>
                <Wrench size={15} aria-hidden="true" />
              </span>
              <div>
                <p>{c.next}</p>
                <strong>{c.task}</strong>
              </div>
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-[#b7cbc2]">
              <Check size={13} aria-hidden="true" />
              {c.progress}
            </p>
          </div>
        </figure>
      </div>
    </section>
  );
}
