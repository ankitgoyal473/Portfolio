"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Prospect {
  name: string;
  company: string;
  opener: string;
}

interface ResultsTableProps {
  prospects: Prospect[];
  agentColor: string;
  isLocked: boolean;
  totalCount: number;
}

export function ResultsTable({
  prospects,
  agentColor,
  isLocked,
  totalCount,
}: ResultsTableProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = useCallback(async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  }, []);

  const handleDownloadCSV = useCallback(() => {
    const header = "Name,Company,Opener\n";
    const rows = prospects
      .map(
        (p) =>
          `"${p.name}","${p.company}","${p.opener.replace(/"/g, '""')}"`
      )
      .join("\n");
    const csv = header + rows;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "harvey_prospects.csv";
    link.click();
    URL.revokeObjectURL(url);
  }, [prospects]);

  const visibleLimit = isLocked ? 10 : prospects.length;
  const remaining = totalCount - 10;

  return (
    <div className="w-full space-y-3">
      {/* Header */}
      <p
        className="text-xs font-medium uppercase tracking-wider"
        style={{ color: agentColor }}
      >
        Harvey&apos;s openers — {totalCount} prospects
      </p>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[2rem_1fr_1fr_2fr_4rem] gap-2 px-3 py-2 bg-background border-b border-border">
          <span className="text-[10px] font-semibold text-foreground-muted uppercase">
            #
          </span>
          <span className="text-[10px] font-semibold text-foreground-muted uppercase">
            Name
          </span>
          <span className="text-[10px] font-semibold text-foreground-muted uppercase">
            Company
          </span>
          <span className="text-[10px] font-semibold text-foreground-muted uppercase">
            Opener
          </span>
          <span className="text-[10px] font-semibold text-foreground-muted uppercase">
            Actions
          </span>
        </div>

        {/* Rows */}
        <div className="relative">
          {prospects.map((prospect, index) => {
            const locked = isLocked && index >= visibleLimit;
            return (
              <motion.div
                key={index}
                initial={{ x: -16, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.15, duration: 0.3 }}
                className={cn(
                  "group grid grid-cols-[2rem_1fr_1fr_2fr_4rem] gap-2 px-3 py-2 border-b border-border last:border-b-0 hover:bg-background/50",
                  locked && "select-none"
                )}
                style={
                  locked
                    ? { filter: "blur(4px)", pointerEvents: "none" }
                    : undefined
                }
              >
                <span className="text-[11px] text-foreground-muted tabular-nums">
                  {index + 1}
                </span>
                <span className="text-[11px] text-foreground truncate">
                  {prospect.name}
                </span>
                <span className="text-[11px] text-foreground-secondary truncate">
                  {prospect.company}
                </span>
                <span className="text-[11px] text-foreground-secondary leading-snug line-clamp-2">
                  {prospect.opener}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopy(prospect.opener, index)}
                    className="text-[10px] px-1.5 py-0.5 rounded border border-border text-foreground-muted hover:text-foreground hover:border-foreground-muted transition-colors"
                    title="Copy opener"
                  >
                    {copiedIndex === index ? "Copied!" : "Steal this \u{1F4CB}"}
                  </button>
                  <button
                    className="text-[10px] px-1 py-0.5 rounded border border-border text-foreground-muted hover:text-foreground hover:border-foreground-muted transition-colors"
                    title="Regenerate"
                  >
                    ↺
                  </button>
                </div>
              </motion.div>
            );
          })}

          {/* Locked overlay */}
          {isLocked && prospects.length > 10 && (
            <div className="absolute bottom-0 left-0 right-0 h-32 flex items-center justify-center">
              <span
                className="text-xs font-semibold px-3 py-1.5 rounded-md bg-background/80 backdrop-blur-sm z-10"
                style={{ color: agentColor }}
              >
                Harvey has {remaining} more to write. Unlock unlimited — $29/month
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Download button */}
      <button
        onClick={handleDownloadCSV}
        className="w-full text-xs font-medium py-2 rounded-lg border border-border text-foreground-secondary hover:text-foreground hover:border-foreground-muted transition-colors"
      >
        Download Harvey&apos;s work
      </button>

      {/* Sign-off */}
      <p
        className="text-xs font-medium pt-1"
        style={{ color: agentColor }}
      >
        Close-worthy. Go get them. — Harvey 💼
      </p>
    </div>
  );
}
