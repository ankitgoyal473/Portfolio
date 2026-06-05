"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Shield,
  BarChart3,
  Settings,
  Globe,
  CheckCircle2,
  Search,
  ClipboardList,
  Users,
  Newspaper,
  AlertTriangle,
  FileText,
  FolderOpen,
  Pencil,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { ThinkingStep } from "@/lib/mock-sessions";

const ICON_MAP: Record<string, LucideIcon> = {
  "trending-up": TrendingUp,
  shield: Shield,
  "bar-chart": BarChart3,
  settings: Settings,
  globe: Globe,
  "check-circle": CheckCircle2,
  search: Search,
  clipboard: ClipboardList,
  users: Users,
  newspaper: Newspaper,
  alert: AlertTriangle,
  "file-text": FileText,
  folder: FolderOpen,
  pencil: Pencil,
  zap: Zap,
};

function formatElapsed(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

interface ThinkingBubbleProps {
  steps: ThinkingStep[];
  agentColor: string;
  elapsedSeconds?: number;
  ticker?: string;
  onComplete?: () => void;
}

export function ThinkingBubble({ steps, agentColor, elapsedSeconds, ticker, onComplete }: ThinkingBubbleProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (activeIndex >= steps.length) {
      const timeout = setTimeout(() => {
        onComplete?.();
      }, 400);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => {
      setActiveIndex((prev) => prev + 1);
    }, 800);
    return () => clearTimeout(timeout);
  }, [activeIndex, steps.length, onComplete]);

  return (
    <div className="flex flex-col gap-2">
      {steps.map((step, i) => {
        const status: ThinkingStep["status"] =
          i < activeIndex ? "done" : i === activeIndex ? "active" : "pending";

        return (
          <motion.div
            key={i}
            className="flex items-center gap-2"
            initial={{ opacity: 0.4 }}
            animate={{ opacity: status === "pending" ? 0.4 : 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Status indicator */}
            <span className="flex-shrink-0 text-sm">
              {status === "pending" && <span className="text-foreground-muted">&#9675;</span>}
              {status === "active" && (
                <motion.span
                  style={{ color: agentColor }}
                  animate={{ scale: [0.8, 1.0, 0.8] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  &#9673;
                </motion.span>
              )}
              {status === "done" && <span style={{ color: agentColor }}>&#10003;</span>}
            </span>

            {/* Step icon */}
            <span className="text-sm text-foreground-muted">
              {ICON_MAP[step.icon]
                ? (() => {
                    const Icon = ICON_MAP[step.icon];
                    return <Icon className="w-3.5 h-3.5 inline" />;
                  })()
                : step.icon}
            </span>

            {/* Label */}
            <span className="text-sm text-foreground-secondary">{step.label}</span>
          </motion.div>
        );
      })}
      {elapsedSeconds !== undefined && elapsedSeconds > 0 && (
        <div className="mt-2 text-xs" style={{ color: agentColor }}>
          {ticker ? `Analysing ${ticker}` : "Analysing"} · {formatElapsed(elapsedSeconds)}
        </div>
      )}
    </div>
  );
}
