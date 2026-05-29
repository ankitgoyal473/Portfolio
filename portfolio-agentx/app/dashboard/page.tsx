"use client";

import { useEffect, useState } from "react";
import { ClientAuthGuard } from "@/components/auth/client-auth-guard";
import { useMockAuth } from "@/lib/mock-auth";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { AgentUsage, MockSession, MockLead } from "@/lib/mock-data";
import { agents } from "@/lib/agents";
import Link from "next/link";
import { Shield } from "lucide-react";
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
  const [subscription, setSubscription] = useState<{
    status: string;
    expires_at: string;
    daysLeft: number;
  } | null>(null);

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

    // Fetch subscription for premium users
    if (user.user_metadata?.is_premium) {
      supabase
        .from("subscriptions")
        .select("status, expires_at")
        .eq("user_id", user.id)
        .eq("status", "active")
        .gt("expires_at", new Date().toISOString())
        .order("expires_at", { ascending: false })
        .limit(1)
        .single()
        .then(({ data }) => {
          if (data) {
            const daysLeft = Math.ceil(
              (new Date(data.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );
            setSubscription({ ...data, daysLeft });
          }
        });
    }

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
            plan={subscription ? "pro" : "free"}
          />

          {/* 2. Agent Usage Cards */}
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {agents.map((agent, i) => (
              <AgentUsageCard
                key={agent.slug}
                agent={agent}
                usage={
                  subscription
                    ? { used: 0, limit: 999, unit: UNITS[agent.slug] ?? "uses" }
                    : usageMap[agent.slug] ?? {
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

          {/* Subscription card — visible to Pro users */}
          {subscription && (
            <div className="mt-10">
              <div className="rounded-xl border border-accent/20 bg-accent/5 px-6 py-5">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-accent">✦ AGentX Pro</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        subscription.daysLeft <= 7
                          ? "bg-error/10 text-error border border-error/20"
                          : "bg-success/10 text-success border border-success/20"
                      }`}>
                        {subscription.daysLeft <= 7 ? `${subscription.daysLeft} days left` : "Active"}
                      </span>
                    </div>
                    <p className="text-sm text-foreground-secondary">
                      Active until {new Date(subscription.expires_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "long", year: "numeric"
                      })}
                    </p>
                  </div>
                  {subscription.daysLeft <= 7 && (
                    <button
                      onClick={() => {
                        window.location.href = "/agents/warren";
                      }}
                      className="rounded-lg border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent hover:bg-accent/20 transition-colors"
                    >
                      Renew — ₹999
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Admin Panel — visible only to admins */}
          {user?.user_metadata?.is_admin === true && (
            <div className="mt-10">
              <Link href="/admin">
                <div className="flex items-center gap-4 rounded-xl border border-accent/30 bg-accent/5 px-6 py-4 transition-colors hover:bg-accent/10 cursor-pointer">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15">
                    <Shield className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-accent">Admin Panel</p>
                    <p className="text-xs text-foreground-secondary">
                      Manage leads, users, and premium access
                    </p>
                  </div>
                  <span className="text-xs text-accent font-medium">Open →</span>
                </div>
              </Link>
            </div>
          )}

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
