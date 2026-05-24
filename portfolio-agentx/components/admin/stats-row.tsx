"use client";

import { Lead } from "@/lib/mock-leads";
import { Users, Clock, CheckCircle, XCircle } from "lucide-react";

interface StatsRowProps {
  leads: Lead[];
}

export function StatsRow({ leads }: StatsRowProps) {
  const total = leads.length;
  const pending = leads.filter((l) => l.status === "pending").length;
  const accepted = leads.filter((l) => l.status === "accepted").length;
  const declined = leads.filter((l) => l.status === "declined").length;

  const stats = [
    {
      label: "Total",
      value: total,
      icon: Users,
      color: "text-accent",
      bg: "bg-accent-muted",
    },
    {
      label: "Pending",
      value: pending,
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
    {
      label: "Accepted",
      value: accepted,
      icon: CheckCircle,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      label: "Declined",
      value: declined,
      icon: XCircle,
      color: "text-red-400",
      bg: "bg-red-400/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-border bg-background-card p-4 transition-all duration-300 hover:border-border-hover"
        >
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${stat.bg}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-foreground-secondary">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
