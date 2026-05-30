"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Search, Mail, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/mock-sessions";
import { ThinkingBubble } from "./ThinkingBubble";
import { PillarCards } from "./PillarCards";
import { CaseFileCard } from "./CaseFileCard";
import { ResultsTable } from "./ResultsTable";

interface ChatThreadProps {
  messages: ChatMessage[];
  agentId: string;
  agentColor: string;
  isRunning: boolean;
  isLocked?: boolean;
}

const AGENT_ICONS: Record<string, LucideIcon> = {
  warren: TrendingUp,
  sherlock: Search,
  harvey: Mail,
};

const AGENT_NAMES: Record<string, string> = {
  warren: "WARRen",
  sherlock: "Sherlock",
  harvey: "Harvey",
};

export function ChatThread({
  messages,
  agentId,
  agentColor,
  isRunning,
  isLocked = true,
}: ChatThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isRunning]);

  const AgentIcon = AGENT_ICONS[agentId] ?? TrendingUp;
  const agentName = AGENT_NAMES[agentId] ?? agentId;

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      {messages.map((msg, index) => {
        const isFirstAgentBubble =
          msg.role === "agent" && (index === 0 || messages[index - 1]?.role !== "agent");

        return (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "flex",
              msg.role === "user" && "justify-end",
              msg.role === "system" && "justify-center",
              (msg.role === "agent" || msg.role === "thinking" || msg.role === "paywall") &&
                "justify-start"
            )}
          >
            {/* USER */}
            {msg.role === "user" && (
              <div
                className="max-w-[70%] rounded-xl rounded-tr-sm px-4 py-3 text-sm text-foreground"
                style={{
                  backgroundColor: `${agentColor}26`,
                  borderWidth: "1px",
                  borderColor: `${agentColor}4D`,
                }}
              >
                {msg.content}
              </div>
            )}

            {/* AGENT */}
            {msg.role === "agent" && (
              <div className="max-w-[85%] rounded-xl rounded-tl-sm border border-border/50 bg-background-card px-4 py-3">
                {isFirstAgentBubble && (
                  <div
                    className="text-xs font-medium mb-1 flex items-center gap-1"
                    style={{ color: agentColor }}
                  >
                    <AgentIcon className="w-3.5 h-3.5" />
                    {agentName}
                  </div>
                )}
                {msg.metadata?.type === "pillar-cards" ? (
                  <PillarCards
                    ticker={msg.metadata.ticker ?? msg.content}
                    agentColor={agentColor}
                    isLocked={false}
                    pillars={msg.metadata.pillars}
                    verdict={msg.metadata.verdict}
                  />
                ) : msg.metadata?.type === "case-file" ? (
                  <CaseFileCard
                    url={msg.metadata.url ?? msg.content}
                    agentColor={agentColor}
                    isLocked={false}
                    caseFile={msg.metadata.caseFile}
                  />
                ) : msg.metadata?.type === "results-table" ? (
                  <ResultsTable
                    prospects={msg.metadata.prospects ?? []}
                    agentColor={agentColor}
                    isLocked={false}
                    totalCount={
                      msg.metadata.totalCount ??
                      msg.metadata.prospects?.length ??
                      0
                    }
                  />
                ) : (
                  <div className="text-sm text-foreground whitespace-pre-wrap">{msg.content}</div>
                )}
              </div>
            )}

            {/* THINKING */}
            {msg.role === "thinking" && (
              <div className="max-w-[85%] rounded-xl rounded-tl-sm border border-border/50 bg-background-card px-4 py-3">
                {msg.metadata?.thinkingSteps ? (
                  <ThinkingBubble steps={msg.metadata.thinkingSteps} agentColor={agentColor} />
                ) : (
                  <div className="text-sm text-foreground-muted">{msg.content}</div>
                )}
              </div>
            )}

            {/* SYSTEM */}
            {msg.role === "system" && (
              <div className="text-xs text-foreground-muted py-2">{msg.content}</div>
            )}

            {/* PAYWALL */}
            {msg.role === "paywall" && (
              <div
                className="max-w-[85%] rounded-xl rounded-tl-sm border border-border/50 px-4 py-3"
                style={{
                  borderLeftWidth: "3px",
                  borderLeftColor: agentColor,
                  backgroundColor: `${agentColor}0D`,
                }}
              >
                <div className="text-sm text-foreground whitespace-pre-wrap">{msg.content}</div>
              </div>
            )}
          </motion.div>
        );
      })}

      {/* Running indicator */}
      {isRunning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-start"
        >
          <div className="rounded-xl rounded-tl-sm border border-border/50 bg-background-card px-4 py-3">
            <motion.div
              className="flex gap-1"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: agentColor }} />
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: agentColor }} />
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: agentColor }} />
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
