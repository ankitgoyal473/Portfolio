import type { Metadata } from "next";
import { TrendingUp, Search, Mail } from "lucide-react";
import { AgentCard } from "@/components/agents/agent-card";
import { agents } from "@/lib/agents";

export const metadata: Metadata = {
  title: "AGentX — Meet the Squad",
  description:
    "Warren analyses stocks. Sherlock watches rivals. Harvey writes cold emails. Try free.",
};

const AGENT_ICONS: Record<string, { icon: typeof TrendingUp; color: string }> = {
  warren: { icon: TrendingUp, color: "#f0b429" },
  sherlock: { icon: Search, color: "#4a9eff" },
  harvey: { icon: Mail, color: "#00c896" },
};

const AGENT_TOOLS: Record<string, string[]> = {
  warren: ["Claude API", "yfinance", "Strands"],
  sherlock: ["Claude API", "Jina Reader", "Strands", "Resend"],
  harvey: ["Claude API", "Jina Reader", "Strands"],
};

export default function AgentsPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative px-6 pt-32 pb-20">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl">
            Meet Our Agents
          </h1>
          <p className="mt-6 text-lg text-foreground-secondary max-w-2xl mx-auto">
            AI personas built for real workflows. Each agent has a distinct personality, expertise,
            and output style — pick the one that fits your problem.
          </p>
        </div>
      </section>

      {/* Agent Cards Grid */}
      <section className="px-6 pb-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-3">
            {agents.map((agent) => {
              const iconData = AGENT_ICONS[agent.slug];
              const tools = AGENT_TOOLS[agent.slug] ?? [];
              const Icon = iconData?.icon;

              return (
                <div key={agent.slug} className="flex flex-col">
                  <AgentCard agent={agent} />
                  {/* Icon badge */}
                  {Icon && (
                    <div className="flex items-center gap-2 mt-3 px-1">
                      <Icon className="w-5 h-5" style={{ color: iconData.color }} />
                      <span className="text-xs font-medium" style={{ color: iconData.color }}>
                        {agent.name}
                      </span>
                    </div>
                  )}
                  {/* Powered By tools */}
                  {tools.length > 0 && (
                    <div className="border-t border-border mt-4 pt-3 px-1">
                      <p className="text-[10px] uppercase tracking-widest text-foreground-muted mb-2">
                        POWERED BY
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {tools.map((tool) => (
                          <span
                            key={tool}
                            className="text-[10px] px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${agent.color}14`,
                              border: `1px solid ${agent.color}33`,
                              color: agent.color,
                            }}
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
