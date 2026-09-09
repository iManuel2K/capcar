import Link from "next/link";
import { AudioComparison } from "@/components/visualizer/audio-comparison";
import { RecordingLibrary } from "@/components/visualizer/recording-library";
import { CuratedSounds } from "@/components/visualizer/curated-sounds";
export const metadata = { title: "Sound studio | Capcar" };
export default function Page() {
  return (
    <main className="min-h-dvh bg-[#e8e6d7] px-5 py-10 text-[#0e2d30]">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="inline-flex min-h-11 items-center underline">
          ← Capcar
        </Link>
        <h1 className="my-8 text-4xl font-medium tracking-tight sm:text-6xl">
          Listen to the difference.
        </h1>
        <CuratedSounds />
        <RecordingLibrary />
        <div className="rounded-2xl bg-[#0e2d30] text-[#e8e6d7]">
          <AudioComparison />
        </div>
      </div>
    </main>
  );
}
