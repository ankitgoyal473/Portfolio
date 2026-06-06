import Link from "next/link";
import { AgentXLogo } from "@/components/shared/agentx-logo";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-[#27272A] bg-[#0A0A0A]/90 backdrop-blur-sm">
      <Link href="/" className="flex items-center gap-2">
        <AgentXLogo size="sm" showText={false} />
        <span className="font-semibold text-sm tracking-tight text-[#F8FAFC]">AGentX</span>
      </Link>
      <a
        href="#what-is-claude-code"
        className="text-sm text-[#71717A] hover:text-[#F8FAFC] transition-colors duration-150 cursor-pointer"
      >
        What is Claude Code?
      </a>
    </nav>
  );
}
