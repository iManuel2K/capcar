import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#0b0e0c] px-5 text-center text-[#f4f5f2]">
      <div>
        <p className="text-xs tracking-[0.16em] text-[#8ab7ff] uppercase">
          404 · Route not found
        </p>
        <h1 className="mt-4 text-5xl font-medium tracking-[-0.05em]">
          This road ends here.
        </h1>
        <p className="mt-4 text-white/40">
          Return to your garage and continue the build.
        </p>
        <Link
          href="/garage"
          className="mt-7 inline-flex rounded-xl bg-[#74a7ff] px-5 py-3 text-sm font-semibold text-[#07101d]"
        >
          Open garage
        </Link>
      </div>
    </main>
  );
}
