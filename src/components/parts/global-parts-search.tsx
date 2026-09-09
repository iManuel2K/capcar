import { Search } from "lucide-react";

export function GlobalPartsSearch({
  theme = "light",
  expanded = false,
}: {
  theme?: "light" | "dark";
  expanded?: boolean;
}) {
  const dark = theme === "dark";
  return (
    <form
      action="/parts-search"
      role="search"
      className={expanded ? "w-full" : "w-52 xl:w-64"}
    >
      <label
        className="sr-only"
        htmlFor={`global-parts-${theme}-${expanded ? "expanded" : "compact"}`}
      >
        Search parts, fitment and cross-references
      </label>
      <div
        className={`flex min-h-11 items-center rounded-full border px-3 transition focus-within:ring-2 ${dark ? "border-white/10 bg-white/[0.04] focus-within:ring-[#e72d45]/40" : "border-[#0e2d30]/14 bg-white/35 focus-within:ring-[#6d0101]/25"}`}
      >
        <Search
          className={`size-4 shrink-0 ${dark ? "text-white/40" : "text-[#0e2d30]/45"}`}
          aria-hidden="true"
        />
        <input
          id={`global-parts-${theme}-${expanded ? "expanded" : "compact"}`}
          name="q"
          type="search"
          maxLength={80}
          placeholder="Part no., name, chassis…"
          className={`min-w-0 flex-1 bg-transparent px-2 text-sm outline-none ${dark ? "text-white placeholder:text-white/30" : "text-[#0e2d30] placeholder:text-[#0e2d30]/42"}`}
        />
        <button
          type="submit"
          className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${dark ? "text-[#ff667a]" : "text-[#6d0101]"}`}
        >
          Find
        </button>
      </div>
    </form>
  );
}
