"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  role: "assistant" | "user";
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "max-w-[85%] px-3 py-2 rounded-lg text-sm leading-relaxed",
        role === "assistant"
          ? "self-start bg-[#141414] border-l-2 border-[#F97316] text-[#F8FAFC]"
          : "self-end bg-[#F97316] text-white"
      )}
    >
      {content}
    </motion.div>
  );
}
