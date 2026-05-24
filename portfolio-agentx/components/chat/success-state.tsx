"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
// @ts-ignore
import confetti from "canvas-confetti";

interface SuccessStateProps {
  onClose: () => void;
}

export function SuccessState({ onClose }: SuccessStateProps) {
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { x: 0.85, y: 0.85 },
      colors: ["#E8D5B8", "#FAFAFA", "#A1A1AA"],
    });
  }, []);

  const handleEmailSubmit = () => {
    if (email.trim()) {
      setEmailSubmitted(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center p-6 text-center space-y-4 flex-1"
    >
      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        className="w-16 h-16 rounded-full bg-[#E8D5B8]/10 border-2 border-[#E8D5B8] flex items-center justify-center"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Check className="w-8 h-8 text-[#E8D5B8]" />
        </motion.div>
      </motion.div>

      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-[#FAFAFA]">Sent to Ankit</h3>
        <p className="text-sm text-[#A1A1AA]">
          You&apos;ll hear back within 24 hours.
        </p>
      </div>

      {/* Email opt-in */}
      {!emailSubmitted ? (
        <div className="w-full space-y-2 pt-2">
          <p className="text-xs text-[#71717A]">Want updates? Leave your email:</p>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="flex-1 bg-[#141414] text-[#FAFAFA] text-sm px-3 py-2 rounded-lg border border-[#27272A] focus:border-[#E8D5B8] focus:outline-none placeholder:text-[#71717A]"
              onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
            />
            <button
              onClick={handleEmailSubmit}
              disabled={!email.trim()}
              className="px-3 py-2 rounded-lg bg-[#E8D5B8] text-[#0A0A0A] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-[#E8D5B8]">Email saved. We&apos;ll keep you updated.</p>
      )}

      <button
        onClick={onClose}
        className="w-full mt-4 px-4 py-2 rounded-lg border border-[#27272A] text-[#A1A1AA] text-sm hover:border-[#E8D5B8]/50 hover:text-[#FAFAFA] transition-colors"
      >
        Close
      </button>
    </motion.div>
  );
}
