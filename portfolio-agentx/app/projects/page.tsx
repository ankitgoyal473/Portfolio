"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/shared/section-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Project {
  name: string;
  description: string;
  impact: string;
  stack: string[];
  category: "genai" | "agentic-ai" | "mcps";
  tag: string;
}

const projects: Project[] = [
  {
    name: "Enterprise RAG System",
    tag: "GenAI · AWS",
    description:
      "Natural language interface over structured and unstructured enterprise data. Built on AWS Bedrock — analysts query internal knowledge bases without writing SQL or searching through documents.",
    impact: "50+ analysts · 250+ hours saved per week",
    stack: ["AWS Bedrock", "Python", "S3", "Lambda"],
    category: "genai",
  },
  {
    name: "Hypothesis Testing Agent",
    tag: "Agentic AI · Statistics",
    description:
      "Conversational statistical analysis for non-technical teams. Business users run A/B tests and significance testing through natural language — no code, no analyst dependency.",
    impact: "40+ hours/week of manual analysis automated",
    stack: ["Python", "LLMs", "AWS", "Statistical libraries"],
    category: "agentic-ai",
  },
  {
    name: "QA Testing Agent",
    tag: "Agentic AI · DevOps",
    description:
      "Agentic system that reads code changes, generates test cases, and executes them autonomously. Integrated into CI/CD pipelines — 3-day QA cycles reduced to hours.",
    impact: "~70% reduction in QA cycle time",
    stack: ["AWS Bedrock Agents", "Python", "CI/CD"],
    category: "agentic-ai",
  },
  {
    name: "Developer MCP Suite",
    tag: "MCPs · Developer Tools",
    description:
      "Custom MCP servers for JIRA, AWS, and GitLab. Engineers manage sprints, provision infrastructure, and review PRs through conversation — built before MCP was mainstream.",
    impact: "20+ engineers · 50+ hours/week reclaimed",
    stack: ["Python", "MCP Protocol", "JIRA API", "AWS SDK", "GitLab API"],
    category: "mcps",
  },
];

const categories = [
  { label: "All", value: "all" },
  { label: "GenAI", value: "genai" },
  { label: "Agentic AI", value: "agentic-ai" },
  { label: "MCPs", value: "mcps" },
] as const;

function ProjectCard({ project }: { project: Project }) {
  return (
    <Card className="flex flex-col h-full animate-fade-up">
      <CardHeader>
        <p className="text-xs font-medium text-accent mb-1">{project.tag}</p>
        <CardTitle>{project.name}</CardTitle>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto space-y-3">
        <div className="flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <Badge key={tech} variant="secondary">
              {tech}
            </Badge>
          ))}
        </div>
        <p className="text-xs text-foreground-muted">{project.impact}</p>
      </CardContent>
    </Card>
  );
}

export default function ProjectsPage() {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filteredProjects =
    activeFilter === "all" ? projects : projects.filter((p) => p.category === activeFilter);

  return (
    <main className="min-h-screen bg-background">
      <section className="container mx-auto px-4 py-20 sm:py-28">
        <SectionHeader
          title="Projects"
          subtitle="Production AI systems built at enterprise scale. All projects are from real deployments — no demos, no prototypes."
        />

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={activeFilter === cat.value ? "default" : "secondary"}
              size="sm"
              onClick={() => setActiveFilter(cat.value)}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <p className="text-center text-foreground-secondary mt-12">
            No projects found in this category.
          </p>
        )}
      </section>
    </main>
  );
}
