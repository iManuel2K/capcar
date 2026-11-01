"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Check, CircleAlert, Wrench } from "lucide-react";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";
import type { AppLocale } from "@/i18n/config";
import { useBuildState } from "@/features/builds/use-builds";
import { announceBuildChange } from "@/features/builds/build-storage";
import { commonCheckCopy } from "@/features/problems/common-check-copy";
import {
  commonChecksForVehicle,
  type CommonCheckId,
} from "@/features/problems/common-checks";
import {
  commonCheckItemId,
  saveCommonCheck,
} from "@/features/problems/common-check-plan";
import {
  ACTIVE_GARAGE_USER_KEY,
  useGarageAccount,
} from "@/components/account/garage-account-boundary";
import { trackAnalytics } from "@/features/analytics/client";

export function CommonCheckCards({
  vehicle,
  locale,
}: {
  vehicle: Vehicle;
  locale: AppLocale;
}) {
  const c = commonCheckCopy[locale];
  const { configured, userId } = useGarageAccount();
  const { builds, items } = useBuildState();
  const [error, setError] = useState<CommonCheckId>();
  const checks = commonChecksForVehicle(vehicle);
  function save(id: CommonCheckId) {
    setError(undefined);
    try {
      if (
        configured &&
        (!userId || localStorage.getItem(ACTIVE_GARAGE_USER_KEY) !== userId)
      )
        throw new Error("Account changed.");
      const result = saveCommonCheck(vehicle.id, id, locale, localStorage);
      announceBuildChange();
      if (result.created)
        trackAnalytics("build_item_added", {
          source: "common-problems",
          kind: "maintenance",
        });
    } catch {
      setError(id);
    }
  }
  if (!checks.length)
    return <p className="text-muted-foreground mt-8">{c.concept}</p>;
  return (
    <section className="mt-9" aria-labelledby="everyday-checks">
      <h2 id="everyday-checks" className="text-2xl font-medium">
        {c.general}
      </h2>
      <p className="text-muted-foreground mt-3 max-w-3xl text-base leading-7">
        {c.generalNote}
      </p>
      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        {checks.map((check) => {
          const copy = c.checks[check.id];
          const item = items.find(
            (entry) => entry.id === commonCheckItemId(vehicle.id, check.id),
          );
          const plan = builds.find(
            (entry) =>
              entry.id === item?.buildId && entry.vehicleId === vehicle.id,
          );
          return (
            <article
              key={check.id}
              id={`check-${check.id}`}
              className="bg-card flex scroll-mt-24 flex-col rounded-2xl border border-white/15 p-5 sm:p-6"
            >
              <span className="text-primary flex items-center gap-2 text-sm">
                <Wrench className="size-4 shrink-0" aria-hidden="true" />
                {c[check.difficulty]}
              </span>
              <h3 className="mt-3 text-2xl font-medium tracking-tight">
                {copy.title}
              </h3>
              <p className="text-muted-foreground mt-2 text-base leading-7">
                {copy.symptom}
              </p>
              <p className="mt-4 text-base leading-7">
                <span className="font-medium">{c.tools}: </span>
                <span className="text-muted-foreground">{copy.tools}</span>
              </p>
              <h4 className="mt-5 font-medium">{c.steps}</h4>
              <ol className="text-muted-foreground marker:text-primary mt-3 list-decimal space-y-3 pl-5 text-base leading-7">
                {copy.steps.map((step) => (
                  <li key={step} className="pl-1">
                    {step}
                  </li>
                ))}
              </ol>
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200/25 bg-amber-200/5 p-4 text-base leading-7">
                <CircleAlert
                  className="mt-1 size-5 shrink-0 text-amber-200"
                  aria-hidden="true"
                />
                <p>
                  <strong className="font-medium text-amber-100">
                    {c.stop}.{" "}
                  </strong>
                  <span className="text-foreground">{copy.stop}</span>
                </p>
              </div>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
                {plan ? (
                  <div>
                    <p
                      role="status"
                      className="text-primary mb-1 flex items-center gap-2 text-sm"
                    >
                      <Check className="size-4" aria-hidden="true" />
                      {c.saved}
                    </p>
                    <Link
                      href={`/garage/${vehicle.id}/builds/${encodeURIComponent(plan.id)}`}
                      className="text-primary inline-flex min-h-11 items-center underline underline-offset-4 focus-visible:outline-2"
                    >
                      {c.openPlan}
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={() => save(check.id)}
                    type="button"
                    className="border-primary/40 text-primary hover:bg-primary/10 focus-visible:outline-primary min-h-11 rounded-xl border px-4 py-2 text-left font-medium focus-visible:outline-2 focus-visible:outline-offset-4"
                  >
                    {c.save}
                    <span className="sr-only">: {copy.title}</span>
                  </button>
                )}
                <a
                  className="text-muted-foreground inline-flex min-h-11 items-center gap-1 text-sm underline underline-offset-4 focus-visible:outline-2"
                  href={check.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {check.sourceLabel}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
              </div>
              {error === check.id && (
                <p role="alert" className="text-destructive mt-3">
                  {c.saveError}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
