import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  Check,
  CircleGauge,
  Euro,
  Layers3,
  Menu,
  ScanSearch,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Wrench,
} from "lucide-react";

import { CapcarWordmark } from "@/components/brand/capcar-wordmark";

export function MarketingLanding() {
  return (
    <div className="min-h-dvh overflow-hidden bg-[#f4f1e9] text-[#151713]">
      <header className="relative z-50 mx-auto flex h-20 w-full max-w-[1500px] items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          aria-label="Capcar home"
          className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3978d9]"
        >
          <CapcarWordmark />
        </Link>
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-8 text-sm text-[#151713]/55 md:flex"
        >
          <a className="transition hover:text-[#151713]" href="#product">
            Product
          </a>
          <a className="transition hover:text-[#151713]" href="#difference">
            Why Capcar
          </a>
          <a className="transition hover:text-[#151713]" href="#journey">
            How it works
          </a>
        </nav>
        <Link
          href="/garage"
          className="hidden min-h-11 items-center gap-2 rounded-xl bg-[#151713] px-4 text-sm font-medium text-white transition hover:-translate-y-0.5 sm:inline-flex"
        >
          Open garage <ArrowRight className="size-4" />
        </Link>
        <Link
          href="/garage"
          aria-label="Open garage"
          className="grid size-11 place-items-center rounded-xl bg-[#151713] text-white sm:hidden"
        >
          <Menu className="size-4" />
        </Link>
      </header>

      <main>
        <section className="relative mx-auto grid min-h-[calc(100dvh-5rem)] w-full max-w-[1500px] items-center gap-12 px-5 pt-12 pb-20 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:pt-10">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#151713]/10 bg-white/45 px-3 py-1.5 text-xs text-[#151713]/55 backdrop-blur">
              <span className="size-1.5 rounded-full bg-[#3978d9]" />
              Local product preview
            </div>
            <h1 className="mt-7 max-w-3xl text-[clamp(3.5rem,7vw,7.4rem)] leading-[0.86] font-medium tracking-[-0.072em] text-balance">
              Your car.
              <br />
              <span className="text-[#151713]/28">Before it becomes</span>
              <br />
              your project.
            </h1>
            <p className="mt-8 max-w-xl text-base leading-7 text-[#151713]/58 sm:text-lg">
              See the direction, organize every modification, understand what
              fits and build with a plan instead of scattered tabs and
              guesswork.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/garage"
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-[#3978d9] px-6 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(57,120,217,0.22)] transition hover:-translate-y-0.5 hover:bg-[#2f6fc9]"
              >
                Start with your car <ArrowRight className="size-4" />
              </Link>
              <a
                href="#product"
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl border border-[#151713]/12 bg-white/35 px-6 text-sm font-medium transition hover:bg-white/65"
              >
                Explore the product <ArrowDown className="size-4" />
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs text-[#151713]/42">
              <span className="flex items-center gap-2">
                <Check className="size-3.5 text-[#3978d9]" /> No account needed
              </span>
              <span className="flex items-center gap-2">
                <Check className="size-3.5 text-[#3978d9]" /> BMW-first
                prototype
              </span>
              <span className="flex items-center gap-2">
                <Check className="size-3.5 text-[#3978d9]" /> Free preview
              </span>
            </div>
          </div>

          <HeroStage />
        </section>

        <section className="border-y border-[#151713]/10 bg-white/35">
          <div className="mx-auto grid max-w-[1500px] divide-y divide-[#151713]/10 px-5 sm:px-8 md:grid-cols-4 md:divide-x md:divide-y-0">
            <Signal number="01" label="One exact vehicle" />
            <Signal number="02" label="One coherent build" />
            <Signal number="03" label="Visible fitment evidence" />
            <Signal number="04" label="A permanent history" />
          </div>
        </section>

        <section
          id="product"
          className="mx-auto w-full max-w-[1500px] px-5 py-24 sm:px-8 sm:py-32"
        >
          <SectionHeading
            eyebrow="The product"
            title="The car stays at the center."
            description="Capcar connects the emotional project with the practical work required to make it real."
          />
          <div className="mt-14 grid gap-5 lg:grid-cols-12">
            <FeatureCard
              className="lg:col-span-7"
              icon={CircleGauge}
              eyebrow="Garage"
              title="Know the car you are building."
              description="Engine, chassis, mileage and project identity become the context for every later decision."
              visual={<GarageVisual />}
            />
            <FeatureCard
              className="lg:col-span-5"
              icon={Wrench}
              eyebrow="Maintenance"
              title="Build from a reliable baseline."
              description="Unknown history remains honest. Completed work creates the next date and mileage target."
              visual={<MaintenanceVisual />}
            />
            <FeatureCard
              className="lg:col-span-5"
              icon={Layers3}
              eyebrow="Build studio"
              title="Turn taste into a roadmap."
              description="Foundation, handling, appearance and performance stay in the correct order."
              visual={<BuildVisual />}
            />
            <FeatureCard
              className="lg:col-span-7"
              icon={ScanSearch}
              eyebrow="Parts"
              title="See why a part appears relevant."
              description="Platform, year, body and engine checks are visible before price enters the conversation."
              visual={<PartsVisual />}
            />
          </div>
        </section>

        <section id="difference" className="bg-[#0b0e0c] text-white">
          <div className="mx-auto grid max-w-[1500px] gap-14 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-[#8ab7ff] uppercase">
                The difference
              </p>
              <h2 className="mt-5 text-4xl leading-[0.98] font-medium tracking-[-0.055em] text-balance sm:text-6xl">
                Confidence before checkout.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/48">
                “Fits your BMW” is not enough. Capcar is designed to show the
                evidence, the unresolved conditions and the complete build
                context before recommending a purchase.
              </p>
              <Link
                href="/garage"
                className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#74a7ff] px-5 text-sm font-semibold text-[#07101d]"
              >
                Explore your garage <ArrowRight className="size-4" />
              </Link>
            </div>
            <EvidencePanel />
          </div>
        </section>

        <section
          id="journey"
          className="mx-auto w-full max-w-[1500px] px-5 py-24 sm:px-8 sm:py-32"
        >
          <SectionHeading
            eyebrow="One ownership journey"
            title="From idea to installed."
            description="Each step creates useful context for the next, instead of disappearing into another app or spreadsheet."
          />
          <ol className="mt-14 grid gap-px overflow-hidden rounded-[2rem] border border-[#151713]/10 bg-[#151713]/10 md:grid-cols-5">
            {[
              [
                "01",
                "Add the car",
                "Start from the real chassis, engine and mileage.",
              ],
              [
                "02",
                "Set the baseline",
                "Record maintenance before modification.",
              ],
              [
                "03",
                "Shape the build",
                "Create stages, priorities and a budget.",
              ],
              [
                "04",
                "Prove the part",
                "Inspect fitment evidence and conditions.",
              ],
              [
                "05",
                "Install and record",
                "Preserve the work as vehicle history.",
              ],
            ].map(([number, title, description]) => (
              <li
                key={number}
                className="flex min-h-72 flex-col bg-[#f4f1e9] p-6 sm:p-7"
              >
                <span className="text-xs text-[#3978d9]">{number}</span>
                <h3 className="mt-auto text-xl font-medium tracking-[-0.025em]">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#151713]/45">
                  {description}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="px-5 pb-5 sm:px-8 sm:pb-8">
          <div className="relative mx-auto min-h-[560px] max-w-[1500px] overflow-hidden rounded-[2.5rem] bg-[#3978d9] px-6 py-16 text-white sm:px-12 sm:py-20 lg:px-20">
            <div className="absolute -top-48 -right-36 size-[520px] rounded-full border border-white/20" />
            <div className="absolute -right-16 -bottom-72 size-[620px] rounded-full border border-white/15" />
            <div className="relative z-10 flex min-h-[400px] max-w-4xl flex-col justify-between">
              <Sparkles className="size-7" />
              <div>
                <h2 className="text-5xl leading-[0.92] font-medium tracking-[-0.06em] text-balance sm:text-7xl lg:text-8xl">
                  The build starts before the first part.
                </h2>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/garage"
                    className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-[#245da9]"
                  >
                    Open Capcar <ArrowRight className="size-4" />
                  </Link>
                  <span className="inline-flex min-h-13 items-center justify-center rounded-xl border border-white/25 px-6 text-sm text-white/72">
                    Free local preview
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-[1500px] flex-col justify-between gap-7 px-5 py-12 sm:flex-row sm:items-center sm:px-8">
        <CapcarWordmark />
        <p className="max-w-xl text-xs leading-5 text-[#151713]/38">
          Prototype data is for product testing only. Always verify fitment,
          safety specifications and legal documentation before purchasing or
          installing automotive parts.
        </p>
        <Link href="/garage" className="text-sm font-medium">
          Garage →
        </Link>
      </footer>
    </div>
  );
}

function HeroStage() {
  return (
    <div className="relative min-h-[600px] overflow-hidden rounded-[2.4rem] border border-white/8 bg-[#0b0e0c] text-white shadow-[0_40px_110px_rgba(25,29,26,0.28)] sm:min-h-[720px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_42%,rgba(92,145,235,0.28),transparent_32%)]" />
      <div className="absolute inset-x-[8%] bottom-[22%] h-28 rounded-full bg-[#74a7ff]/14 blur-3xl" />
      <div className="absolute top-6 right-6 left-6 flex items-center justify-between sm:top-8 sm:right-8 sm:left-8">
        <div>
          <p className="text-[11px] tracking-[0.16em] text-white/35 uppercase">
            Current garage
          </p>
          <p className="mt-2 text-sm font-medium">2011 BMW 318i</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/45">
          E90 · N43B20
        </span>
      </div>

      <MarketingCar />

      <div className="absolute right-5 bottom-5 left-5 grid gap-3 sm:right-8 sm:bottom-8 sm:left-8 sm:grid-cols-3">
        <StageCard
          icon={CircleGauge}
          label="Maintenance"
          value="Baseline ready"
        />
        <StageCard icon={Layers3} label="Active build" value="Stealth Rear" />
        <StageCard
          icon={ShoppingBag}
          label="Part evidence"
          value="4 conditions"
        />
      </div>
      <div className="absolute top-[18%] left-5 rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-xl sm:left-8">
        <p className="text-[10px] tracking-[0.13em] text-white/35 uppercase">
          Build budget
        </p>
        <p className="mt-2 text-xl font-medium">€1,200</p>
        <div className="mt-3 h-1.5 w-28 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-[67%] rounded-full bg-[#74a7ff]" />
        </div>
      </div>
    </div>
  );
}

function MarketingCar() {
  return (
    <svg
      aria-label="Stylized project car"
      className="absolute top-[43%] left-1/2 w-[112%] max-w-[950px] -translate-x-1/2 -translate-y-1/2"
      role="img"
      viewBox="0 0 1000 430"
    >
      <defs>
        <linearGradient id="landing-body" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#919b95" />
          <stop offset="0.34" stopColor="#303733" />
          <stop offset="0.72" stopColor="#121613" />
          <stop offset="1" stopColor="#050706" />
        </linearGradient>
        <linearGradient id="landing-glass" x1="0" x2="1">
          <stop offset="0" stopColor="#8ba5ad" />
          <stop offset="1" stopColor="#14201d" />
        </linearGradient>
      </defs>
      <ellipse cx="505" cy="340" rx="405" ry="46" fill="#000" opacity=".58" />
      <path
        d="M78 288c27-54 75-91 145-111l133-33c52-76 112-108 206-108h97c74 0 126 33 187 108l73 23c28 9 46 31 52 65l8 65H55l23-9Z"
        fill="url(#landing-body)"
        stroke="rgba(255,255,255,.2)"
        strokeWidth="3"
      />
      <path
        d="M382 142c49-61 99-83 178-83h93c51 0 92 24 143 83H382Z"
        fill="url(#landing-glass)"
        opacity=".86"
      />
      <path
        d="M579 61v80M365 148h448"
        stroke="rgba(255,255,255,.18)"
        strokeWidth="3"
      />
      <path
        d="M78 245h112M817 222h122"
        stroke="#a8c6ff"
        strokeLinecap="round"
        strokeWidth="11"
        opacity=".72"
      />
      <circle
        cx="252"
        cy="294"
        r="77"
        fill="#070908"
        stroke="#333a35"
        strokeWidth="13"
      />
      <circle
        cx="252"
        cy="294"
        r="39"
        fill="#7e8780"
        stroke="#161b18"
        strokeWidth="12"
      />
      <circle
        cx="757"
        cy="294"
        r="77"
        fill="#070908"
        stroke="#333a35"
        strokeWidth="13"
      />
      <circle
        cx="757"
        cy="294"
        r="39"
        fill="#7e8780"
        stroke="#161b18"
        strokeWidth="12"
      />
    </svg>
  );
}

function StageCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CircleGauge;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-xl">
      <div className="flex items-center gap-2 text-[10px] tracking-[0.12em] text-white/35 uppercase">
        <Icon className="size-3" /> {label}
      </div>
      <p className="mt-2 text-sm font-medium text-white/82">{value}</p>
    </div>
  );
}

function Signal({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex items-center gap-4 py-5 md:px-6 first:md:pl-0">
      <span className="text-xs text-[#3978d9]">{number}</span>
      <span className="text-sm text-[#151713]/52">{label}</span>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="grid gap-7 lg:grid-cols-[1fr_0.7fr] lg:items-end">
      <div>
        <p className="text-xs font-semibold tracking-[0.18em] text-[#3978d9] uppercase">
          {eyebrow}
        </p>
        <h2 className="mt-5 max-w-4xl text-4xl leading-[0.98] font-medium tracking-[-0.055em] text-balance sm:text-6xl">
          {title}
        </h2>
      </div>
      <p className="max-w-xl text-base leading-7 text-[#151713]/48 lg:justify-self-end">
        {description}
      </p>
    </div>
  );
}

function FeatureCard({
  className,
  icon: Icon,
  eyebrow,
  title,
  description,
  visual,
}: {
  className: string;
  icon: typeof CircleGauge;
  eyebrow: string;
  title: string;
  description: string;
  visual: React.ReactNode;
}) {
  return (
    <article
      className={`overflow-hidden rounded-[2rem] border border-[#151713]/10 bg-white/42 ${className}`}
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs tracking-[0.14em] text-[#3978d9] uppercase">
          <Icon className="size-4" /> {eyebrow}
        </div>
        <h3 className="mt-8 max-w-xl text-2xl font-medium tracking-[-0.035em] sm:text-3xl">
          {title}
        </h3>
        <p className="mt-4 max-w-xl text-sm leading-6 text-[#151713]/45">
          {description}
        </p>
      </div>
      <div className="px-4 pb-4 sm:px-6 sm:pb-6">{visual}</div>
    </article>
  );
}

function GarageVisual() {
  return (
    <div className="relative min-h-64 overflow-hidden rounded-2xl bg-[#0b0e0c] p-5 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_45%,rgba(116,167,255,0.25),transparent_32%)]" />
      <p className="relative text-xs text-white/35">PROJECT 318</p>
      <div className="absolute right-[10%] bottom-[22%] left-[10%] h-20 rounded-[50%] bg-[#74a7ff]/14 blur-3xl" />
      <div className="absolute right-5 bottom-5 left-5 flex items-end justify-between">
        <div>
          <p className="text-xs text-white/35">2011 BMW</p>
          <p className="mt-1 text-xl font-medium">318i · E90</p>
        </div>
        <p className="text-sm text-white/45">148,200 km</p>
      </div>
    </div>
  );
}

function MaintenanceVisual() {
  return (
    <div className="space-y-2 rounded-2xl bg-[#ebe7dd] p-4">
      {[
        ["Brake fluid", "Due now", "text-red-600"],
        ["Engine oil", "Due soon", "text-amber-600"],
        ["Cabin filter", "Up to date", "text-emerald-700"],
      ].map(([name, state, color]) => (
        <div
          key={name}
          className="flex items-center justify-between rounded-xl bg-[#f8f6f0] p-4"
        >
          <span className="text-sm font-medium">{name}</span>
          <span className={`text-xs ${color}`}>{state}</span>
        </div>
      ))}
    </div>
  );
}

function BuildVisual() {
  return (
    <div className="rounded-2xl bg-[#ebe7dd] p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Stealth Rear</span>
        <span className="text-xs text-[#151713]/35">67%</span>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#151713]/8">
        <div className="h-full w-2/3 rounded-full bg-[#3978d9]" />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <MiniStat label="Budget" value="€1,200" />
        <MiniStat label="Planned" value="€804" />
      </div>
    </div>
  );
}

function PartsVisual() {
  return (
    <div className="grid gap-2 rounded-2xl bg-[#ebe7dd] p-4 sm:grid-cols-2">
      <div className="rounded-xl bg-[#f8f6f0] p-4">
        <BadgeCheck className="size-4 text-emerald-700" />
        <p className="mt-8 text-xs text-[#151713]/40">Platform</p>
        <p className="mt-1 text-sm font-medium">E90 matches</p>
      </div>
      <div className="rounded-xl bg-[#f8f6f0] p-4">
        <ShieldCheck className="size-4 text-amber-600" />
        <p className="mt-8 text-xs text-[#151713]/40">Still verify</p>
        <p className="mt-1 text-sm font-medium">Connector + approval</p>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#f8f6f0] p-3">
      <p className="text-[10px] tracking-[0.1em] text-[#151713]/35 uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function EvidencePanel() {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#121713]">
      <div className="flex items-center justify-between border-b border-white/8 p-6">
        <div>
          <p className="text-xs tracking-[0.14em] text-white/30 uppercase">
            Fitment evidence
          </p>
          <p className="mt-2 font-medium">Dark-red rear lamp set</p>
        </div>
        <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-xs text-amber-200">
          Conditional
        </span>
      </div>
      <div className="divide-y divide-white/8">
        {[
          ["Platform", "E90", true],
          ["Year", "2011", true],
          ["Body", "Sedan", true],
          ["Connector", "Needs confirmation", false],
        ].map(([label, value, matched]) => (
          <div
            key={String(label)}
            className="grid grid-cols-[110px_1fr_auto] items-center gap-4 p-5"
          >
            <span className="text-xs text-white/30">{label}</span>
            <span className="text-sm text-white/65">{value}</span>
            {matched ? (
              <Check className="size-4 text-emerald-300" />
            ) : (
              <ShieldCheck className="size-4 text-amber-200" />
            )}
          </div>
        ))}
      </div>
      <div className="grid gap-px bg-white/8 sm:grid-cols-3">
        <PanelStat icon={Euro} label="Price" value="Next epic" />
        <PanelStat icon={Wrench} label="Install" value="Moderate" />
        <PanelStat icon={ShieldCheck} label="Approval" value="Unverified" />
      </div>
    </div>
  );
}

function PanelStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Euro;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-[#121713] p-5">
      <Icon className="size-4 text-[#8ab7ff]" />
      <p className="mt-5 text-[10px] tracking-[0.12em] text-white/28 uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm text-white/65">{value}</p>
    </div>
  );
}
