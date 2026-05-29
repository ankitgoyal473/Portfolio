import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/shared/section-header";
import { tools } from "@/lib/constants";
import { agents } from "@/lib/agents";

export function ToolsPreview() {
  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Agents Section */}
        <SectionHeader
          title="Meet Our Agents"
          subtitle="AI personas with distinct expertise. Each one solves a different problem — pick yours."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <Link key={agent.slug} href={`/agents/${agent.slug}`}>
              <Card
                className="flex h-full flex-col"
                style={{
                  borderTopColor: agent.color,
                  borderTopWidth: "3px",
                }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle style={{ color: agent.color }}>{agent.name}</CardTitle>
                    <Badge variant="secondary">{agent.price}</Badge>
                  </div>
                  <CardDescription>{agent.personality}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1"
                    style={{ color: agent.color }}
                  >
                    {agent.cta}
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/agents">
            <Button variant="secondary" className="gap-2">
              Explore all agents <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Utility Tools Section */}
        <div className="mt-20">
          <SectionHeader
            title="Utility Tools"
            subtitle="Standalone productivity tools — upload, generate, export."
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 max-w-3xl mx-auto">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Card key={tool.slug} className="flex flex-col">
                  <CardHeader>
                    <div
                      className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: `${tool.color}15`,
                        color: tool.color,
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle>{tool.name}</CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto flex items-center justify-between">
                    <Badge variant="secondary">{tool.price}</Badge>
                    <Link href={`/tools/${tool.slug}`}>
                      <Button variant="ghost" size="sm" className="gap-1">
                        Try Free <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <Link href="/tools">
              <Button variant="secondary" className="gap-2">
                View All Tools <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
