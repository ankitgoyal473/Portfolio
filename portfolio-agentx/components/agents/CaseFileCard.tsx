"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CaseFileData } from "@/lib/agent-types";

interface CaseFileCardProps {
  url: string;
  agentColor: string;
  isLocked: boolean;
  caseFile?: CaseFileData;
}

const THREAT_BADGE: Record<
  "LOW" | "MEDIUM" | "HIGH",
  { label: string; className: string }
> = {
  LOW: { label: "LOW", className: "bg-green-500/20 text-green-400" },
  MEDIUM: { label: "MEDIUM", className: "bg-yellow-500/20 text-yellow-400" },
  HIGH: { label: "HIGH", className: "bg-red-500/20 text-red-400" },
};

const BADGE_COLOR_MAP: Record<
  "red" | "yellow" | "green",
  { dot: string; badge: string }
> = {
  red: { dot: "#ef4444", badge: "bg-red-500/20 text-red-400" },
  yellow: { dot: "#eab308", badge: "bg-yellow-500/20 text-yellow-400" },
  green: { dot: "#22c55e", badge: "bg-green-500/20 text-green-400" },
};

export function CaseFileCard({ url, agentColor, isLocked, caseFile }: CaseFileCardProps) {
  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (caseFile) {
    const threatBadge = THREAT_BADGE[caseFile.threatLevel];
    // Lock the last two sections if isLocked
    const lockAfter = 1;

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
            <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5" style={{ color: agentColor }} />
              CASE FILE
            </span>
            <span className="text-xs text-foreground-muted">· {url}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-foreground-muted">{today}</span>
            <span
              className={cn(
                "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
                threatBadge.className
              )}
            >
              {threatBadge.label}
            </span>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Summary */}
          <p className="text-sm text-foreground-secondary italic">{caseFile.summary}</p>

          {/* Sections */}
          {caseFile.sections.map((section, sectionIndex) => {
            const locked = isLocked && sectionIndex >= lockAfter;
            const colorKey = section.badgeColor ?? "yellow";
            const colors = BADGE_COLOR_MAP[colorKey];

            return (
              <div key={section.title} className="relative">
                <div
                  className={cn(locked && "select-none")}
                  style={locked ? { filter: "blur(4px)", pointerEvents: "none" } : undefined}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      {section.title}
                    </h4>
                    {section.badge && (
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
                          colors.badge
                        )}
                      >
                        {section.badge}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {section.bullets.map((bullet, bulletIndex) => (
                      <div key={bulletIndex} className="flex items-start gap-2">
                        <span
                          className="mt-1.5 w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: colors.dot }}
                        />
                        <p className="text-xs text-foreground-secondary leading-relaxed">
                          {bullet}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                {locked && (
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
            );
          })}

          {/* Sign-off */}
          <p
            className="text-xs font-medium pt-2 border-t border-border"
            style={{ color: agentColor }}
          >
            The game is afoot. — Sherlock
          </p>
        </div>
      </motion.div>
    );
  }

  // Fallback: original hardcoded content (with V6 Lucide icon in header)
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
          <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" style={{ color: agentColor }} />
            CASE FILE
          </span>
          <span className="text-xs text-foreground-muted">· {url}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-foreground-muted">{today}</span>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
            MEDIUM
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
              PRICING CHANGE
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span
              className="mt-1.5 w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: "#ef4444" }}
            />
            <p className="text-xs text-foreground-secondary leading-relaxed">
              {url} pricing page updated. $99 plan → $79. Aggressive discounting detected.
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
              HIRING SIGNAL
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span
              className="mt-1.5 w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: "#eab308" }}
            />
            <p className="text-xs text-foreground-secondary leading-relaxed">
              3 new ML Engineer roles posted on {url} careers page. Building something new in AI.
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
                News &amp; Press
              </h4>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                NEWS
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span
                className="mt-1.5 w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: "#3b82f6" }}
              />
              <p className="text-xs text-foreground-secondary leading-relaxed">
                Featured in TechCrunch last week. CEO quoted on aggressive growth plans for Q3.
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
              They are cutting prices to acquire users fast — likely burning cash. Their AI hiring
              signals a pivot. You have 2-3 months before their new product ships. Move now.
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
          The game is afoot. — Sherlock
        </p>
      </div>
    </motion.div>
  );
}
