"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Agent } from "@/lib/agents";
import type { AgentUsage } from "@/lib/mock-data";

const agentEmojis: Record<string, string> = {
  warren: "\u{1F9D0}",
  sherlock: "\u{1F50E}",
  harvey: "\u{1F4BC}",
};

interface AgentUsageCardProps {
  agent: Agent;
  usage: AgentUsage;
  index: number;
}

export function AgentUsageCard({ agent, usage, index }: AgentUsageCardProps) {
  const percentage = Math.min((usage.used / usage.limit) * 100, 100);
  const isMaxed = usage.used >= usage.limit;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={cn(
        "rounded-xl border border-border bg-background-card p-5",
        "transition-all duration-300 hover:border-border-hover hover:shadow-lg hover:-translate-y-1"
      )}
      style={{ borderTopColor: agent.color, borderTopWidth: "3px" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{agentEmojis[agent.slug]}</span>
        <h3 className="font-semibold" style={{ color: agent.color }}>
          {agent.name}
        </h3>
      </div>

      <p className="text-sm text-foreground-secondary mb-2">
        {usage.used} / {usage.limit} free {usage.unit} used
      </p>

      <div className="h-1 rounded-full bg-border overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: agent.color,
          }}
        />
      </div>

      <p className="text-xs text-foreground-secondary mb-4">
        Free tier &middot; {usage.limit} {usage.unit}/month
      </p>

      {isMaxed ? (
        <Link href="#">
          <button
            className={cn(
              "w-full rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
              "text-background hover:opacity-90"
            )}
            style={{ backgroundColor: agent.color }}
          >
            Unlock {agent.name} &mdash; {agent.price}
          </button>
        </Link>
      ) : (
        <Link href={`/agents/${agent.slug}`}>
          <button
            className={cn(
              "w-full rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
              "bg-transparent border hover:opacity-80"
            )}
            style={{ borderColor: agent.color, color: agent.color }}
          >
            {agent.cta}
          </button>
        </Link>
      )}
    </motion.div>
  );
}
