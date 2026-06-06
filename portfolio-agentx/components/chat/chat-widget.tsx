"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { stages, generateEstimate } from "@/lib/estimate";
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

const HIDDEN_PATHS = ["/hire", "/login", "/auth"];

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentStage, isTyping]);

  useEffect(() => {
    if (isOpen && !hasInitialized.current) {
      hasInitialized.current = true;
      setIsTyping(true);
      const timer = setTimeout(() => {
        setIsTyping(false);
        setMessages([{ role: "assistant", content: stages[0].question }]);
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
      setMessages((prev) => [...prev, { role: "user", content: answer }]);
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const nextStage = currentStage + 1;
        setCurrentStage(nextStage);
        setChipDisabled(false);
        if (nextStage < 4) {
          setMessages((prev) => [...prev, { role: "assistant", content: stages[nextStage].question }]);
        } else {
          setMessages((prev) => [...prev, { role: "assistant", content: "Here's your instant estimate based on what you've shared:" }]);
        }
      }, 400);
    },
    [currentStage, answers]
  );

  const handleSubmit = async () => {
    const estimate = generateEstimate(answers.problem, answers.budget);
    try {
      await fetch("/api/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Chat Widget Lead",
          email: "",
          company: "",
          message: `Problem: ${answers.problem}\nWorkflow: ${answers.workflow}\nTimeline: ${answers.timeline}\nBudget: ${answers.budget}\n\nEstimate: $${estimate.estimateLow.toLocaleString()}–$${estimate.estimateHigh.toLocaleString()} (${estimate.complexity} · ${estimate.delivery})\nStack: ${estimate.stack}`,
        }),
      });
    } catch {
      // continue to success even if email fails
    }
    setViewMode("success");
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

  // Hide on hire, login, auth pages
  if (HIDDEN_PATHS.some((p) => pathname.startsWith(p))) return null;

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#F97316] text-white shadow-lg shadow-[#F97316]/30 flex items-center justify-center hover:bg-[#EA6C0A] hover:scale-105 transition-all duration-150 cursor-pointer"
            aria-label="Open chat"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] max-h-[80vh] bg-[#141414] rounded-2xl border border-[#27272A] flex flex-col shadow-2xl shadow-black/50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#27272A]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#F97316] animate-pulse" />
                <h2 className="text-sm font-semibold text-[#F8FAFC]">AGentX Discovery</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-[#71717A] hover:text-[#F8FAFC] hover:bg-[#27272A] transition-colors cursor-pointer"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <StageBar currentStage={currentStage} />

            {/* Content */}
            {viewMode === "success" ? (
              <SuccessState onClose={handleReset} />
            ) : viewMode === "edit" ? (
              <div className="flex-1 overflow-y-auto">
                <EditMode answers={answers} onSave={(u) => { setAnswers(u); setViewMode("chat"); }} onCancel={() => setViewMode("chat")} />
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col min-h-0">
                  {messages.map((msg, i) => (
                    <MessageBubble key={i} role={msg.role} content={msg.content} />
                  ))}

                  {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="self-start px-3 py-2 rounded-lg bg-[#0A0A0A] border-l-2 border-[#F97316]">
                      <div className="flex gap-1">
                        {[0, 150, 300].map((delay) => (
                          <span key={delay} className="w-1.5 h-1.5 rounded-full bg-[#71717A] animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {currentStage === 4 && !isTyping && (
                    <EstimateCard answers={answers} onSubmit={handleSubmit} onEdit={() => setViewMode("edit")} />
                  )}

                  {currentStage < 4 && !isTyping && messages.length > 0 && (
                    <div className="pt-2">
                      <ChipSelector chips={[...stages[currentStage].chips]} onSelect={advanceStage} disabled={chipDisabled} />
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {currentStage < 4 && (
                  <ChatInput
                    onSubmit={advanceStage}
                    disabled={chipDisabled || isTyping}
                    placeholder={currentStage === 0 ? "Describe your problem..." : "Type your answer..."}
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
