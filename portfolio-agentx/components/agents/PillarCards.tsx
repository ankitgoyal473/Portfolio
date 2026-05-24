"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PillarCardsProps {
  ticker: string;
  agentColor: string;
  isLocked: boolean;
}

type Signal = "BULLISH" | "BEARISH" | "NEUTRAL";

interface Pillar {
  name: string;
  icon: string;
  signal: Signal;
  body: string;
}

const MOCK_PILLARS: Pillar[] = [
  {
    name: "Technical",
    icon: "📈",
    signal: "BULLISH",
    body: "Price at $178, holding 200-day MA. RSI 52 — neutral territory. Support $170, resistance $185.",
  },
  {
    name: "Fundamental",
    icon: "📊",
    signal: "BULLISH",
    body: "P/E 28x vs 5yr avg 25x. Services revenue +16% YoY. Net cash $57B.",
  },
  {
    name: "Sentiment",
    icon: "💬",
    signal: "NEUTRAL",
    body: "Analyst consensus 82% Buy. Social sentiment slightly bearish post-earnings.",
  },
  {
    name: "Options",
    icon: "🎯",
    signal: "BULLISH",
    body: "PCR 0.72. Max pain $175. IV percentile 34% — options cheap.",
  },
  {
    name: "Global",
    icon: "🌍",
    signal: "NEUTRAL",
    body: "China revenue risk priced in. AI narrative tailwind. Services moat deepening.",
  },
];

const SIGNAL_COLORS: Record<Signal, { bg: string; text: string }> = {
  BULLISH: { bg: "#16a34a20", text: "#22c55e" },
  BEARISH: { bg: "#dc262620", text: "#ef4444" },
  NEUTRAL: { bg: "#71717a20", text: "#a1a1aa" },
};

export function PillarCards({ ticker, agentColor, isLocked }: PillarCardsProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <p
        className="text-xs font-medium uppercase tracking-wider mb-1"
        style={{ color: agentColor }}
      >
        {ticker} — 5-Pillar Analysis
      </p>

      {MOCK_PILLARS.map((pillar, index) => {
        const locked = isLocked && index > 0;
        return (
          <div key={pillar.name} className="relative">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className={cn(
                "rounded-lg border border-border bg-background-card p-3",
                locked && "select-none"
              )}
              style={locked ? { filter: "blur(4px)", pointerEvents: "none" } : undefined}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{pillar.icon}</span>
                  <span className="text-sm font-medium text-foreground">
                    {pillar.name}
                  </span>
                </div>
                <span
                  className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: SIGNAL_COLORS[pillar.signal].bg,
                    color: SIGNAL_COLORS[pillar.signal].text,
                  }}
                >
                  {pillar.signal}
                </span>
              </div>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                {pillar.body}
              </p>
            </motion.div>

            {locked && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="text-xs font-semibold px-3 py-1.5 rounded-md bg-background/80 backdrop-blur-sm"
                  style={{ color: agentColor }}
                >
                  Unlock WARRen — $19/month
                </span>
              </div>
            )}
          </div>
        );
      })}

      {/* Verdict card */}
      <div className="relative mt-1">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className={cn(
            "rounded-lg border p-3",
            isLocked && "select-none"
          )}
          style={
            isLocked
              ? { borderColor: agentColor, filter: "blur(4px)", pointerEvents: "none" as const }
              : { borderColor: agentColor }
          }
        >
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className="text-xs font-bold uppercase px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "#16a34a20", color: "#22c55e" }}
            >
              BUY
            </span>
            <span className="text-xs text-foreground-secondary">
              Conviction <span className="text-foreground font-medium">7/10</span>
            </span>
            <span className="text-xs text-foreground-secondary">
              Entry <span className="text-foreground font-medium">$175-178</span>
            </span>
            <span className="text-xs text-foreground-secondary">
              Target <span className="text-foreground font-medium">$195</span>
            </span>
            <span className="text-xs text-foreground-secondary">
              Stop <span className="text-foreground font-medium">$165</span>
            </span>
          </div>
        </motion.div>

        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-xs font-semibold px-3 py-1.5 rounded-md bg-background/80 backdrop-blur-sm"
              style={{ color: agentColor }}
            >
              Unlock WARRen — $19/month
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
