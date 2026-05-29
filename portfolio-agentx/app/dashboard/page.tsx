"use client";

import { useEffect, useState } from "react";
import { ClientAuthGuard } from "@/components/auth/client-auth-guard";
import { useMockAuth } from "@/lib/mock-auth";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { AgentUsage, MockSession, MockLead } from "@/lib/mock-data";
import { agents } from "@/lib/agents";
import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import { AgentUsageCard } from "@/components/dashboard/agent-usage-card";
import { StatsRow } from "@/components/dashboard/stats-row";
import { SessionList } from "@/components/dashboard/session-list";
import { LeadCards } from "@/components/dashboard/lead-cards";

const LIMITS: Record<string, number> = {
  warren: 1,
  sherlock: 1,
  harvey: 10,
};

const UNITS: Record<string, string> = {
  warren: "reports",
  sherlock: "rivals",
  harvey: "rows",
};

export default function DashboardPage() {
  const { user } = useMockAuth();

  const [usageMap, setUsageMap] = useState<Record<string, AgentUsage>>(() =>
    Object.fromEntries(
      agents.map((a) => [
        a.slug,
        { used: 0, limit: LIMITS[a.slug] ?? 1, unit: UNITS[a.slug] ?? "uses" },
      ])
    )
  );
  const [sessions, setSessions] = useState<MockSession[]>([]);
  const [leads, setLeads] = useState<MockLead[]>([]);
  const [stats, setStats] = useState({
    reportsRun: 0,
    rivalsTracked: 0,
    emailsWritten: 0,
    sessionsSaved: 0,
  });

  useEffect(() => {
    if (!user?.id) return;
    const supabase = createBrowserSupabaseClient();

    // Fetch agent usage
    supabase
      .from("agent_usage")
      .select("agent_id, count")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, AgentUsage> = { ...usageMap };
        for (const row of data) {
          map[row.agent_id] = {
            used: row.count ?? 0,
            limit: LIMITS[row.agent_id] ?? 1,
            unit: UNITS[row.agent_id] ?? "uses",
          };
        }
        setUsageMap(map);

        // Compute stats from usage
        const warren = data.find((r) => r.agent_id === "warren")?.count ?? 0;
        const sherlock = data.find((r) => r.agent_id === "sherlock")?.count ?? 0;
        const harvey = data.find((r) => r.agent_id === "harvey")?.count ?? 0;
        setStats((prev) => ({
          ...prev,
          reportsRun: warren,
          rivalsTracked: sherlock,
          emailsWritten: harvey,
        }));
      });

    // Fetch sessions
    supabase
      .from("agent_sessions")
      .select("id, agent_id, created_at, title, messages")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (!data) return;
        const mapped: MockSession[] = data.map((row) => {
          const msgs = (row.messages as unknown[]) ?? [];
          return {
            id: row.id,
            agentId: row.agent_id,
            createdAt: row.created_at,
            inputSummary: row.title ?? "",
            rowCount: msgs.length,
            status: "complete" as const,
          };
        });
        setSessions(mapped);
        setStats((prev) => ({ ...prev, sessionsSaved: mapped.length }));
      });

    // Fetch leads submitted by the user's email
    if (user.email) {
      fetch("/api/leads")
        .then((r) => r.json())
        .then((data: unknown) => {
          if (!Array.isArray(data)) return;
          const userLeads: MockLead[] = data
            .filter(
              (row: Record<string, unknown>) =>
                row.user_email === user.email
            )
            .map((row: Record<string, unknown>) => ({
              id: row.id as string,
              problem: (row.problem as string) ?? "",
              budget: (row.budget as string) ?? "",
              estimateLow: (row.estimate_low as number) ?? 0,
              estimateHigh: (row.estimate_high as number) ?? 0,
              status: (row.status as MockLead["status"]) ?? "pending",
              calendlyUrl: undefined,
              createdAt: row.created_at as string,
            }));
          setLeads(userLeads);
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.email]);

  return (
    <ClientAuthGuard>
      <main className="min-h-screen bg-background">
        <section className="mx-auto max-w-[1100px] px-8 py-10 pt-28">
          {/* 1. Welcome Header */}
          <WelcomeHeader
            userName={
              user?.user_metadata?.full_name ?? user?.email ?? "Guest"
            }
            plan="free"
          />

          {/* 2. Agent Usage Cards */}
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {agents.map((agent, i) => (
              <AgentUsageCard
                key={agent.slug}
                agent={agent}
                usage={
                  usageMap[agent.slug] ?? {
                    used: 0,
                    limit: 1,
                    unit: "uses",
                  }
                }
                index={i}
              />
            ))}
          </div>

          {/* 3. Stats Row */}
          <div className="mt-10">
            <StatsRow stats={stats} />
          </div>

          {/* 4. Session List */}
          <div className="mt-10">
            <SessionList sessions={sessions} />
          </div>

          {/* 5. Lead Cards */}
          <div className="mt-10 pb-12">
            <LeadCards leads={leads} />
          </div>
        </section>
      </main>
    </ClientAuthGuard>
  );
}
