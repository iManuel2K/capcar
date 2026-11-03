import { ArrowUpRight } from "lucide-react";
import type { AppLocale } from "@/i18n/config";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";
import { commonCheckCopy } from "@/features/problems/common-check-copy";
import { modelProblemCopy } from "@/features/problems/model-problem-copy";
import {
  modelProblemProfileForVehicle,
  modelProblemsReviewedAt,
} from "@/features/problems/model-problem-profiles";

export function ModelProblemCards({
  vehicle,
  locale,
}: {
  vehicle: Vehicle;
  locale: AppLocale;
}) {
  const profile = modelProblemProfileForVehicle(vehicle);
  if (!profile) return null;
  const c = modelProblemCopy[locale];
  const labels = commonCheckCopy[locale];
  return (
    <div className="mt-6" lang={locale}>
      <p className="text-base leading-7">{c.intro}</p>
      <p className="text-primary mt-2 text-base leading-7">
        {c.scope}: {c[profile.scope]} · {profile.reportYears[0]}–
        {profile.reportYears[1]}
      </p>
      <p className="text-muted-foreground mt-2 max-w-3xl text-base leading-7">
        {c.candidate}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
        <a
          className="text-primary inline-flex min-h-11 items-center gap-2 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
          href={profile.sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          {labels.source}: ADAC · {vehicle.make} {vehicle.model}
          <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
        </a>
        <span className="text-muted-foreground">
          {labels.reviewed}:{" "}
          <time dateTime={modelProblemsReviewedAt}>
            {modelProblemsReviewedAt}
          </time>
        </span>
      </div>
      {profile.issues.length === 0 ? (
        <p className="bg-card text-muted-foreground mt-4 rounded-xl p-5 text-base leading-7">
          {c.noPattern}
        </p>
      ) : (
        <>
          <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-6">
            {c.guidance}
          </p>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {profile.issues.map((issue) => {
              const topic = c.topics[issue.topic];
              return (
                <article
                  key={issue.topic}
                  className="bg-card rounded-2xl border border-white/15 p-5 sm:p-6"
                >
                  <p className="text-primary text-sm">
                    {labels.evidence["inspection-data"]}
                  </p>
                  <h3 className="mt-2 text-2xl font-medium">{topic.title}</h3>
                  {issue.years && (
                    <div className="text-muted-foreground mt-3 text-sm leading-6">
                      <p>
                        {c.registrationYears}: {issue.years.join(", ")}
                      </p>
                      <p>{c.yearHint}</p>
                    </div>
                  )}
                  <dl className="mt-4 space-y-4 text-base leading-7">
                    <div>
                      <dt className="font-medium">{c.notice}</dt>
                      <dd className="text-muted-foreground mt-1">
                        {topic.notice}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium">{c.check}</dt>
                      <dd className="text-muted-foreground mt-1">
                        {topic.check}
                      </dd>
                    </div>
                    <div className="border-t border-amber-200/25 pt-4">
                      <dt className="font-medium text-amber-100">{c.help}</dt>
                      <dd className="text-muted-foreground mt-1">
                        {topic.help}
                      </dd>
                    </div>
                  </dl>
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
