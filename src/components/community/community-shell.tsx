import Link from "next/link";
import { MarketingHeader } from "@/components/marketing/marketing-header";
export const fieldClass =
  "mt-2 block min-h-11 w-full rounded-xl border border-[#0e2d30]/30 bg-white/40 p-3 text-sm";
export const actionClass =
  "min-h-11 rounded-xl border border-[#0e2d30]/30 px-4 py-2 text-sm font-medium disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4";
export function CommunityShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-[#e8e6d7] text-[#0e2d30]">
      <MarketingHeader />
      <main className="px-5 py-8">
        <div className="mx-auto max-w-6xl break-words">
          <nav
            aria-label="Community navigation"
            className="flex flex-wrap gap-5 text-sm"
          >
            <Link
              className="inline-flex min-h-11 items-center underline"
              href="/"
            >
              Capcar
            </Link>
            <Link
              className="inline-flex min-h-11 items-center underline"
              href="/marketplace"
            >
              Marketplace
            </Link>
            <Link
              className="inline-flex min-h-11 items-center underline"
              href="/connected-parts"
            >
              Retail search
            </Link>
            <Link
              className="inline-flex min-h-11 items-center underline"
              href="/verified-work"
            >
              Verified work
            </Link>
            <Link
              className="inline-flex min-h-11 items-center underline"
              href="/login"
            >
              Account
            </Link>
          </nav>
          <h1 className="mt-10 mb-8 text-4xl font-medium tracking-tight sm:text-6xl">
            {title}
          </h1>
          {children}
        </div>
      </main>
    </div>
  );
}
