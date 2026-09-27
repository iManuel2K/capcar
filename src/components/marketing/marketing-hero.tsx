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
          <div className="flex flex-wrap items-center gap-3">
            <p className={styles.eyebrow}>{t("hero.eyebrow")}</p>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#d6aa92]/35 bg-[#d6aa92]/8 px-3 py-1.5 text-[10px] font-semibold tracking-[0.13em] text-[#f0c0a8] uppercase">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-[#6bd2ae] shadow-[0_0_0_4px_rgba(107,210,174,.12)]"
              />
              {t("hero.status")}
            </span>
          </div>
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
          <div
            className="mt-7 max-w-lg overflow-hidden rounded-2xl border border-white/14 bg-black/10"
            aria-label={t("hero.aiLabel")}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <p className="text-[10px] font-semibold tracking-[0.17em] text-[#d6aa92] uppercase">
                {t("hero.aiLabel")}
              </p>
              <span className="font-mono text-[9px] tracking-[0.14em] text-white/35 uppercase">
                {t("hero.aiProtocol")}
              </span>
            </div>
            <div className="grid gap-3 px-4 py-4 sm:grid-cols-[auto_1fr] sm:items-center">
              <div
                className="flex items-center gap-2"
                aria-label="ChatGPT and Claude"
              >
                <span className="rounded-md border border-white/20 bg-white/5 px-2.5 py-1.5 font-mono text-[10px] font-semibold text-[#f5f0e8]">
                  ChatGPT
                </span>
                <span aria-hidden="true" className="h-px w-3 bg-[#d6aa92]/60" />
                <span className="rounded-md border border-white/20 bg-white/5 px-2.5 py-1.5 font-mono text-[10px] font-semibold text-[#f5f0e8]">
                  Claude
                </span>
              </div>
              <p className="text-xs leading-5 text-[#bfcac5]">
                {t("hero.aiSupport")}
              </p>
            </div>
          </div>
        </div>
        <BuildTransformation eager />
      </div>
    </section>
  );
}
