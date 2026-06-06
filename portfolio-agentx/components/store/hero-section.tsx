"use client";

import { motion } from "framer-motion";
import { FloatingCodeBackground } from "@/components/shared/floating-code-bg";

export default function HeroSection() {
  return (
    <section className="relative pt-40 pb-24 px-6 text-center overflow-hidden">
      <FloatingCodeBackground />
      <div className="relative z-10 max-w-3xl mx-auto">
        <p className="text-sm font-medium text-[#71717A] uppercase tracking-widest mb-4">
          Claude Code Solutions
        </p>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
          AI that runs in{" "}
          <span className="text-[#F97316]">your terminal.</span>
        </h1>
        <p className="text-lg text-[#71717A] mb-10 max-w-xl mx-auto">
          Buy once. Download. Run with Claude Code. No subscriptions, no
          servers, no accounts. Your AI, on your machine.
        </p>
        <motion.a
          href="#products"
          className="inline-block bg-[#F97316] hover:bg-[#EA6C0A] text-white font-semibold px-8 py-3.5 rounded-xl transition-colors duration-150 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          See the solutions ↓
        </motion.a>
      </div>
    </section>
  );
}
