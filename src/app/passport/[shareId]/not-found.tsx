import Link from "next/link";
import { Link2Off } from "lucide-react";

import { CapcarWordmark } from "@/components/brand/capcar-wordmark";

export default function SharedPassportNotFound() {
  return (
    <main className="bg-background text-foreground grid min-h-dvh place-items-center px-5 text-center">
      <section className="max-w-xl">
        <CapcarWordmark />
        <Link2Off className="text-primary mx-auto mt-12 size-8" />
        <p className="text-muted-foreground mt-6 text-xs font-semibold tracking-[0.15em] uppercase">
          Passport unavailable
        </p>
        <h1 className="mt-3 text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
          This link is no longer public.
        </h1>
        <p className="text-muted-foreground mt-5 leading-7">
          The owner may have revoked the link, or the shared record could not be
          verified.
        </p>
        <Link
          href="/"
          className="bg-primary text-primary-foreground mt-8 inline-flex min-h-12 items-center rounded-xl px-5 text-sm font-semibold"
        >
          Return to CapCar
        </Link>
      </section>
    </main>
  );
}
