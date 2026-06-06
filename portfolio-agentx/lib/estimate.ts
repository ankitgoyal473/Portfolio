export interface EstimateResult {
  complexity: "Low" | "Medium" | "Med-High" | "High";
  delivery: string;
  stack: string;
  estimateLow: number;
  estimateHigh: number;
}

const budgetMap: Record<string, Omit<EstimateResult, "stack">> = {
  "Under $1,500": { complexity: "Low", delivery: "1–2 weeks", estimateLow: 1000, estimateHigh: 2000 },
  "$1,500–$3,000": { complexity: "Medium", delivery: "3–4 weeks", estimateLow: 2500, estimateHigh: 4000 },
  "$3,000–$6,000": { complexity: "Med-High", delivery: "5–8 weeks", estimateLow: 4500, estimateHigh: 6500 },
  "$6,000+": { complexity: "High", delivery: "8–12 weeks", estimateLow: 7000, estimateHigh: 12000 },
  "Not sure yet": { complexity: "Medium", delivery: "4–6 weeks", estimateLow: 2500, estimateHigh: 5000 },
};

const stackMap: Record<string, string> = {
  "Automate a repetitive manual workflow": "Claude API · Python · n8n",
  "Build a custom AI chatbot": "Claude API · Next.js · Supabase",
  "Generate automated reports from data": "Claude API · Python · ReportLab",
  "Analyse documents or contracts": "Claude API · PyMuPDF · Supabase",
  "Stock market research & analysis": "Warren (Claude API · yfinance · Next.js)",
  "Competitor intelligence monitoring": "Sherlock (Claude API · Strands · Resend)",
  "Cold email personalisation at scale": "Harvey (Claude API · Next.js · Supabase)",
  "Something else": "Claude API · Next.js · Supabase",
};

export function generateEstimate(problem: string, budget: string): EstimateResult {
  const base = budgetMap[budget] ?? budgetMap["Not sure yet"];
  const stack = stackMap[problem] ?? stackMap["Something else"];
  return { ...base, stack };
}

export const stages = [
  {
    id: "problem",
    question: "What's the core problem you want to solve with AI?",
    chips: [
      "Automate a repetitive manual workflow",
      "Build a custom AI chatbot",
      "Generate automated reports from data",
      "Analyse documents or contracts",
      "Stock market research & analysis",
      "Competitor intelligence monitoring",
      "Cold email personalisation at scale",
      "Something else",
    ],
  },
  {
    id: "workflow",
    question: "How do you handle this today?",
    chips: [
      "Manual copy-paste between tools",
      "Spreadsheets and email",
      "Paying someone to do it manually",
      "Existing tool that's too slow or expensive",
      "No process yet — starting from scratch",
    ],
  },
  {
    id: "timeline",
    question: "When do you need this live?",
    chips: [
      "ASAP — within 2 weeks",
      "Within 1 month",
      "2–3 months",
      "Flexible — just want it done right",
    ],
  },
  {
    id: "budget",
    question: "What's your rough budget range?",
    chips: ["Under $1,500", "$1,500–$3,000", "$3,000–$6,000", "$6,000+", "Not sure yet"],
  },
] as const;

export type StageId = (typeof stages)[number]["id"];
