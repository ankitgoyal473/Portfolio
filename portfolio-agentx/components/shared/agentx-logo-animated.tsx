"use client";

import { useEffect, useRef } from "react";

interface AgentXLogoAnimatedProps {
  size?: number;
  className?: string;
}

// Agent node colors — brand identity
const NODE_COLORS = [
  "#f0b429", // Warren — gold
  "#4a9eff", // Sherlock — blue
  "#00c896", // Harvey — green
];

const TRAIL_LENGTH = 45;
const ORBITAL_PERIOD = 60000; // 60s full revolution

export function AgentXLogoAnimated({
  size = 500,
  className = "",
}: AgentXLogoAnimatedProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctxOrNull = canvas.getContext("2d");
    if (!ctxOrNull) return;
    const ctx: CanvasRenderingContext2D = ctxOrNull;

    // Stars — generated once
    const starCount = Math.floor((size * size) / 4000);
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * size,
      y: Math.random() * size,
      r: Math.random() * 1.2 + 0.3,
      base: Math.random() * 0.5 + 0.1,
      speed: Math.random() * 0.8 + 0.3,
      offset: Math.random() * Math.PI * 2,
      violet: Math.random() > 0.7,
    }));

    // Trails — circular buffer per node
    const trails: Array<Array<{ x: number; y: number }>> = [[], [], []];

    const cx = size / 2;
    const cy = size / 2;
    const orbitR = size * 0.32;

    // Hexagon vertices (6 points)
    const hexPts = Array.from({ length: 6 }, (_, i) => {
      const a = (i * Math.PI) / 3 - Math.PI / 2;
      return {
        x: cx + orbitR * 0.88 * Math.cos(a),
        y: cy + orbitR * 0.88 * Math.sin(a),
      };
    });

    let raf: number;
    const t0 = performance.now();

    function draw() {
      const now = performance.now();
      const elapsed = now - t0;
      const t = elapsed / 1000;

      ctx.clearRect(0, 0, size, size);

      // ── Stars ──────────────────────────────────────────
      for (const s of stars) {
        const alpha =
          s.base +
          ((Math.sin(t * s.speed + s.offset) * 0.5 + 0.5) * (1 - s.base)) /
            (1 / 0.6);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.violet
          ? `rgba(182,163,255,${alpha * 0.7})`
          : `rgba(255,255,255,${alpha})`;
        ctx.fill();
      }

      // ── Hexagon outline ────────────────────────────────
      ctx.beginPath();
      hexPts.forEach((p, i) =>
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
      );
      ctx.closePath();
      ctx.strokeStyle = "rgba(182,163,255,0.18)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // ── Compute node positions ─────────────────────────
      const nodePositions = NODE_COLORS.map((_, i) => {
        const baseAngle = (i * (2 * Math.PI)) / 3 - Math.PI / 2;
        const angle = baseAngle + (elapsed / ORBITAL_PERIOD) * Math.PI * 2;
        return {
          x: cx + orbitR * Math.cos(angle),
          y: cy + orbitR * Math.sin(angle),
        };
      });

      // Push to trails
      nodePositions.forEach((pos, i) => {
        trails[i].push({ ...pos });
        if (trails[i].length > TRAIL_LENGTH) trails[i].shift();
      });

      // ── Draw connecting lines between nodes ────────────
      for (let a = 0; a < 3; a++) {
        for (let b = a + 1; b < 3; b++) {
          ctx.beginPath();
          ctx.moveTo(nodePositions[a].x, nodePositions[a].y);
          ctx.lineTo(nodePositions[b].x, nodePositions[b].y);
          ctx.strokeStyle = "rgba(182,163,255,0.08)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // ── Draw trails ────────────────────────────────────
      NODE_COLORS.forEach((color, i) => {
        const trail = trails[i];
        for (let j = 1; j < trail.length; j++) {
          const alpha = (j / trail.length) * 0.55;
          const r = (j / trail.length) * 2.5;
          ctx.beginPath();
          ctx.arc(trail[j].x, trail[j].y, r, 0, Math.PI * 2);
          ctx.fillStyle = hexToRgba(color, alpha);
          ctx.fill();
        }
      });

      // ── Draw nodes ─────────────────────────────────────
      NODE_COLORS.forEach((color, i) => {
        const { x, y } = nodePositions[i];
        // Glow
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 10);
        glow.addColorStop(0, hexToRgba(color, 0.35));
        glow.addColorStop(1, hexToRgba(color, 0));
        ctx.fillStyle = glow;
        ctx.fill();
        // Core dot
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`}
      aria-hidden="true"
      style={{ display: "block" }}
    />
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
