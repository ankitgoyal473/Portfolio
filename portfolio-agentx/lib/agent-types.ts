export interface Pillar {
  name: string;
  icon: string;
  signal: "BULLISH" | "BEARISH" | "NEUTRAL" | "N/A" | "POSITIVE" | "NEGATIVE";
  body: string;
  score?: number | null;
  keyMetrics?: Record<string, string | number>;
}

export interface Verdict {
  verdict: string;
  conviction: "HIGH" | "MEDIUM" | "LOW" | "AVOID";
  avgScore?: number;
  entry?: string;
  target?: string;
  stopLoss?: string;
  riskReward?: string;
  nextReview?: string;
}

export interface CaseFileSection {
  title: string;
  badge?: string;
  badgeColor?: "red" | "yellow" | "green";
  bullets: string[];
}

export interface CaseFileData {
  threatLevel: "LOW" | "MEDIUM" | "HIGH";
  summary: string;
  sections: CaseFileSection[];
}

export interface Prospect {
  name: string;
  company: string;
  opener: string;
}
