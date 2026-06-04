import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export type PaywallStage = "fresh" | "aware" | "warning" | "locked";

export interface UsageState {
  used: number;
  limit: number;
  stage: PaywallStage;
}

export const LIMITS: Record<string, number> = {
  warren: 1,
  sherlock: 1,
  harvey: 10,
};

export async function getUsage(
  agentId: string,
  userId: string
): Promise<UsageState> {
  const limit = LIMITS[agentId] ?? 1;
  try {
    const supabase = createBrowserSupabaseClient();
    const { data } = await supabase
      .from("agent_usage")
      .select("count")
      .eq("user_id", userId)
      .eq("agent_id", agentId)
      .single();
    const used = data?.count ?? 0;
    return { used, limit, stage: computeStage(used, limit) };
  } catch {
    return { used: 0, limit, stage: "fresh" };
  }
}

export async function incrementUsage(
  agentId: string,
  userId: string
): Promise<UsageState> {
  const limit = LIMITS[agentId] ?? 1;
  try {
    const supabase = createBrowserSupabaseClient();

    // Fetch current count
    const { data: existing } = await supabase
      .from("agent_usage")
      .select("count")
      .eq("user_id", userId)
      .eq("agent_id", agentId)
      .single();

    const newCount = (existing?.count ?? 0) + 1;

    await supabase.from("agent_usage").upsert(
      { user_id: userId, agent_id: agentId, count: newCount },
      { onConflict: "user_id,agent_id" }
    );

    return {
      used: newCount,
      limit,
      stage: computeStage(newCount, limit),
    };
  } catch {
    return { used: 0, limit, stage: "fresh" };
  }
}

export async function resetUsage(
  agentId: string,
  userId: string
): Promise<void> {
  try {
    const supabase = createBrowserSupabaseClient();
    await supabase
      .from("agent_usage")
      .delete()
      .eq("user_id", userId)
      .eq("agent_id", agentId);
  } catch {
    // Ignore errors on reset
  }
}

export function computeStage(used: number, limit: number): PaywallStage {
  if (used === 0) return "fresh";
  if (used < limit) return "aware";
  if (used === limit) return "warning";
  return "locked";
}

export function isLocked(stage: PaywallStage): boolean {
  return stage === "warning" || stage === "locked";
}

export const PAYWALL_MESSAGES: Record<string, string> = {
  warren:
    "That was my last free report for you this month. I have more to say — shall we continue? — WARRen \u{1F9D0}",
  sherlock:
    "I've used up my free surveillance quota for the month. I have more intelligence to gather. The game doesn't have to end here. — Sherlock \u{1F50E}",
  harvey:
    "That's your last free batch. I've got more prospects waiting — and I'm just warming up. Shall we keep going? — Harvey \u{1F4BC}",
};


export const PAYWALL_SHEET_DATA: Record<
  string,
  {
    headline: string;
    subtext: string;
    features: string[];
    price: string;
    buttonText: string;
  }
> = {
  warren: {
    headline: "WARRen has more analysis to share.",
    subtext:
      "You've used your 1 free report this month. Unlock WARRen for full 5-pillar analysis, PDF export, and unlimited reports.",
    features: ["5-pillar analysis", "PDF export", "Unlimited"],
    price: "$19",
    buttonText: "Unlock WARRen — $19/month",
  },
  sherlock: {
    headline: "Sherlock is still on the case.",
    subtext:
      "You've used your free scan. Unlock Sherlock for 5 rivals, weekly auto-digest, and Monday email delivery.",
    features: ["5 rivals", "Weekly digest", "Email delivery"],
    price: "$49",
    buttonText: "Unlock Sherlock — $49/month",
  },
  harvey: {
    headline: "Harvey has more prospects waiting.",
    subtext:
      "You've used your 10 free prospect emails. Unlock Harvey for unlimited prospects, 3 tone variants, and campaign history.",
    features: ["Unlimited rows", "3 tones", "Campaign history"],
    price: "$29",
    buttonText: "Unlock Harvey — $29/month",
  },
};
