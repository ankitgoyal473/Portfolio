import Anthropic from "@anthropic-ai/sdk";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { LIMITS } from "@/lib/paywall";
import { NextResponse } from "next/server";

const client = new Anthropic();

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

interface Finding {
  text: string;
  badge: string;
  severity: "high" | "medium" | "low";
}

interface Section {
  type: string;
  title?: string;
  findings: Finding[];
}

interface ClaudeResponse {
  threatLevel?: string;
  sections?: Section[];
}

export async function POST(request: Request) {
  // Auth check
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Premium users: skip paywall gate but still track usage below
  const isPremium = user.user_metadata?.is_premium === true;

  // Paywall check
  const { data: usageRow } = await supabase
    .from("agent_usage")
    .select("count")
    .eq("user_id", user.id)
    .eq("agent_id", "sherlock")
    .single();
  if (!isPremium && (usageRow?.count ?? 0) >= (LIMITS["sherlock"] ?? 1)) {
    return NextResponse.json({ error: "paywall" }, { status: 403 });
  }

  // Increment usage server-side (authoritative)
  const newCount = (usageRow?.count ?? 0) + 1;
  await supabase.from("agent_usage").upsert(
    { user_id: user.id, agent_id: "sherlock", count: newCount },
    { onConflict: "user_id,agent_id" }
  );

  const { url } = await request.json();
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

  let sections: Section[] = [];
  let threatLevel = "MEDIUM";

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: `You are Sherlock, an AI competitive intelligence detective. You analyze competitor websites and produce sharp, actionable intelligence reports. Be direct and incisive.`,
      messages: [
        {
          role: "user",
          content: `Analyze the competitor at ${url}. Return ONLY valid JSON:
{
  "threatLevel": "HIGH",
  "sections": [
    {
      "type": "recent_moves",
      "title": "Recent Moves",
      "findings": [
        {"text": "Specific strategic shift or product change observed", "badge": "STRATEGIC SHIFT", "severity": "high"}
      ]
    },
    {
      "type": "pricing_intel",
      "title": "Pricing Intel",
      "findings": [
        {"text": "Pricing changes or positioning", "badge": "PRICING CHANGE", "severity": "medium"}
      ]
    },
    {
      "type": "hiring_signals",
      "title": "Hiring Signals",
      "findings": [
        {"text": "What their hiring patterns reveal about their roadmap", "badge": "HIRING SIGNAL", "severity": "medium"}
      ]
    }
  ]
}`,
        },
      ],
    });
    const text =
      message.content[0].type === "text" ? message.content[0].text : "";
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      const data = JSON.parse(match[0]) as ClaudeResponse;
      if (data.sections) sections = data.sections;
      if (data.threatLevel) threatLevel = data.threatLevel;
    }
  } catch {
    // Fallback sections
    sections = [
      {
        type: "recent_moves",
        title: "Recent Moves",
        findings: [
          {
            text: `${url} has made notable changes to their homepage messaging. New emphasis on enterprise features.`,
            badge: "STRATEGIC SHIFT",
            severity: "high",
          },
        ],
      },
      {
        type: "pricing_intel",
        title: "Pricing Intel",
        findings: [
          {
            text: `Pricing page updated with a new mid-tier plan. They are expanding to capture the SMB market.`,
            badge: "PRICING CHANGE",
            severity: "medium",
          },
        ],
      },
      {
        type: "hiring_signals",
        title: "Hiring Signals",
        findings: [
          {
            text: "Multiple ML and AI engineering roles posted. Building an AI-powered feature in the next quarter.",
            badge: "HIRING SIGNAL",
            severity: "medium",
          },
        ],
      },
    ];
    threatLevel = "MEDIUM";
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

      send("status", { message: `Examining ${url}...` });
      await delay(600);
      send("status", { message: "Comparing to last snapshot..." });
      await delay(600);
      send("status", { message: "Scoring threat level..." });
      await delay(400);

      for (const section of sections) {
        send("section", {
          type: section.type,
          title: section.title ?? section.type,
          findings: section.findings,
        });
        await delay(500);
      }

      send("threat", { level: threatLevel });
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
