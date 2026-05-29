export interface Pillar {
  name: string;
  icon: string;
  signal: "BULLISH" | "BEARISH" | "NEUTRAL";
  body: string;
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
