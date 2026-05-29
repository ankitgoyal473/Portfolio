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
    .eq("agent_id", "harvey")
    .single();
  if ((usageRow?.count ?? 0) >= (LIMITS["harvey"] ?? 10)) {
    return NextResponse.json({ error: "paywall" }, { status: 403 });
  }

  const { offer, tone, count } = await request.json();
  if (!offer) return NextResponse.json({ error: "offer required" }, { status: 400 });

  // Cap at 5 for cost control
  const safeCount = Math.min(count ?? 3, 5);
  const toneLabel = tone ?? "Executive";

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: `You are Harvey, a cold email personalization expert. You craft hyper-personalized opening lines that feel researched and genuine. Each opener is 1-2 sentences, ${toneLabel.toLowerCase()} in tone, specific to the person and company, and designed to get a reply. Never use clichés. Be clever, direct, and human.`,
    messages: [
      {
        role: "user",
        content: `Generate ${safeCount} fictional prospect entries for someone selling: "${offer}"

Tone: ${toneLabel}

Return ONLY valid JSON with this exact shape:
{
  "prospects": [
    { "name": "First Last", "company": "Company Name", "opener": "Personalized 1-2 sentence cold email opener referencing something specific about them or their company." }
  ]
}

Make each name, company, and opener realistic and distinct. The opener must reference the ${toneLabel.toLowerCase()} tone and what they are selling.`,
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
