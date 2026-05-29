"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Lock, Paperclip, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentChatbarProps {
  agentId: string;
  agentColor: string;
  usageCount: number;
  usageLimit: number;
  isLocked: boolean;
  onSend: (message: string) => void;
  onFileUpload?: (file: File) => void;
  onLockClick?: () => void;
  placeholder: string;
  chips?: string[];
  onChipSelect?: (chip: string) => void;
}

export function AgentChatbar({
  agentId,
  agentColor,
  usageCount,
  usageLimit,
  isLocked,
  onSend,
  onFileUpload,
  onLockClick,
  placeholder,
  chips,
  onChipSelect,
}: AgentChatbarProps) {
  const [input, setInput] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [chipsVisible, setChipsVisible] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const remaining = usageLimit - usageCount;
  const showCounter = usageCount > 0 && !isLocked;

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isLocked) return;
    onSend(trimmed);
    setInput("");
    setFileName(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [input, isLocked, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileUpload?.(file);
    }
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const handleChipClick = (chip: string) => {
    setChipsVisible(false);
    onChipSelect?.(chip);
  };

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  }, [input]);

  return (
    <div className="sticky bottom-0 bg-background/80 backdrop-blur-md border-t border-border/50 px-4 py-3 z-10">
      {/* Quick-reply chips */}
      <AnimatePresence>
        {chips && chips.length > 0 && chipsVisible && !isLocked && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-wrap gap-2 px-4 pb-2"
          >
            {chips.map((chip) => (
              <button
                key={chip}
                onClick={() => handleChipClick(chip)}
                className="rounded-full px-3 py-1.5 text-xs transition-colors cursor-pointer"
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
                {chip}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input pill */}
      <div
        className={cn(
          "flex items-center gap-2 rounded-3xl border border-border bg-background-card px-4 py-2 transition-shadow duration-200",
          isLocked && "opacity-50"
        )}
        style={
          {
            "--chatbar-focus-shadow": `0 0 0 2px ${agentColor}33`,
          } as React.CSSProperties
        }
        onFocus={(e) => {
          if (!isLocked) {
            e.currentTarget.style.boxShadow = `0 0 0 2px ${agentColor}33`;
          }
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {/* File upload (Harvey only) */}
        {agentId === "harvey" && (
          <>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLocked}
              className="flex-shrink-0 p-1 text-foreground-muted hover:text-foreground transition-colors disabled:opacity-40"
              aria-label="Upload CSV"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </>
        )}

        {/* Filename pill */}
        {fileName && (
          <div
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs flex-shrink-0"
            style={{
              backgroundColor: `${agentColor}26`,
              color: agentColor,
            }}
          >
            <span className="max-w-[100px] truncate">{fileName}</span>
            <button onClick={() => setFileName(null)} className="hover:opacity-70">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLocked}
          placeholder={isLocked ? "Upgrade to continue..." : placeholder}
          rows={1}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground-muted resize-none outline-none min-h-[20px] max-h-[120px] py-1"
        />

        {/* Right side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Usage counter */}
          {showCounter && (
            <motion.span
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="text-xs font-mono whitespace-nowrap"
              style={{ color: agentColor }}
            >
              {remaining} of {usageLimit} left
            </motion.span>
          )}

          {/* Locked label */}
          {isLocked && (
            <span className="text-xs font-mono text-error whitespace-nowrap">Limit reached</span>
          )}

          {/* Send / Lock button */}
          {isLocked ? (
            <button
              onClick={onLockClick}
              className="w-8 h-8 rounded-full bg-error flex items-center justify-center flex-shrink-0 cursor-pointer hover:brightness-110 transition-all"
              aria-label="Upgrade to continue"
            >
              <Lock className="w-4 h-4 text-foreground" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity",
                !input.trim() && "opacity-40"
              )}
              style={{ backgroundColor: agentColor }}
              aria-label="Send message"
            >
              <ArrowUp className="w-4 h-4 text-background" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
