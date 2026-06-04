import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { LIMITS } from "@/lib/paywall";

const client = new Anthropic();

export async function POST(request: Request) {
  // Auth check
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Paywall check
  const { data: usageRow } = await supabase
    .from("agent_usage")
    .select("count")
    .eq("user_id", user.id)
    .eq("agent_id", "warren")
    .single();
  if ((usageRow?.count ?? 0) >= (LIMITS["warren"] ?? 1)) {
    return NextResponse.json({ error: "paywall" }, { status: 403 });
  }

  const { ticker } = await request.json();
  if (!ticker) return NextResponse.json({ error: "ticker required" }, { status: 400 });

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: `You are Warren, an AI stock analyst channeling Warren Buffett's investment philosophy. You perform deep, structured 5-pillar analyses with conviction and wit. Speak in first person as Warren. Be direct, confident, insightful.`,
    messages: [
      {
        role: "user",
        content: `Analyze ${ticker} across these 5 pillars. Return ONLY valid JSON with this exact shape:
{
  "pillars": [
    { "name": "Business Quality", "icon": "🏛️", "signal": "BULLISH"|"BEARISH"|"NEUTRAL", "body": "2-3 sentence analysis" },
    { "name": "Moat Assessment", "icon": "🏰", "signal": "BULLISH"|"BEARISH"|"NEUTRAL", "body": "2-3 sentence analysis" },
    { "name": "Financial Health", "icon": "📊", "signal": "BULLISH"|"BEARISH"|"NEUTRAL", "body": "2-3 sentence analysis" },
    { "name": "Valuation", "icon": "💰", "signal": "BULLISH"|"BEARISH"|"NEUTRAL", "body": "2-3 sentence analysis" },
    { "name": "Risk Factors", "icon": "⚠️", "signal": "BULLISH"|"BEARISH"|"NEUTRAL", "body": "2-3 sentence analysis" }
  ],
  "verdict": "BUY"|"HOLD"|"AVOID",
  "summary": "One punchy Warren-voice sentence verdict."
}`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return NextResponse.json({ error: "parse error" }, { status: 500 });

  try {
    const data = JSON.parse(jsonMatch[0]);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "parse error" }, { status: 500 });
  }
}
