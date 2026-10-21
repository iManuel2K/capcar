import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  Check,
  ClipboardCheck,
  History,
  IdCard,
  Lightbulb,
  ScanLine,
  ShoppingBag,
  Volume2,
  WandSparkles,
} from "lucide-react";
import Link from "next/link";
import { platformCopy } from "@/features/marketing/platform-copy";
import { homepageCopy } from "@/features/marketing/homepage-copy";
import { journalArticlePath } from "@/features/journal/routes";
import type { AppLocale } from "@/i18n/config";
import { DeferredProductDashboardPreview } from "./deferred-marketing-demos";
import { UseCaseExplorer } from "./use-case-explorer";
import { MarketingHero } from "./marketing-hero";
import { HomepageLink } from "./homepage-link";
import { MarketingFaq } from "./marketing-faq";
import { SiteFooter } from "./site-footer";
import styles from "./homepage.module.css";

export function MarketingLanding({ locale = "en" }: { locale?: AppLocale }) {
  const c = homepageCopy[locale] ?? homepageCopy.en;
  const p = platformCopy[locale];
  const guide = journalArticlePath("bmw-wochenendprojekt-planen", locale);
  const euro = (value: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);
  const steps = [
    { title: c.idea, text: c.ideaText, icon: Lightbulb },
    { title: c.parts, text: c.partsText, icon: ShoppingBag },
    { title: c.guide, text: c.guideText, icon: BookOpen },
    { title: c.record, text: c.recordText, icon: ClipboardCheck },
    { title: c.history, text: c.historyText, icon: History },
  ];
  const tools = [
    {
      title: c.visual,
      text: c.visualText,
      icon: WandSparkles,
      href: "/studio",
      preview: true,
    },
    { title: c.sound, text: c.soundText, icon: Volume2, href: "/sound-studio" },
    {
      title: c.diagnostics,
      text: c.diagnosticsText,
      icon: ScanLine,
      href: "/garage",
      preview: true,
    },
    { title: c.passport, text: c.passportText, icon: IdCard, href: "/garage" },
  ];
  return (
    <div className={styles.page}>
      <main id="main-content">
        <MarketingHero locale={locale} />
        <aside className={styles.platformBridge} aria-label={p.label}>
          <div>
            <strong>{p.bridge}</strong>
            <p>{p.bridgeText}</p>
          </div>
          <Link
            href={locale === "en" ? "/platform" : `/${locale}/platform`}
            className={styles.secondary}
          >
            {p.label}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </aside>
        <section
          id="platform"
          className={styles.section}
          aria-labelledby="use-cases-title"
        >
          <h2 id="use-cases-title" className={styles.title}>
            {c.usesTitle}
          </h2>
          <UseCaseExplorer
            label={c.usesTitle}
            titles={[c.maintain, c.build, c.drives]}
          >
            <article className={styles.use}>
              <div>
                <h3>{c.maintain}</h3>
                <p>{c.maintainText}</p>
                <p className={styles.fine}>{c.maintainAccess}</p>
                <div className={styles.actions}>
                  <HomepageLink
                    href="/garage/new?goal=maintain"
                    useCase="maintain"
                    className={styles.secondary}
                  >
                    {c.maintainAction}
                    <ArrowRight size={16} aria-hidden="true" />
                  </HomepageLink>
                </div>
                <HomepageLink
                  href={guide}
                  useCase="maintain"
                  className={styles.secondary}
                >
                  {c.guides}
                  <ArrowRight size={16} aria-hidden="true" />
                </HomepageLink>
              </div>
              <div className={styles.mini} aria-label={c.maintain}>
                <p>{c.sample} / BMW 318i</p>
                <div className={styles.miniRow}>
                  <strong>{c.task}</strong>
                  <span>{c.due}</span>
                </div>
                <div className={styles.miniRow}>
                  <strong className="flex items-center gap-2">
                    <Check size={16} aria-hidden="true" />
                    {c.completedTask}
                  </strong>
                  <span>{c.done}</span>
                </div>
                <div className={styles.miniRow}>
                  <BookOpen size={20} aria-hidden="true" />
                  <HomepageLink
                    href={guide}
                    useCase="maintain"
                    className={styles.secondary}
                  >
                    {c.guideName}
                  </HomepageLink>
                </div>
              </div>
            </article>
            <article className={styles.use}>
              <div>
                <h3>{c.build}</h3>
                <p>{c.buildText}</p>
                <p className={styles.fine}>{c.buildAccess}</p>
                <div className={styles.actions}>
                  <HomepageLink
                    href="/garage/new?goal=modify"
                    useCase="modify"
                    className={styles.secondary}
                  >
                    {c.buildAction}
                    <ArrowRight size={16} aria-hidden="true" />
                  </HomepageLink>
                </div>
              </div>
              <div className={styles.mini} aria-label={c.build}>
                <p>{c.sample} / BMW 318i</p>
                <strong>{c.project}</strong>
                <div className={styles.bar} aria-hidden="true">
                  <span />
                </div>
                <span className="text-xs">{c.progress}</span>
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
                <p className={styles.fine}>{c.progressNote}</p>
              </div>
            </article>
            <article className={styles.use}>
              <div>
                <h3>{c.drives}</h3>
                <p>{c.drivesText}</p>
                <p className={styles.fine}>{c.drivesAccess}</p>
                <div className={styles.actions}>
                  <HomepageLink
                    href="/roadbook"
                    useCase="drives"
                    className={styles.secondary}
                  >
                    {c.drivesAction}
                    <ArrowRight size={16} aria-hidden="true" />
                  </HomepageLink>
                </div>
                <HomepageLink
                  href="/ai"
                  useCase="drives"
                  className={styles.secondary}
                >
                  {c.trip}
                  <ArrowRight size={16} aria-hidden="true" />
                </HomepageLink>
              </div>
              <figure className={`${styles.mini} ${styles.drive}`}>
                <div className={styles.drivePhoto}>
                  <Image
                    src="/previews/roadbook.png"
                    alt={c.drivePhoto}
                    fill
                    sizes="(min-width: 1320px) 590px, (min-width: 761px) 45vw, 100vw"
                    quality={65}
                  />
                </div>
                <figcaption className={styles.driveCaption}>
                  <p className={styles.fine}>
                    ©{" "}
                    <a href="https://www.openstreetmap.org/copyright">
                      OpenStreetMap
                    </a>{" "}
                    · <a href="https://openfreemap.org/">OpenFreeMap</a> ·{" "}
                    <a href="https://openmaptiles.org/">OpenMapTiles</a>
                  </p>
                  <p className={styles.fine}>{c.sample}</p>
                  <strong>{c.route}</strong>
                  <p>{c.routeDetail}</p>
                  <HomepageLink
                    href={journalArticlePath(
                      "ruesselsheim-rheingau-tagesausflug",
                      locale,
                    )}
                    useCase="drives"
                    className={styles.secondary}
                  >
                    {c.open}
                    <ArrowRight size={16} aria-hidden="true" />
                  </HomepageLink>
                </figcaption>
              </figure>
            </article>
          </UseCaseExplorer>
        </section>
        <section
          id="projects"
          className={styles.story}
          aria-labelledby="project-story-title"
        >
          <div className={styles.section}>
            <p className={styles.eyebrow}>{c.storyEyebrow}</p>
            <h2 id="project-story-title" className={styles.title}>
              {c.storyTitle}
            </h2>
            <p className={styles.intro}>{c.storyText}</p>
            <ol className={styles.steps}>
              {steps.map(({ title, text, icon: Icon }, index) => (
                <li key={title} className={styles.step}>
                  <span className={styles.number}>0{index + 1}</span>
                  <Icon aria-hidden="true" />
                  <h3>{title}</h3>
                  <p>{text}</p>
                  {index === 2 && (
                    <HomepageLink href={guide} className={styles.secondary}>
                      {c.guides}
                      <ArrowRight size={14} aria-hidden="true" />
                    </HomepageLink>
                  )}
                </li>
              ))}
            </ol>
            <p className={styles.fine}>{c.ownerRecorded}</p>
          </div>
        </section>
        <DeferredProductDashboardPreview
          eyebrow={c.sample}
          title={c.demoTitle}
          description={c.demoText}
          action={c.create}
        />
        <section
          className={styles.tools}
          aria-labelledby="supporting-tools-title"
        >
          <div className={styles.section}>
            <h2 id="supporting-tools-title" className={styles.title}>
              {c.toolsTitle}
            </h2>
            <div className={styles.toolList}>
              {tools.map(({ title, text, icon: Icon, href, preview }) => (
                <article key={title} className={styles.tool}>
                  <Icon aria-hidden="true" />
                  <h3>
                    {title}
                    {preview && (
                      <span className="mt-1 block text-xs font-normal text-[#84553f]">
                        {c.preview}
                      </span>
                    )}
                  </h3>
                  <p>{text}</p>
                  <HomepageLink href={href} aria-label={`${c.open}: ${title}`}>
                    {c.open}
                    <ArrowRight size={14} aria-hidden="true" />
                  </HomepageLink>
                </article>
              ))}
            </div>
          </div>
        </section>
        <MarketingFaq />
        <section className={styles.final}>
          <div className={styles.section}>
            <h2 className={styles.title}>{c.finalTitle}</h2>
            <p>{c.finalText}</p>
            <div className={styles.actions}>
              <HomepageLink
                href="/garage/new"
                placement="final"
                className={styles.primary}
              >
                {c.create}
                <ArrowRight size={16} aria-hidden="true" />
              </HomepageLink>
            </div>
            <p className="text-xs">{c.account}</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
