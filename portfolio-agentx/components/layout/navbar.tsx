"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { AgentXLogo } from "@/components/shared/agentx-logo";
import { Button } from "@/components/ui/button";
import { navLinks } from "@/lib/constants";
import { useMockAuth } from "@/lib/mock-auth";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useMockAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/">
          <AgentXLogo size="sm" />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-foreground-secondary transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-background-card"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-background text-sm font-semibold">
                  {(user.user_metadata?.full_name ?? user.email ?? "?")
                    .split(" ")
                    .map((w: string) => w[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
                <span className="text-sm text-foreground">
                  {user.user_metadata?.full_name ?? user.email}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-background-card py-1 shadow-xl">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-foreground-secondary hover:bg-background hover:text-foreground transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground-secondary hover:bg-background hover:text-foreground transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
          )}
          <Link href="/hire">
            <Button size="sm">Work With Me</Button>
          </Link>
        </div>

        <button
          className="md:hidden text-foreground-secondary hover:text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-border bg-background/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-4 px-6 py-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base text-foreground-secondary hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-3 pt-4 border-t border-border">
              {user ? (
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-background text-sm font-semibold">
                      {(user.user_metadata?.full_name ?? user.email ?? "?")
                        .split(" ")
                        .map((w: string) => w[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>
                    <span className="text-sm text-foreground">
                      {user.user_metadata?.full_name ?? user.email}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      logout();
                    }}
                    className="text-sm text-foreground-secondary hover:text-foreground"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <Link href="/login" className="flex-1">
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => setMobileOpen(false)}
                  >
                    Sign In
                  </Button>
                </Link>
              )}
              {!user && (
                <Link href="/hire" className="flex-1">
                  <Button className="w-full" onClick={() => setMobileOpen(false)}>
                    Work With Me
                  </Button>
                </Link>
              )}
            </div>
            {user && (
              <Link href="/hire" onClick={() => setMobileOpen(false)}>
                <Button className="w-full">Work With Me</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
