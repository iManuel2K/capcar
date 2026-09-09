import {
  ClipboardCheck,
  FileBadge2,
  ScanLine,
  SearchCheck,
} from "lucide-react";
import Link from "next/link";

const tools = [
  { label: "OBD Scanner", segment: "diagnostics", icon: ScanLine },
  { label: "Passport", segment: "passport", icon: FileBadge2 },
  { label: "Fitment", segment: "parts", icon: SearchCheck },
  { label: "Maintenance Log", segment: "maintenance", icon: ClipboardCheck },
] as const;

export function GarageToolRail({
  vehicleId,
  pathname,
}: {
  vehicleId: string;
  pathname: string;
}) {
  return (
    <aside aria-label="Active vehicle tools" className="hidden lg:block">
      <div className="sticky top-26 rounded-[1.5rem] border border-white/10 bg-[#111411]/92 p-2 shadow-xl backdrop-blur-xl">
        <p className="px-2 pt-1 pb-2 text-[9px] font-semibold tracking-[0.14em] text-white/28 uppercase">
          Car tools
        </p>
        <nav className="grid gap-1">
          {tools.map(({ label, segment, icon: Icon }) => {
            const href = `/garage/${vehicleId}/${segment}`;
            const active = pathname.startsWith(href);
            return (
              <Link
                key={segment}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`group flex min-h-13 items-center gap-3 rounded-xl px-3 text-xs transition duration-200 ${active ? "bg-[#e72d45] text-white" : "text-white/48 hover:bg-white/6 hover:text-white"}`}
              >
                <Icon className="size-4 shrink-0 transition group-hover:scale-110" />
                <span className="leading-4">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
