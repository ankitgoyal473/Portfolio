"use client";

import { useEffect, useRef } from "react";

interface BlackholeRingProps {
  size?: number;
  opacity?: number;
  className?: string;
}

export function BlackholeRing({ size = 600, opacity = 0.6, className = "" }: BlackholeRingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Assign to a non-null const so TypeScript narrows correctly inside draw()
    const c = ctx;
    let animationId: number;
    let angle = 0;

    function draw() {
      c.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;

      // --- Outer diffuse glow (static haze) ---
      const outerGlow = c.createRadialGradient(cx, cy, size * 0.15, cx, cy, size * 0.5);
      outerGlow.addColorStop(0, "rgba(99, 102, 241, 0.0)");
      outerGlow.addColorStop(0.5, "rgba(74, 158, 255, 0.06)");
      outerGlow.addColorStop(1, "rgba(99, 102, 241, 0.0)");
      c.beginPath();
      c.arc(cx, cy, size * 0.5, 0, Math.PI * 2);
      c.fillStyle = outerGlow;
      c.fill();

      // --- Accretion disk (rotating, perspective-tilted) ---
      c.save();
      c.translate(cx, cy);
      c.scale(1, 0.28); // perspective squish (edge-on view)

      const diskRadii = [
        { r: size * 0.30, lineWidth: 18, alpha: 0.55 },
        { r: size * 0.33, lineWidth: 10, alpha: 0.35 },
        { r: size * 0.37, lineWidth: 6,  alpha: 0.20 },
        { r: size * 0.40, lineWidth: 3,  alpha: 0.10 },
      ];

      for (const disk of diskRadii) {
        // Conic gradient to simulate Doppler brightness + color variation
        const grad = c.createConicGradient(angle, 0, 0);
        grad.addColorStop(0.00, `rgba(240, 180,  41, ${disk.alpha})`);  // warm amber
        grad.addColorStop(0.15, `rgba(255, 107,   0, ${disk.alpha})`);  // hot orange
        grad.addColorStop(0.35, `rgba(255, 200, 100, ${disk.alpha * 1.4})`); // bright peak
        grad.addColorStop(0.55, `rgba(74,  158, 255, ${disk.alpha * 0.6})`); // cool blue
        grad.addColorStop(0.80, `rgba(99,  102, 241, ${disk.alpha * 0.3})`); // indigo
        grad.addColorStop(1.00, `rgba(240, 180,  41, ${disk.alpha})`);  // back to amber

        c.beginPath();
        c.arc(0, 0, disk.r, 0, Math.PI * 2);
        c.strokeStyle = grad;
        c.lineWidth = disk.lineWidth;
        c.shadowBlur = disk.lineWidth * 2;
        c.shadowColor = "rgba(240, 180, 41, 0.3)";
        c.stroke();
      }
      c.restore();

      // --- Photon ring (thin, bright, slightly tilted) ---
      c.save();
      c.translate(cx, cy);
      c.scale(1, 0.28);
      c.beginPath();
      c.arc(0, 0, size * 0.245, 0, Math.PI * 2);
      c.strokeStyle = "rgba(255, 240, 200, 0.55)";
      c.lineWidth = 1.5;
      c.shadowBlur = 8;
      c.shadowColor = "rgba(255, 220, 150, 0.8)";
      c.stroke();
      c.restore();

      // --- Event horizon (dark filled circle) ---
      const horizonGrad = c.createRadialGradient(cx, cy, 0, cx, cy, size * 0.22);
      horizonGrad.addColorStop(0,   "#020205");
      horizonGrad.addColorStop(0.7, "#050508");
      horizonGrad.addColorStop(1,   "rgba(5, 5, 8, 0.9)");
      c.beginPath();
      c.arc(cx, cy, size * 0.22, 0, Math.PI * 2);
      c.fillStyle = horizonGrad;
      c.fill();

      // Slow rotation — full revolution in ~60s at 60fps
      angle += 0.0017;
      animationId = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ opacity }}
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    />
  );
}
