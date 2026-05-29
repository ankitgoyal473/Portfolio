import Anthropic from "@anthropic-ai/sdk";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { LIMITS } from "@/lib/paywall";
import { NextResponse } from "next/server";

const client = new Anthropic();

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

interface ProspectData {
  name: string;
  company: string;
  title: string;
  opener: string;
}

interface ClaudeResponse {
  prospects?: ProspectData[];
}

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

  // Increment usage server-side (authoritative)
  const newCount = (usageRow?.count ?? 0) + 1;
  await supabase.from("agent_usage").upsert(
    { user_id: user.id, agent_id: "harvey", count: newCount },
    { onConflict: "user_id,agent_id" }
  );

  const body = await request.json();
  const offer: string = body.offer ?? "software product";
  const tone: string = body.tone ?? "direct";
  const count: number = Math.min(body.count ?? 3, 5);

  let prospects: ProspectData[] = [];

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: `You are Harvey, an expert cold email copywriter. You write highly personalized, punchy openers that get replies. Match the requested tone exactly.`,
      messages: [
        {
          role: "user",
          content: `Generate ${count} cold email prospects for this offer: "${offer}". Use a ${tone} tone.
Return ONLY valid JSON:
{
  "prospects": [
    {
      "name": "First Last",
      "company": "Company Name",
      "title": "Job Title",
      "opener": "Personalized 1-2 sentence cold email opener referencing their company/role"
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
      if (data.prospects) prospects = data.prospects;
    }
  } catch {
    // Fallback prospects
    prospects = [
      {
        name: "Sarah Chen",
        company: "Acme Inc",
        title: "VP Engineering",
        opener: `Sarah — Acme's engineering team scaled fast. That kind of growth usually means tooling gaps. Worth a 15-min call?`,
      },
      {
        name: "Marcus Johnson",
        company: "TechFlow",
        title: "Head of Growth",
        opener: `Marcus — saw TechFlow's new product launch — congrats! Quick thought on how ${offer} could accelerate what you're building...`,
      },
      {
        name: "Priya Patel",
        company: "DataVault",
        title: "CTO",
        opener: `Priya — CTOs at companies like DataVault usually hit the same bottleneck around this stage. I have a specific idea for you.`,
      },
    ].slice(0, count);
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

      send("status", { message: "Parsing prospects..." });
      await delay(400);
      send("status", { message: "Researching companies..." });
      await delay(600);
      send("status", { message: "Writing openers..." });
      await delay(400);

      for (let i = 0; i < prospects.length; i++) {
        const p = prospects[i];
        send("prospect", {
          index: i,
          name: p.name,
          company: p.company,
          title: p.title,
          opener: p.opener,
        });
        await delay(150);
      }

      send("done", { totalCount: prospects.length });
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
