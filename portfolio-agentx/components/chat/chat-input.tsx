"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSubmit: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSubmit,
  disabled,
  placeholder = "Type your answer...",
}: ChatInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 border-t border-[#27272A]">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          "flex-1 bg-[#141414] text-[#FAFAFA] text-sm px-3 py-2 rounded-lg",
          "border border-[#27272A] focus:border-[#E8D5B8] focus:outline-none focus:ring-1 focus:ring-[#E8D5B8]/30",
          "placeholder:text-[#71717A] disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        className={cn(
          "p-2 rounded-lg transition-colors",
          value.trim() && !disabled
            ? "bg-[#E8D5B8] text-[#0A0A0A] hover:bg-[#E8D5B8]/90"
            : "bg-[#27272A] text-[#71717A] cursor-not-allowed"
        )}
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
}
