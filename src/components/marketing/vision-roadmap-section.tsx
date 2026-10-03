import { ArrowRight, Check, Circle } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

const columns = [
  {
    id: "foundation",
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
    active: true,
  },
  {
    id: "hardening",
    items: [
      "reliability",
      "publicPassport",
      "marketplaceTrust",
      "specialistOnboarding",
      "accessibility",
      "localization",
    ],
    active: true,
  },
  {
    id: "tangible",
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
    active: true,
  },
  {
    id: "beyond",
    items: ["ai", "tripPlanning", "calendarMail", "twowheels", "more"],
    active: false,
  },
] as const;

export function VisionRoadmapSection() {
  const t = useTranslations("Roadmap");
  const faq = useTranslations("Faq");

  return (
    <section
      id="roadmap"
      className="scroll-mt-20 border-y border-white/8 bg-[#0e2d30] text-[#e8e6d7]"
    >
      <div className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.58fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-[#bf8269] uppercase">
              {t("sequenceEyebrow")}
            </p>
            <h2 className="mt-5 max-w-4xl text-5xl leading-[0.9] font-medium tracking-[-0.06em] sm:text-7xl">
              {t("sequenceTitle")}
            </h2>
          </div>
          <div>
            <p className="text-base leading-7 text-white/48">
              {t("sequenceDescription")}
            </p>
            <Link
              href="/roadmap"
              className="mt-5 inline-flex min-h-11 items-center gap-2 font-medium text-white/76 transition hover:text-[#bf8269]"
            >
              {faq("roadmap")} <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
          {columns.map((column) => (
            <article
              key={column.id}
              className={`rounded-[1.6rem] border border-white/10 p-6 sm:p-7 ${column.id === "hardening" ? "bg-[#1d494b]" : column.id === "tangible" ? "bg-[#183f42]" : "bg-[#153b3e]"}`}
            >
              <p className="text-[11px] font-semibold tracking-[0.14em] text-[#bf8269] uppercase">
                {t(`${column.id}.label`)}
              </p>
              <h3 className="mt-3 text-2xl font-medium tracking-[-0.035em]">
                {t(`${column.id}.title`)}
              </h3>
              <p className="mt-2 text-xs text-white/32">
                {t("milestoneCount", { count: column.items.length })}
              </p>
              <ul className="mt-6 space-y-3">
                {column.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm text-white/58"
                  >
                    <span
                      className={`grid size-5 shrink-0 place-items-center rounded-full ${column.active ? "bg-[#6d0101]/20 text-[#bf8269]" : "bg-white/6 text-white/35"}`}
                    >
                      {column.active ? (
                        <Check aria-hidden="true" className="size-3" />
                      ) : (
                        <Circle aria-hidden="true" className="size-3" />
                      )}
                    </span>
                    {t(`${column.id}.${item}.title`)}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
