"use client";

import { useState } from "react";
import { projects } from "@/lib/constants";

const categories = [
  { label: "All", value: "all" },
  { label: "GenAI", value: "genai" },
  { label: "Agentic AI", value: "agentic-ai" },
  { label: "MCPs", value: "mcps" },
];

export default function ProjectsPage() {
  const [active, setActive] = useState("all");
  const filtered = active === "all" ? projects : projects.filter((p) => p.category === active);

  return (
    <main className="min-h-screen bg-[#0A0A0A] pt-24 pb-24">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#71717A] mb-4">
            Production Work
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#F8FAFC] tracking-tight">
            AI systems that ship.
          </h1>
          <p className="mt-4 text-[#71717A] max-w-xl mx-auto">
            Real problems, real scale. Everything here has been in production — built for banks, hedge funds, SaaS companies, and enterprises.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 justify-center mb-10 flex-wrap">
          {categories.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setActive(value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 cursor-pointer border ${
                active === value
                  ? "bg-[#F97316] text-white border-[#F97316]"
                  : "border-[#27272A] text-[#71717A] hover:text-[#F8FAFC] hover:border-[#3f3f46]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Projects grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          {filtered.map((project) => (
            <div
              key={project.name}
              className="rounded-xl border border-[#27272A] bg-[#141414] p-6 flex flex-col gap-4 hover:border-[#3f3f46] transition-all duration-150"
              style={{ borderTopColor: project.color, borderTopWidth: "3px" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: project.color }}
                  >
                    {project.tag}
                  </span>
                  <h3 className="text-lg font-bold text-[#F8FAFC] mt-1">{project.name}</h3>
                </div>
              </div>

              <p className="text-sm text-[#71717A] leading-relaxed flex-1">
                {project.description}
              </p>

              <div className="rounded-lg bg-[#0A0A0A] px-3 py-2 border border-[#27272A]">
                <span className="text-xs text-[#71717A]">Impact: </span>
                <span className="text-xs font-semibold text-[#F8FAFC]">{project.impact}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {project.stack.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md text-xs border border-[#27272A] text-[#71717A]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center border border-[#27272A] rounded-xl p-8 bg-[#141414]">
          <h2 className="text-xl font-bold text-[#F8FAFC] mb-2">Have a similar problem?</h2>
          <p className="text-[#71717A] text-sm mb-6">
            I build production AI systems end-to-end. Let&apos;s talk about yours.
          </p>
          <a
            href="/hire"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#F97316] text-white text-sm font-semibold hover:bg-[#EA6C0A] transition-colors duration-150 cursor-pointer"
          >
            Work with me →
          </a>
        </div>
      </div>
    </main>
  );
}
