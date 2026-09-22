import Image from "next/image";

type CapcarWordmarkProps = {
  compact?: boolean;
  glow?: boolean;
};

export function CapcarWordmark({
  compact = false,
  glow = true,
}: CapcarWordmarkProps) {
  return (
    <div className="inline-flex items-center gap-1.5" aria-label="CapCar">
      <span
        className={`relative block h-10 w-14 shrink-0 ${glow ? "drop-shadow-[0_4px_12px_rgba(255,79,139,0.2)]" : ""}`}
      >
        <Image
          src="/capcar-mark.png"
          alt=""
          aria-hidden="true"
          fill
          sizes="56px"
          className="object-contain"
        />
      </span>
      {!compact && (
        <span className="text-sm font-medium tracking-[0.18em] text-current">
          CAPCAR
        </span>
      )}
    </div>
  );
}
