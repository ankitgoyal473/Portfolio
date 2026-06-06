import type { Metadata } from "next";
import Link from "next/link";
import { stackItems, mcpProjects } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Stack & MCPs | AGentX",
  description: "The production AI infrastructure powering AGentX, plus custom MCP servers built by Ankit.",
};

export default function McpPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] pt-24 pb-24">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#71717A] mb-4">
            Under the hood
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#F8FAFC] tracking-tight">
            Stack & MCPs
          </h1>
          <p className="mt-4 text-[#71717A] max-w-xl mx-auto">
            The production infrastructure powering all AGentX agents, plus custom MCP servers I&apos;ve built for enterprise clients.
          </p>
        </div>

        {/* Tech stack */}
        <div className="mb-20">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#71717A] mb-8">
            Tech Stack
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {stackItems.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-4 p-4 rounded-xl border border-[#27272A] bg-[#141414] hover:border-[#3f3f46] transition-colors duration-150"
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div>
                  <span className="text-sm font-semibold text-[#F8FAFC]">{item.name}</span>
                  <span className="text-[#71717A] text-sm"> — {item.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MCP Projects */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-[#71717A]">
              MCP Servers Built
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs border border-[#27272A] text-[#71717A]">
              Model Context Protocol
            </span>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {mcpProjects.map((mcp) => (
              <div
                key={mcp.name}
                className="rounded-xl border border-[#27272A] bg-[#141414] p-6 flex flex-col gap-3"
                style={{ borderTopColor: mcp.color, borderTopWidth: "3px" }}
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-[#F8FAFC] text-sm">{mcp.name}</h3>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full border flex-shrink-0"
                    style={{ color: mcp.color, borderColor: `${mcp.color}50` }}
                  >
                    {mcp.status}
                  </span>
                </div>
                <p className="text-sm text-[#71717A] leading-relaxed">{mcp.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What is MCP explainer */}
        <div className="rounded-xl border border-[#27272A] bg-[#141414] p-8 mb-12">
          <h2 className="text-lg font-bold text-[#F8FAFC] mb-3">What is MCP?</h2>
          <p className="text-[#71717A] text-sm leading-relaxed mb-4">
            Model Context Protocol (MCP) is an open standard that lets AI models like Claude connect to external tools, APIs, and data sources. Instead of hardcoding integrations, you define tools as MCP servers — Claude discovers and calls them dynamically.
          </p>
          <p className="text-[#71717A] text-sm leading-relaxed">
            I started building MCP servers before the standard went mainstream. Today every AGentX agent runs on a suite of custom MCP tools — web search, stock data, financial analysis, and more.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-[#71717A] text-sm mb-4">
            Need a custom MCP server for your stack?
          </p>
          <Link
            href="/hire"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#F97316] text-white text-sm font-semibold hover:bg-[#EA6C0A] transition-colors duration-150 cursor-pointer"
          >
            Let&apos;s talk →
          </Link>
        </div>
      </div>
    </main>
  );
}
