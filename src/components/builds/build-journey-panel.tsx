"use client";
import Link from "next/link";
import { useLocale } from "next-intl";
import { isAppLocale } from "@/i18n/config";
import { buildProgressCopy } from "@/features/builds/build-progress-copy";
import styles from "./build-progress.module.css";
import { Check, ArrowRight } from "lucide-react";
import type { Build, BuildItem } from "@/features/builds/build-schema";
import { getBuildJourney } from "@/features/builds/build-journey";
import { findGuideForPart } from "@/features/guides/guide-catalog";
import { useBuildVisuals } from "@/features/visualizer/use-build-visuals";

export function BuildJourneyPanel({
  build,
  items,
}: {
  build: Build;
  items: BuildItem[];
}) {
  const locale = useLocale();
  const copy = buildProgressCopy[isAppLocale(locale) ? locale : "en"];
  const visuals = useBuildVisuals();
  const visual = visuals.find(
    (item) => item.buildId === build.id && item.vehicleId === build.vehicleId,
  );
  const journey = getBuildJourney(build, items, Boolean(visual));
  const base = `/garage/${encodeURIComponent(build.vehicleId)}/builds/${encodeURIComponent(build.id)}`;
  const next = journey.next;
  const nextGuide = next?.catalogPartId
    ? findGuideForPart(next.catalogPartId)
    : undefined;
  const parts = `${base}/parts${next ? `?item=${encodeURIComponent(next.id)}` : ""}`;
  return (
    <section
      aria-label="Connected build journey"
      className="border-foreground/20 bg-card text-foreground mt-5 rounded-[2rem] border p-5 sm:p-8"
    >
      <ol className={styles.steps} aria-label={copy.label}>
        {journey.steps.map((step, index) => (
          <li
            key={step.label}
            className={styles.step}
            aria-current={index === journey.currentStep ? "step" : undefined}
            data-done={step.done}
            data-passed={index < journey.currentStep}
          >
            <span className={styles.number} aria-hidden="true">
              {index + 1}
            </span>
            <div className={styles.stepText}>
              <span className={styles.label}>
                <span className="sr-only">{index + 1}. </span>
                {copy.steps[index]}
                {step.done && (
                  <Check className={styles.check} aria-label={copy.complete} />
                )}
              </span>
              {index === journey.currentStep && (
                <span className={styles.current}>{copy.current}</span>
              )}
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-7 grid gap-6 md:grid-cols-2">
        <div>
          <p className="text-primary text-xs tracking-widest uppercase">
            Next workshop action
          </p>
          <h2 className="mt-2 text-2xl font-medium">
            {next
              ? next.title
              : journey.blocked.length
                ? "Resolve blocked work"
                : items.length
                  ? "Review your build record"
                  : "Add your first modification"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/75">
            {next?.status === "ordered"
              ? "Check the delivered part and its fitment before installation. Record the work when complete."
              : next?.selectedOfferId
                ? "An offer is saved. Confirm fitment, returns and the final total before ordering."
                : next
                  ? "Compare live offers for this modification, then save your choice to the plan."
                  : journey.blocked.length
                    ? "Every remaining modification is waiting on another task. Open the plan below to review its dependencies."
                    : "Installed work appears in your Vehicle Passport as an owner-supplied record."}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {next && (
              <Link
                className="bg-background text-foreground inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold"
                href={parts}
              >
                Compare parts <ArrowRight className="size-4" />
              </Link>
            )}
            {nextGuide && (
              <Link
                className="inline-flex min-h-11 items-center rounded-xl border border-white/30 px-4 text-sm"
                href={
                  "/garage/" +
                  encodeURIComponent(build.vehicleId) +
                  "/guides/" +
                  encodeURIComponent(nextGuide.slug)
                }
              >
                Prepare installation
              </Link>
            )}
            <Link
              className="inline-flex min-h-11 items-center rounded-xl border border-white/30 px-4 text-sm"
              href={`/garage/${encodeURIComponent(build.vehicleId)}/passport`}
            >
              Open Passport
            </Link>
          </div>
        </div>
        <div>
          <p className="text-primary text-xs tracking-widest uppercase">
            Phase allocation · EUR estimates
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            {journey.stages.map(({ stage, title, allocated }) => (
              <div key={stage}>
                <dt className="text-white/65">{title}</dt>
                <dd className="mt-1 font-mono">
                  €{allocated.toLocaleString("en-IE")}
                </dd>
              </div>
            ))}
          </dl>
          <Link
            href={`${base}/visualize`}
            className="hover:border-primary mt-5 block rounded-xl border border-white/20 p-3 text-sm"
          >
            {visual?.reference
              ? `Saved 3D reference: ${Object.keys(visual.reference.paints).length} material colours and camera view`
              : visual
                ? `Saved concept: ${visual.paint.replaceAll("-", " ")} · ${visual.wheels.replaceAll("-", " ")} · ${visual.stance}`
                : "Choose a visual direction →"}
            <span className="mt-1 block text-xs text-white/65">
              Illustrative configuration, not proof of part compatibility.
            </span>
          </Link>
        </div>
      </div>
      <p className="mt-5 text-xs text-white/60">
        {journey.activated
          ? "First offer saved to this build."
          : "First-build milestone: save an offer to a planned modification."}{" "}
        Progress is derived from your records; no tracking data is sent.
      </p>
    </section>
  );
}
