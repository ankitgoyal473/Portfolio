import { AgentXLogo } from "@/components/shared/agentx-logo";

export default function Footer() {
  const products = ["rudy", "warren", "sherlock", "harvey"];
  return (
    <footer className="border-t border-[#27272A] px-6 py-12 mt-24">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <AgentXLogo size="sm" showText={false} />
          <span className="text-sm text-[#71717A]">AGentX — Built by Ankit Goyal</span>
        </div>
        <div className="flex gap-6">
          {products.map((slug) => (
            <a
              key={slug}
              href={`#${slug}`}
              className="text-sm text-[#71717A] hover:text-[#F8FAFC] transition-colors duration-150 capitalize cursor-pointer"
            >
              {slug}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
