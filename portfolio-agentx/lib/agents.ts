export interface Agent {
  name: string;
  fullName: string;
  slug: string;
  color: string;
  price: string;
  freeLimit: string;
  personality: string;
  signature: string;
  tagline: string;
  cta: string;
  loadingMessages: string[];
  emptyState: string;
  errorMessage: string;
  successMessage: string;
  freemiumCta: string;
}

export const agents: Agent[] = [
  {
    name: "WARRen",
    fullName: "Wealth & Asset Research & Recommendation Engine",
    slug: "warren",
    color: "#f0b429",
    price: "$19/month",
    freeLimit: "1 report/month",
    personality:
      "Seasoned investment analyst. Studied every Buffett letter since 1965. Calm, data-driven, never hypes.",
    signature: "— WARRen \u{1F9D0}",
    tagline:
      "Give WARRen a ticker. He will tell you what the market misses.",
    cta: "Ask WARRen →",
    loadingMessages: [
      "WARRen is reading the fundamentals...",
      "WARRen is checking the options chain...",
      "WARRen is forming his verdict...",
    ],
    emptyState:
      "Give WARRen a ticker. He will tell you what the market misses.",
    errorMessage: "WARRen hit a snag — retrying...",
    successMessage: "WARRen has spoken. — WARRen \u{1F9D0}",
    freemiumCta:
      "WARRen has more to say. Unlock his full analysis — $19/month.",
  },
  {
    name: "Sherlock",
    fullName:
      "Systematic Heuristic Evidence & Research for Leveraging cOmpetitor Knowledge",
    slug: "sherlock",
    color: "#4a9eff",
    price: "$49/month",
    freeLimit: "1 URL, manual only",
    personality:
      "Sharp, analytical, slightly dramatic. Speaks like a detective who always finds what others miss.",
    signature: "The game is afoot. — Sherlock \u{1F50E}",
    tagline:
      "Give Sherlock a rival. He will tell you everything they do not want you to know.",
    cta: "Put Sherlock on the case →",
    loadingMessages: [
      "Sherlock is examining their website...",
      "Sherlock is checking job postings...",
      "Sherlock is writing your case file...",
    ],
    emptyState:
      "Give Sherlock a rival. He will tell you everything they do not want you to know.",
    errorMessage: "Sherlock hit a dead end — retrying...",
    successMessage: "The game is afoot. — Sherlock \u{1F50E}",
    freemiumCta:
      "Sherlock is watching 4 more rivals. Unlock full surveillance — $49/month.",
  },
  {
    name: "Harvey",
    fullName: "Hyper-personalised AI Revenue & Value Engine",
    slug: "harvey",
    color: "#00c896",
    price: "$29/month",
    freeLimit: "10 rows/month",
    personality:
      "Elite sales copywriter. Closing energy. Confident, punchy, results-obsessed.",
    signature: "Close-worthy. Go get them. — Harvey \u{1F4BC}",
    tagline:
      "Drop your prospect list. Harvey will make every single one feel personal.",
    cta: "Let Harvey Work →",
    loadingMessages: [
      "Harvey is researching {company}...",
      "Found something good for {name}...",
      "This one is going to land...",
      "Harvey is on fire — {done}/{total} done...",
    ],
    emptyState:
      "Drop your prospect list. Harvey will make every single one feel personal.",
    errorMessage: "Harvey hit a snag on row {row}. Retry or skip?",
    successMessage: "Close-worthy. Go get them. — Harvey \u{1F4BC}",
    freemiumCta:
      "Harvey has {remaining} more prospects to write. Unlock unlimited — $29/month.",
  },
];

export function getAgentBySlug(slug: string): Agent | undefined {
  return agents.find((a) => a.slug === slug);
}
