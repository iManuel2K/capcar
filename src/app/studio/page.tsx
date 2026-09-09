import Link from "next/link";
import type { Metadata } from "next";
import { ShowcaseBuilds } from "@/components/visualizer/showcase-builds";

export const metadata: Metadata = {
  title: "Concept studio | Capcar",
  description:
    "Explore stylized automotive concepts with paint, stance and original cinema-inspired presets.",
};
export default function StudioPage() {
  return (
    <main className="min-h-dvh bg-[#e8e6d7] px-5 py-8 text-[#0e2d30] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link className="inline-flex min-h-11 items-center underline" href="/">
          ← Back to Capcar
        </Link>
        <p className="mt-10 text-xs font-semibold tracking-widest uppercase">
          Capcar / Concept studio
        </p>
        <h1 className="mt-4 text-4xl font-medium tracking-tight sm:text-6xl">
          Explore the direction.
        </h1>
        <p className="mt-5 mb-10 max-w-xl text-base leading-7">
          A small space for visual experimentation. Generic stylized cars, real
          interaction, and no changes to your garage.
        </p>
        <ShowcaseBuilds />
      </div>
    </main>
  );
}
