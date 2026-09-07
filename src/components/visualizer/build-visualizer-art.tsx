import type { BuildVisual } from "@/features/visualizer/build-visual-schema";

const paintColors: Record<BuildVisual["paint"], [string, string]> = {
  "factory-black": ["#242a2d", "#070909"],
  "alpine-white": ["#f4f3eb", "#9ca3a6"],
  "estoril-blue": ["#387ed1", "#102a54"],
  "deep-green": ["#31594c", "#0c211a"],
};

export function BuildVisualizerArt({
  visual,
  label,
  instanceId,
}: {
  visual: BuildVisual;
  label: string;
  instanceId: string;
}) {
  const [paintTop, paintBottom] = paintColors[visual.paint];
  const bodyOffset =
    visual.stance === "low" ? 13 : visual.stance === "sport" ? 7 : 0;
  const wheelRadius = visual.wheels === "factory" ? 43 : 47;
  const wheelFill = visual.wheels === "graphite" ? "#343b3e" : "#c7cbca";
  const gradientId = `paint-${instanceId}`;

  return (
    <div className="relative min-h-[330px] overflow-hidden rounded-[1.5rem] bg-[radial-gradient(circle_at_50%_72%,rgba(231,45,69,0.18),transparent_34%),linear-gradient(180deg,#151212,#090909)]">
      <div className="absolute top-5 left-5 z-10 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[10px] tracking-[0.12em] text-white/40 uppercase">
        {label}
      </div>
      <svg
        viewBox="0 0 720 330"
        role="img"
        aria-label={`${label} stylized vehicle concept`}
        className="absolute inset-0 size-full"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={paintTop} />
            <stop offset="1" stopColor={paintBottom} />
          </linearGradient>
          <filter id={`shadow-${instanceId}`} x="-20%" width="140%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>
        <ellipse
          cx="360"
          cy="282"
          rx="270"
          ry="19"
          fill="#000"
          opacity="0.6"
          filter={`url(#shadow-${instanceId})`}
        />
        <g transform={`translate(0 ${bodyOffset})`}>
          <path
            d="M91 224 C115 187 153 174 218 169 L274 113 C293 94 322 84 357 83 L444 83 C475 85 496 103 519 130 L554 169 C609 175 642 193 657 224 L643 246 L87 246 Z"
            fill={`url(#${gradientId})`}
            stroke="rgba(255,255,255,.18)"
            strokeWidth="2"
          />
          <path
            d="M254 163 L300 111 C314 99 333 94 359 93 L399 93 L399 163 Z"
            fill="#111a20"
            stroke="rgba(255,255,255,.13)"
          />
          <path
            d="M411 93 L442 94 C462 96 476 108 495 132 L520 163 L411 163 Z"
            fill="#111a20"
            stroke="rgba(255,255,255,.13)"
          />
          <path d="M400 94 L409 164" stroke="rgba(255,255,255,.2)" />
          <path d="M260 174 H541" stroke="rgba(255,255,255,.17)" />
          <path d="M112 213 H164" stroke="#e6edf2" strokeWidth="8" rx="4" />
          <path
            d="M603 205 H650"
            stroke={visual.lighting === "dark" ? "#38181b" : "#d44b55"}
            strokeWidth="11"
          />
          {visual.aero === "sport" && (
            <>
              <path d="M78 246 H180 L166 254 H88 Z" fill="#080a0a" />
              <path d="M574 246 H656 L645 255 H586 Z" fill="#080a0a" />
            </>
          )}
        </g>
        {[218, 536].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy="242" r={wheelRadius + 6} fill="#070808" />
            <circle
              cx={cx}
              cy="242"
              r={wheelRadius}
              fill="#171a1a"
              stroke="#373d3e"
              strokeWidth="3"
            />
            <circle cx={cx} cy="242" r={wheelRadius - 10} fill={wheelFill} />
            {Array.from({
              length: visual.wheels === "silver-mesh" ? 10 : 5,
            }).map((_, index, spokes) => (
              <line
                key={index}
                x1={cx}
                y1="242"
                x2={cx}
                y2={242 - wheelRadius + 14}
                stroke="#151919"
                strokeWidth={visual.wheels === "silver-mesh" ? 2 : 5}
                transform={`rotate(${(360 / spokes.length) * index} ${cx} 242)`}
              />
            ))}
            <circle cx={cx} cy="242" r="8" fill="#171a1a" />
          </g>
        ))}
      </svg>
      <p className="absolute right-5 bottom-4 text-[10px] text-white/25">
        Stylized concept · not dimensionally accurate
      </p>
    </div>
  );
}
