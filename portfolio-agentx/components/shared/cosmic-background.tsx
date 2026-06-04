"use client";

interface CosmicBackgroundProps {
  ringSize?: "sm" | "md" | "lg";
  className?: string;
}

const ringSizes = {
  sm: { width: 320, height: 120 },
  md: { width: 500, height: 190 },
  lg: { width: 700, height: 265 },
};

export function CosmicBackground({
  ringSize = "md",
  className = "",
}: CosmicBackgroundProps) {
  const { width, height } = ringSizes[ringSize];

  // Ring geometry (scaled proportionally)
  const rx = width * 0.48;
  const ry = height * 0.47;
  const cx = width / 2;
  const cy = height / 2;

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      {/* ── Aurora blobs ──────────────────────────────── */}

      {/* Blob 1 — Warren gold, top-left */}
      <div
        style={{
          position: "absolute",
          top: "5%",
          left: "5%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(240,180,41,0.28) 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "aurora-1 18s ease-in-out infinite",
        }}
      />

      {/* Blob 2 — Sherlock blue, top-right */}
      <div
        style={{
          position: "absolute",
          top: "0%",
          right: "5%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(74,158,255,0.22) 0%, transparent 70%)",
          filter: "blur(90px)",
          animation: "aurora-2 22s ease-in-out infinite",
          animationDelay: "-9s",
        }}
      />

      {/* Blob 3 — Harvey green, bottom-center */}
      <div
        style={{
          position: "absolute",
          bottom: "0%",
          left: "30%",
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,200,150,0.18) 0%, transparent 70%)",
          filter: "blur(100px)",
          animation: "aurora-3 26s ease-in-out infinite",
          animationDelay: "-13s",
        }}
      />

      {/* ── Rotating ring ─────────────────────────────── */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ filter: `drop-shadow(0 0 14px rgba(182,163,255,0.35)) drop-shadow(0 0 28px rgba(139,92,246,0.20))` }}
      >
        {/* Outer ring wrapper — spins */}
        <div style={{ animation: "ring-spin 24s linear infinite", width, height }}>
          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="disk-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#c4b5fd" stopOpacity="0.9" />
                <stop offset="30%"  stopColor="#8b5cf6" stopOpacity="0.7" />
                <stop offset="55%"  stopColor="#6366f1" stopOpacity="0.5" />
                <stop offset="80%"  stopColor="#4f46e5" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="disk-gradient-2" x1="100%" y1="0%" x2="0%" y2="0%">
                <stop offset="0%"   stopColor="#c4b5fd" stopOpacity="0.4" />
                <stop offset="50%"  stopColor="#8b5cf6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Outer glow ring */}
            <ellipse
              cx={cx} cy={cy}
              rx={rx + 18} ry={ry + 7}
              stroke="url(#disk-gradient-2)"
              strokeWidth="8"
              fill="none"
              opacity="0.4"
            />

            {/* Main accretion ring */}
            <ellipse
              cx={cx} cy={cy}
              rx={rx} ry={ry}
              stroke="url(#disk-gradient)"
              strokeWidth="3"
              fill="none"
            />

            {/* Inner bright ring */}
            <ellipse
              cx={cx} cy={cy}
              rx={rx * 0.72} ry={ry * 0.72}
              stroke="rgba(196,181,253,0.6)"
              strokeWidth="1.5"
              fill="none"
              style={{ animation: "ring-pulse 3s ease-in-out infinite" }}
            />
          </svg>
        </div>

        {/* Event horizon — static dark center */}
        <div
          style={{
            position: "absolute",
            width: width * 0.24,
            height: height * 0.55,
            borderRadius: "50%",
            background: "radial-gradient(circle, #020205 60%, rgba(2,2,5,0.7) 100%)",
          }}
        />
      </div>
    </div>
  );
}
