import Image from "next/image";
import { Gauge, Zap } from "lucide-react";

export function VehicleArt({
  label,
  compact = false,
  imageUrl,
  badge,
}: {
  label: string;
  compact?: boolean;
  imageUrl?: string;
  badge?: string;
}) {
  return (
    <div
      aria-label={`Vehicle visual for ${label}`}
      className={`relative isolate overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#101512] ${compact ? "min-h-52" : "min-h-[360px] lg:min-h-[470px]"}`}
      role="img"
    >
      {imageUrl && (
        <Image
          alt={label}
          className="object-cover transition duration-700 group-hover:scale-[1.025]"
          fill
          sizes={
            compact
              ? "(min-width: 1280px) 50vw, 100vw"
              : "(min-width: 1024px) 58vw, 100vw"
          }
          src={imageUrl}
        />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(7,7,7,0.72),transparent_48%),radial-gradient(circle_at_58%_44%,rgba(231,45,69,0.2),transparent_38%)]" />
      <div className="absolute inset-x-[10%] bottom-[16%] h-[12%] rounded-full bg-black/80 blur-2xl" />
      {!imageUrl && (
        <svg
          aria-hidden="true"
          className={`absolute top-1/2 left-1/2 w-[88%] -translate-x-1/2 -translate-y-[42%] ${compact ? "max-w-[480px]" : "max-w-[860px]"}`}
          viewBox="0 0 900 300"
        >
          <defs>
            <linearGradient id="capcar-body" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#7f8983" />
              <stop offset="0.4" stopColor="#252c28" />
              <stop offset="1" stopColor="#0a0d0b" />
            </linearGradient>
            <linearGradient id="capcar-glass" x1="0" x2="1">
              <stop offset="0" stopColor="#7291a1" />
              <stop offset="1" stopColor="#172421" />
            </linearGradient>
          </defs>
          <path
            d="M72 201c24-40 59-67 107-80l122-25c44-58 94-82 170-82h91c59 0 105 24 157 80l91 24c31 8 51 27 58 56l7 40H54l18-13Z"
            fill="url(#capcar-body)"
            stroke="rgba(255,255,255,.18)"
            strokeWidth="3"
          />
          <path
            d="M323 94c38-43 80-62 143-62h91c42 0 78 18 121 60l-355 2Z"
            fill="url(#capcar-glass)"
            opacity=".86"
          />
          <path
            d="M490 34v59M307 98h390"
            stroke="rgba(255,255,255,.2)"
            strokeWidth="3"
          />
          <path
            d="M78 178h90M735 163h116"
            stroke="#9fc0ff"
            strokeLinecap="round"
            strokeWidth="9"
            opacity=".7"
          />
          <circle
            cx="230"
            cy="209"
            r="62"
            fill="#080a09"
            stroke="#323934"
            strokeWidth="10"
          />
          <circle
            cx="230"
            cy="209"
            r="31"
            fill="#747d77"
            stroke="#171c19"
            strokeWidth="10"
          />
          <circle
            cx="700"
            cy="209"
            r="62"
            fill="#080a09"
            stroke="#323934"
            strokeWidth="10"
          />
          <circle
            cx="700"
            cy="209"
            r="31"
            fill="#747d77"
            stroke="#171c19"
            strokeWidth="10"
          />
        </svg>
      )}
      <div className="absolute top-5 left-5 flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[11px] tracking-[0.12em] text-white/55 uppercase backdrop-blur">
        <Zap className="size-3 text-[#ff667a]" />{" "}
        {badge ?? (imageUrl ? "Showcase project" : "Concept stage")}
      </div>
      {!compact && !imageUrl && (
        <div className="absolute right-5 bottom-5 flex items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-xs text-white/55 backdrop-blur">
          <Gauge className="size-3.5" /> Precise 3D arrives later
        </div>
      )}
    </div>
  );
}
