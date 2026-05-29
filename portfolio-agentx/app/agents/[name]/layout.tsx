import type { Metadata } from "next";

const TITLES: Record<string, { title: string; description: string }> = {
  warren: {
    title: "Warren — AI Stock Analyst | AGentX",
    description: "Buffett-style 5-pillar stock analysis. Try free.",
  },
  sherlock: {
    title: "Sherlock — Competitor Intel | AGentX",
    description: "AI-powered competitor surveillance. Try free.",
  },
  harvey: {
    title: "Harvey — Cold Email AI | AGentX",
    description: "Hyper-personalized cold emails at scale. Try free.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  return TITLES[name] ?? { title: "AGentX" };
}

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
