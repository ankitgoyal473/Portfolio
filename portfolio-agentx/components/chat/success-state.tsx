"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
// @ts-ignore
import confetti from "canvas-confetti";

export function SuccessState({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { x: 0.85, y: 0.85 },
      colors: ["#F97316", "#F8FAFC", "#71717A"],
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center p-6 text-center space-y-4 flex-1"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        className="w-16 h-16 rounded-full bg-[#F97316]/10 border-2 border-[#F97316] flex items-center justify-center"
      >
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <Check className="w-8 h-8 text-[#F97316]" />
        </motion.div>
      </motion.div>

      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-[#F8FAFC]">Sent to Ankit</h3>
        <p className="text-sm text-[#71717A]">You&apos;ll hear back within 24 hours.</p>
      </div>

      <button
        onClick={onClose}
        className="w-full mt-4 px-4 py-2 rounded-lg border border-[#27272A] text-[#71717A] text-sm hover:border-[#F97316]/50 hover:text-[#F8FAFC] transition-colors cursor-pointer"
      >
        Close
      </button>
    </motion.div>
  );
}
