export type PaywallStage = "fresh" | "aware" | "warning" | "locked";

const USAGE_PREFIX = "agentx_usage_";

export interface UsageState {
  used: number;
  limit: number;
  stage: PaywallStage;
}

const LIMITS: Record<string, number> = {
  warren: 1,
  sherlock: 1,
  harvey: 10,
};

export function getUsage(agentId: string): UsageState {
  const limit = LIMITS[agentId] ?? 1;
  if (typeof window === "undefined") {
    return { used: 0, limit, stage: "fresh" };
  }

  const stored = localStorage.getItem(`${USAGE_PREFIX}${agentId}`);
  const used = stored ? parseInt(stored, 10) : 0;

  return { used, limit, stage: computeStage(used, limit) };
}

export function incrementUsage(agentId: string): UsageState {
  if (typeof window === "undefined") {
    return getUsage(agentId);
  }

  const limit = LIMITS[agentId] ?? 1;
  const stored = localStorage.getItem(`${USAGE_PREFIX}${agentId}`);
  const current = stored ? parseInt(stored, 10) : 0;
  const next = current + 1;

  localStorage.setItem(`${USAGE_PREFIX}${agentId}`, String(next));
  return { used: next, limit, stage: computeStage(next, limit) };
}

export function resetUsage(agentId: string): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(`${USAGE_PREFIX}${agentId}`);
  }
}

function computeStage(used: number, limit: number): PaywallStage {
  if (used === 0) return "fresh";
  if (used < limit) return "aware";
  if (used === limit) return "warning";
  return "locked";
}

export function isLocked(agentId: string): boolean {
  return getUsage(agentId).stage === "locked";
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
      "You've used your 10 free rows. Unlock Harvey for unlimited prospects, 3 tone variants, and campaign history.",
    features: ["Unlimited rows", "3 tones", "Campaign history"],
    price: "$29",
    buttonText: "Unlock Harvey — $29/month",
  },
};
