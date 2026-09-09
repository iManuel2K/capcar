import Link from "next/link";
import { AudioComparison } from "@/components/visualizer/audio-comparison";
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
        <AudioComparison />
      </div>
    </main>
  );
}
