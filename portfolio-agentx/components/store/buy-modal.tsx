"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.querySelector('script[src*="checkout.razorpay.com"]')) {
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

interface BuyModalProps {
  product: Product;
  onClose: () => void;
}

export default function BuyModal({ product, onClose }: BuyModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleBuy() {
    if (!email || !email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      // 1. Load Razorpay SDK
      const ok = await loadRazorpayScript();
      if (!ok) throw new Error("Failed to load payment SDK. Check your connection.");

      // 2. Create order
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_slug: product.slug, email }),
      });
      if (!orderRes.ok) throw new Error("Could not create order. Please try again.");
      const order = await orderRes.json();

      // 3. Open Razorpay modal
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "AGentX",
        description: product.name,
        order_id: order.orderId,
        prefill: { email },
        theme: { color: "#F97316" },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          // 4. Verify payment
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              product_slug: product.slug,
              email,
            }),
          });
          const result = await verifyRes.json();

          if (!verifyRes.ok) {
            setError("Payment verification failed. Contact support with your payment ID.");
            setLoading(false);
            return;
          }

          // 5. Navigate to success page
          if (result.downloadUrl) {
            window.location.href = `/success?url=${encodeURIComponent(result.downloadUrl)}&product=${product.slug}`;
          } else {
            // Fallback: storage error — email was still sent
            window.location.href = `/success?product=${product.slug}&fallback=1`;
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      });

      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-[#141414] border border-[#27272A] rounded-xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#71717A] hover:text-[#F8FAFC] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <h2 className="text-lg font-semibold mb-1">Buy {product.name}</h2>
        <p className="text-sm text-[#71717A] mb-5">
          Enter your email — we&apos;ll send your download link there.
        </p>

        <label htmlFor="buy-email" className="block text-sm font-medium mb-1.5">
          Email address
        </label>
        <input
          id="buy-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleBuy()}
          placeholder="you@example.com"
          className="w-full bg-[#0A0A0A] border border-[#27272A] rounded-lg px-3 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#71717A] focus:outline-none focus:border-[#F97316] transition-colors mb-4"
        />

        {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

        <button
          onClick={handleBuy}
          disabled={loading}
          className="w-full bg-[#F97316] hover:bg-[#EA6C0A] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors duration-150 cursor-pointer"
        >
          {loading ? "Processing…" : `Pay ${formatPrice(product.price)}`}
        </button>

        <p className="text-xs text-[#71717A] text-center mt-3">
          One-time purchase · No subscription · Download link valid 24h
        </p>
      </div>
    </div>
  );
}
