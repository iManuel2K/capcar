import Link from "next/link";
import { ArrowRight, BadgeEuro, BookOpenCheck } from "lucide-react";

import { findGuideForPart } from "@/features/guides/guide-catalog";
import { findCatalogPart } from "@/features/parts/part-catalog";

export function PartNextActions({
  vehicleId,
  partId,
}: {
  vehicleId: string;
  partId: string;
}) {
  const part = findCatalogPart(partId);
  if (!part) return null;
  const guide = findGuideForPart(partId);

  return (
    <section className="mt-5 grid gap-4 pb-24 sm:pb-0 md:grid-cols-2">
      <ActionCard
        href={`/garage/${vehicleId}/parts/${partId}/offers`}
        icon={BadgeEuro}
        eyebrow="Epic 08"
        title="Compare demo offers"
        description="See shipping, delivered total, seller confidence and transparent rankings."
      />
      {guide ? (
        <ActionCard
          href={`/garage/${vehicleId}/guides/${guide.slug}`}
          icon={BookOpenCheck}
          eyebrow="Epic 09"
          title="Open guided install"
          description="Prepare tools, pass the safety gate and complete one clear step at a time."
        />
      ) : (
        <div className="rounded-[2rem] border border-white/8 bg-[#111111] p-7 opacity-50">
          <p className="text-xs tracking-[0.14em] text-white/30 uppercase">
            Installation guide
          </p>
          <h2 className="mt-3 text-xl font-medium">Guide not yet available</h2>
          <p className="mt-3 text-sm leading-6 text-white/40">
            This demo part has no guided workflow in the current catalogue.
          </p>
        </div>
      )}
    </section>
  );
}

function ActionCard({
  href,
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  href: string;
  icon: typeof BadgeEuro;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[2rem] border border-white/10 bg-[#111111] p-7 transition-colors hover:border-[#e72d45]/35"
    >
      <div className="flex items-center justify-between">
        <span className="grid size-11 place-items-center rounded-xl bg-[#e72d45]/10 text-[#ff667a]">
          <Icon className="size-5" />
        </span>
        <ArrowRight className="size-5 text-white/25 transition-transform group-hover:translate-x-1 group-hover:text-white" />
      </div>
      <p className="mt-8 text-xs tracking-[0.14em] text-[#ff667a] uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-medium">{title}</h2>
      <p className="mt-3 max-w-lg text-sm leading-6 text-white/40">
        {description}
      </p>
    </Link>
  );
}
