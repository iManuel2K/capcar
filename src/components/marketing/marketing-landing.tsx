import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CircleGauge,
  Euro,
  Layers3,
  ShoppingBag,
  Wrench,
} from "lucide-react";

import { CapcarWordmark } from "@/components/brand/capcar-wordmark";
import { FitmentLookup } from "@/components/marketing/fitment-lookup";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { ProductDashboardPreview } from "@/components/marketing/product-dashboard-preview";
import { VisionRoadmapSection } from "@/components/marketing/vision-roadmap-section";

export function MarketingLanding() {
  return (
    <div className="min-h-dvh overflow-hidden bg-[#e8e6d7] text-[#0e2d30]">
      <main>
        <MarketingHero />
        <ProductDashboardPreview />
        <VisionRoadmapSection />

        <section id="platform" className="bg-[#050306] text-[#e8e6d7]">
          <div className="mx-auto w-full max-w-[1500px] px-5 py-20 sm:px-8 sm:py-32">
            <SectionHeading
              eyebrow="The platform"
              title="One car. One system."
              description="Maintain it. Plan it. Build it."
              tone="dark"
            />

            <div className="mt-10 grid gap-4 sm:mt-14 sm:gap-5 lg:grid-cols-12">
              <article className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#111111] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#92644d]/50 sm:rounded-[2rem] sm:p-8 lg:col-span-7">
                <CardLabel icon={CircleGauge}>Garage</CardLabel>
                <h3 className="mt-6 text-2xl font-medium tracking-[-0.04em] sm:mt-8 sm:text-3xl">
                  Your car, fully documented.
                </h3>
                <GaragePreview />
              </article>

              <article className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#111111] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#92644d]/50 sm:rounded-[2rem] sm:p-8 lg:col-span-5">
                <CardLabel icon={Wrench}>Maintenance</CardLabel>
                <h3 className="mt-6 text-2xl font-medium tracking-[-0.04em] sm:mt-8 sm:text-3xl">
                  Stay ahead of service.
                </h3>
                <MaintenancePreview />
              </article>

              <article className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#111111] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#92644d]/50 sm:rounded-[2rem] sm:p-8 lg:col-span-5">
                <CardLabel icon={Layers3}>Build</CardLabel>
                <h3 className="mt-6 text-2xl font-medium tracking-[-0.04em] sm:mt-8 sm:text-3xl">
                  Plan before you buy.
                </h3>
                <BuildPreview />
              </article>

              <article className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#111111] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#92644d]/50 sm:rounded-[2rem] sm:p-8 lg:col-span-7">
                <CardLabel icon={ShoppingBag}>Parts</CardLabel>
                <h3 className="mt-6 text-2xl font-medium tracking-[-0.04em] sm:mt-8 sm:text-3xl">
                  Choose with confidence.
                </h3>
                <PartsPreview />
              </article>
            </div>
          </div>
        </section>

        <section className="border-y border-[#0e2d30]/8 bg-[#88988d] py-5">
          <div className="mx-auto flex max-w-[1500px] snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-8">
            <PhotoDetail
              src="/capcar-hero-bmw-e90.jpeg"
              alt="Black BMW E90 side profile"
              label="The car"
            />
            <PhotoDetail
              src="/capcar-detail-rain.jpeg"
              alt="Rain on the black BMW E90"
              label="The details"
            />
            <PhotoDetail
              src="/capcar-detail-distance.jpeg"
              alt="Black BMW E90 photographed through foliage"
              label="The history"
            />
          </div>
        </section>

        <section
          id="projects"
          className="mx-auto w-full max-w-[1500px] px-5 py-20 sm:px-8 sm:py-36"
        >
          <SectionHeading
            eyebrow="Community builds"
            title="Real plans. Measurable progress."
            description="Builds with mileage, parts and total cost kept visible."
          />

          <div className="-mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:mt-14 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0">
            <ProjectCard
              image="/capcar-hero-bmw-vision.png"
              name="Project Street Terrorist"
              vehicle="2011 BMW 318i · E90"
              direction="Street OEM+"
              status="In progress"
              stage="Stage 2 of 4"
              kilometres="148,200 km"
              parts="8 parts"
              cost="€3,480"
            />
            <ProjectCard
              image="/capcar-project-f150.png"
              name="Project Night Shift"
              vehicle="Ford F-150"
              direction="Street overland"
              status="Concept"
              stage="Stage 1 of 4"
              kilometres="63,400 km"
              parts="14 parts"
              cost="€8,920"
            />
            <ProjectCard
              image="/capcar-project-eclass.png"
              name="Project Blackline"
              vehicle="Mercedes-Benz E-Class · W213"
              direction="Executive OEM+"
              status="Concept"
              stage="Stage 1 of 3"
              kilometres="78,900 km"
              parts="6 parts"
              cost="€4,760"
            />
            <ProjectCard
              image="/capcar-project-gti-tcr.png"
              name="Project Redline"
              vehicle="Volkswagen Golf GTI TCR"
              direction="Fast road"
              status="Concept"
              stage="Stage 2 of 5"
              kilometres="54,800 km"
              parts="11 parts"
              cost="€6,340"
            />
          </div>
        </section>

        <section
          id="fitment"
          className="border-y border-[#0e2d30]/15 bg-[#88988d] text-[#050306]"
        >
          <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-16 sm:px-8 sm:py-32 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-[#0e2d30]/68 uppercase">
                Fitment
              </p>
              <h2 className="mt-4 text-4xl leading-[0.92] font-medium tracking-[-0.055em] sm:mt-5 sm:text-7xl">
                Buy the right part.
              </h2>
              <p className="mt-6 max-w-md text-base leading-7 text-[#0e2d30]/72">
                Compatibility and requirements before checkout.
              </p>
              <Link
                href="/register"
                className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#6d0101] px-5 text-sm font-semibold text-[#e8e6d7] transition hover:-translate-y-0.5 hover:bg-[#050306]"
              >
                Start with your car <ArrowRight className="size-4" />
              </Link>
            </div>
            <FitmentLookup />
          </div>
        </section>

        <section className="bg-[#88988d] px-5 py-5 sm:px-8 sm:py-8">
          <div className="relative mx-auto min-h-[330px] max-w-[1500px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0e2d30] px-6 py-10 text-[#e8e6d7] shadow-[0_30px_90px_rgba(20,34,28,0.18)] sm:min-h-[430px] sm:rounded-[2.5rem] sm:px-12 sm:py-14 lg:px-20">
            <div className="absolute top-0 right-0 h-full w-1/2 bg-[radial-gradient(circle_at_center,rgba(231,45,69,0.22),transparent_65%)]" />
            <div className="relative z-10 flex min-h-[250px] max-w-4xl flex-col justify-between sm:min-h-[320px]">
              <span className="h-1 w-16 rounded-full bg-[#6d0101]" />
              <div>
                <h2 className="text-4xl leading-[0.94] font-medium tracking-[-0.055em] sm:text-7xl sm:tracking-[-0.06em] lg:text-8xl">
                  Your garage starts here.
                </h2>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/register"
                    className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[#6d0101] px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#830705]"
                  >
                    Open your garage <ArrowRight className="size-4" />
                  </Link>
                  <a
                    href="#live-demo"
                    className="inline-flex min-h-13 items-center justify-center rounded-full border border-white/12 px-6 text-sm font-medium text-white/65 transition hover:border-white/25 hover:text-white"
                  >
                    Live demo
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-[1500px] flex-col justify-between gap-7 px-5 py-12 text-[#0e2d30] sm:flex-row sm:items-center sm:px-8">
        <CapcarWordmark glow={false} />
        <p className="max-w-xl text-xs leading-5 text-[#0e2d30]/48">
          Confirm fitment, safety requirements and legal approval before
          installation.
        </p>
        <Link
          href="/register"
          className="text-sm font-medium text-[#0e2d30]/75"
        >
          Open garage →
        </Link>
      </footer>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  tone = "light",
}: {
  eyebrow: string;
  title: string;
  description: string;
  tone?: "light" | "dark";
}) {
  return (
    <div className="grid gap-7 lg:grid-cols-[1fr_0.55fr] lg:items-end">
      <div>
        <p
          className={`text-xs font-semibold tracking-[0.2em] uppercase ${tone === "dark" ? "text-[#bf8269]" : "text-[#6d0101]"}`}
        >
          {eyebrow}
        </p>
        <h2 className="mt-4 max-w-4xl text-4xl leading-[0.94] font-medium tracking-[-0.055em] sm:mt-5 sm:text-7xl sm:leading-[0.92] sm:tracking-[-0.06em]">
          {title}
        </h2>
      </div>
      <p
        className={`text-base leading-7 lg:justify-self-end ${tone === "dark" ? "text-white/42" : "text-[#0e2d30]/55"}`}
      >
        {description}
      </p>
    </div>
  );
}

function CardLabel({
  icon: Icon,
  children,
}: {
  icon: typeof CircleGauge;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-[#bf8269] uppercase">
      <Icon className="size-4" /> {children}
    </div>
  );
}

function GaragePreview() {
  return (
    <div className="mt-9 rounded-2xl border border-white/8 bg-[#050306] p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-white/34">PROJECT 318</p>
          <p className="mt-2 text-xl font-medium">2011 BMW 318i</p>
        </div>
        <span className="rounded-full border border-[#6d0101]/30 bg-[#6d0101]/10 px-3 py-1.5 text-xs text-[#bf8269]">
          Active
        </span>
      </div>
      <div className="mt-8 grid grid-cols-3 divide-x divide-white/8">
        <PreviewStat label="Platform" value="E90" />
        <PreviewStat label="Mileage" value="148,200" />
        <PreviewStat label="Builds" value="1 active" />
      </div>
    </div>
  );
}

function MaintenancePreview() {
  return (
    <div className="mt-9 space-y-2">
      {[
        ["Brake fluid", "Due now", "text-[#bf8269]"],
        ["Engine oil", "1,800 km", "text-amber-300"],
        ["Cabin filter", "Complete", "text-emerald-300"],
      ].map(([name, state, color]) => (
        <div
          key={name}
          className="flex items-center justify-between rounded-xl border border-white/8 bg-[#050306] p-4"
        >
          <span className="text-sm font-medium">{name}</span>
          <span className={`text-xs ${color}`}>{state}</span>
        </div>
      ))}
    </div>
  );
}

function BuildPreview() {
  return (
    <div className="mt-9 rounded-2xl border border-white/8 bg-[#050306] p-5">
      <div className="flex items-center justify-between">
        <span className="font-medium">Stealth Rear</span>
        <span className="text-xs text-white/36">Planning</span>
      </div>
      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/8">
        <div className="h-full w-2/3 rounded-full bg-[#6d0101]" />
      </div>
      <div className="mt-7 grid grid-cols-2 gap-2">
        <PreviewStat label="Budget" value="€1,200" />
        <PreviewStat label="Planned" value="€804" />
      </div>
    </div>
  );
}

function PartsPreview() {
  return (
    <div className="mt-9 grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border border-white/8 bg-[#050306] p-5">
        <BadgeCheck className="size-5 text-emerald-300" />
        <p className="mt-8 text-xs text-white/34">Vehicle match</p>
        <p className="mt-2 font-medium">E90 · 2011 · Sedan</p>
      </div>
      <div className="rounded-2xl border border-white/8 bg-[#050306] p-5">
        <Euro className="size-5 text-[#bf8269]" />
        <p className="mt-8 text-xs text-white/34">Delivered from</p>
        <p className="mt-2 font-medium">€248</p>
      </div>
    </div>
  );
}

function PhotoDetail({
  src,
  alt,
  label,
}: {
  src: string;
  alt: string;
  label: string;
}) {
  return (
    <figure className="group relative h-64 w-[78vw] shrink-0 snap-center overflow-hidden rounded-2xl bg-[#050306] sm:h-96 sm:w-auto">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 640px) 33vw, 100vw"
        className="object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-transparent to-transparent" />
      <figcaption className="absolute right-5 bottom-5 left-5 text-sm font-medium">
        {label}
      </figcaption>
    </figure>
  );
}

function ProjectCard({
  image,
  name,
  vehicle,
  direction,
  status,
  stage,
  kilometres,
  parts,
  cost,
}: {
  image: string;
  name: string;
  vehicle: string;
  direction: string;
  status: string;
  stage: string;
  kilometres: string;
  parts: string;
  cost: string;
}) {
  return (
    <article className="group relative min-h-[400px] w-[86vw] max-w-[620px] shrink-0 snap-center overflow-hidden rounded-[1.6rem] border border-[#0e2d30]/12 bg-[#050306] text-white sm:min-h-[510px] sm:w-auto sm:max-w-none sm:rounded-[2rem]">
      <Image
        src={image}
        alt={`${vehicle}, ${name} project`}
        fill
        sizes="(min-width: 640px) 50vw, 86vw"
        className="object-cover transition duration-700 ease-out group-hover:scale-[1.025]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.12)_28%,rgba(5,5,5,0.9)_100%)]" />

      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 sm:p-7">
        <span className="rounded-full border border-white/14 bg-black/45 px-3 py-1.5 text-xs font-medium text-white/72 backdrop-blur-xl">
          {direction}
        </span>
        <span
          className={`rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-xl ${
            status === "In progress"
              ? "border-[#bf8269]/35 bg-[#6d0101]/45 text-[#e8e6d7]"
              : "border-white/14 bg-black/45 text-white/58"
          }`}
        >
          {status}
        </span>
      </div>

      <div className="absolute right-0 bottom-0 left-0 p-6 sm:p-8">
        <p className="text-sm text-white/52">{vehicle}</p>
        <h3 className="mt-2 text-3xl font-medium tracking-[-0.045em] sm:text-4xl">
          {name}
        </h3>
        <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/12 pt-4">
          <ProjectMetric label="Logged" value={kilometres} />
          <ProjectMetric label="Parts" value={parts} />
          <ProjectMetric label="Build cost" value={cost} />
        </div>
        <div className="mt-4 flex items-center justify-between text-[11px] text-white/42">
          <span>{stage}</span>
          <span className="inline-flex items-center gap-1.5 text-emerald-200/75">
            <BadgeCheck className="size-3.5" /> Verified builder
          </span>
        </div>
      </div>
    </article>
  );
}

function ProjectMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] tracking-[0.1em] text-white/28 uppercase">
        {label}
      </p>
      <p className="mt-1 text-xs font-medium text-white/72">{value}</p>
    </div>
  );
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 first:pl-0 last:pr-0">
      <p className="text-[10px] tracking-[0.11em] text-white/30 uppercase">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium">{value}</p>
    </div>
  );
}
