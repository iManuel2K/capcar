import Link from "next/link";
import { ArrowLeft, ArrowRight, Circle } from "lucide-react";
import { useTranslations } from "next-intl";

import { CapcarWordmark } from "@/components/brand/capcar-wordmark";
import { MarketingHeader } from "@/components/marketing/marketing-header";

const columns = [
  {
    key: "foundation",
    tone: "#6d0101",
    items: ["garage", "maintenance", "planning", "passport"],
  },
  {
    key: "tangible",
    tone: "#92644d",
    items: ["models", "movie", "sound", "obd", "connected"],
  },
  {
    key: "beyond",
    tone: "#0e2d30",
    items: ["events", "ai", "twowheels", "more"],
  },
] as const;

export function RoadmapPage() {
  const t = useTranslations("Roadmap");
  return (
    <div className="min-h-dvh bg-[#e8e6d7] text-[#0e2d30]">
      <MarketingHeader />
      <main>
        <section className="px-2 pb-2 sm:px-4 sm:pb-4 lg:px-6 lg:pb-6">
          <div className="relative mx-auto flex min-h-[520px] max-w-[1500px] items-end overflow-hidden rounded-[1.75rem] bg-[radial-gradient(circle_at_83%_10%,rgba(232,230,215,0.22),transparent_27%),linear-gradient(145deg,#92644d_0%,#6d3d35_42%,#0e2d30_100%)] p-6 text-[#e8e6d7] sm:min-h-[610px] sm:rounded-[2.5rem] sm:p-12 lg:p-16">
            <div className="absolute -top-28 -right-20 size-80 rounded-full border border-white/10" />
            <div className="absolute top-24 right-[16%] size-48 rounded-full border border-white/8" />
            <div className="relative max-w-3xl">
              <p className="text-xs font-semibold tracking-[0.22em] text-white/58 uppercase">
                {t("eyebrow")}
              </p>
              <h1 className="mt-5 text-5xl leading-[0.88] font-medium tracking-[-0.065em] sm:text-7xl lg:text-8xl">
                {t("title")}
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-7 text-white/68 sm:text-lg">
                {t("description")}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#e8e6d7] px-5 text-sm font-semibold text-[#0e2d30]"
                >
                  {t("build")} <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/18 px-5 text-sm font-medium text-white/78"
                >
                  <ArrowLeft className="size-4" /> {t("back")}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8 sm:py-28">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.2em] text-[#6d0101] uppercase">
              {t("sequenceEyebrow")}
            </p>
            <h2 className="mt-4 text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
              {t("sequenceTitle")}
            </h2>
            <p className="mt-5 leading-7 text-[#0e2d30]/58">
              {t("sequenceDescription")}
            </p>
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-3 lg:gap-0">
            {columns.map((column, columnIndex) => (
              <article
                key={column.key}
                className="lg:border-l lg:border-[#0e2d30]/12 lg:px-8 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0"
              >
                <div className="flex items-center gap-3">
                  <Circle
                    className="size-3 fill-current"
                    style={{ color: column.tone }}
                  />
                  <span
                    className="rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase"
                    style={{
                      color: column.tone,
                      backgroundColor: `${column.tone}14`,
                    }}
                  >
                    {t(`${column.key}.label`)}
                  </span>
                </div>
                <h3 className="mt-5 text-3xl font-medium tracking-[-0.04em]">
                  {t(`${column.key}.title`)}
                </h3>
                <ol className="mt-8">
                  {column.items.map((item, itemIndex) => (
                    <li
                      key={item}
                      className="grid grid-cols-[28px_1fr] gap-3 border-t border-[#0e2d30]/12 py-6"
                    >
                      <span
                        className="pt-0.5 text-[10px] font-semibold"
                        style={{ color: column.tone }}
                      >
                        {String(columnIndex * 5 + itemIndex + 1).padStart(
                          2,
                          "0",
                        )}
                      </span>
                      <div>
                        <h4 className="font-medium">
                          {t(`${column.key}.${item}.title`)}
                        </h4>
                        <p className="mt-2 text-sm leading-6 text-[#0e2d30]/55">
                          {t(`${column.key}.${item}.description`)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
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
              className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#6d0101] px-5 text-sm font-semibold text-white"
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
