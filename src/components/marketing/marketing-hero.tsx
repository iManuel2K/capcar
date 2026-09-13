import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { BuildTransformation } from "./build-transformation";
import styles from "./launch.module.css";

export function MarketingHero() {
  const t = useTranslations("Launch");
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.heroGrid}>
        <div>
          <p className={styles.eyebrow}>{t("hero.eyebrow")}</p>
          <h1 id="hero-title" className={`${styles.heroTitle} mt-5`}>
            {t("hero.title")}{" "}
            <span className="block text-[#d6aa92]">{t("hero.accent")}</span>
          </h1>
          <p className={`${styles.body} mt-6`}>{t("hero.description")}</p>
          <div className="mt-7 flex flex-wrap gap-3" data-testid="hero-actions">
            <Link href="/register" className={styles.primary}>
              {t("start")} <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <a href="#live-demo" className={styles.secondary}>
              {t("explore")}
            </a>
          </div>
          <p className="mt-5 text-xs leading-5 text-[#bfcac5]">
            {t("hero.note")}
          </p>
        </div>
        <BuildTransformation eager />
      </div>
    </section>
  );
}
