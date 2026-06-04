"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Lock,
  X,
  TrendingUp,
  Search,
  Mail,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionRecord } from "@/lib/mock-sessions";
import type { UsageState } from "@/lib/paywall";

interface AgentSidebarProps {
  agentId: string;
  agentColor: string;
  sessions: SessionRecord[];
  usage: UsageState;
  isPremium?: boolean;
  onNewSession: () => void;
  onSelectSession: (sessionId: string) => void;
  activeSessionId: string | null;
  isOpen: boolean;
  onToggle: () => void;
}

const AGENT_ICONS: Record<string, LucideIcon> = {
  warren: TrendingUp,
  sherlock: Search,
  harvey: Mail,
};

const AGENT_NAMES: Record<string, string> = {
  warren: "Warren",
  sherlock: "Sherlock",
  harvey: "Harvey",
};

function getRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

function getUsageDotColor(usage: UsageState, agentColor: string): string {
  const pct = usage.limit > 0 ? usage.used / usage.limit : 0;
  if (pct >= 1) return "#ef4444";
  if (pct >= 0.8) return "#f59e0b";
  return agentColor;
}

function getProgressColor(usage: UsageState, agentColor: string): string {
  const pct = usage.limit > 0 ? usage.used / usage.limit : 0;
  if (pct >= 1) return "#ef4444";
  if (pct >= 0.8) return "#f59e0b";
  return agentColor;
}

export function AgentSidebar({
  agentId,
  agentColor,
  sessions,
  usage,
  isPremium = false,
  onNewSession,
  onSelectSession,
  activeSessionId,
  isOpen,
  onToggle,
}: AgentSidebarProps) {
  const AgentIcon = AGENT_ICONS[agentId] ?? TrendingUp;
  const agentName = AGENT_NAMES[agentId] ?? agentId;
  const overlayRef = useRef<HTMLDivElement>(null);

  const progressPct = usage.limit > 0 ? (usage.used / usage.limit) * 100 : 0;
  const progressColor = getProgressColor(usage, agentColor);
  const dotColor = getUsageDotColor(usage, agentColor);
  const isAtLimit = usage.used >= usage.limit;

  // Close on escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onToggle();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onToggle]);

  // Collapsed state
  if (!isOpen) {
    return (
      <>
        {/* Desktop collapsed */}
        <div className="hidden md:flex flex-col items-center w-12 h-full border-r border-border bg-background py-4 gap-3">
          <button
            onClick={onToggle}
            className="hover:scale-110 transition-transform"
            aria-label="Open sidebar"
          >
            <AgentIcon className="w-5 h-5" style={{ color: agentColor }} />
          </button>
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dotColor }} />
          <button
            onClick={onToggle}
            className="mt-auto text-foreground-muted hover:text-foreground transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={onToggle}
          className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-background-card border border-border"
          aria-label="Open sidebar"
        >
          <ChevronRight className="w-4 h-4 text-foreground" />
        </button>
      </>
    );
  }

  const sidebarContent = (
    <div className="flex flex-col h-full w-60 border-r border-border bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border/50">
        <span className="font-bold text-sm flex items-center gap-1.5" style={{ color: agentColor }}>
          <AgentIcon className="w-4 h-4" />
          {agentName}
        </span>
        <button
          onClick={onToggle}
          className="text-foreground-muted hover:text-foreground transition-colors"
          aria-label="Close sidebar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Usage widget */}
      <div className="px-4 py-3 border-b border-border/50">
        {isPremium ? (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold" style={{ color: "#f0b429" }}>✦ Pro</span>
            <span className="text-xs text-foreground-muted">· Unlimited</span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-foreground-muted">Free tier</span>
              <div className="flex items-center gap-1">
                {isAtLimit && <Lock className="w-3 h-3 text-error" />}
                <span className="text-xs text-foreground-secondary font-mono">
                  {usage.used} / {usage.limit}
                </span>
              </div>
            </div>
            <div className="w-full h-1 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(progressPct, 100)}%`,
                  backgroundColor: progressColor,
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* New session button */}
      <div className="px-4 py-3">
        <button
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
          style={{
            border: `1px solid ${agentColor}`,
            color: agentColor,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `${agentColor}26`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          New session
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto px-2">
        {sessions.length === 0 && (
          <p className="text-xs text-foreground-muted px-2 py-4 text-center">No sessions yet</p>
        )}
        {sessions.map((session) => {
          const isActive = session.id === activeSessionId;
          return (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={cn(
                "w-full text-left rounded-lg px-3 py-2.5 mb-1 transition-colors",
                isActive ? "border-l-2" : "border-l-2 border-l-transparent",
                !isActive && "hover:bg-background-card"
              )}
              style={
                isActive
                  ? {
                      backgroundColor: `${agentColor}1A`,
                      borderLeftColor: agentColor,
                    }
                  : undefined
              }
            >
              <div className="text-xs text-foreground truncate font-medium">{session.name}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-foreground-muted">
                  {getRelativeDate(session.createdAt)}
                </span>
                <span className="text-[10px] text-foreground-muted">
                  {session.messages.length} msgs
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: inline sidebar */}
      <div className="hidden md:block">{sidebarContent}</div>

      {/* Mobile: slide-over drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              ref={overlayRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={onToggle}
            />
            <motion.div
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="md:hidden fixed left-0 top-0 h-full z-50 shadow-xl"
            >
              <div className="relative">
                {sidebarContent}
                <button
                  onClick={onToggle}
                  className="absolute top-4 right-[-40px] p-2 rounded-r-lg bg-background-card border border-l-0 border-border"
                  aria-label="Close sidebar"
                >
                  <X className="w-4 h-4 text-foreground" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
