"use client";

import { useEffect, useRef } from "react";

const COLORS = [
  "#f0b429", // Warren gold
  "#4a9eff", // Sherlock blue
  "#00c896", // Harvey green
];

const NODE_COUNT = 60;
const CONNECT_DIST = 150;
const BASE_SPEED = 0.3;
const PULSE_INTERVAL_MS = 2000;

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  opacity: number;
  pulsePhase: number;
}

interface Pulse {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  progress: number;
  color: string;
  speed: number;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function makeNodes(w: number, h: number): Node[] {
  return Array.from({ length: NODE_COUNT }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = BASE_SPEED * (0.5 + Math.random() * 0.5);
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      radius: 1.5 + Math.random() * 2,
      opacity: 0.4 + Math.random() * 0.5,
      pulsePhase: Math.random() * Math.PI * 2,
    };
  });
}

export function NeuralBackground({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctxOrNull = canvas.getContext("2d");
    if (!ctxOrNull) return;
    const ctx: CanvasRenderingContext2D = ctxOrNull;

    let w = canvas.offsetWidth;
    let h = canvas.offsetHeight;
    canvas.width = w;
    canvas.height = h;

    let nodes = makeNodes(w, h);
    const pulses: Pulse[] = [];
    let lastPulseAt = 0;
    let raf: number;

    function trySpawnPulse(now: number) {
      if (now - lastPulseAt < PULSE_INTERVAL_MS) return;
      for (let attempt = 0; attempt < 20; attempt++) {
        const a = nodes[Math.floor(Math.random() * nodes.length)];
        const b = nodes[Math.floor(Math.random() * nodes.length)];
        if (a === b) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        if (Math.sqrt(dx * dx + dy * dy) < CONNECT_DIST) {
          pulses.push({
            fromX: a.x, fromY: a.y,
            toX: b.x,   toY: b.y,
            progress: 0,
            color: a.color,
            speed: 0.012 + Math.random() * 0.01,
          });
          lastPulseAt = now;
          break;
        }
      }
    }

    function draw(now: number) {
      ctx.clearRect(0, 0, w, h);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        n.pulsePhase += 0.02;
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const alpha = (1 - dist / CONNECT_DIST) * 0.18;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(180,163,255,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      trySpawnPulse(now);
      for (let p = pulses.length - 1; p >= 0; p--) {
        const pulse = pulses[p];
        pulse.progress += pulse.speed;
        if (pulse.progress >= 1) { pulses.splice(p, 1); continue; }
        const px = pulse.fromX + (pulse.toX - pulse.fromX) * pulse.progress;
        const py = pulse.fromY + (pulse.toY - pulse.fromY) * pulse.progress;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(pulse.color, 0.9);
        ctx.shadowBlur = 8;
        ctx.shadowColor = pulse.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      for (const n of nodes) {
        const glow = 0.25 + Math.sin(n.pulsePhase) * 0.12;
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius * 5);
        grad.addColorStop(0, hexToRgba(n.color, glow * 0.45));
        grad.addColorStop(1, hexToRgba(n.color, 0));
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius * 5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(n.color, n.opacity);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);

    const onResize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w;
      canvas.height = h;
      nodes = makeNodes(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`}
      aria-hidden="true"
    />
  );
}
