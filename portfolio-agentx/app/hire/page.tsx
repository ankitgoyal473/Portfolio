"use client";

import { useState } from "react";
import { Search, Hammer, Rocket } from "lucide-react";
import { services } from "@/lib/constants";

const processSteps = [
  { icon: Search, title: "Discovery", description: "We define the problem, scope, and success metrics. I audit your existing systems and propose an architecture." },
  { icon: Hammer, title: "Build", description: "Iterative development with weekly demos. You see progress in real-time and can steer direction early." },
  { icon: Rocket, title: "Ship", description: "Production deployment, documentation, and handoff. I stick around for 2 weeks post-launch support." },
];

const roleHighlights = [
  "5+ years shipping production AI systems at enterprise scale",
  "Led AI initiatives at a global investment bank — RAG, agents, MCP tooling",
  "End-to-end delivery: architecture, build, deployment, monitoring",
  "Strong communicator who bridges technical and business teams",
];

const techTags = ["Claude API", "Strands", "FastAPI", "Next.js", "Python", "AWS Bedrock", "RAG", "MCP Development", "Supabase", "Agentic AI"];

type FormState = "idle" | "loading" | "success" | "error";

export default function HirePage() {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const [state, setState] = useState<FormState>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setState(res.ok ? "success" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] pt-24 pb-24">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#71717A] mb-4">
            Hire Ankit Goyal
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#F8FAFC] tracking-tight">
            Let&apos;s build your{" "}
            <span className="text-[#F97316]">AI system.</span>
          </h1>
          <p className="mt-4 text-[#71717A] max-w-xl mx-auto">
            Solo AI/ML engineer based in Gurgaon. I design and ship production agentic systems, RAG pipelines, and MCP tooling for businesses that need AI to work — not just demo.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left column */}
          <div className="flex flex-col gap-10">
            {/* Role highlights */}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-[#71717A] mb-4">
                About me
              </h2>
              <ul className="flex flex-col gap-3">
                {roleHighlights.map((h) => (
                  <li key={h} className="flex items-start gap-3 text-sm text-[#71717A]">
                    <span className="text-[#F97316] mt-0.5 flex-shrink-0">→</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-[#71717A] mb-4">
                What I build
              </h2>
              <div className="flex flex-col gap-3">
                {services.map((s) => (
                  <div key={s.title} className="rounded-xl border border-[#27272A] bg-[#141414] p-4">
                    <h3 className="text-sm font-semibold text-[#F8FAFC] mb-1">{s.title}</h3>
                    <p className="text-xs text-[#71717A] mb-2">{s.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {s.tags.map((t) => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded border border-[#27272A] text-[#71717A]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Process */}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-[#71717A] mb-4">
                How we work
              </h2>
              <div className="flex flex-col gap-4">
                {processSteps.map(({ icon: Icon, title, description }, i) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-[#141414] border border-[#27272A] flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-[#F97316]">{i + 1}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#F8FAFC] mb-0.5">{title}</h3>
                      <p className="text-xs text-[#71717A]">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech tags */}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-[#71717A] mb-4">
                Tech
              </h2>
              <div className="flex flex-wrap gap-2">
                {techTags.map((t) => (
                  <span key={t} className="px-3 py-1 text-xs rounded-full border border-[#27272A] text-[#71717A] bg-[#141414]">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right column — contact form */}
          <div>
            <div className="sticky top-28 rounded-xl border border-[#27272A] bg-[#141414] p-8">
              <h2 className="text-lg font-bold text-[#F8FAFC] mb-6">Get in touch</h2>

              {state === "success" ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-[#00c896]/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-[#00c896] text-xl">✓</span>
                  </div>
                  <h3 className="font-semibold text-[#F8FAFC] mb-2">Message received</h3>
                  <p className="text-sm text-[#71717A]">
                    I&apos;ll reply to {form.email} within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-medium text-[#71717A] mb-1.5 block">Name *</label>
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                      className="w-full bg-[#0A0A0A] border border-[#27272A] rounded-lg px-4 py-2.5 text-sm text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#F97316] transition-colors duration-150"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#71717A] mb-1.5 block">Email *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@company.com"
                      className="w-full bg-[#0A0A0A] border border-[#27272A] rounded-lg px-4 py-2.5 text-sm text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#F97316] transition-colors duration-150"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#71717A] mb-1.5 block">Company</label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      placeholder="Your company (optional)"
                      className="w-full bg-[#0A0A0A] border border-[#27272A] rounded-lg px-4 py-2.5 text-sm text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#F97316] transition-colors duration-150"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#71717A] mb-1.5 block">What do you want to build? *</label>
                    <textarea
                      required
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Describe the problem or system you want to build..."
                      className="w-full bg-[#0A0A0A] border border-[#27272A] rounded-lg px-4 py-2.5 text-sm text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#F97316] transition-colors duration-150 resize-none"
                    />
                  </div>

                  {state === "error" && (
                    <p className="text-xs text-red-400">Something went wrong. Email me directly: ankitgoyal473@gmail.com</p>
                  )}

                  <button
                    type="submit"
                    disabled={state === "loading"}
                    className="w-full py-3 rounded-lg bg-[#F97316] text-white text-sm font-semibold hover:bg-[#EA6C0A] transition-colors duration-150 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {state === "loading" ? "Sending..." : "Send message →"}
                  </button>

                  <p className="text-center text-xs text-[#71717A]">
                    Or email: <a href="mailto:ankitgoyal473@gmail.com" className="text-[#F8FAFC] hover:text-[#F97316] transition-colors">ankitgoyal473@gmail.com</a>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
