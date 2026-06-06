import type { Metadata } from "next";
import Link from "next/link";
import { tools } from "@/lib/constants";

export const metadata: Metadata = {
  title: "AI Tools | AGentX",
  description: "AI-powered tools for real business workflows.",
};

export default function ToolsPage() {
  const liveTools = tools.filter((t) => !t.comingSoon);
  const comingSoonTools = tools.filter((t) => t.comingSoon);

  return (
    <main className="min-h-screen bg-[#0A0A0A] pt-24 pb-24">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#71717A] mb-4">
            AI Tools
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#F8FAFC] tracking-tight">
            Tools that run{" "}
            <span className="text-[#F97316]">while you sleep.</span>
          </h1>
          <p className="mt-4 text-[#71717A] max-w-xl mx-auto">
            AI-powered tools for real business workflows. Upload, process, ship.
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm">
            <span className="text-[#F8FAFC] font-semibold">{liveTools.length} Live</span>
            <span className="text-[#27272A]">·</span>
            <span className="text-[#71717A]">{comingSoonTools.length} Coming Soon</span>
          </div>
        </div>

        {/* Live tools */}
        {liveTools.length > 0 && (
          <div className="mb-12">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-[#71717A] mb-6">
              Available now
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {liveTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    className="flex flex-col rounded-xl border border-[#27272A] bg-[#141414] p-6 hover:border-[#3f3f46] hover:scale-[1.02] transition-all duration-150 group cursor-pointer"
                    style={{ borderTopColor: tool.color, borderTopWidth: "3px" }}
                  >
                    <div
                      className="mb-4 w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${tool.color}20` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: tool.color }} />
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-[#F8FAFC]">{tool.name}</h3>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full border"
                        style={{ color: tool.color, borderColor: `${tool.color}50` }}
                      >
                        {tool.price}
                      </span>
                    </div>
                    <p className="text-sm text-[#71717A] flex-1 mb-4">{tool.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {tool.features.map((f) => (
                        <span key={f} className="text-xs px-2 py-0.5 rounded border border-[#27272A] text-[#71717A]">
                          {f}
                        </span>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Coming soon */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#71717A] mb-6">
            Coming soon
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {comingSoonTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.slug}
                  className="flex flex-col rounded-xl border border-[#27272A] bg-[#141414] p-6 opacity-50 grayscale"
                >
                  <div className="mb-4 w-12 h-12 rounded-xl flex items-center justify-center bg-[#27272A]">
                    <Icon className="w-6 h-6 text-[#71717A]" />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-[#F8FAFC]">{tool.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full border border-[#27272A] text-[#71717A]">
                      Soon
                    </span>
                  </div>
                  <p className="text-sm text-[#71717A] flex-1">{tool.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
