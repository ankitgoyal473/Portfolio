"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface Pillar {
  name: string;
  icon: string;
  signal: "BULLISH" | "BEARISH" | "NEUTRAL" | "N/A" | "POSITIVE" | "NEGATIVE";
  body: string;
  score?: number | null;
  keyMetrics?: Record<string, string | number>;
}

export interface Verdict {
  verdict: string;
  conviction: "HIGH" | "MEDIUM" | "LOW" | "AVOID";
  avgScore?: number;
  entry?: string;
  target?: string;
  stopLoss?: string;
  riskReward?: string;
  nextReview?: string;
}

interface PillarCardsProps {
  ticker: string;
  agentColor: string;
  isLocked: boolean;
  pillars?: Pillar[];
  verdict?: Verdict;
}

const SIGNAL_COLORS: Record<string, string> = {
  BULLISH: "#00c896",
  POSITIVE: "#00c896",
  NEUTRAL: "#f0b429",
  NEGATIVE: "#ff6b6b",
  BEARISH: "#ff6b6b",
  "N/A": "#6b7280",
};

const CONVICTION_COLORS: Record<string, string> = {
  HIGH: "#00c896",
  MEDIUM: "#f0b429",
  LOW: "#ff9500",
  AVOID: "#ff6b6b",
};

const PILLAR_ICONS: Record<string, string> = {
  Technical: "📊",
  Fundamental: "🏰",
  Sentiment: "📰",
  OptionChain: "📈",
  GlobalImpact: "🌍",
  FIIDIIFlows: "💰",
};

function SignalBadge({ signal }: { signal: string }) {
  const color = SIGNAL_COLORS[signal] ?? "#6b7280";
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: `${color}22`, color }}
    >
      {signal}
    </span>
  );
}

function ScoreDots({ score }: { score?: number | null }) {
  if (score == null) return null;
  return (
    <span className="flex gap-0.5 items-center ml-1">
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{
            backgroundColor: i <= score ? "#f0b429" : "#374151",
          }}
        />
      ))}
    </span>
  );
}

function PillarCard({
  pillar,
  index,
  agentColor,
  isLocked,
}: {
  pillar: Pillar;
  index: number;
  agentColor: string;
  isLocked: boolean;
}) {
  const icon = PILLAR_ICONS[pillar.name] ?? "📋";
  const blurred = isLocked && index >= 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.2 }}
      className="relative rounded-lg border border-border/50 bg-background p-3 overflow-hidden"
    >
      {blurred && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center rounded-lg backdrop-blur-sm"
          style={{ backgroundColor: `${agentColor}11` }}
        >
          <span className="text-xs font-medium" style={{ color: agentColor }}>
            Unlock WARRen — ₹999/month
          </span>
        </div>
      )}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">{icon}</span>
        <span className="text-xs font-semibold text-foreground">{pillar.name}</span>
        <ScoreDots score={pillar.score} />
        <div className="ml-auto">
          <SignalBadge signal={pillar.signal} />
        </div>
      </div>
      <p className="text-xs text-foreground-secondary leading-relaxed">{pillar.body}</p>
    </motion.div>
  );
}

function VerdictCard({
  verdict,
  agentColor,
}: {
  verdict: Verdict;
  agentColor: string;
}) {
  const convColor = CONVICTION_COLORS[verdict.conviction] ?? agentColor;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.25 }}
      className="rounded-lg border p-3 mt-1"
      style={{ borderColor: `${convColor}44`, backgroundColor: `${convColor}0D` }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-foreground">🎯 Verdict</span>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${convColor}22`, color: convColor }}
        >
          {verdict.conviction} · {verdict.verdict}
        </span>
      </div>
      {verdict.entry && (
        <div className="grid grid-cols-3 gap-2 text-xs text-foreground-muted">
          <div>
            <div className="font-medium text-foreground-secondary">Entry</div>
            <div>{verdict.entry}</div>
          </div>
          <div>
            <div className="font-medium text-foreground-secondary">Target</div>
            <div style={{ color: "#00c896" }}>{verdict.target}</div>
          </div>
          <div>
            <div className="font-medium text-foreground-secondary">Stop</div>
            <div style={{ color: "#ff6b6b" }}>{verdict.stopLoss}</div>
          </div>
        </div>
      )}
      {verdict.riskReward && (
        <div className="mt-2 text-xs text-foreground-muted">
          R/R: <span className="font-medium text-foreground">{verdict.riskReward}</span>
          {verdict.nextReview && (
            <span className="ml-3">Review: {verdict.nextReview}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}

export function PillarCards({
  ticker,
  agentColor,
  isLocked,
  pillars,
  verdict,
}: PillarCardsProps) {
  const displayPillars: Pillar[] = pillars ?? [
    { name: "Technical", icon: "📊", signal: "BULLISH", body: "Loading...", score: null },
  ];

  return (
    <div className="space-y-2 w-full">
      <div className="text-xs font-semibold mb-2" style={{ color: agentColor }}>
        {ticker} · 6-Pillar Analysis
      </div>
      {displayPillars.map((p, i) => (
        <PillarCard
          key={p.name}
          pillar={p}
          index={i}
          agentColor={agentColor}
          isLocked={isLocked}
        />
      ))}
      {verdict && <VerdictCard verdict={verdict} agentColor={agentColor} />}
      <p className="text-xs text-foreground-muted text-right mt-1">— WARRen 🧐</p>
    </div>
  );
}
