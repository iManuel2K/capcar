import { Route } from "lucide-react";

type CapcarWordmarkProps = {
  compact?: boolean;
};

export function CapcarWordmark({ compact = false }: CapcarWordmarkProps) {
  return (
    <div className="inline-flex items-center gap-2.5" aria-label="Capcar">
      <span className="grid size-8 place-items-center rounded-[10px] bg-[var(--capcar-blue)] text-[#07101d]">
        <Route aria-hidden="true" className="size-4" />
      </span>
      {!compact && (
        <span className="text-sm font-medium tracking-[0.18em] text-current">
          CAPCAR
        </span>
      )}
    </div>
  );
}
