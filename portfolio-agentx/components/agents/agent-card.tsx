"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Agent } from "@/lib/agents";

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <Link href={`/agents/${agent.slug}`} className="flex-1 flex flex-col">
      <motion.div
        whileHover={{ y: -4 }}
        className="group relative flex h-full flex-col rounded-xl border border-border bg-background-card p-6 transition-all duration-300"
        style={{
          borderTopColor: agent.color,
          borderTopWidth: "3px",
        }}
      >
        {/* Hover glow */}
        <div
          className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            boxShadow: `0 0 30px ${agent.color}15, inset 0 0 30px ${agent.color}05`,
          }}
        />

        <div className="relative z-10 flex flex-1 flex-col">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-2xl font-bold" style={{ color: agent.color }}>
              {agent.name}
            </h3>
            <Badge variant="secondary">{agent.price}</Badge>
          </div>

          {/* Full name */}
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-foreground-secondary">
            {agent.fullName}
          </p>

          {/* Personality */}
          <p className="mb-6 flex-1 text-sm text-foreground-secondary">{agent.personality}</p>

          {/* Free limit */}
          <p className="mb-4 text-xs text-foreground-secondary">Free: {agent.freeLimit}</p>

          {/* CTA */}
          <Button
            variant="secondary"
            className="w-full gap-2"
            style={{
              borderColor: `${agent.color}40`,
              color: agent.color,
            }}
          >
            {agent.cta}
          </Button>
        </div>
      </motion.div>
    </Link>
  );
}
