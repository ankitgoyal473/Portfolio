"use client";

import { motion } from "framer-motion";
import { TrendingUp, BarChart3, MessageCircle, Target, Globe, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Pillar } from "@/lib/agent-types";

interface PillarCardsProps {
  ticker: string;
  agentColor: string;
  isLocked: boolean;
  pillars?: Pillar[];
}

type Signal = "BULLISH" | "BEARISH" | "NEUTRAL";

interface GeneratedPillar {
  name: string;
  icon: LucideIcon;
  signal: Signal;
  body: string;
}

interface Verdict {
  action: "BUY" | "SELL" | "HOLD";
  conviction: number;
  entry: string;
  target: string;
  stop: string;
}

const PILLAR_TEMPLATES: { name: string; icon: LucideIcon; body: string }[] = [
  {
    name: "Technical",
    icon: TrendingUp,
    body: "Price at $178, holding 200-day MA. RSI 52 — neutral territory. Support $170, resistance $185.",
  },
  {
    name: "Fundamental",
    icon: BarChart3,
    body: "P/E 28x vs 5yr avg 25x. Services revenue +16% YoY. Net cash $57B.",
  },
  {
    name: "Sentiment",
    icon: MessageCircle,
    body: "Analyst consensus 82% Buy. Social sentiment slightly bearish post-earnings.",
  },
  {
    name: "Options",
    icon: Target,
    body: "PCR 0.72. Max pain $175. IV percentile 34% — options cheap.",
  },
  {
    name: "Global",
    icon: Globe,
    body: "China revenue risk priced in. AI narrative tailwind. Services moat deepening.",
  },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash + str.charCodeAt(i) * (i + 1)) % 10007;
  }
  return hash;
}

function generatePillars(ticker: string): { pillars: GeneratedPillar[]; verdict: Verdict } {
  const hash = hashString(ticker.toUpperCase());

  const signals: Signal[] = ["BULLISH", "BEARISH", "NEUTRAL"];
  const pillars: GeneratedPillar[] = PILLAR_TEMPLATES.map((template, index) => {
    const signalIndex = (hash + index * 37) % 3;
    return {
      ...template,
      signal: signals[signalIndex],
    };
  });

  const bullishCount = pillars.filter((p) => p.signal === "BULLISH").length;
  const bearishCount = pillars.filter((p) => p.signal === "BEARISH").length;

  const action: "BUY" | "SELL" | "HOLD" =
    bullishCount >= 3 ? "BUY" : bearishCount >= 3 ? "SELL" : "HOLD";

  const conviction = 6 + (hash % 4); // 6-9

  const basePrice = 50 + (hash % 300);
  const entry = `$${basePrice - 3}-${basePrice}`;
  const target = `$${basePrice + Math.floor(basePrice * 0.12)}`;
  const stop = `$${basePrice - Math.floor(basePrice * 0.08)}`;

  return {
    pillars,
    verdict: { action, conviction, entry, target, stop },
  };
}

const SIGNAL_COLORS: Record<Signal, { bg: string; text: string }> = {
  BULLISH: { bg: "#16a34a20", text: "#22c55e" },
  BEARISH: { bg: "#dc262620", text: "#ef4444" },
  NEUTRAL: { bg: "#71717a20", text: "#a1a1aa" },
};

export function PillarCards({ ticker, agentColor, isLocked, pillars }: PillarCardsProps) {
  // When real pillars are provided, use them; otherwise generate from ticker hash
  const generated = generatePillars(ticker);
  const verdict = generated.verdict;

  const verdictColors: Record<string, { bg: string; text: string }> = {
    BUY: { bg: "#16a34a20", text: "#22c55e" },
    SELL: { bg: "#dc262620", text: "#ef4444" },
    HOLD: { bg: "#71717a20", text: "#a1a1aa" },
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <p
        className="text-xs font-medium uppercase tracking-wider mb-1"
        style={{ color: agentColor }}
      >
        {ticker} — 5-Pillar Analysis
      </p>

      {pillars
        ? // Real data path: use Pillar[] from agent-types (has emoji icon string)
          pillars.map((pillar, index) => {
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
                      <span className="text-sm font-medium text-foreground">{pillar.name}</span>
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
                  <p className="text-xs text-foreground-secondary leading-relaxed">{pillar.body}</p>
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
          })
        : // Generated data path: use Lucide icons from hash
          generated.pillars.map((pillar, index) => {
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
                      <pillar.icon className="w-4 h-4 text-foreground-muted" />
                      <span className="text-sm font-medium text-foreground">{pillar.name}</span>
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
                  <p className="text-xs text-foreground-secondary leading-relaxed">{pillar.body}</p>
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
          className={cn("rounded-lg border p-3", isLocked && "select-none")}
          style={
            isLocked
              ? { borderColor: agentColor, filter: "blur(4px)", pointerEvents: "none" as const }
              : { borderColor: agentColor }
          }
        >
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className="text-xs font-bold uppercase px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: verdictColors[verdict.action].bg,
                color: verdictColors[verdict.action].text,
              }}
            >
              {verdict.action}
            </span>
            <span className="text-xs text-foreground-secondary">
              Conviction{" "}
              <span className="text-foreground font-medium">{verdict.conviction}/10</span>
            </span>
            <span className="text-xs text-foreground-secondary">
              Entry <span className="text-foreground font-medium">{verdict.entry}</span>
            </span>
            <span className="text-xs text-foreground-secondary">
              Target <span className="text-foreground font-medium">{verdict.target}</span>
            </span>
            <span className="text-xs text-foreground-secondary">
              Stop <span className="text-foreground font-medium">{verdict.stop}</span>
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
