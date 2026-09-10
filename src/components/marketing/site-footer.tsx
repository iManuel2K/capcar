import Link from "next/link";
import { CapcarWordmark } from "@/components/brand/capcar-wordmark";
const links = {
  Explore: [
    ["Parts", "/parts-search"],
    ["Concept Studio", "/studio"],
    ["Sound Studio", "/sound-studio"],
    ["Marketplace", "/marketplace"],
  ],
  Capcar: [
    ["Roadmap", "/roadmap"],
    ["FAQ", "/#faq"],
    ["Privacy", "/privacy"],
    ["Terms", "/terms"],
    ["Imprint", "/imprint"],
  ],
};
export function SiteFooter() {
  return (
    <footer className="border-t border-[#0e2d30]/15 bg-[#e8e6d7] px-5 py-10 text-[#0e2d30] sm:px-8">
      <div className="mx-auto grid max-w-[1500px] gap-8 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <Link href="/" aria-label="Capcar home" className="inline-block">
            <CapcarWordmark glow={false} />
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-[#0e2d30]/75">
            Your cars, your plans, your next workshop session.
          </p>
          <Link
            href="/garage"
            className="mt-4 inline-flex min-h-11 items-center font-medium underline underline-offset-4"
          >
            Open your garage →
          </Link>
        </div>
        {Object.entries(links).map(([group, items]) => (
          <nav key={group} aria-label={`${group} footer`}>
            <h2 className="mb-2 text-xs font-semibold tracking-widest uppercase">
              {group}
            </h2>
            <ul>
              {items.map(([label, href]) => (
                <li key={href}>
                  <Link
                    className="inline-flex min-h-11 items-center text-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
                    href={href}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <p className="mx-auto mt-8 max-w-[1500px] border-t border-[#0e2d30]/15 pt-5 text-xs leading-6 text-[#0e2d30]/75">
        Confirm fitment, safety requirements and road approval before
        installation.
      </p>
    </footer>
  );
}
