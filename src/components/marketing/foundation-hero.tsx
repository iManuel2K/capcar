import Link from "next/link";
import { ArrowRight, Check, CircleGauge, Wrench } from "lucide-react";

import { CapcarWordmark } from "@/components/brand/capcar-wordmark";

export function FoundationHero() {
  return (
    <div className="bg-background text-foreground min-h-dvh">
      <header className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <CapcarWordmark />
        <nav className="text-muted-foreground hidden items-center gap-8 text-sm md:flex">
          <a
            className="hover:text-foreground transition-colors"
            href="#journey"
          >
            How it works
          </a>
          <a
            className="hover:text-foreground transition-colors"
            href="#foundation"
          >
            Foundation
          </a>
        </nav>
        <span className="border-border bg-card text-muted-foreground rounded-full border px-3 py-1.5 text-xs">
          Private preview
        </span>
      </header>

      <main>
        <section className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 pt-12 pb-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:pt-20 lg:pb-24">
          <div>
            <p className="mb-5 text-xs font-medium tracking-[0.18em] text-[var(--capcar-blue-strong)] uppercase">
              Your project-car copilot
            </p>
            <h1 className="max-w-3xl text-5xl leading-[0.98] font-medium tracking-[-0.055em] text-balance sm:text-7xl">
              Build the car in your head.
            </h1>
            <p className="text-muted-foreground mt-7 max-w-xl text-base leading-7 sm:text-lg">
              Visualize the direction, find compatible parts at the real price,
              install them confidently and preserve the complete story of your
              car.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="#foundation"
                className="bg-primary text-primary-foreground inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-transform hover:-translate-y-0.5"
              >
                Explore the foundation
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                href="#journey"
                className="border-border bg-card hover:bg-accent inline-flex min-h-11 items-center justify-center rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors"
              >
                See the product journey
              </Link>
            </div>
          </div>

          <VehicleStage />
        </section>

        <section id="foundation" className="border-border bg-card/60 border-y">
          <div className="bg-border mx-auto grid w-full max-w-7xl gap-px sm:grid-cols-3">
            <FoundationCard
              icon={CircleGauge}
              eyebrow="Maintenance"
              title="Know what needs attention"
              description="Upcoming work is prioritized by mileage, time and safety."
            />
            <FoundationCard
              icon={Check}
              eyebrow="Compatibility"
              title="Buy with confidence"
              description="Fitment and the full delivered price appear before the purchase."
            />
            <FoundationCard
              icon={Wrench}
              eyebrow="Installation"
              title="One clear step at a time"
              description="The selected part connects directly to tools, guidance and verification."
            />
          </div>
        </section>

        <section
          id="journey"
          className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8"
        >
          <p className="text-xs font-medium tracking-[0.18em] text-[var(--capcar-blue-strong)] uppercase">
            CapCar v0.1
          </p>
          <h2 className="mt-4 max-w-2xl text-3xl font-medium tracking-[-0.035em] sm:text-5xl">
            One connected ownership journey.
          </h2>
          <div className="mt-10 grid gap-3 md:grid-cols-5">
            {[
              "Add your car",
              "See what it needs",
              "Plan the build",
              "Install the part",
              "Record the result",
            ].map((step, index) => (
              <div
                className="border-border bg-card rounded-2xl border p-5"
                key={step}
              >
                <span className="text-muted-foreground text-xs">
                  0{index + 1}
                </span>
                <p className="mt-8 mb-0 font-medium">{step}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function VehicleStage() {
  return (
    <div className="relative min-h-[430px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#0c0f0d] p-6 text-white shadow-[0_30px_90px_rgba(16,20,18,0.24)] sm:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_45%,rgba(88,142,230,0.24),transparent_38%)]" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs tracking-[0.16em] text-white/50 uppercase">
            Current garage
          </p>
          <p className="text-lg font-medium">2011 BMW 318i</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/65">
          148,200 km
        </span>
      </div>

      <div className="relative mt-14 flex min-h-48 items-center justify-center">
        <div className="absolute h-24 w-4/5 rounded-[50%] bg-[var(--capcar-blue)]/20 blur-3xl" />
        <div className="relative w-4/5 max-w-lg">
          <div className="h-28 rounded-[48%_56%_22%_20%/58%_60%_30%_28%] bg-gradient-to-br from-[#58605b] via-[#1d211f] to-[#080a09] shadow-[inset_0_2px_0_rgba(255,255,255,0.15),0_28px_50px_rgba(0,0,0,0.4)] sm:h-36">
            <div className="absolute top-2 left-[22%] h-[38%] w-[54%] rounded-[65%_70%_12%_10%] bg-gradient-to-br from-[#84928e] to-[#202927] opacity-75" />
          </div>
          <div className="absolute -bottom-6 left-[12%] size-16 rounded-full border-[13px] border-[#080a09] bg-[#6f7772] shadow-[0_0_0_5px_rgba(255,255,255,0.04)] sm:size-20" />
          <div className="absolute -right-1 -bottom-6 size-16 rounded-full border-[13px] border-[#080a09] bg-[#6f7772] shadow-[0_0_0_5px_rgba(255,255,255,0.04)] sm:size-20" />
        </div>
      </div>

      <div className="relative mt-12 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="mb-1 text-xs text-white/50">Next attention</p>
          <p className="mb-0 font-medium">Brake fluid</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="mb-1 text-xs text-white/50">Active build</p>
          <p className="mb-0 font-medium">Stealth Rear</p>
        </div>
      </div>
    </div>
  );
}

type FoundationCardProps = {
  icon: typeof CircleGauge;
  eyebrow: string;
  title: string;
  description: string;
};

function FoundationCard({
  icon: Icon,
  eyebrow,
  title,
  description,
}: FoundationCardProps) {
  return (
    <article className="bg-background p-6 sm:p-8">
      <Icon
        aria-hidden="true"
        className="size-5 text-[var(--capcar-blue-strong)]"
      />
      <p className="text-muted-foreground mt-10 mb-2 text-xs tracking-[0.14em] uppercase">
        {eyebrow}
      </p>
      <h2 className="text-xl font-medium tracking-[-0.02em]">{title}</h2>
      <p className="text-muted-foreground mt-3 mb-0 leading-6">{description}</p>
    </article>
  );
}
