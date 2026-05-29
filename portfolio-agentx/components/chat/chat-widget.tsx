"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { stages, generateEstimate } from "@/lib/estimate";
import { cn } from "@/lib/utils";
import { StageBar } from "./stage-bar";
import { MessageBubble } from "./message-bubble";
import { ChipSelector } from "./chip-selector";
import { ChatInput } from "./chat-input";
import { EstimateCard } from "./estimate-card";
import { EditMode } from "./edit-mode";
import { SuccessState } from "./success-state";

interface Message {
  role: "assistant" | "user";
  content: string;
}

type ViewMode = "chat" | "edit" | "success";

export function ChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("chat");
  const [chipDisabled, setChipDisabled] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentStage, isTyping]);

  // Show first message when chat opens
  useEffect(() => {
    if (isOpen && !hasInitialized.current) {
      hasInitialized.current = true;
      setIsTyping(true);
      const timer = setTimeout(() => {
        setIsTyping(false);
        setMessages([
          {
            role: "assistant",
            content: stages[0].question,
          },
        ]);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const advanceStage = useCallback(
    (answer: string) => {
      if (currentStage >= 4) return;

      const stageId = stages[currentStage].id;
      const newAnswers = { ...answers, [stageId]: answer };
      setAnswers(newAnswers);
      setChipDisabled(true);

      // Add user message
      setMessages((prev) => [...prev, { role: "user", content: answer }]);

      // Show typing indicator then next question or estimate
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const nextStage = currentStage + 1;
        setCurrentStage(nextStage);
        setChipDisabled(false);

        if (nextStage < 4) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: stages[nextStage].question },
          ]);
        } else {
          // Stage 4 = estimate view
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "Here's your instant estimate based on what you've shared:",
            },
          ]);
        }
      }, 400);
    },
    [currentStage, answers]
  );

  // Hide on agent pages (after all hooks)
  if (pathname.startsWith("/agents/")) return null;

  const handleSubmit = async () => {
    const estimate = generateEstimate(answers.problem, answers.budget);
    try {
      await fetch("/api/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem: answers.problem || "",
          workflow: answers.workflow || "",
          timeline: answers.timeline || "",
          budget: answers.budget || "",
          notes: "",
          complexity: estimate.complexity,
          delivery: estimate.delivery,
          stack: estimate.stack,
          estimateLow: estimate.estimateLow,
          estimateHigh: estimate.estimateHigh,
          userEmail: "",
        }),
      });
    } catch {
      // silently continue to success state even if API call fails
    }
    setViewMode("success");
  };

  const handleEdit = () => {
    setViewMode("edit");
  };

  const handleEditSave = (updated: Record<string, string>) => {
    setAnswers(updated);
    setViewMode("chat");
  };

  const handleEditCancel = () => {
    setViewMode("chat");
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleReset = () => {
    setIsOpen(false);
    setCurrentStage(0);
    setAnswers({});
    setMessages([]);
    setViewMode("chat");
    hasInitialized.current = false;
    setChipDisabled(false);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className={cn(
              "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full",
              "bg-[#E8D5B8] text-[#0A0A0A] shadow-lg shadow-[#E8D5B8]/20",
              "flex items-center justify-center",
              "hover:scale-105 transition-transform",
              "animate-pulse"
            )}
            aria-label="Open chat"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={cn(
              "fixed bottom-6 right-6 z-50 w-[400px] max-h-[80vh]",
              "bg-[#1E1E1E] rounded-2xl border border-[#27272A]",
              "flex flex-col shadow-2xl shadow-black/50",
              "overflow-hidden"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#27272A]">
              <h2 className="text-sm font-semibold text-[#FAFAFA]">AGentX Discovery</h2>
              <button
                onClick={handleClose}
                className="p-1 rounded-md text-[#71717A] hover:text-[#FAFAFA] hover:bg-[#27272A] transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stage Bar */}
            <StageBar currentStage={currentStage} />

            {/* Content Area */}
            {viewMode === "success" ? (
              <SuccessState onClose={handleReset} />
            ) : viewMode === "edit" ? (
              <div className="flex-1 overflow-y-auto">
                <EditMode answers={answers} onSave={handleEditSave} onCancel={handleEditCancel} />
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col min-h-0">
                  {messages.map((msg, i) => (
                    <MessageBubble key={i} role={msg.role} content={msg.content} />
                  ))}

                  {/* Typing indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="self-start px-3 py-2 rounded-lg bg-[#141414] border-l-2 border-[#E8D5B8]"
                    >
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#71717A] animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#71717A] animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#71717A] animate-bounce [animation-delay:300ms]" />
                      </div>
                    </motion.div>
                  )}

                  {/* Estimate Card (Stage 4) */}
                  {currentStage === 4 && !isTyping && (
                    <EstimateCard answers={answers} onSubmit={handleSubmit} onEdit={handleEdit} />
                  )}

                  {/* Chip Selector for current stage */}
                  {currentStage < 4 && !isTyping && messages.length > 0 && (
                    <div className="pt-2">
                      <ChipSelector
                        chips={[...stages[currentStage].chips]}
                        onSelect={advanceStage}
                        disabled={chipDisabled}
                      />
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input (only during stages 0-3) */}
                {currentStage < 4 && (
                  <ChatInput
                    onSubmit={advanceStage}
                    disabled={chipDisabled || isTyping}
                    placeholder={
                      currentStage === 0 ? "Describe your problem..." : "Type your answer..."
                    }
                  />
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
