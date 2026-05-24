"use client";

import { ClientAuthGuard } from "@/components/auth/client-auth-guard";
import { useMockAuth } from "@/lib/mock-auth";
import {
  mockUsage,
  mockStats,
  mockSessions,
  mockLeads,
} from "@/lib/mock-data";
import { agents } from "@/lib/agents";
import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import { AgentUsageCard } from "@/components/dashboard/agent-usage-card";
import { StatsRow } from "@/components/dashboard/stats-row";
import { SessionList } from "@/components/dashboard/session-list";
import { LeadCards } from "@/components/dashboard/lead-cards";

export default function DashboardPage() {
  const { user } = useMockAuth();

  return (
    <ClientAuthGuard>
      <main className="min-h-screen bg-background">
        <section className="mx-auto max-w-[1100px] px-8 py-10 pt-28">
          {/* 1. Welcome Header */}
          <WelcomeHeader
            userName={user?.name ?? "Guest"}
            plan={user?.plan ?? "free"}
          />

          {/* 2. Agent Usage Cards */}
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {agents.map((agent, i) => (
              <AgentUsageCard
                key={agent.slug}
                agent={agent}
                usage={mockUsage[agent.slug] ?? { used: 0, limit: 1, unit: "uses" }}
                index={i}
              />
            ))}
          </div>

          {/* 3. Stats Row */}
          <div className="mt-10">
            <StatsRow stats={mockStats} />
          </div>

          {/* 4. Session List */}
          <div className="mt-10">
            <SessionList sessions={mockSessions} />
          </div>

          {/* 5. Lead Cards */}
          <div className="mt-10 pb-12">
            <LeadCards leads={mockLeads} />
          </div>
        </section>
      </main>
    </ClientAuthGuard>
  );
}
