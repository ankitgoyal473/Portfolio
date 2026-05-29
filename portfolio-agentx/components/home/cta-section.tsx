import Link from "next/link";
import { ArrowRight, Briefcase, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedGrid } from "@/components/shared/animated-grid";

export function CtaSection() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      <AnimatedGrid />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Freelance clients */}
          <div className="rounded-xl border border-border bg-background-card/80 backdrop-blur-sm p-8 lg:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-muted mb-6">
              <Briefcase className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">Need AI Automation?</h3>
            <p className="text-foreground-secondary mb-6">
              I help businesses automate workflows, build intelligent systems, and ship AI products.
              Projects range from $1.5K to $8K with 2-6 week timelines.
            </p>
            <ul className="space-y-2 mb-8 text-sm text-foreground-secondary">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Custom AI chatbots & agents
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Data pipeline automation
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                ML model development & deployment
              </li>
            </ul>
            <Link href="/hire">
              <Button className="gap-2">
                Discuss Your Project <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Recruiters */}
          <div className="rounded-xl border border-border bg-background-card/80 backdrop-blur-sm p-8 lg:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-muted mb-6">
              <Building2 className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">Hiring Senior AI Engineers?</h3>
            <p className="text-foreground-secondary mb-6">
              Open to senior AI/ML engineering roles at companies building meaningful products. 5+
              years shipping production ML systems at scale.
            </p>
            <ul className="space-y-2 mb-8 text-sm text-foreground-secondary">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                LLM systems & RAG architectures
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                MLOps & production ML pipelines
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Full-stack AI product development
              </li>
            </ul>
            <Link href="/hire#roles">
              <Button variant="secondary" className="gap-2">
                View Experience <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
