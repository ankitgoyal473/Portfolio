"use client";

import { useRef, useEffect, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const STATS = [
  { end: 20, suffix: "+", label: "AI Tools Shipped" },
  { end: 5000, suffix: "+", label: "Hours Automated", comma: true },
  { end: 3, suffix: "+", label: "Enterprise Teams" },
];

function Counter({
  end,
  suffix,
  label,
  comma,
  animate,
}: {
  end: number;
  suffix: string;
  label: string;
  comma?: boolean;
  animate: boolean;
}) {
  const [count, setCount] = useState(animate ? 0 : end);

  useEffect(() => {
    if (!animate) {
      setCount(end);
      return;
    }
    const startTime = performance.now();
    const duration = 1500;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 2); // quadratic ease-out
      const current = Math.floor(eased * end);
      setCount(current);
      if (progress < 1) requestAnimationFrame(tick);
      else setCount(end);
    };

    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [animate, end]);

  const display = comma ? count.toLocaleString() : count.toString();

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-4xl md:text-5xl font-black text-[#F97316]">
        {display}{suffix}
      </span>
      <span className="text-sm text-[#71717A]">{label}</span>
    </div>
  );
}

export function StatsSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = isInView && !prefersReducedMotion;

  return (
    <section
      ref={ref}
      className="py-14 px-6 border-y border-[#27272A] bg-[#0D0D0D]"
    >
      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-3 gap-8">
          {STATS.map((s) => (
            <Counter key={s.label} {...s} animate={shouldAnimate} />
          ))}
        </div>
      </div>
    </section>
  );
}
