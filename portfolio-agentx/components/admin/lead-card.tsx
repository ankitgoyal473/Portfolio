"use client";

import { useState } from "react";
import { Lead } from "@/lib/mock-leads";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface LeadCardProps {
  lead: Lead;
  onStatusChange: (id: string, status: "accepted" | "declined", note?: string) => void;
}

export function LeadCard({ lead, onStatusChange }: LeadCardProps) {
  const [note, setNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAction = (status: "accepted" | "declined") => {
    setIsUpdating(true);
    onStatusChange(lead.id, status, note || undefined);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatCurrency = (n: number) => `$${n.toLocaleString("en-US")}`;

  const statusBadge = () => {
    switch (lead.status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/20 bg-amber-400/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
            <Clock className="h-3 w-3" />
            PENDING
          </span>
        );
      case "accepted":
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
            <CheckCircle className="h-3 w-3" />
            ACCEPTED
          </span>
        );
      case "declined":
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-red-400/20 bg-red-400/10 px-2.5 py-0.5 text-xs font-medium text-red-400">
            <XCircle className="h-3 w-3" />
            DECLINED
          </span>
        );
    }
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <p className="text-xs text-foreground-muted">{formatDate(lead.createdAt)}</p>
        {statusBadge()}
      </div>

      <h3 className="mt-3 text-lg font-bold text-foreground">{lead.problem}</h3>

      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant="secondary">{lead.budget}</Badge>
        <Badge variant="secondary">{lead.timeline}</Badge>
        <Badge variant="secondary">{lead.complexity}</Badge>
      </div>

      <p className="mt-3 text-sm font-medium text-accent">
        {formatCurrency(lead.estimateLow)} &ndash; {formatCurrency(lead.estimateHigh)}
      </p>

      {lead.stack && <p className="mt-2 text-xs text-foreground-muted">{lead.stack}</p>}

      {lead.notes && (
        <p className="mt-2 text-sm italic text-foreground-secondary">&ldquo;{lead.notes}&rdquo;</p>
      )}

      {lead.userEmail && <p className="mt-2 text-xs text-foreground-secondary">{lead.userEmail}</p>}

      {lead.ankitNote && (
        <p className="mt-2 rounded-md border border-border bg-background-secondary p-2 text-xs text-foreground-secondary">
          <span className="font-medium text-foreground">Note:</span> {lead.ankitNote}
        </p>
      )}

      {lead.status === "pending" && !isUpdating && (
        <div className="mt-4 space-y-3 border-t border-border pt-4">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional)..."
            className="w-full resize-none rounded-lg border border-border bg-background-secondary p-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-border-hover focus:outline-none"
            rows={2}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-emerald-600 text-white hover:bg-emerald-500"
              onClick={() => handleAction("accepted")}
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Accept
            </Button>
            <Button
              size="sm"
              className="bg-red-600 text-white hover:bg-red-500"
              onClick={() => handleAction("declined")}
            >
              <XCircle className="h-3.5 w-3.5" />
              Decline
            </Button>
          </div>
        </div>
      )}

      {isUpdating && <p className="mt-4 text-xs text-foreground-muted">Updated.</p>}
    </Card>
  );
}
