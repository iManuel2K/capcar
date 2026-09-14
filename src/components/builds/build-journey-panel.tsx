"use client";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import type { Build, BuildItem } from "@/features/builds/build-schema";
import { getBuildJourney } from "@/features/builds/build-journey";
import { useBuildVisuals } from "@/features/visualizer/use-build-visuals";

export function BuildJourneyPanel({
  build,
  items,
}: {
  build: Build;
  items: BuildItem[];
}) {
  const visuals = useBuildVisuals();
  const visual = visuals.find(
    (item) => item.buildId === build.id && item.vehicleId === build.vehicleId,
  );
  const journey = getBuildJourney(build, items, Boolean(visual));
  const base = `/garage/${encodeURIComponent(build.vehicleId)}/builds/${encodeURIComponent(build.id)}`;
  const next = journey.next;
  const parts = `${base}/parts${next ? `?item=${encodeURIComponent(next.id)}` : ""}`;
  return (
    <section
      aria-label="Connected build journey"
      className="mt-5 rounded-[2rem] border border-[#b7cec3]/20 bg-[#0b2528] p-5 text-[#eee7d8] sm:p-8"
    >
      <ol className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {journey.steps.map((step, index) => (
          <li
            key={step.label}
            className="flex items-center gap-2 text-xs sm:text-sm"
          >
            <span
              className={`grid size-7 shrink-0 place-items-center rounded-full border ${step.done ? "border-[#89cbb0] text-[#89cbb0]" : "border-white/30 text-white/60"}`}
            >
              {step.done ? (
                <Check aria-label="Complete" className="size-4" />
              ) : (
                index + 1
              )}
            </span>
            {step.label}
          </li>
        ))}
      </ol>
      <div className="mt-7 grid gap-6 md:grid-cols-2">
        <div>
          <p className="text-xs tracking-widest text-[#c98f72] uppercase">
            Next workshop action
          </p>
          <h2 className="mt-2 text-2xl font-medium">
            {next
              ? next.title
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
                  : "Installed work appears in your Vehicle Passport as an owner-supplied record."}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {next && (
              <Link
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#eee7d8] px-4 text-sm font-semibold text-[#0b2528]"
                href={parts}
              >
                Compare parts <ArrowRight className="size-4" />
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
          <p className="text-xs tracking-widest text-[#c98f72] uppercase">
            Phase allocation · EUR estimates
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            {journey.stages.map(({ stage, allocated }) => (
              <div key={stage}>
                <dt className="text-white/65 capitalize">{stage}</dt>
                <dd className="mt-1 font-mono">
                  €{allocated.toLocaleString("en-IE")}
                </dd>
              </div>
            ))}
          </dl>
          <Link
            href={`${base}/visualize`}
            className="mt-5 block rounded-xl border border-white/20 p-3 text-sm hover:border-[#c98f72]"
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
