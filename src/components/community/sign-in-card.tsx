import Link from "next/link";
import { actionClass } from "./community-shell";

export function SignInCard({
  next,
  children,
}: {
  next: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#0e2d30]/15 bg-white/35 p-6 sm:p-8">
      <h2 className="text-2xl font-medium">
        Keep your work connected to your car.
      </h2>
      <p className="mt-3 max-w-xl leading-7">{children}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          className={actionClass}
          href={`/login?next=${encodeURIComponent(next)}`}
        >
          Sign in to continue
        </Link>
        <Link className={actionClass} href="/parts-search">
          Browse parts
        </Link>
      </div>
    </section>
  );
}
