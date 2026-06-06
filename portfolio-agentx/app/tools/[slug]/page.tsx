import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { tools } from "@/lib/constants";

export async function generateStaticParams() {
  return tools.filter((t) => !t.comingSoon).map((t) => ({ slug: t.slug }));
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = tools.find((t) => t.slug === slug);

  if (!tool) notFound();
  if (tool.comingSoon) redirect("/tools");

  const Icon = tool.icon;

  return (
    <main className="min-h-screen bg-[#0A0A0A] pt-24 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        {/* Back */}
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 text-sm text-[#71717A] hover:text-[#F8FAFC] transition-colors duration-150 mb-10"
        >
          <ArrowLeft className="h-4 w-4" />
          All tools
        </Link>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left: tool info */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${tool.color}20` }}
              >
                <Icon className="w-7 h-7" style={{ color: tool.color }} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#F8FAFC]">{tool.name}</h1>
                <span
                  className="text-sm font-semibold"
                  style={{ color: tool.color }}
                >
                  {tool.price}
                </span>
              </div>
            </div>

            <p className="text-[#71717A] mb-8 leading-relaxed">{tool.description}</p>

            <div className="mb-8">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[#71717A] mb-4">
                What&apos;s included
              </h3>
              <ul className="flex flex-col gap-3">
                {tool.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-[#F8FAFC]">
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: tool.color }} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <a
              href="/hire"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#F97316] text-white text-sm font-semibold hover:bg-[#EA6C0A] transition-colors duration-150 cursor-pointer w-full justify-center"
            >
              Get this tool →
            </a>
          </div>

          {/* Right: about */}
          <div className="flex flex-col gap-6">
            <div
              className="rounded-xl border border-[#27272A] bg-[#141414] p-6"
              style={{ borderTopColor: tool.color, borderTopWidth: "3px" }}
            >
              <h3 className="text-sm font-semibold text-[#F8FAFC] mb-3">Who is this for?</h3>
              <p className="text-sm text-[#71717A] leading-relaxed">
                Business teams and analysts who want AI-powered workflows without writing code.
                This tool is built for professionals who need results fast — not developers building infrastructure.
              </p>
            </div>

            <div className="rounded-xl border border-[#27272A] bg-[#141414] p-6">
              <h3 className="text-sm font-semibold text-[#F8FAFC] mb-3">How it works</h3>
              <ol className="flex flex-col gap-3">
                {["Contact to discuss your use case", "Custom setup for your data and workflow", "Delivered and operational in days"].map(
                  (step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[#71717A]">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: `${tool.color}20`, color: tool.color }}
                      >
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  )
                )}
              </ol>
            </div>

            <div className="rounded-xl border border-[#27272A] bg-[#141414] p-6">
              <h3 className="text-sm font-semibold text-[#F8FAFC] mb-2">Custom integrations</h3>
              <p className="text-sm text-[#71717A]">
                Need this connected to your existing tools — Slack, CRM, internal APIs? That&apos;s part of the service. Reach out and we&apos;ll scope it together.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
