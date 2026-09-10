import Link from "next/link";
import { ArrowLeft, ArrowRight, Circle } from "lucide-react";

import { CapcarWordmark } from "@/components/brand/capcar-wordmark";
import { MarketingHeader } from "@/components/marketing/marketing-header";

const columns = [
  {
    label: "Live now",
    title: "The foundation",
    tone: "#6d0101",
    items: [
      {
        title: "Private digital garage",
        description:
          "Create vehicles, keep their identity current and sync the garage to your account.",
      },
      {
        title: "Maintenance and diagnostics",
        description:
          "Track service work, known problems and manual diagnostic fault logs.",
      },
      {
        title: "Build planning",
        description:
          "Organize upgrades, budgets, wishlists, fitment evidence and installation history.",
      },
      {
        title: "Vehicle passport",
        description:
          "Keep a shareable record of the car, completed work and project history.",
      },
    ],
  },
  {
    label: "In beta · still expanding",
    title: "Make it tangible",
    tone: "#92644d",
    items: [
      {
        title: "Interactive vehicle models",
        description:
          "Selected 3D references are available. Vehicle-specific configurable models are still expanding.",
      },
      {
        title: "Iconic movie-car demos",
        description:
          "Planned: licensed movie-car replicas. Current showcase references and original sketches are not movie replicas.",
      },
      {
        title: "Sound studio",
        description:
          "Play credited recordings and upload your own. The library is growing; exact stock-versus-modified pairs remain limited.",
      },
      {
        title: "OBD-II and verified work",
        description:
          "Import scans and request specialist confirmation. Direct hardware connections and specialist coverage remain in development.",
      },
      {
        title: "Connected parts",
        description:
          "Retailer search and moderated listings are in beta. Availability depends on provider access; direct checkout is planned.",
      },
    ],
  },
  {
    label: "Later",
    title: "Beyond the car",
    tone: "#0e2d30",
    items: [
      {
        title: "Events worth driving to",
        description:
          "Discover nearby meets, shows and destination events that match your interests.",
      },
      {
        title: "AI build direction",
        description:
          "Generate useful upgrade ideas and visual concepts around the vehicle you own.",
      },
      {
        title: "Motorcycles and bicycles",
        description:
          "Use the same garage structure for two-wheeled projects and their history.",
      },
      {
        title: "Surfboards and more",
        description:
          "Turn Capcar into one considered home for the projects and equipment you care about.",
      },
    ],
  },
] as const;

export function RoadmapPage() {
  return (
    <div className="min-h-dvh bg-[#e8e6d7] text-[#0e2d30]">
      <MarketingHeader />
      <main>
        <section className="px-2 pb-2 sm:px-4 sm:pb-4 lg:px-6 lg:pb-6">
          <div className="relative mx-auto flex min-h-[520px] max-w-[1500px] items-end overflow-hidden rounded-[1.75rem] bg-[radial-gradient(circle_at_83%_10%,rgba(232,230,215,0.22),transparent_27%),linear-gradient(145deg,#92644d_0%,#6d3d35_42%,#0e2d30_100%)] p-6 text-[#e8e6d7] sm:min-h-[610px] sm:rounded-[2.5rem] sm:p-12 lg:p-16">
            <div className="absolute -top-28 -right-20 size-80 rounded-full border border-white/10" />
            <div className="absolute top-24 right-[16%] size-48 rounded-full border border-white/8" />
            <div className="relative max-w-3xl">
              <p className="text-xs font-semibold tracking-[0.22em] text-white/58 uppercase">
                Product roadmap
              </p>
              <h1 className="mt-5 text-5xl leading-[0.88] font-medium tracking-[-0.065em] sm:text-7xl lg:text-8xl">
                Where Capcar is going.
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-7 text-white/68 sm:text-lg">
                A practical view of what works today, what comes next and how
                Capcar grows from a car app into a garage for every project.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#e8e6d7] px-5 text-sm font-semibold text-[#0e2d30]"
                >
                  Build your car <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/18 px-5 text-sm font-medium text-white/78"
                >
                  <ArrowLeft className="size-4" /> Back to Capcar
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8 sm:py-28">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.2em] text-[#6d0101] uppercase">
              Now, next, later
            </p>
            <h2 className="mt-4 text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
              Direction without fake deadlines.
            </h2>
            <p className="mt-5 leading-7 text-[#0e2d30]/58">
              The order matters more than a date. Beta feedback can move an idea
              forward or show that something simpler is more useful.
            </p>
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-3 lg:gap-0">
            {columns.map((column, columnIndex) => (
              <article
                key={column.title}
                className="lg:border-l lg:border-[#0e2d30]/12 lg:px-8 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0"
              >
                <div className="flex items-center gap-3">
                  <Circle
                    className="size-3 fill-current"
                    style={{ color: column.tone }}
                  />
                  <span
                    className="rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase"
                    style={{
                      color: column.tone,
                      backgroundColor: `${column.tone}14`,
                    }}
                  >
                    {column.label}
                  </span>
                </div>
                <h3 className="mt-5 text-3xl font-medium tracking-[-0.04em]">
                  {column.title}
                </h3>
                <ol className="mt-8">
                  {column.items.map((item, itemIndex) => (
                    <li
                      key={item.title}
                      className="grid grid-cols-[28px_1fr] gap-3 border-t border-[#0e2d30]/12 py-6"
                    >
                      <span
                        className="pt-0.5 text-[10px] font-semibold"
                        style={{ color: column.tone }}
                      >
                        {String(columnIndex * 5 + itemIndex + 1).padStart(
                          2,
                          "0",
                        )}
                      </span>
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="mt-2 text-sm leading-6 text-[#0e2d30]/55">
                          {item.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-[#0e2d30] px-5 py-20 text-[#e8e6d7] sm:px-8 sm:py-28">
          <div className="mx-auto grid max-w-[1100px] gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <p className="text-xs font-semibold tracking-[0.2em] text-[#bf8269] uppercase">
              How we decide
            </p>
            <div>
              <h2 className="text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
                Useful before impressive.
              </h2>
              <p className="mt-5 max-w-2xl leading-7 text-white/52">
                Capcar ships the tools that make ownership and projects clearer
                first. Visual technology earns its place when it helps someone
                make a better decision—not only because it looks good.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1100px] px-5 py-20 sm:px-8 sm:py-28">
          <div className="rounded-[1.75rem] border border-[#0e2d30]/12 bg-[#88988d] p-7 sm:rounded-[2.25rem] sm:p-12">
            <p className="text-xs font-semibold tracking-[0.2em] text-[#6d0101] uppercase">
              Beta feedback
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
              Help shape what comes next.
            </h2>
            <p className="mt-5 max-w-2xl leading-7 text-[#0e2d30]/64">
              Use the garage with your own car and tell us where the work still
              feels unclear.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#6d0101] px-5 text-sm font-semibold text-white"
            >
              Open your garage <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-[1500px] flex-col justify-between gap-6 border-t border-[#0e2d30]/10 px-5 py-10 sm:flex-row sm:items-center sm:px-8">
        <CapcarWordmark glow={false} />
        <p className="text-xs text-[#0e2d30]/48">
          Roadmap direction may change with Beta feedback.
        </p>
        <Link href="/" className="text-sm font-medium">
          Back to Capcar →
        </Link>
      </footer>
    </div>
  );
}
