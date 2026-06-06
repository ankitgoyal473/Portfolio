"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

const SNIPPETS = [
  "claude",
  "CLAUDE.md",
  "> warren analyze RELIANCE",
  "use_computer: true",
  "tool_use: web_search",
  "✓ 32/32 tests passed",
  "export ANTHROPIC_API_KEY=sk-...",
  '> sherlock research "HDFC"',
  "npm install -g @anthropic-ai/claude-code",
  "streaming: true",
  "FastAPI + Strands",
  "# Claude Code Solution",
];

interface Particle {
  id: number;
  snippet: string;
  left: string;
  duration: number;
  color: string;
  fontSize: string;
}

export function FloatingCodeBackground() {
  const prefersReducedMotion = useReducedMotion();
  const [particles, setParticles] = useState<Particle[]>([]);
  const counter = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const MAX = 8;

    const spawn = () => {
      setParticles((prev) => {
        if (prev.length >= MAX) return prev;
        const id = counter.current++;
        return [
          ...prev,
          {
            id,
            snippet: SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)],
            left: `${5 + Math.random() * 80}%`,
            duration: 6 + Math.random() * 4,
            color: Math.random() > 0.5 ? "#F9731655" : "#4a9eff45",
            fontSize: `${0.55 + Math.random() * 0.15}rem`,
          },
        ];
      });
    };

    const interval = setInterval(spawn, 900);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  const remove = (id: number) =>
    setParticles((prev) => prev.filter((p) => p.id !== id));

  if (prefersReducedMotion) return null;

  return (
    <div
      className="floating-code-bg absolute inset-0 overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          onAnimationEnd={() => remove(p.id)}
          style={{
            position: "absolute",
            bottom: "-30px",
            left: p.left,
            color: p.color,
            fontSize: p.fontSize,
            fontFamily: "monospace",
            whiteSpace: "nowrap",
            animation: `floatCode ${p.duration}s linear forwards`,
          }}
        >
          {p.snippet}
        </span>
      ))}
      {/* Fade out near top */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, transparent 55%, #0A0A0A 92%)",
          zIndex: 1,
        }}
      />
    </div>
  );
}
