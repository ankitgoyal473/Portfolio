import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { tools } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToolDemo } from "@/components/tools/tool-demo";

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = tools.find((t) => t.slug === slug);

  if (!tool) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Tool Not Found
          </h1>
          <p className="text-foreground-secondary mb-8">
            The tool you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/tools">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" />
              Back to Tools
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  const Icon = tool.icon;

  return (
    <main className="min-h-screen bg-background">
      <section className="px-6 pt-28 pb-20">
        <div className="mx-auto max-w-7xl">
          {/* Back link */}
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 text-sm text-foreground-secondary hover:text-accent transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Link>

          {/* Main layout */}
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Left: Tool Info */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${tool.color}15` }}
                >
                  <Icon
                    className="h-6 w-6"
                    style={{ color: tool.color }}
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    {tool.name}
                  </h1>
                  <Badge variant="secondary" className="mt-1">
                    {tool.price}
                  </Badge>
                </div>
              </div>

              <p className="text-lg text-foreground-secondary mb-8">
                {tool.description}
              </p>

              <div className="mb-8">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                  Features
                </h3>
                <ul className="space-y-3">
                  {tool.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-foreground-secondary"
                    >
                      <Check className="h-5 w-5 text-accent flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-4">
                <Button size="lg">Subscribe — {tool.price}</Button>
                <Link href="/tools">
                  <Button variant="secondary" size="lg">
                    Compare Plans
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Demo */}
            <div>
              <ToolDemo slug={slug} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
