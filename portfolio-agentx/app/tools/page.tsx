import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { tools } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "AI Tools | AGentX",
};

export default function ToolsPage() {
  const liveTools = tools.filter((t) => !t.comingSoon);
  const comingSoonTools = tools.filter((t) => t.comingSoon);
  const allTools = [...liveTools, ...comingSoonTools];

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative px-6 pt-12 pb-16">
        <div className="mx-auto max-w-7xl text-center">
          <Badge className="mb-6">
            {liveTools.length} Live · {comingSoonTools.length} Coming Soon
          </Badge>
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl">
            Tools That Run<br className="hidden sm:block" />{" "}
            <span className="text-accent">While You Sleep</span>
          </h1>
          <p className="mt-6 text-lg text-foreground-secondary max-w-2xl mx-auto">
            AI-powered tools for real business workflows. Upload, process, ship.
          </p>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {allTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div key={tool.slug} className="relative">
                  {/* Coming soon overlay */}
                  {tool.comingSoon && (
                    <div className="absolute inset-0 z-10 flex items-start justify-end p-4 pointer-events-none">
                      <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                    </div>
                  )}
                  <div
                    className={`flex flex-col rounded-xl border border-border bg-background-card p-6 h-full transition-all duration-300 ${
                      tool.comingSoon
                        ? "opacity-50 grayscale cursor-default"
                        : "hover:border-opacity-80 group cursor-pointer"
                    }`}
                    style={
                      !tool.comingSoon
                        ? { borderTopColor: tool.color, borderTopWidth: "3px" }
                        : {}
                    }
                  >
                    {/* Icon circle */}
                    <div
                      className="mb-4 w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: `${tool.color}20` }}
                    >
                      <Icon className="w-7 h-7" style={{ color: tool.color }} />
                    </div>

                    {/* Name + price */}
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-foreground">{tool.name}</h3>
                      <Badge variant="secondary" className="text-xs">{tool.price}</Badge>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-foreground-secondary mb-4 flex-1">
                      {tool.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-1 mb-6">
                      {tool.features.slice(0, 3).map((f) => (
                        <li key={f} className="text-xs text-foreground-muted flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-foreground-muted flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    {!tool.comingSoon && (
                      <Link href={`/tools/${tool.slug}`}>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full gap-1"
                          style={{ borderColor: `${tool.color}40`, color: tool.color }}
                        >
                          Open Tool <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 pb-32">
        <div className="mx-auto max-w-2xl text-center rounded-xl border border-border bg-background-card p-12">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Have a specific workflow in mind?
          </h2>
          <p className="text-foreground-secondary mb-8">
            Let&apos;s build it. Custom agentic tools tailored to your exact process.
          </p>
          <Link href="/hire">
            <Button size="lg" className="gap-2">
              Work With Me <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
