"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { agents } from "@/lib/agents";
import type { MockSession } from "@/lib/mock-data";

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

interface SessionListProps {
  sessions: MockSession[];
}

export function SessionList({ sessions }: SessionListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="rounded-xl border border-border bg-background-card p-6"
    >
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Recent sessions
      </h2>

      <div className="space-y-3">
        {sessions.map((session) => {
          const agent = agents.find((a) => a.slug === session.agentId);
          return (
            <div
              key={session.id}
              className="flex items-center gap-3 rounded-lg border border-border/50 px-4 py-3"
            >
              <div
                className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: agent?.color ?? "#888" }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {agent?.name ?? "Unknown"}
                  </span>
                  <span className="text-xs text-foreground-secondary truncate">
                    {session.inputSummary}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-foreground-secondary">
                    {timeAgo(session.createdAt)}
                  </span>
                  <span className="text-xs text-foreground-secondary">
                    &middot;
                  </span>
                  <span className="text-xs text-foreground-secondary">
                    {session.rowCount === 1
                      ? "1 report"
                      : `${session.rowCount} rows`}
                  </span>
                </div>
              </div>
              <Badge variant="success" className="text-[10px] px-2 py-0.5">
                {session.status}
              </Badge>
              <button
                disabled
                className="text-xs text-foreground-secondary/50 cursor-not-allowed"
              >
                View &rarr;
              </button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
