import { SiteFooter } from "@/components/marketing/site-footer";
import Link from "next/link";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import type { Metadata } from "next";
import { ShowcaseBuilds } from "@/components/visualizer/showcase-builds";

export const metadata: Metadata = {
  title: "Concept studio | Capcar",
  description:
    "Explore stylized automotive concepts with paint, stance and original cinema-inspired presets.",
};
export default function StudioPage() {
  return (
    <div className="min-h-dvh bg-[#e8e6d7] text-[#0e2d30]">
      <MarketingHeader />
      <main className="px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <Link
            className="inline-flex min-h-11 items-center underline"
            href="/"
          >
            ← Back to Capcar
          </Link>
          <p className="mt-10 text-xs font-semibold tracking-widest uppercase">
            Capcar / Concept studio
          </p>
          <h1 className="mt-4 text-4xl font-medium tracking-tight sm:text-6xl">
            Explore the direction.
          </h1>
          <p className="mt-5 mb-10 max-w-xl text-base leading-7">
            Explore creator-made 3D references and original stylized concepts.
            Reference models are separate from the configurable sketches below.
          </p>
          <ShowcaseBuilds />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
