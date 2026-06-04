"use client";

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NeuralBackground } from "@/components/shared/neural-background";
import { AgentXLogoAnimated } from "@/components/shared/agentx-logo-animated";
import { Typewriter } from "@/components/shared/typewriter";
import { typewriterPhrases } from "@/lib/constants";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <NeuralBackground />

      <AgentXLogoAnimated />

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <div className="animate-fade-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background-card/50 px-4 py-1.5 text-sm text-foreground-secondary backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Open to freelance &amp; full-time
          </div>
        </div>

        <h1 className="animate-fade-up text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl [animation-delay:100ms]">
          <Typewriter phrases={typewriterPhrases} />
        </h1>

        <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-lg text-foreground-secondary sm:text-xl [animation-delay:200ms]">
          ML Engineer building production-grade AI systems. From concept to deployment — I
          ship tools that automate thousands of hours and scale across enterprise teams.
        </p>

        <div className="animate-fade-up mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center [animation-delay:300ms]">
          <Link href="/hire">
            <Button size="lg" className="gap-2">
              Work With Me <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/tools">
            <Button variant="secondary" size="lg" className="gap-2">
              <Play className="h-4 w-4" /> Try AI Tools Free
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
