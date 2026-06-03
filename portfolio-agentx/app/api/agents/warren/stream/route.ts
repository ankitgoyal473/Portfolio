export const runtime = "edge";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { LIMITS } from "@/lib/paywall";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Auth check
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { ticker } = body as { ticker?: string };
  if (!ticker) return NextResponse.json({ error: "ticker required" }, { status: 400 });

  const agentUrl = process.env.WARREN_AGENT_URL;
  if (!agentUrl) return NextResponse.json({ error: "WARREN_AGENT_URL not configured" }, { status: 500 });

  const isPremium = user.user_metadata?.is_premium === true;
  let subscriptionActive = false;

  if (isPremium) {
    // Check subscription table for valid active subscription
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("id, expires_at, reminder_sent_at")
      .eq("user_id", user.id)
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: false })
      .limit(1)
      .single();

    if (sub) {
      subscriptionActive = true;

      // Lazy expiry reminder: fire-and-forget via /api/send-reminder (non-edge)
      const daysLeft = Math.ceil(
        (new Date(sub.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      if (daysLeft <= 7 && !sub.reminder_sent_at) {
        const appUrl =
          process.env.NEXT_PUBLIC_APP_URL ?? "https://portfolio-one-topaz-65.vercel.app";
        void fetch(new URL("/api/send-reminder", request.url).toString(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-internal-token": process.env.INTERNAL_SECRET ?? "",
          },
          body: JSON.stringify({
            subscriptionId: sub.id,
            userId: user.id,
            userEmail: user.email,
            userName: user.user_metadata?.full_name ?? user.email ?? "there",
            expiresAt: sub.expires_at,
            daysLeft,
            appUrl,
          }),
        });
      }
    } else {
      // Subscription expired — clear is_premium
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: { is_premium: false },
      });
    }
  }

  // Paywall check (skipped for active subscribers)
  if (!subscriptionActive) {
    const { data: usageRow } = await supabase
      .from("agent_usage")
      .select("count")
      .eq("user_id", user.id)
      .eq("agent_id", "warren")
      .single();
    if ((usageRow?.count ?? 0) >= (LIMITS["warren"] ?? 1)) {
      return NextResponse.json({ error: "paywall" }, { status: 403 });
    }
  }

  // Increment usage server-side — skipped for active premium subscribers
  if (!subscriptionActive) {
    const { data: currentUsage } = await supabase
      .from("agent_usage")
      .select("count")
      .eq("user_id", user.id)
      .eq("agent_id", "warren")
      .single();
    const newCount = (currentUsage?.count ?? 0) + 1;
    await supabase.from("agent_usage").upsert(
      { user_id: user.id, agent_id: "warren", count: newCount },
      { onConflict: "user_id,agent_id" }
    );
  }

  const upstream = await fetch(`${agentUrl}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ticker,
      user_id: user.id,
      api_key: process.env.ANTHROPIC_API_KEY ?? "",
    }),
  });

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Agent unavailable" }, { status: 502 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
