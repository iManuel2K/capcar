import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

const questions = ["one", "two", "three", "four", "five", "six"] as const;

export function MarketingFaq() {
  const t = useTranslations("Faq");
  return (
    <section
      id="faq"
      className="scroll-mt-20 border-y border-[#0e2d30]/10 bg-[#e8e6d7] text-[#0e2d30]"
    >
      <div className="mx-auto grid max-w-[1500px] gap-12 px-5 py-20 sm:px-8 sm:py-32 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#6d0101] uppercase">
            FAQ
          </p>
          <h2 className="mt-4 max-w-lg text-4xl leading-[0.94] font-medium tracking-[-0.055em] sm:text-6xl">
            {t("title")}
          </h2>
          <p className="mt-6 max-w-md text-base leading-7 text-[#0e2d30]/58">
            {t("description")}
          </p>
          <Link
            href="/roadmap"
            className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#0e2d30] px-5 text-sm font-semibold text-[#e8e6d7] transition hover:bg-[#6d0101]"
          >
            {t("roadmap")} <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="border-t border-[#0e2d30]/16">
          {questions.map((item) => (
            <details key={item} className="group border-b border-[#0e2d30]/16">
              <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-medium tracking-[-0.02em] marker:hidden sm:min-h-24 sm:text-xl [&::-webkit-details-marker]:hidden">
                {t(`${item}.question`)}
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-[#0e2d30]/14 transition group-open:rotate-45 group-open:bg-[#6d0101] group-open:text-white">
                  <Plus className="size-4" />
                </span>
              </summary>
              <p className="max-w-2xl pr-12 pb-7 text-sm leading-7 text-[#0e2d30]/62 sm:text-base">
                {t(`${item}.answer`)}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
