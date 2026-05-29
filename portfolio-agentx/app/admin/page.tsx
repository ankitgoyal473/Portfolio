"use client";

// To grant admin access, run in Supabase SQL editor:
// UPDATE auth.users
//   SET raw_user_meta_data = raw_user_meta_data || '{"is_admin": true}'
//   WHERE email = 'your@email.com';

import { Suspense, useState, useEffect } from "react";
import { useMockAuth } from "@/lib/mock-auth";
import type { Lead } from "@/lib/mock-leads";
import { StatsRow } from "@/components/admin/stats-row";
import { LeadCard } from "@/components/admin/lead-card";
import { Card } from "@/components/ui/card";
import { Shield, Users } from "lucide-react";

type AdminUser = {
  id: string;
  email: string;
  name: string;
  is_premium: boolean;
  is_admin: boolean;
  created_at: string;
};

// Map the snake_case API response to the camelCase Lead type
function mapApiLead(row: Record<string, unknown>): Lead {
  return {
    id: row.id as string,
    createdAt: row.created_at as string,
    problem: (row.problem as string) ?? "",
    workflow: (row.workflow as string) ?? "",
    timeline: (row.timeline as string) ?? "",
    budget: (row.budget as string) ?? "",
    notes: (row.notes as string) ?? "",
    complexity: (row.complexity as string) ?? "",
    delivery: (row.delivery as string) ?? "",
    stack: (row.stack as string) ?? "",
    estimateLow: (row.estimate_low as number) ?? 0,
    estimateHigh: (row.estimate_high as number) ?? 0,
    userEmail: (row.user_email as string) ?? "",
    status: (row.status as Lead["status"]) ?? "pending",
    ankitNote: (row.ankit_note as string) ?? "",
  };
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-foreground-secondary">Loading...</p>
        </div>
      }
    >
      <AdminContent />
    </Suspense>
  );
}

function AdminContent() {
  const { user, isLoading } = useMockAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);

  const isAdmin = user?.user_metadata?.is_admin === true;

  useEffect(() => {
    if (!isAdmin) return;

    fetch("/api/leads")
      .then((res) => res.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) {
          setLeads(data.map(mapApiLead));
        } else {
          setFetchError("Failed to load leads.");
        }
      })
      .catch(() => setFetchError("Failed to load leads."));

    fetch("/api/admin/users")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data: unknown) => {
        if (Array.isArray(data)) {
          setUsers(data as AdminUser[]);
        }
      })
      .catch(() => {});
  }, [isAdmin]);

  const togglePremium = async (userId: string, current: boolean) => {
    const res = await fetch("/api/admin/set-premium", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, premium: !current }),
    });
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_premium: !current } : u))
      );
    }
  };

  const handleStatusChange = async (
    id: string,
    status: "accepted" | "declined",
    note?: string
  ) => {
    try {
      await fetch("/api/update-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, note }),
      });
    } catch {
      // Ignore network errors
    }

    // Refresh leads from API
    fetch("/api/leads")
      .then((res) => res.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) {
          setLeads(data.map(mapApiLead));
        }
      })
      .catch(() => {});
  };

  // Still loading auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-foreground-secondary">Loading...</p>
      </div>
    );
  }

  // Logged in but not admin
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-accent-muted p-3">
              <Shield className="h-6 w-6 text-accent" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Access Denied</h1>
            <p className="text-sm text-center text-foreground-secondary">
              You do not have admin access. Contact Ankit to request permissions.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Dashboard
  const sortedLeads = [...leads].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">AGentX Leads</h1>
          <p className="mt-1 text-sm text-foreground-secondary">
            Manage incoming project leads
          </p>
        </div>

        {fetchError && (
          <p className="text-sm text-red-400">{fetchError}</p>
        )}

        {/* Stats */}
        <StatsRow leads={leads} />

        {/* Lead cards */}
        {sortedLeads.length === 0 ? (
          <Card className="text-center">
            <p className="text-foreground-secondary">
              No leads yet. They will appear here after users submit through the
              discovery chat.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sortedLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}

        {/* Users section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-bold text-foreground">Users</h2>
            <span className="ml-1 rounded-full bg-background-card border border-border px-2 py-0.5 text-xs text-foreground-secondary">
              {users.length}
            </span>
          </div>

          {users.length === 0 ? (
            <Card className="text-center">
              <p className="text-foreground-secondary">No users found.</p>
            </Card>
          ) : (
            <div className="rounded-xl border border-border bg-background-card overflow-hidden">
              {users.map((u, idx) => {
                const initials = u.name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();
                const joinedDate = new Date(u.created_at).toLocaleDateString(
                  "en-US",
                  { month: "short", day: "numeric", year: "numeric" }
                );
                return (
                  <div
                    key={u.id}
                    className={`flex items-center gap-4 px-5 py-4 ${
                      idx !== users.length - 1
                        ? "border-b border-border"
                        : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-background"
                      style={{ backgroundColor: "#E8D5B8" }}
                    >
                      {initials || "?"}
                    </div>

                    {/* Name + email */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground truncate">
                          {u.name}
                        </span>
                        {u.is_admin && (
                          <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                            Admin
                          </span>
                        )}
                        {u.is_premium && (
                          <span className="rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                            Premium
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-foreground-secondary truncate mt-0.5">
                        {u.email}
                      </p>
                    </div>

                    {/* Joined date */}
                    <span className="hidden sm:block text-xs text-foreground-secondary shrink-0">
                      Joined {joinedDate}
                    </span>

                    {/* Premium toggle */}
                    <button
                      onClick={() => togglePremium(u.id, u.is_premium)}
                      className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        u.is_premium
                          ? "border-success/30 bg-success/10 text-success hover:bg-success/20"
                          : "border-accent/40 bg-accent/10 text-accent hover:bg-accent/20"
                      }`}
                    >
                      {u.is_premium ? "✓ Premium" : "Grant Premium"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
