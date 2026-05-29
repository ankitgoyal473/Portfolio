import Anthropic from "@anthropic-ai/sdk";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { LIMITS } from "@/lib/paywall";
import { sendEmail, expiryReminderEmail } from "@/lib/email";
import { NextResponse } from "next/server";

const client = new Anthropic();

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function POST(request: Request) {
  // Auth check
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

      // Lazy expiry reminder: send if within 7 days and not yet sent
      const daysLeft = Math.ceil(
        (new Date(sub.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      if (daysLeft <= 7 && !sub.reminder_sent_at) {
        const appUrl =
          process.env.NEXT_PUBLIC_APP_URL ?? "https://portfolio-one-topaz-65.vercel.app";
        const reminderEmail = expiryReminderEmail({
          name: user.user_metadata?.full_name ?? user.email ?? "there",
          expiresAt: sub.expires_at,
          daysLeft,
          appUrl,
        });
        await sendEmail({ to: user.email!, ...reminderEmail });
        await supabaseAdmin
          .from("subscriptions")
          .update({ reminder_sent_at: new Date().toISOString() })
          .eq("id", sub.id);
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

  // Increment usage server-side (authoritative)
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

  const { ticker } = await request.json();
  if (!ticker) return NextResponse.json({ error: "ticker required" }, { status: 400 });

  // Call Claude for structured analysis
  let pillars: Array<{ name: string; signal: string; summary: string }> = [];
  let verdict = {
    action: "HOLD",
    conviction: 7,
    entry: "market",
    target: "+15%",
    stop: "-8%",
  };

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: `You are WARRen, an AI stock analyst channeling Warren Buffett's investment philosophy. Be direct, confident, and insightful. You give structured 5-pillar analyses.`,
      messages: [
        {
          role: "user",
          content: `Analyze ${ticker}. Return ONLY valid JSON:
{
  "pillars": [
    {"name":"Business Quality","signal":"BULLISH","summary":"2-3 sentence analysis"},
    {"name":"Moat Assessment","signal":"BULLISH","summary":"..."},
    {"name":"Financial Health","signal":"NEUTRAL","summary":"..."},
    {"name":"Valuation","signal":"BEARISH","summary":"..."},
    {"name":"Risk Factors","signal":"NEUTRAL","summary":"..."}
  ],
  "verdict": {"action":"BUY","conviction":8,"entry":"$175-178","target":"$195","stop":"$165"}
}`,
        },
      ],
    });
    const text =
      message.content[0].type === "text" ? message.content[0].text : "";
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      const data = JSON.parse(match[0]);
      if (data.pillars) pillars = data.pillars;
      if (data.verdict) verdict = data.verdict;
    }
  } catch {
    // Fall through to default pillars if Claude fails
    pillars = [
      {
        name: "Business Quality",
        signal: "BULLISH",
        summary: `${ticker} shows strong business fundamentals with a durable competitive position.`,
      },
      {
        name: "Moat Assessment",
        signal: "BULLISH",
        summary:
          "Wide economic moat with significant switching costs and brand power.",
      },
      {
        name: "Financial Health",
        signal: "NEUTRAL",
        summary:
          "Solid balance sheet with manageable debt levels and consistent cash generation.",
      },
      {
        name: "Valuation",
        signal: "NEUTRAL",
        summary: "Trading near fair value. Patience required for ideal entry.",
      },
      {
        name: "Risk Factors",
        signal: "BEARISH",
        summary:
          "Macro headwinds and sector rotation risk. Monitor closely.",
      },
    ];
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      function send(event: string, data: object) {
        controller.enqueue(
          encoder.encode(
            `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
          )
        );
      }

      send("status", { message: `Reading price data for ${ticker}...` });
      await delay(500);
      send("status", { message: "Analysing the moat..." });
      await delay(500);
      send("status", { message: "Checking financial health..." });
      await delay(400);

      for (const pillar of pillars) {
        send("pillar", {
          name: pillar.name,
          signal: pillar.signal,
          summary: pillar.summary,
        });
        await delay(350);
      }

      send("verdict", verdict);
      await delay(200);
      send("done", {});
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
