import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { tools, pricing } from "@/lib/constants";
import { SectionHeader } from "@/components/shared/section-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ToolsPage() {
  const pricingPlans = [
    { key: "free" as const, highlight: false },
    { key: "individual" as const, highlight: false },
    { key: "pro" as const, highlight: true },
  ];

  return (
    <main className="min-h-screen bg-background">
      {/* Agents Banner */}
      <section className="px-6 pt-28 pb-0">
        <div className="mx-auto max-w-7xl">
          <Link href="/agents">
            <div className="flex items-center justify-between rounded-lg border border-accent/20 bg-accent/5 px-6 py-4 transition-colors hover:bg-accent/10">
              <p className="text-sm font-medium text-foreground">
                Looking for our AI Agents (WARRen, Sherlock, Harvey)?
              </p>
              <span className="flex items-center gap-1 text-sm font-medium text-accent">
                Go to Agents <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Hero */}
      <section className="relative px-6 pt-12 pb-20">
        <div className="mx-auto max-w-7xl text-center">
          <Badge className="mb-6">2 Utility Tools</Badge>
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl">
            Utility Tools
          </h1>
          <p className="mt-6 text-lg text-foreground-secondary max-w-2xl mx-auto">
            Standalone productivity tools — upload data, generate reports, build
            chatbots. No hype, just tools that save you hours.
          </p>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 md:grid-cols-2">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.slug} href={`/tools/${tool.slug}`}>
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${tool.color}15` }}
                        >
                          <Icon
                            className="h-5 w-5"
                            style={{ color: tool.color }}
                          />
                        </div>
                        <div className="flex-1">
                          <CardTitle>{tool.name}</CardTitle>
                        </div>
                        <Badge variant="secondary">{tool.price}</Badge>
                      </div>
                      <CardDescription className="mt-2">
                        {tool.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {tool.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-center gap-2 text-sm text-foreground-secondary"
                          >
                            <Check className="h-4 w-4 text-accent" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6">
                        <Button variant="secondary" size="sm">
                          View Tool &rarr;
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 pb-32">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            title="Simple Pricing"
            subtitle="Start free, upgrade when you're ready. No hidden fees."
          />
          <div className="grid gap-8 md:grid-cols-3">
            {pricingPlans.map(({ key, highlight }) => {
              const plan = pricing[key];
              return (
                <Card
                  key={key}
                  className={
                    highlight
                      ? "border-accent/50 ring-1 ring-accent/20"
                      : ""
                  }
                >
                  <CardHeader>
                    {highlight && (
                      <Badge className="w-fit mb-2">Most Popular</Badge>
                    )}
                    <CardTitle>{plan.name}</CardTitle>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-foreground">
                        {plan.price}
                      </span>
                      {key !== "free" && (
                        <span className="text-foreground-secondary text-sm">
                          /month
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2 text-sm text-foreground-secondary"
                        >
                          <Check className="h-4 w-4 text-accent" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-8">
                      <Button
                        variant={highlight ? "default" : "secondary"}
                        className="w-full"
                      >
                        {key === "free" ? "Get Started" : "Subscribe"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
