"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/mock-sessions";
import { ThinkingBubble } from "./ThinkingBubble";

interface ChatThreadProps {
  messages: ChatMessage[];
  agentId: string;
  agentColor: string;
  isRunning: boolean;
}

const AGENT_EMOJIS: Record<string, string> = {
  warren: "\u{1F9D0}",
  sherlock: "\u{1F50E}",
  harvey: "\u{1F4BC}",
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
}: ChatThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isRunning]);

  const emoji = AGENT_EMOJIS[agentId] ?? "";
  const agentName = AGENT_NAMES[agentId] ?? agentId;

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
    >
      {messages.map((msg, index) => {
        const isFirstAgentBubble =
          msg.role === "agent" &&
          (index === 0 || messages[index - 1]?.role !== "agent");

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
              (msg.role === "agent" ||
                msg.role === "thinking" ||
                msg.role === "paywall") &&
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
                    className="text-xs font-medium mb-1"
                    style={{ color: agentColor }}
                  >
                    {emoji} {agentName}
                  </div>
                )}
                <div className="text-sm text-foreground whitespace-pre-wrap">
                  {msg.content}
                </div>
              </div>
            )}

            {/* THINKING */}
            {msg.role === "thinking" && (
              <div className="max-w-[85%] rounded-xl rounded-tl-sm border border-border/50 bg-background-card px-4 py-3">
                {msg.metadata?.thinkingSteps ? (
                  <ThinkingBubble
                    steps={msg.metadata.thinkingSteps}
                    agentColor={agentColor}
                  />
                ) : (
                  <div className="text-sm text-foreground-muted">
                    {msg.content}
                  </div>
                )}
              </div>
            )}

            {/* SYSTEM */}
            {msg.role === "system" && (
              <div className="text-xs text-foreground-muted py-2">
                {msg.content}
              </div>
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
                <div className="text-sm text-foreground whitespace-pre-wrap">
                  {msg.content}
                </div>
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
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: agentColor }}
              />
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: agentColor }}
              />
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: agentColor }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
