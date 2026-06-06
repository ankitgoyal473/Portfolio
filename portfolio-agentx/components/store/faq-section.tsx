"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Do I need to know how to code?",
    a: "No. You only need to install Claude Code (one terminal command) and fill in a config file with your details. No programming required.",
  },
  {
    q: "What is Claude Code and how do I get it?",
    a: "Claude Code is an AI assistant that runs in your terminal. Install it with: npm install -g claude. You'll need a Claude account — a free tier is available at claude.ai.",
  },
  {
    q: "What happens after I buy?",
    a: "You'll get a download link on the page immediately and via email. The link is valid for 24 hours. Unzip the file, open the folder in your terminal, and type 'claude' to start.",
  },
  {
    q: "Will it work on Windows and Mac?",
    a: "Yes. Claude Code runs on Mac, Windows (via PowerShell or WSL), and Linux. The solutions are tested on all three.",
  },
  {
    q: "Can I get a refund?",
    a: "Because these are digital downloads, we don't offer refunds after the download link is generated. If something doesn't work, email ankitgoyal473@gmail.com and I'll fix it or refund you manually.",
  },
  {
    q: "What if my download link expires?",
    a: "Email ankitgoyal473@gmail.com with your payment ID and I'll send a new link within a few hours.",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">FAQ</h2>
        <div className="flex flex-col gap-2">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-[#27272A] rounded-lg overflow-hidden">
              <motion.button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium hover:bg-[#141414] transition-colors duration-150 cursor-pointer"
                aria-expanded={open === i}
                whileHover={{ x: 2 }}
                transition={{ duration: 0.15 }}
              >
                <span>{faq.q}</span>
                <motion.div
                  animate={{ rotate: open === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={16} className="shrink-0 text-[#71717A]" />
                </motion.div>
              </motion.button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="px-5 pb-4 text-sm text-[#71717A] leading-relaxed border-t border-[#27272A]">
                      <div className="pt-3">{faq.a}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
