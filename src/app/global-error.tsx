"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="grid min-h-dvh place-items-center bg-[#0b0e0c] px-5 text-center text-[#f4f5f2]">
        <main>
          <p className="text-xs tracking-[0.16em] text-red-200 uppercase">
            Unexpected error
          </p>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.04em]">
            Capcar could not finish that action.
          </h1>
          <p className="mt-4 text-white/40">
            Your browser-local records have not been intentionally deleted.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-7 rounded-xl bg-[#74a7ff] px-5 py-3 text-sm font-semibold text-[#07101d]"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
