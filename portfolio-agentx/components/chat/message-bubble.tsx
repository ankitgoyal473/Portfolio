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
          ? "self-start bg-[#141414] border-l-2 border-[#E8D5B8] text-[#FAFAFA]"
          : "self-end bg-[#E8D5B8] text-[#0A0A0A]"
      )}
    >
      {content}
    </motion.div>
  );
}
