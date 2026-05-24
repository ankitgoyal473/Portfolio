"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MockLead } from "@/lib/mock-data";

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

interface LeadCardsProps {
  leads: MockLead[];
}

export function LeadCards({ leads }: LeadCardsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
    >
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Your project requests
      </h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {leads.map((lead, i) => (
          <motion.div
            key={lead.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 + i * 0.1 }}
          >
            {lead.status === "pending" && <PendingCard lead={lead} />}
            {lead.status === "accepted" && <AcceptedCard lead={lead} />}
            {lead.status === "declined" && <DeclinedCard lead={lead} />}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function PendingCard({ lead }: { lead: MockLead }) {
  return (
    <div className="rounded-xl border border-border bg-background-card p-5">
      <p className="font-semibold text-foreground mb-2">{lead.problem}</p>
      <p className="text-sm text-foreground-secondary mb-2">
        {lead.budget} &middot; Est. ${lead.estimateLow.toLocaleString()}&ndash;$
        {lead.estimateHigh.toLocaleString()}
      </p>
      <p className="text-xs text-foreground-secondary mb-3">
        Submitted {timeAgo(lead.createdAt)}
      </p>
      <Badge
        className="bg-amber-500/10 text-amber-400 border-amber-500/20 mb-2"
      >
        Pending review
      </Badge>
      <p className="text-xs text-foreground-secondary mt-2">
        Ankit will review within 24 hours
      </p>
    </div>
  );
}

function AcceptedCard({ lead }: { lead: MockLead }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-green-500/30 bg-background-card p-5",
        "shadow-[0_0_16px_rgba(0,200,150,0.08)]"
      )}
    >
      <p className="font-semibold text-foreground mb-2">{lead.problem}</p>
      <Badge variant="success" className="mb-2">
        Accepted
      </Badge>
      <p className="text-sm text-foreground-secondary mb-4">
        Ankit wants to connect!
      </p>
      <a
        href={lead.calendlyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium",
          "bg-green-500/15 text-green-400 border border-green-500/30",
          "hover:bg-green-500/25 transition-colors"
        )}
      >
        Book a call &rarr;
      </a>
    </div>
  );
}

function DeclinedCard({ lead }: { lead: MockLead }) {
  return (
    <div className="rounded-xl border border-border bg-background-card p-5 opacity-60">
      <p className="font-semibold text-foreground mb-2">{lead.problem}</p>
      <Badge variant="secondary">Not a fit right now</Badge>
    </div>
  );
}
