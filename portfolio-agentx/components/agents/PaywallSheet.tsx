"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PAYWALL_SHEET_DATA } from "@/lib/paywall";

interface PaywallSheetProps {
  agentId: string;
  agentColor: string;
  isOpen: boolean;
  onClose: () => void;
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

export function PaywallSheet({
  agentId,
  agentColor,
  isOpen,
  onClose,
}: PaywallSheetProps) {
  const data = PAYWALL_SHEET_DATA[agentId];
  if (!data) return null;

  const emoji = AGENT_EMOJIS[agentId] ?? "";
  const name = AGENT_NAMES[agentId] ?? agentId;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-background-card rounded-t-2xl"
            style={{ borderTop: `2px solid ${agentColor}` }}
          >
            <div className="px-6 pt-3 pb-8 max-w-md mx-auto">
              {/* Handle bar */}
              <div className="flex justify-center mb-4">
                <div className="w-8 h-[3px] rounded-full bg-border" />
              </div>

              {/* Agent identity */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{emoji}</span>
                <span
                  className="text-lg font-bold"
                  style={{ color: agentColor }}
                >
                  {name}
                </span>
              </div>

              {/* Headline */}
              <h3 className="text-foreground font-semibold text-base mb-1">
                {data.headline}
              </h3>

              {/* Subtext */}
              <p className="text-foreground-secondary text-sm mb-4">
                {data.subtext}
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {data.features.map((feature) => (
                  <span
                    key={feature}
                    className="text-xs px-3 py-1 rounded-full border"
                    style={{
                      backgroundColor: `${agentColor}1A`,
                      color: agentColor,
                      borderColor: agentColor,
                    }}
                  >
                    {feature}
                  </span>
                ))}
              </div>

              {/* Price */}
              <div className="mb-1">
                <span
                  className="text-2xl font-bold"
                  style={{ color: agentColor }}
                >
                  {data.price}
                </span>
                <span className="text-foreground-muted text-sm">/month</span>
              </div>
              <p className="text-xs text-foreground-muted mb-5">
                Cancel anytime · No contracts
              </p>

              {/* Primary CTA */}
              <button
                onClick={() => {
                  console.log("Mock Stripe:", agentId);
                }}
                className="w-full py-3 rounded-lg font-bold text-sm mb-3 transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: agentColor,
                  color: "#0A0A0A",
                }}
              >
                {data.buttonText}
              </button>

              {/* Secondary CTA */}
              <button
                onClick={onClose}
                className="w-full py-3 rounded-lg font-medium text-sm border border-border text-foreground-muted hover:text-foreground transition-colors mb-4"
              >
                Maybe later
              </button>

              {/* Bundle link */}
              <p className="text-xs text-foreground-muted text-center">
                <a href="#" className="hover:underline">
                  Or get all 3 for $79/month →
                </a>
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
