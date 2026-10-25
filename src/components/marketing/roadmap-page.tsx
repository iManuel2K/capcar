import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Gauge,
  Layers3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";
import editorial from "./public-editorial.module.css";

import { CapcarWordmark } from "@/components/brand/capcar-wordmark";
import { soundCatalog } from "@/features/visualizer/sound-catalog";
import { carModels } from "@/features/visualizer/car-model-catalog";

const stages = [
  {
    key: "foundation",
    number: "01",
    tone: "var(--primary)",
    surface: "bg-background",
    icon: Layers3,
    items: [
      "garage",
      "maintenance",
      "planning",
      "guidance",
      "passport",
      "wishlist",
      "costs",
      "diagnostics",
      "specialists",
    ],
  },
  {
    key: "hardening",
    number: "02",
    tone: "var(--primary)",
    surface: "bg-background",
    icon: ShieldCheck,
    items: [
      "reliability",
      "publicPassport",
      "marketplaceTrust",
      "specialistOnboarding",
      "accessibility",
      "localization",
    ],
  },
  {
    key: "tangible",
    number: "03",
    tone: "var(--primary)",
    surface: "bg-background",
    icon: Gauge,
    items: [
      "models",
      "movie",
      "sound",
      "obd",
      "verified",
      "connected",
      "marketplace",
      "checkout",
      "roadbook",
      "photoSpots",
      "events",
    ],
  },
  {
    key: "beyond",
    number: "04",
    tone: "var(--primary)",
    surface: "bg-background",
    icon: Sparkles,
    items: ["ai", "tripPlanning", "dashcam", "drivingStyle", "carFlipping", "calendarMail", "twowheels", "more"],
  },
] as const;

export function RoadmapPage() {
  const t = useTranslations("Roadmap");
  const totalMilestones = stages.reduce(
    (total, stage) => total + stage.items.length,
    0,
  );

  return (
    <div className="bg-background text-foreground min-h-dvh">
      <main id="main-content" className={editorial.roadmap}>
        <section className="px-2 pb-2 sm:px-4 sm:pb-4 lg:px-6 lg:pb-6">
          <div className="bg-card text-foreground relative mx-auto grid min-h-[360px] max-w-[1500px] overflow-hidden rounded-[1.75rem] sm:min-h-[460px] sm:rounded-[2.5rem] lg:grid-cols-[1.12fr_0.88fr]">
            <div className="flex items-end p-6 sm:p-12 lg:p-16">
              <div className="max-w-3xl">
                <p className="text-primary text-xs font-semibold tracking-[0.22em] uppercase">
                  {t("eyebrow")}
                </p>
                <h1 className="mt-5 text-5xl leading-[0.88] font-medium tracking-[-0.065em] sm:text-7xl lg:text-8xl">
                  {t("title")}
                </h1>
                <p className="mt-7 max-w-2xl text-base leading-7 text-white/62 sm:text-lg">
                  {t("description")}
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/register"
                    className="bg-background text-foreground inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition hover:-translate-y-0.5"
                  >
                    {t("build")} <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="/"
                    className="hover:text-foreground inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/18 px-5 text-sm font-medium text-white/78 transition hover:border-white/35"
                  >
                    <ArrowLeft className="size-4" /> {t("back")}
                  </Link>
                </div>
              </div>
            </div>

            <div className="hidden border-l border-white/10 p-8 lg:grid lg:grid-cols-2 lg:gap-3">
              {stages.map((stage) => {
                const Icon = stage.icon;
                return (
                  <a
                    key={stage.key}
                    href={`#${stage.key}`}
                    className="group hover:border-primary/55 flex flex-col justify-between gap-5 border-b border-white/15 p-5 transition hover:bg-white/[0.035] motion-reduce:transition-none"
                  >
                    <div className="flex items-start justify-between">
                      <span className="bg-primary/14 text-primary grid size-10 place-items-center rounded-full">
                        <Icon className="size-4" />
                      </span>
                      <span className="text-muted-foreground font-mono text-xs">
                        {stage.number}
                      </span>
                    </div>
                    <div>
                      <p className="text-primary text-xs tracking-[0.12em] uppercase">
                        {t(`${stage.key}.label`)}
                      </p>
                      <p className="mt-2 text-xl font-medium">
                        {t(`${stage.key}.title`)}
                      </p>
                      <p className="text-muted-foreground mt-2 text-xs">
                        {t("milestoneCount", { count: stage.items.length })}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-5 py-18 sm:px-8 sm:py-24">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">
                {t("sequenceEyebrow")}
              </p>
              <h2 className="mt-4 text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
                {t("sequenceTitle")}
              </h2>
              <p className="text-foreground/58 mt-5 max-w-2xl leading-7">
                {t("sequenceDescription")}
              </p>
            </div>
            <div className="flex gap-3">
              <Metric value={String(stages.length)} label={t("stageCount")} />
              <Metric
                value={String(totalMilestones)}
                label={t("milestoneLabel")}
              />
            </div>
          </div>

          <nav
            aria-label={t("stageNavigation")}
            className="mt-10 flex snap-x gap-2 overflow-x-auto pb-2"
          >
            {stages.map((stage) => (
              <a
                key={stage.key}
                href={`#${stage.key}`}
                className="border-foreground/14 hover:border-primary/30 hover:bg-card inline-flex min-h-11 shrink-0 snap-start items-center gap-3 rounded-full border bg-white/20 px-4 text-sm transition"
              >
                <span className="text-primary font-mono text-[10px]">
                  {stage.number}
                </span>
                {t(`${stage.key}.title`)}
              </a>
            ))}
          </nav>
        </section>

        <section className="mx-auto max-w-[1280px] space-y-5 px-3 pb-20 sm:px-6 sm:pb-28">
          {stages.map((stage, stageIndex) => {
            const Icon = stage.icon;
            const milestoneOffset = stages
              .slice(0, stageIndex)
              .reduce((total, previous) => total + previous.items.length, 0);
            return (
              <article
                id={stage.key}
                key={stage.key}
                className={`${stage.surface} border-foreground/10 scroll-mt-24 overflow-hidden rounded-[1.75rem] border sm:rounded-[2.25rem]`}
              >
                <div className="grid lg:grid-cols-[0.38fr_0.62fr]">
                  <header className="border-foreground/10 flex flex-col justify-between border-b p-6 sm:p-9 lg:border-r lg:border-b-0">
                    <div>
                      <div className="flex items-center justify-between gap-4">
                        <span
                          className="text-foreground grid size-12 place-items-center rounded-full"
                          style={{ backgroundColor: stage.tone }}
                        >
                          <Icon className="size-5" />
                        </span>
                        <span className="text-muted-foreground font-mono text-sm">
                          {stage.number}
                        </span>
                      </div>
                      <p
                        className="mt-10 text-xs font-semibold tracking-[0.16em] uppercase"
                        style={{ color: stage.tone }}
                      >
                        {t(`${stage.key}.label`)}
                      </p>
                      <h3 className="mt-3 text-4xl font-medium tracking-[-0.05em] sm:text-5xl">
                        {t(`${stage.key}.title`)}
                      </h3>
                      <p className="text-foreground/58 mt-5 max-w-md text-sm leading-7">
                        {t(`${stage.key}.description`)}
                      </p>
                    </div>
                    <p className="text-muted-foreground mt-10 text-xs font-medium">
                      {t(`${stage.key}.itemStatus`)}
                    </p>
                  </header>
                  <details className="p-2" open={stage.key === "hardening"}>
                    <summary className="border-foreground/15 flex min-h-12 cursor-pointer items-center border-b px-5 text-sm font-semibold underline underline-offset-4">
                      {t("milestoneCount", { count: stage.items.length })}
                    </summary>
                    <ol className="grid sm:grid-cols-2">
                      {stage.items.map((item, itemIndex) => {
                        return (
                          <li
                            key={item}
                            className="border-foreground/10 border-b p-6 last:border-b-0 sm:p-7"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <span
                                className="font-mono text-[10px] font-semibold"
                                style={{ color: stage.tone }}
                              >
                                {String(
                                  milestoneOffset + itemIndex + 1,
                                ).padStart(2, "0")}
                              </span>
                            </div>
                            <h4 className="mt-7 text-lg font-medium tracking-[-0.025em]">
                              {t(`${stage.key}.${item}.title`)}
                            </h4>
                            <p className="text-muted-foreground mt-3 text-sm leading-6">
                              {t(`${stage.key}.${item}.description`, {
                                count: soundCatalog.length,
                                modelCount: carModels.length,
                              })}
                            </p>
                          </li>
                        );
                      })}
                    </ol>
                  </details>
                </div>
              </article>
            );
          })}
        </section>

        <section className="bg-card text-foreground px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto grid max-w-[1100px] gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <p className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">
              {t("decisionEyebrow")}
            </p>
            <div>
              <h2 className="text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
                {t("decisionTitle")}
              </h2>
              <p className="text-muted-foreground mt-5 max-w-2xl leading-7">
                {t("decisionDescription")}
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1100px] px-5 py-20 sm:px-8 sm:py-28">
          <div className="border-foreground/12 bg-secondary rounded-[1.75rem] border p-7 sm:rounded-[2.25rem] sm:p-12">
            <p className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">
              {t("feedbackEyebrow")}
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
              {t("feedbackTitle")}
            </h2>
            <p className="text-foreground/64 mt-5 max-w-2xl leading-7">
              {t("feedbackDescription")}
            </p>
            <Link
              href="/register"
              className="bg-primary text-primary-foreground mt-8 inline-flex min-h-12 items-center gap-2 rounded-full px-5 text-sm font-semibold transition hover:-translate-y-0.5"
            >
              {t("openGarage")} <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-foreground/10 mx-auto flex max-w-[1500px] flex-col justify-between gap-6 border-t px-5 py-10 sm:flex-row sm:items-center sm:px-8">
        <CapcarWordmark glow={false} />
        <p className="text-muted-foreground text-xs">{t("footerNote")}</p>
        <Link href="/" className="text-sm font-medium">
          {t("back")} →
        </Link>
      </footer>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-foreground/12 min-w-28 rounded-2xl border bg-white/20 px-4 py-3">
      <p className="text-2xl font-medium tracking-[-0.04em]">{value}</p>
      <p className="text-muted-foreground mt-1 text-[10px] font-semibold tracking-[0.1em] uppercase">
        {label}
      </p>
    </div>
  );
}
