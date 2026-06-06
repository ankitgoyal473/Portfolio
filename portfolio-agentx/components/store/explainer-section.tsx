import { Terminal, Download, Zap } from "lucide-react";

const steps = [
  {
    icon: Terminal,
    title: "What is Claude Code?",
    body: "Claude Code is Anthropic's AI assistant for your terminal. It reads a CLAUDE.md file in any folder and becomes an expert at that task.",
  },
  {
    icon: Download,
    title: "How do I get it?",
    body: "Install it with one command: npm install -g claude. Requires a Claude account (free tier available). Works on Mac, Windows, and Linux.",
  },
  {
    icon: Zap,
    title: "Why is it powerful?",
    body: "It can browse the web, fill forms, read files, send emails, and automate anything on your computer — all by following the instructions in CLAUDE.md.",
  },
];

export default function ExplainerSection() {
  return (
    <section
      id="what-is-claude-code"
      className="py-20 px-6 border-y border-[#27272A] bg-[#0D0D0D]"
    >
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-12">
          New to Claude Code?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex flex-col gap-3">
              <Icon size={24} className="text-[#F97316]" />
              <h3 className="font-semibold text-[#F8FAFC]">{title}</h3>
              <p className="text-sm text-[#71717A] leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
