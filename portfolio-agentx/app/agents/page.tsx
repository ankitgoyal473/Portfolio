import { AgentCard } from "@/components/agents/agent-card";
import { agents } from "@/lib/agents";

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
            AI personas built for real workflows. Each agent has a distinct
            personality, expertise, and output style — pick the one that fits
            your problem.
          </p>
        </div>
      </section>

      {/* Agent Cards Grid */}
      <section className="px-6 pb-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-3">
            {agents.map((agent) => (
              <AgentCard key={agent.slug} agent={agent} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
