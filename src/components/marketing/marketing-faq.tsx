import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";

const questions = [
  {
    question: "What is Capcar trying to solve?",
    answer:
      "Car projects are usually split across notes, retailer tabs, forums and spreadsheets. Capcar brings the vehicle, maintenance, parts, costs and build plan into one garage.",
  },
  {
    question: "Who is building Capcar?",
    answer:
      "Capcar is being built by a car enthusiast who enjoys driving, working on cars and that simple feeling of warm air through an open window. The goal is practical: make projects easier to understand, organize and finish.",
  },
  {
    question: "Is Capcar free during the Beta?",
    answer:
      "Yes. The Beta is free while the core garage is tested with real users. If paid features arrive later, the basic garage and your own exported data will remain accessible.",
  },
  {
    question: "Does Capcar guarantee that a part fits?",
    answer:
      "No. Capcar helps organize fitment evidence and flags uncertainty, but users should still confirm part numbers, vehicle specifications and legal requirements before buying or installing.",
  },
  {
    question: "Why do I need an account?",
    answer:
      "Your account keeps your vehicles and project history private and available across sessions. It also prevents one user’s garage from mixing with another user’s data.",
  },
  {
    question: "What is coming next?",
    answer:
      "Interactive cars, sound previews, OBD-II tools, events and AI-supported build concepts are part of the public direction. The roadmap explains the order without promising fictional dates.",
  },
] as const;

export function MarketingFaq() {
  return (
    <section
      id="faq"
      className="scroll-mt-20 border-y border-[#0e2d30]/10 bg-[#e8e6d7] text-[#0e2d30]"
    >
      <div className="mx-auto grid max-w-[1500px] gap-12 px-5 py-20 sm:px-8 sm:py-32 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#6d0101] uppercase">
            FAQ
          </p>
          <h2 className="mt-4 max-w-lg text-4xl leading-[0.94] font-medium tracking-[-0.055em] sm:text-6xl">
            A clearer way to build.
          </h2>
          <p className="mt-6 max-w-md text-base leading-7 text-[#0e2d30]/58">
            The short version of what Capcar is, who it is for and where it is
            going.
          </p>
          <Link
            href="/roadmap"
            className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#0e2d30] px-5 text-sm font-semibold text-[#e8e6d7] transition hover:bg-[#6d0101]"
          >
            Read the roadmap <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="border-t border-[#0e2d30]/16">
          {questions.map((item) => (
            <details
              key={item.question}
              className="group border-b border-[#0e2d30]/16"
            >
              <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-medium tracking-[-0.02em] marker:hidden sm:min-h-24 sm:text-xl [&::-webkit-details-marker]:hidden">
                {item.question}
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-[#0e2d30]/14 transition group-open:rotate-45 group-open:bg-[#6d0101] group-open:text-white">
                  <Plus className="size-4" />
                </span>
              </summary>
              <p className="max-w-2xl pr-12 pb-7 text-sm leading-7 text-[#0e2d30]/62 sm:text-base">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
