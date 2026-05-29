"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Search, Mail, type LucideIcon } from "lucide-react";

interface PaywallSheetProps {
  agentId: string;
  agentColor: string;
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  userEmail?: string;
  userName?: string;
  onUnlocked?: () => void;
}

const AGENT_ICONS: Record<string, LucideIcon> = {
  warren: TrendingUp,
  sherlock: Search,
  harvey: Mail,
};

const AGENT_NAMES: Record<string, string> = {
  warren: "WARRen",
  sherlock: "Sherlock",
  harvey: "Harvey",
};

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as unknown as Record<string, unknown>).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function PaywallSheet({
  agentId,
  agentColor,
  isOpen,
  onClose,
  userEmail,
  userName,
  onUnlocked,
}: PaywallSheetProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const AgentIcon = AGENT_ICONS[agentId] ?? TrendingUp;
  const name = AGENT_NAMES[agentId] ?? agentId;

  const handleUnlock = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Create order server-side
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!orderRes.ok) throw new Error("Could not create order. Please try again.");

      const { orderId, amount, currency, keyId } = await orderRes.json();

      // 2. Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Payment SDK failed to load. Check your connection.");

      // 3. Open Razorpay modal
      type RazorpayInstance = { open(): void };
      type RazorpayConstructor = new (opts: unknown) => RazorpayInstance;
      const RazorpayClass = (window as unknown as { Razorpay: RazorpayConstructor }).Razorpay;

      const rzp = new RazorpayClass({
        key: keyId,
        amount,
        currency,
        name: "AGentX",
        description: "Unlock Warren, Sherlock & Harvey — unlimited runs",
        order_id: orderId,
        prefill: { name: userName ?? "", email: userEmail ?? "" },
        theme: { color: agentColor },
        modal: { ondismiss: () => setLoading(false) },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          // 4. Verify payment server-side
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          if (!verifyRes.ok) {
            setError("Payment received but verification failed. Contact support.");
            setLoading(false);
            return;
          }

          setLoading(false);
          onClose();
          onUnlocked?.();
        },
      });

      rzp.open();
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }, [agentColor, onClose, onUnlocked, userEmail, userName]);

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
                <AgentIcon className="w-6 h-6" style={{ color: agentColor }} />
                <span className="text-lg font-bold" style={{ color: agentColor }}>
                  {name}
                </span>
              </div>

              <h3 className="text-foreground font-semibold text-base mb-1">
                {name} is just the start.
              </h3>
              <p className="text-foreground-secondary text-sm mb-4">
                Unlock Warren, Sherlock &amp; Harvey — unlimited runs, all features.
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {["Unlimited runs", "All 3 agents", "Priority access"].map((f) => (
                  <span
                    key={f}
                    className="text-xs px-3 py-1 rounded-full border"
                    style={{
                      backgroundColor: `${agentColor}1A`,
                      color: agentColor,
                      borderColor: agentColor,
                    }}
                  >
                    {f}
                  </span>
                ))}
              </div>

              {/* Price */}
              <div className="mb-1">
                <span className="text-2xl font-bold" style={{ color: agentColor }}>
                  ₹999
                </span>
                <span className="text-foreground-muted text-sm">/month</span>
              </div>
              <p className="text-xs text-foreground-muted mb-5">
                Cancel anytime · No contracts
              </p>

              {error && <p className="text-xs text-error mb-3">{error}</p>}

              {/* Primary CTA */}
              <button
                onClick={handleUnlock}
                disabled={loading}
                className="w-full py-3 rounded-lg font-bold text-sm mb-3 transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: agentColor, color: "#0A0A0A" }}
              >
                {loading ? "Opening payment..." : "Unlock All 3 Agents — ₹999/month"}
              </button>

              {/* Secondary CTA */}
              <button
                onClick={onClose}
                className="w-full py-3 rounded-lg font-medium text-sm border border-border text-foreground-muted hover:text-foreground transition-colors mb-4"
              >
                Maybe later
              </button>

              <p className="text-xs text-foreground-muted text-center">
                <a href="mailto:ankitgoyal473@gmail.com" className="hover:underline">
                  Questions? Talk to Ankit →
                </a>
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
