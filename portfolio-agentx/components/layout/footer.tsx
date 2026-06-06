import Link from "next/link";
import { AgentXLogo } from "@/components/shared/agentx-logo";

const links = {
  Solutions: [
    { label: "Rudy", href: "/#rudy" },
    { label: "Warren", href: "/#warren" },
    { label: "Sherlock", href: "/#sherlock" },
    { label: "Harvey", href: "/#harvey" },
  ],
  Portfolio: [
    { label: "Projects", href: "/projects" },
    { label: "Tools", href: "/tools" },
    { label: "MCP & Stack", href: "/mcp" },
  ],
  Contact: [
    { label: "Hire Ankit", href: "/hire" },
    { label: "Email", href: "mailto:ankitgoyal473@gmail.com" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-[#27272A] px-6 py-16 mt-12">
      <div className="max-w-5xl mx-auto">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <AgentXLogo size="sm" showText={false} />
              <span className="font-semibold text-sm text-[#F8FAFC]">AGentX</span>
            </div>
            <p className="text-xs text-[#71717A] leading-relaxed">
              Claude Code solutions and custom AI systems built by Ankit Goyal, Gurgaon.
            </p>
          </div>

          {/* Link groups */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-[#71717A] mb-3">
                {group}
              </h4>
              <ul className="flex flex-col gap-2">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-[#71717A] hover:text-[#F8FAFC] transition-colors duration-150"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[#27272A] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-[#71717A]">
            © 2026 AGentX · Built by Ankit Goyal
          </span>
          <span className="text-xs text-[#71717A]">
            Claude Code Solutions · Gurgaon, India
          </span>
        </div>
      </div>
    </footer>
  );
}
