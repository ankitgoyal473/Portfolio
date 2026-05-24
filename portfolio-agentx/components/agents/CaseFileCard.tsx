"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CaseFileCardProps {
  url: string;
  agentColor: string;
  isLocked: boolean;
}

export function CaseFileCard({ url, agentColor, isLocked }: CaseFileCardProps) {
  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full rounded-lg border border-border bg-background-card overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            🔎 CASE FILE
          </span>
          <span className="text-xs text-foreground-muted">· {url}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-foreground-muted">{today}</span>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
            MEDIUM 🟡
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Intro */}
        <p className="text-sm text-foreground-secondary italic">
          Elementary. Here is what I found.
        </p>

        {/* Website changes */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Website Changes
            </h4>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
              PRICING CHANGE 🔴
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span
              className="mt-1.5 w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: "#ef4444" }}
            />
            <p className="text-xs text-foreground-secondary leading-relaxed">
              Pricing page updated. $99 plan → $79. Discounting.
            </p>
          </div>
        </div>

        {/* Hiring signals */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Hiring Signals
            </h4>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
              HIRING SIGNAL 🟡
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span
              className="mt-1.5 w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: "#eab308" }}
            />
            <p className="text-xs text-foreground-secondary leading-relaxed">
              3 new ML Engineer roles posted. Building something new in AI.
            </p>
          </div>
        </div>

        {/* News — blurred if locked */}
        <div className="relative">
          <div
            className={cn(isLocked && "select-none")}
            style={isLocked ? { filter: "blur(4px)", pointerEvents: "none" } : undefined}
          >
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                News & Press
              </h4>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                NEWS 🔵
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span
                className="mt-1.5 w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: "#3b82f6" }}
              />
              <p className="text-xs text-foreground-secondary leading-relaxed">
                Featured in TechCrunch last week. CEO quoted on aggressive growth
                plans for Q3.
              </p>
            </div>
          </div>
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-xs font-semibold px-3 py-1.5 rounded-md bg-background/80 backdrop-blur-sm"
                style={{ color: agentColor }}
              >
                Unlock Sherlock — $49/month
              </span>
            </div>
          )}
        </div>

        {/* What this means — blurred if locked */}
        <div className="relative">
          <div
            className={cn(isLocked && "select-none")}
            style={isLocked ? { filter: "blur(4px)", pointerEvents: "none" } : undefined}
          >
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              What This Means For You
            </h4>
            <p className="text-xs text-foreground-secondary leading-relaxed">
              They are cutting prices to acquire users fast — likely burning cash.
              Their AI hiring signals a pivot. You have 2-3 months before their new
              product ships. Move now.
            </p>
          </div>
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-xs font-semibold px-3 py-1.5 rounded-md bg-background/80 backdrop-blur-sm"
                style={{ color: agentColor }}
              >
                Unlock Sherlock — $49/month
              </span>
            </div>
          )}
        </div>

        {/* Sign-off */}
        <p
          className="text-xs font-medium pt-2 border-t border-border"
          style={{ color: agentColor }}
        >
          The game is afoot. — Sherlock 🔎
        </p>
      </div>
    </motion.div>
  );
}
