import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  ClipboardList,
  FileText,
  Search,
  ScanLine,
  Check,
  CircleHelp,
  UserRound,
  Calculator,
} from "lucide-react";
import { MarketingHeader } from "./marketing-header";
import { MarketingHero } from "./marketing-hero";
import { ProductDashboardPreview } from "./product-dashboard-preview";
import { MarketingFaq } from "./marketing-faq";
import { SiteFooter } from "./site-footer";
import styles from "./launch.module.css";

const journey = [
  "imagine",
  "plan",
  "find",
  "visualize",
  "build",
  "remember",
] as const;
const features = [
  { key: "plan", icon: ClipboardList, href: "#demo-plan" },
  { key: "parts", icon: Search, href: "#demo-parts" },
  { key: "visual", icon: ScanLine, href: "#demo-visual" },
  { key: "history", icon: FileText, href: "#demo-history" },
] as const;

export function MarketingLanding() {
  const t = useTranslations("Launch");
  const home = useTranslations("Home");
  return (
    <div className="min-h-dvh overflow-x-clip bg-[#e8e6d7] text-[#0e2d30]">
      <a
        href="#main-content"
        className="fixed top-3 left-3 z-[100] -translate-y-24 rounded-full bg-[#0e2d30] px-5 py-3 text-sm font-semibold text-white focus:translate-y-0"
      >
        {home("skip")}
      </a>
      <MarketingHeader />
      <main id="main-content" tabIndex={-1}>
        <MarketingHero />
        <ProductDashboardPreview />
        <section
          className="bg-[#0b2326] text-[#e8e6d7]"
          aria-labelledby="problem-title"
        >
          <div
            className={`${styles.section} grid gap-7 lg:grid-cols-[1.1fr_1fr] lg:items-center`}
          >
            <h2 id="problem-title" className={styles.title}>
              {t("problem.title")}
            </h2>
            <p className={styles.body}>{t("problem.body")}</p>
          </div>
          <div
            id="platform"
            className={`${styles.section} scroll-mt-8 border-t border-white/15 pt-10!`}
          >
            <h2 className="max-w-xl text-2xl font-medium tracking-tight sm:text-3xl">
              {t("journey.title")}
            </h2>
            <ol className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-3 xl:grid-cols-6">
              {journey.map((key, index) => (
                <li key={key}>
                  <span className="font-mono text-xs text-[#d6aa92]">
                    0{index + 1}
                  </span>
                  <h3 className="mt-3 text-xl font-medium">
                    {t(`journey.${key}`)}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#bfcac5]">
                    {t(`journey.${key}Text`)}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section className={styles.section} aria-labelledby="features-title">
          <h2 id="features-title" className={`${styles.title} mb-8`}>
            {t("features.title")}
          </h2>
          <div className="grid gap-x-10 lg:grid-cols-2">
            {features.map(({ key, icon: Icon, href }, index) => (
              <article key={key} className="border-t border-[#0e2d30]/20 py-7">
                <div className="flex items-center gap-3 text-[#80533e]">
                  <Icon className="size-5" aria-hidden="true" />
                  <span className="font-mono text-xs">0{index + 1}</span>
                </div>
                <h3 className="mt-4 text-2xl font-medium tracking-tight sm:text-3xl">
                  {t(`features.${key}`)}
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-7 text-[#4b6260]">
                  {t(`features.${key}Text`)}
                </p>
                <a href={href} className={`${styles.link} mt-3`}>
                  {t("features.view")}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
        </section>
        <section
          id="projects"
          className="scroll-mt-8 border-y border-[#0e2d30]/15 bg-[#d8d9cb]"
          aria-labelledby="project-title"
        >
          <div
            className={`${styles.section} grid items-center gap-8 lg:grid-cols-2`}
          >
            <figure>
              <div className="relative aspect-[16/11] overflow-hidden rounded-xl bg-[#0b2326]">
                <Image
                  src="/capcar-hero-bmw-vision.png"
                  alt={t("visual.alt")}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-3 text-xs leading-6 text-[#4b6260]">
                {t("project.caption")}
              </figcaption>
            </figure>
            <div>
              <p className="mb-4 font-mono text-xs tracking-wider text-[#80533e]">
                PROJECT STREETLINE / BMW E90
              </p>
              <h2 id="project-title" className={styles.title}>
                {t("project.title")}
              </h2>
              <p className="mt-5 text-base leading-7 text-[#4b6260]">
                {t("project.body")}
              </p>
              <a href="#demo-plan" className={`${styles.secondary} mt-6`}>
                {t("explore")}
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>
        <section
          id="fitment"
          className={`${styles.section} scroll-mt-8`}
          aria-labelledby="trust-title"
        >
          <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr] lg:items-end">
            <h2 id="trust-title" className={styles.title}>
              {t("trust.title")}
            </h2>
            <p className="max-w-xl text-base leading-7 text-[#4b6260]">
              {t("trust.body")}
            </p>
          </div>
          <div className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {(
              [
                { key: "fact", icon: Check },
                { key: "owner", icon: UserRound },
                { key: "estimate", icon: Calculator },
                { key: "unknown", icon: CircleHelp },
              ] as const
            ).map(({ key, icon: Icon }) => (
              <article key={key} className="border-t border-[#0e2d30]/20 pt-5">
                <h3 className="flex items-center gap-3 font-medium">
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  {t(`trust.${key}`)}
                </h3>
                <p className="mt-2 max-w-lg text-sm leading-7 text-[#4b6260]">
                  {t(`trust.${key}Text`)}
                </p>
              </article>
            ))}
          </div>
          <Link href="/connected-parts" className={`${styles.link} mt-5`}>
            {t("nav.parts")}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </section>
        <section
          className="border-y border-[#0e2d30]/15"
          aria-labelledby="beta-title"
        >
          <div className={`${styles.section} grid gap-6 py-10! lg:grid-cols-2`}>
            <h2
              id="beta-title"
              className="max-w-xl text-3xl font-medium tracking-tight"
            >
              {t("beta.title")}
            </h2>
            <div>
              <p className="text-sm leading-7 text-[#4b6260]">
                {t("beta.body")}
              </p>
              <a
                href="mailto:imanuel.harizi@proton.me?subject=CapCar%20feedback"
                className={`${styles.link} mt-2`}
              >
                {t("beta.feedback")}
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>
        <MarketingFaq />
        <section
          className="bg-[#0b2326] text-[#e8e6d7]"
          aria-labelledby="final-title"
        >
          <div className={styles.section}>
            <p className={styles.eyebrow}>{t("final.tagline")}</p>
            <h2 id="final-title" className={`${styles.title} mt-4 max-w-4xl`}>
              {t("final.title")}
            </h2>
            <p className={`${styles.body} mt-5`}>{t("final.body")}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/register" className={styles.primary}>
                {t("start")}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <a href="#live-demo" className={styles.secondary}>
                {t("explore")}
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
