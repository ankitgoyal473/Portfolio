"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Lead, getLeads, updateLeadStatus } from "@/lib/mock-leads";
import { StatsRow } from "@/components/admin/stats-row";
import { LeadCard } from "@/components/admin/lead-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

const ADMIN_PASSWORD = "admin123";
const COOKIE_NAME = "agentx-admin";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(^| )" + name + "=([^;]+)")
  );
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 7}`;
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><p className="text-foreground-secondary">Loading...</p></div>}>
      <AdminContent />
    </Suspense>
  );
}

function AdminContent() {
  const searchParams = useSearchParams();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    // Check query param
    const pw = searchParams.get("pw");
    if (pw === ADMIN_PASSWORD) {
      setCookie(COOKIE_NAME, ADMIN_PASSWORD);
      setAuthenticated(true);
      return;
    }
    // Check cookie
    const cookieVal = getCookie(COOKIE_NAME);
    if (cookieVal === ADMIN_PASSWORD) {
      setAuthenticated(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (authenticated) {
      setLeads(getLeads());
    }
  }, [authenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setCookie(COOKIE_NAME, ADMIN_PASSWORD);
      setAuthenticated(true);
      setError("");
    } else {
      setError("Invalid password");
    }
  };

  const handleStatusChange = async (
    id: string,
    status: "accepted" | "declined",
    note?: string
  ) => {
    // Update localStorage
    updateLeadStatus(id, status, note);

    // Call API (mock)
    try {
      await fetch("/api/update-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, note }),
      });
    } catch {
      // API is a stub, ignore errors
    }

    // Refresh state
    setLeads(getLeads());
  };

  // Login screen
  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-accent-muted p-3">
              <Shield className="h-6 w-6 text-accent" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Admin Access</h1>
            <form onSubmit={handleLogin} className="w-full space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-lg border border-border bg-background-secondary p-3 text-sm text-foreground placeholder:text-foreground-muted focus:border-border-hover focus:outline-none"
                autoFocus
              />
              {error && (
                <p className="text-center text-xs text-red-400">{error}</p>
              )}
              <Button type="submit" className="w-full">
                Unlock
              </Button>
            </form>
          </div>
        </Card>
      </div>
    );
  }

  // Dashboard
  const sortedLeads = [...leads].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
      </div>
    </div>
  );
}
