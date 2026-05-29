"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
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
          {agents.map((agent) => {
            const Icon = agent.icon;
            return (
              <Link key={agent.slug} href={`/agents/${agent.slug}`}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="group relative flex flex-col rounded-xl border border-border bg-background-card p-6 h-full transition-all duration-300"
                  style={{ borderTopColor: agent.color, borderTopWidth: "3px" }}
                >
                  {/* Hover glow */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      boxShadow: `0 0 30px ${agent.color}15, inset 0 0 30px ${agent.color}05`,
                    }}
                  />

                  <div className="relative z-10">
                    {/* Large icon circle */}
                    <div
                      className="mb-4 w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: `${agent.color}20` }}
                    >
                      <Icon className="w-7 h-7" style={{ color: agent.color }} />
                    </div>

                    {/* Name + price */}
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold" style={{ color: agent.color }}>
                        {agent.name}
                      </h3>
                      <Badge variant="secondary">{agent.price}</Badge>
                    </div>

                    {/* Personality */}
                    <p className="text-sm text-foreground-secondary mb-4 line-clamp-2">
                      {agent.personality}
                    </p>

                    {/* Free limit */}
                    <p className="text-xs text-foreground-muted">Free: {agent.freeLimit}</p>
                  </div>
                </motion.div>
              </Link>
            );
          })}
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
