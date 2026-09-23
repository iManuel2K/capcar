"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

const steps = ["ask", "plan", "garage"] as const;

export function CapcarStory() {
  const t = useTranslations("Story");
  const section = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!section.current) return;
    if (!window.IntersectionObserver) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.3 },
    );
    observer.observe(section.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || reducedMotion) return;
    const timer = window.setInterval(
      () => setActive((index) => (index + 1) % steps.length),
      5800,
    );
    return () => window.clearInterval(timer);
  }, [visible, reducedMotion]);

  const show = (index: number) => (
    <article
      key={steps[index]}
      className="grid gap-9 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-20"
    >
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] text-[#92644d] uppercase">
          {String(index + 1).padStart(2, "0")} / 03
        </p>
        <h2 className="mt-5 max-w-xl text-4xl leading-[1.04] font-medium tracking-[-0.055em] sm:text-6xl">
          {t(`${steps[index]}.title`)}
        </h2>
        <p className="mt-6 max-w-lg text-base leading-7 text-[#0e2d30]/70">
          {t(`${steps[index]}.description`)}
        </p>
      </div>
      <div className="min-w-0 rounded-[1.75rem] border border-[#0e2d30]/12 bg-[#f7f4ed] p-5 shadow-[0_20px_80px_rgba(14,45,48,.07)] sm:p-8">
        <div className="flex items-center justify-between border-b border-[#0e2d30]/10 pb-5">
          <span className="text-xs font-semibold tracking-[0.15em] uppercase">
            CapCar / {t(`${steps[index]}.card`)}
          </span>
          <span className="flex gap-1.5" aria-hidden="true">
            <i className="size-2 rounded-full bg-[#92644d]" />
            <i className="size-2 rounded-full bg-[#0e2d30]/15" />
          </span>
        </div>
        {index === 0 ? (
          <div className="min-h-52 space-y-5 pt-6">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-[#0e2d30]/25 px-3 py-2 text-sm">
                ChatGPT
              </span>
              <span className="rounded-full border border-[#0e2d30]/25 px-3 py-2 text-sm">
                Claude
              </span>
            </div>
            <p className="border-l-2 border-[#92644d] pl-4 text-sm leading-6">
              {t("ask.prompt")}
            </p>
            <p className="text-xs text-[#0e2d30]/55">{t("ask.context")}</p>
          </div>
        ) : index === 1 ? (
          <dl className="grid min-h-52 grid-cols-2 gap-x-4 gap-y-5 pt-6 text-sm">
            {(
              [
                "vehicle",
                "modification",
                "parts",
                "budget",
                "fitment",
                "verify",
              ] as const
            ).map((field) => (
              <div
                key={field}
                className="min-w-0 border-b border-[#0e2d30]/10 pb-2"
              >
                <dt className="text-[11px] text-[#0e2d30]/55">
                  {t(`fields.${field}`)}
                </dt>
                <dd className="mt-1 font-medium break-words">
                  {t(`plan.${field}`)}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <dl className="grid min-h-52 gap-3 pt-6 text-sm">
            {(["vehicle", "stage", "part", "budget", "next"] as const).map(
              (field) => (
                <div
                  key={field}
                  className="flex min-w-0 flex-wrap justify-between gap-1 border-b border-[#0e2d30]/10 pb-2"
                >
                  <dt className="text-[#0e2d30]/55">{t(`fields.${field}`)}</dt>
                  <dd className="font-medium">{t(`garage.${field}`)}</dd>
                </div>
              ),
            )}
          </dl>
        )}
      </div>
    </article>
  );

  return (
    <section
      ref={section}
      aria-label={t("label")}
      className="bg-[#e8e6d7] px-5 py-20 text-[#0e2d30] sm:px-8 sm:py-32"
    >
      <div className="mx-auto max-w-[1300px]">
        {reducedMotion ? (
          <div className="space-y-20">
            {steps.map((_, index) => show(index))}
          </div>
        ) : (
          <>
            <div className="relative min-h-[490px] sm:min-h-[420px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  {show(active)}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="mt-9 flex gap-3" aria-label={t("steps")}>
              {steps.map((step, index) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => setActive(index)}
                  aria-label={t(`${step}.title`)}
                  aria-current={active === index ? "step" : undefined}
                  className={`grid size-11 place-items-center rounded-full border text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${active === index ? "border-[#0e2d30] bg-[#0e2d30] text-white" : "border-[#0e2d30]/20 text-[#0e2d30]/70 hover:border-[#0e2d30]"}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
