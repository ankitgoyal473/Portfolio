import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "MCPs & Stack | AGentX",
  description:
    "The production-grade AI infrastructure powering AGentX, plus custom MCP servers built by Ankit.",
};

const stackItems = [
  {
    name: "Claude API",
    role: "Core AI reasoning for all 3 agents",
    color: "#D97706",
  },
  {
    name: "Jina Reader",
    role: "Web content extraction & summarization",
    color: "#6366F1",
  },
  {
    name: "Strands",
    role: "Agent orchestration framework",
    color: "#10B981",
  },
  {
    name: "Supabase",
    role: "Auth, real-time DB, and RLS policies",
    color: "#3ECF8E",
  },
  {
    name: "Razorpay",
    role: "Payments and 30-day subscription lifecycle",
    color: "#3395FF",
  },
  {
    name: "Vercel",
    role: "Edge deployment and serverless functions",
    color: "#FFFFFF",
  },
  {
    name: "Nodemailer",
    role: "Transactional email via Gmail SMTP",
    color: "#EA4335",
  },
  {
    name: "Next.js 16",
    role: "App Router framework with SSR",
    color: "#FFFFFF",
  },
];

const mcpProjects = [
  {
    name: "Developer MCP Suite",
    description:
      "MCP servers for code review, PR automation, and dev workflow acceleration",
    status: "Live",
  },
  {
    name: "Agent Workflow MCP",
    description:
      "Custom orchestration layer for multi-step agentic pipelines",
    status: "Coming Soon",
  },
  {
    name: "Data Pipeline MCP",
    description:
      "MCP tools for ETL, schema validation, and data quality checks",
    status: "Coming Soon",
  },
];

export default function McpPage() {
  return (
    <main className="py-24 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Hero */}
        <section className="mb-20 text-center">
          <Badge className="mb-4" variant="secondary">
            Open Architecture
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            The Stack Behind AGentX
          </h1>
          <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
            Every tool is production-grade. No demos, no toy integrations.
          </p>
        </section>

        {/* What Powers AGentX */}
        <section className="mb-20">
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-2">What Powers AGentX</h2>
            <p className="text-foreground-secondary">
              The real infrastructure running under every agent, every request.
            </p>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {stackItems.map((tech) => {
              const isLight = tech.color === "#FFFFFF";
              return (
                <Card
                  key={tech.name}
                  style={{
                    borderBottomColor: isLight ? "#444" : tech.color,
                    borderBottomWidth: "2px",
                  }}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{
                          backgroundColor: isLight
                            ? "rgba(255,255,255,0.08)"
                            : `${tech.color}20`,
                          color: isLight ? "#888" : tech.color,
                        }}
                      >
                        {tech.name[0]}
                      </div>
                      <div>
                        <CardTitle className="text-base">{tech.name}</CardTitle>
                        <CardDescription>{tech.role}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </section>

        {/* MCPs Ankit Built */}
        <section className="mb-20">
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-2">MCPs Ankit Built</h2>
            <p className="text-foreground-secondary">
              Custom MCP servers for agentic workflows — used in production.
            </p>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {mcpProjects.map((mcp) => (
              <Card key={mcp.name}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle>{mcp.name}</CardTitle>
                    <div className="flex gap-2 flex-shrink-0">
                      <Badge
                        variant={mcp.status === "Live" ? "default" : "secondary"}
                      >
                        {mcp.status}
                      </Badge>
                      <Badge variant="secondary">Private</Badge>
                    </div>
                  </div>
                  <CardDescription>{mcp.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <p className="text-foreground-secondary mb-4 text-lg">
            Need a custom MCP?{" "}
            <Link
              href="/hire"
              className="text-accent font-semibold hover:underline"
            >
              Let&apos;s talk →
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
