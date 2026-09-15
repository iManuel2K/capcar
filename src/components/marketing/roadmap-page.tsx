import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Circle,
  Gauge,
  Layers3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { CapcarWordmark } from "@/components/brand/capcar-wordmark";
import { MarketingHeader } from "@/components/marketing/marketing-header";

const stages = [
  {
    key: "foundation",
    number: "01",
    tone: "#6d0101",
    surface: "bg-[#f2eee3]",
    icon: Layers3,
    items: [
      "garage",
      "maintenance",
      "planning",
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
    tone: "#0e2d30",
    surface: "bg-[#d9ddd2]",
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
    tone: "#92644d",
    surface: "bg-[#eaded0]",
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
    ],
  },
  {
    key: "beyond",
    number: "04",
    tone: "#0e2d30",
    surface: "bg-[#ccd5cc]",
    icon: Sparkles,
    items: ["events", "testMap", "ai", "twowheels", "more"],
  },
] as const;

export function RoadmapPage() {
  const t = useTranslations("Roadmap");
  const totalMilestones = stages.reduce(
    (total, stage) => total + stage.items.length,
    0,
  );

  return (
    <div className="min-h-dvh bg-[#e8e6d7] text-[#0e2d30]">
      <MarketingHeader />
      <main>
        <section className="px-2 pb-2 sm:px-4 sm:pb-4 lg:px-6 lg:pb-6">
          <div className="relative mx-auto grid min-h-[540px] max-w-[1500px] overflow-hidden rounded-[1.75rem] bg-[#0e2d30] text-[#e8e6d7] sm:min-h-[620px] sm:rounded-[2.5rem] lg:grid-cols-[1.12fr_0.88fr]">
            <div className="flex items-end p-6 sm:p-12 lg:p-16">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold tracking-[0.22em] text-[#bf8269] uppercase">
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
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#e8e6d7] px-5 text-sm font-semibold text-[#0e2d30] transition hover:-translate-y-0.5"
                  >
                    {t("build")} <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/18 px-5 text-sm font-medium text-white/78 transition hover:border-white/35 hover:text-white"
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
                    className="group flex min-h-52 flex-col justify-between rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-6 transition hover:-translate-y-1 hover:border-[#bf8269]/55 hover:bg-white/[0.075]"
                  >
                    <div className="flex items-start justify-between">
                      <span className="grid size-10 place-items-center rounded-full bg-[#bf8269]/14 text-[#bf8269]">
                        <Icon className="size-4" />
                      </span>
                      <span className="font-mono text-xs text-white/28">
                        {stage.number}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs tracking-[0.12em] text-[#bf8269] uppercase">
                        {t(`${stage.key}.label`)}
                      </p>
                      <p className="mt-2 text-xl font-medium">
                        {t(`${stage.key}.title`)}
                      </p>
                      <p className="mt-2 text-xs text-white/38">
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
              <p className="text-xs font-semibold tracking-[0.2em] text-[#6d0101] uppercase">
                {t("sequenceEyebrow")}
              </p>
              <h2 className="mt-4 text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
                {t("sequenceTitle")}
              </h2>
              <p className="mt-5 max-w-2xl leading-7 text-[#0e2d30]/58">
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
                className="inline-flex min-h-11 shrink-0 snap-start items-center gap-3 rounded-full border border-[#0e2d30]/14 bg-white/20 px-4 text-sm transition hover:border-[#6d0101]/30 hover:bg-white/40"
              >
                <span className="font-mono text-[10px] text-[#6d0101]">
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
                className={`${stage.surface} scroll-mt-24 overflow-hidden rounded-[1.75rem] border border-[#0e2d30]/10 sm:rounded-[2.25rem]`}
              >
                <div className="grid lg:grid-cols-[0.38fr_0.62fr]">
                  <header className="flex flex-col justify-between border-b border-[#0e2d30]/10 p-6 sm:p-9 lg:min-h-[440px] lg:border-r lg:border-b-0">
                    <div>
                      <div className="flex items-center justify-between gap-4">
                        <span
                          className="grid size-12 place-items-center rounded-full text-white"
                          style={{ backgroundColor: stage.tone }}
                        >
                          <Icon className="size-5" />
                        </span>
                        <span className="font-mono text-sm text-[#0e2d30]/25">
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
                      <p className="mt-5 max-w-md text-sm leading-7 text-[#0e2d30]/58">
                        {t(`${stage.key}.description`)}
                      </p>
                    </div>
                    <p className="mt-10 text-xs font-medium text-[#0e2d30]/42">
                      {t("milestoneCount", { count: stage.items.length })}
                    </p>
                  </header>

                  <ol className="grid sm:grid-cols-2">
                    {stage.items.map((item, itemIndex) => {
                      return (
                        <li
                          key={item}
                          className="group min-h-48 border-b border-[#0e2d30]/10 p-6 transition last:border-b-0 hover:bg-white/25 sm:border-r sm:p-7 sm:nth-[2n]:border-r-0 sm:nth-last-[-n+2]:border-b-0"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <span
                              className="font-mono text-[10px] font-semibold"
                              style={{ color: stage.tone }}
                            >
                              {String(milestoneOffset + itemIndex + 1).padStart(
                                2,
                                "0",
                              )}
                            </span>
                            <span
                              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-semibold tracking-[0.08em] uppercase"
                              style={{
                                borderColor: `${stage.tone}26`,
                                color: stage.tone,
                              }}
                            >
                              {stage.key === "foundation" ? (
                                <Check className="size-2.5" />
                              ) : (
                                <Circle className="size-2.5 fill-current" />
                              )}
                              {t(`${stage.key}.itemStatus`)}
                            </span>
                          </div>
                          <h4 className="mt-7 text-lg font-medium tracking-[-0.025em]">
                            {t(`${stage.key}.${item}.title`)}
                          </h4>
                          <p className="mt-3 text-sm leading-6 text-[#0e2d30]/54">
                            {t(`${stage.key}.${item}.description`)}
                          </p>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </article>
            );
          })}
        </section>

        <section className="bg-[#0e2d30] px-5 py-20 text-[#e8e6d7] sm:px-8 sm:py-28">
          <div className="mx-auto grid max-w-[1100px] gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <p className="text-xs font-semibold tracking-[0.2em] text-[#bf8269] uppercase">
              {t("decisionEyebrow")}
            </p>
            <div>
              <h2 className="text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
                {t("decisionTitle")}
              </h2>
              <p className="mt-5 max-w-2xl leading-7 text-white/52">
                {t("decisionDescription")}
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1100px] px-5 py-20 sm:px-8 sm:py-28">
          <div className="rounded-[1.75rem] border border-[#0e2d30]/12 bg-[#88988d] p-7 sm:rounded-[2.25rem] sm:p-12">
            <p className="text-xs font-semibold tracking-[0.2em] text-[#6d0101] uppercase">
              {t("feedbackEyebrow")}
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
              {t("feedbackTitle")}
            </h2>
            <p className="mt-5 max-w-2xl leading-7 text-[#0e2d30]/64">
              {t("feedbackDescription")}
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#6d0101] px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            >
              {t("openGarage")} <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-[1500px] flex-col justify-between gap-6 border-t border-[#0e2d30]/10 px-5 py-10 sm:flex-row sm:items-center sm:px-8">
        <CapcarWordmark glow={false} />
        <p className="text-xs text-[#0e2d30]/48">{t("footerNote")}</p>
        <Link href="/" className="text-sm font-medium">
          {t("back")} →
        </Link>
      </footer>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-28 rounded-2xl border border-[#0e2d30]/12 bg-white/20 px-4 py-3">
      <p className="text-2xl font-medium tracking-[-0.04em]">{value}</p>
      <p className="mt-1 text-[10px] font-semibold tracking-[0.1em] text-[#0e2d30]/45 uppercase">
        {label}
      </p>
    </div>
  );
}
