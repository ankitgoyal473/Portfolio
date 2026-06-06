import Link from "next/link";

export default function HireCtaSection() {
  return (
    <section id="hire" className="px-6 py-20 border-t border-[#27272A]">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#71717A] mb-4">
          Freelance
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-[#F8FAFC] tracking-tight mb-4">
          Need a custom AI system?
        </h2>
        <p className="text-[#71717A] max-w-xl mx-auto mb-8">
          I design and build production agentic systems, RAG pipelines, and MCP servers for businesses.
          End-to-end delivery — architecture, build, deployment, and handoff.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/hire"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-[#F97316] text-white text-sm font-semibold hover:bg-[#EA6C0A] transition-colors duration-150 cursor-pointer"
          >
            Work with me →
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg border border-[#27272A] text-[#71717A] text-sm font-medium hover:text-[#F8FAFC] hover:border-[#3f3f46] transition-colors duration-150 cursor-pointer"
          >
            See my work
          </Link>
        </div>
      </div>
    </section>
  );
}
