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
    .eq("agent_id", "sherlock")
    .single();
  if ((usageRow?.count ?? 0) >= (LIMITS["sherlock"] ?? 1)) {
    return NextResponse.json({ error: "paywall" }, { status: 403 });
  }

  const { url } = await request.json();
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: `You are Sherlock, a sharp competitor intelligence detective. You analyze companies with deductive precision and a dry wit. You uncover what rivals are hiding in plain sight — pricing changes, hiring signals, strategic moves. Be incisive, direct, and speak like a detective filing a case report.`,
    messages: [
      {
        role: "user",
        content: `Produce a competitor intelligence case file for: ${url}

Return ONLY valid JSON with this exact shape:
{
  "threatLevel": "LOW"|"MEDIUM"|"HIGH",
  "summary": "One sharp detective-voice sentence summarizing the overall threat.",
  "sections": [
    {
      "title": "Recent Moves",
      "badge": "STRATEGIC SHIFT",
      "badgeColor": "red"|"yellow"|"green",
      "bullets": ["bullet 1", "bullet 2", "bullet 3"]
    },
    {
      "title": "Pricing Intel",
      "badge": "PRICING CHANGE",
      "badgeColor": "red"|"yellow"|"green",
      "bullets": ["bullet 1", "bullet 2"]
    },
    {
      "title": "Hiring Signals",
      "badge": "HIRING SIGNAL",
      "badgeColor": "yellow",
      "bullets": ["bullet 1", "bullet 2"]
    }
  ]
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
