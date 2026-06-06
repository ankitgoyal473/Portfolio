"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AgentXLogo } from "@/components/shared/agentx-logo";
import { useAuth } from "@/lib/auth";

const navLinks = [
  { label: "Solutions", href: "/#products" },
  { label: "Projects", href: "/projects" },
  { label: "Tools", href: "/tools" },
  { label: "MCP", href: "/mcp" },
  { label: "Hire", href: "/hire" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, login, logout, isLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#27272A] bg-[#0A0A0A]/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <AgentXLogo size="sm" showText={false} />
          <span className="font-semibold text-sm tracking-tight text-[#F8FAFC]">AGentX</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors duration-150 ${
                isActive(href)
                  ? "text-[#F8FAFC] bg-[#141414]"
                  : "text-[#71717A] hover:text-[#F8FAFC]"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right: auth */}
        <div className="hidden md:flex items-center gap-3">
          {!isLoading && (
            user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#71717A] truncate max-w-[140px]">
                  {user.email}
                </span>
                <button
                  onClick={logout}
                  className="text-xs text-[#71717A] hover:text-[#F8FAFC] transition-colors duration-150 cursor-pointer"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={login}
                className="px-4 py-1.5 rounded-lg border border-[#27272A] text-sm text-[#F8FAFC] hover:bg-[#141414] transition-colors duration-150 cursor-pointer"
              >
                Sign in
              </button>
            )
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-[#71717A] hover:text-[#F8FAFC] cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#27272A] bg-[#0A0A0A] px-6 py-4 flex flex-col gap-1">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`px-3 py-2 rounded-md text-sm transition-colors duration-150 ${
                isActive(href)
                  ? "text-[#F8FAFC] bg-[#141414]"
                  : "text-[#71717A] hover:text-[#F8FAFC]"
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="pt-3 border-t border-[#27272A] mt-2">
            {!isLoading && (
              user ? (
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="text-sm text-[#71717A] hover:text-[#F8FAFC] transition-colors duration-150 cursor-pointer"
                >
                  Sign out ({user.email})
                </button>
              ) : (
                <button
                  onClick={() => { login(); setMobileOpen(false); }}
                  className="text-sm text-[#F8FAFC] cursor-pointer"
                >
                  Sign in with Google
                </button>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
