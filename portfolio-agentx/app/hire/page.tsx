import type { Metadata } from "next";
import { services } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Work With Ankit Goyal | AGentX",
};
import { SectionHeader } from "@/components/shared/section-header";
import { NeuralBackground } from "@/components/shared/neural-background";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Hammer, Rocket, Clock, Calendar } from "lucide-react";

const processSteps = [
  {
    icon: Search,
    title: "Discovery",
    description:
      "We define the problem, scope, and success metrics. I audit your existing systems and propose an architecture.",
  },
  {
    icon: Hammer,
    title: "Build",
    description:
      "Iterative development with weekly demos. You see progress in real-time and can steer direction early.",
  },
  {
    icon: Rocket,
    title: "Ship",
    description:
      "Production deployment, documentation, and handoff. I stick around for 2 weeks post-launch support.",
  },
];

const techStack = [
  "AWS Bedrock",
  "GenAI",
  "RAG Systems",
  "Agentic AI",
  "MCP Development",
  "Claude API",
  "Python",
  "Next.js",
];

const roleHighlights = [
  "5+ years shipping production AI systems at enterprise scale",
  "Led AI initiatives at a global investment bank — RAG, agents, MCP tooling",
  "End-to-end delivery: architecture, build, deployment, monitoring",
  "Strong communicator who bridges technical and business teams",
];

export default function HirePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <NeuralBackground />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl">
            Let&apos;s build something that actually works.
          </h1>
          <p className="mt-6 text-lg text-foreground-secondary max-w-2xl mx-auto">
            5 years shipping production AI systems at enterprise scale. Available for the right
            project or role.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg">
              <a href="#services">Start a Project</a>
            </Button>
            <Button variant="secondary" size="lg">
              <a href="/projects">View My Work</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="container mx-auto px-4 py-20">
        <SectionHeader
          title="What I Build"
          subtitle="RAG pipelines, agentic workflows, developer tooling, and LLM integrations — delivered end-to-end."
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <Card key={service.title} className="flex flex-col h-full animate-fade-up">
              <CardHeader>
                <CardTitle>{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                  <Clock className="h-4 w-4 text-accent" />
                  <span>{service.timeline}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How I Work */}
      <section className="container mx-auto px-4 py-20">
        <SectionHeader
          title="How I Work"
          subtitle="A transparent, iterative process designed for speed and clarity."
        />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {processSteps.map((step, i) => (
            <div
              key={step.title}
              className="relative flex flex-col items-center text-center animate-fade-up"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-muted border border-accent/20 mb-4">
                <step.icon className="h-6 w-6 text-accent" />
              </div>
              <span className="text-xs font-medium text-accent mb-2">Step {i + 1}</span>
              <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-foreground-secondary">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Book a Call */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-2xl rounded-xl border border-border bg-background-card p-8 text-center sm:p-12">
          <Calendar className="mx-auto h-10 w-10 text-accent mb-4" />
          <h3 className="text-2xl font-bold text-foreground mb-2">Book a Discovery Call</h3>
          <p className="text-foreground-secondary mb-6">
            30-minute call to discuss your project, timeline, and budget. No commitment required.
          </p>
          <Button size="lg">Book a Call</Button>
        </div>
      </section>

      {/* Open to Roles */}
      <section id="roles" className="container mx-auto px-4 py-20">
        <SectionHeader
          title="Full-Time Roles"
          subtitle="For recruiters and hiring managers: here is what I bring to a full-time team."
        />
        <div className="mx-auto max-w-3xl">
          <Card className="animate-fade-up">
            <CardHeader>
              <CardTitle>What I Bring</CardTitle>
              <CardDescription>
                Senior/Staff-level AI Engineering — RAG pipelines, agentic workflows, developer
                tooling, and LLM integrations at enterprise scale.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Experience Highlights */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">
                  Experience Highlights
                </h4>
                <ul className="space-y-2">
                  {roleHighlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex items-start gap-2 text-sm text-foreground-secondary"
                    >
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tech Stack */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Tech Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {techStack.map((tech) => (
                    <Badge key={tech} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
