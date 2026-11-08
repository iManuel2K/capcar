import Link from "next/link";
import { ArrowUpRight, Film, ScanEye, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { pageMetadata } from "@/features/seo/public-metadata";
import styles from "@/components/driving-review/driving-review.module.css";
export async function generateMetadata() {
  const t = await getTranslations("DrivingReview");
  return pageMetadata("/driving-review", t("nav"), t("intro"));
}
export default async function DrivingReviewIntro() {
  const t = await getTranslations("DrivingReview");
  return (
    <main
      id="main-content"
      className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24"
    >
      <div className={styles.page}>
        <p className={styles.eyebrow}>
          {t("eyebrow")} / {t("beta")}
        </p>
        <h1>{t("title")}</h1>
        <p className={styles.lead}>{t("intro")}</p>
        <div className={styles.actions}>
          <Link href="/garage/driving-review" className={styles.primary}>
            {t("open")}
            <ArrowUpRight aria-hidden="true" size={18} />
          </Link>
        </div>
        <p className={styles.note}>{t("free")}</p>
        <section className="my-16 grid gap-10 border-y border-white/15 py-10 md:grid-cols-3">
          {[
            { icon: Film, title: "step1", body: "uploadHelp" },
            { icon: ScanEye, title: "step2", body: "local" },
            { icon: Sparkles, title: "step3", body: "learningHelp" },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title}>
              <Icon className="text-primary mb-5" aria-hidden="true" />
              <h2>{t(title)}</h2>
              <p className={styles.note}>{t(body)}</p>
            </div>
          ))}
        </section>
        <h2>{t("previewTitle")}</h2>
        <p className={styles.lead}>{t("previewBody")}</p>
        <p className={styles.note}>{t("fixedLimit")}</p>
        <p className={styles.safety}>{t("parked")}</p>
      </div>
    </main>
  );
}
