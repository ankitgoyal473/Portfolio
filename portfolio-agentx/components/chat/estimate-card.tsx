"use client";

import { motion } from "framer-motion";
import { ArrowRight, Edit3 } from "lucide-react";
import { generateEstimate } from "@/lib/estimate";
import { cn } from "@/lib/utils";

interface EstimateCardProps {
  answers: Record<string, string>;
  onSubmit: () => void;
  onEdit: () => void;
}

export function EstimateCard({ answers, onSubmit, onEdit }: EstimateCardProps) {
  const estimate = generateEstimate(answers.problem, answers.budget);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-2 my-2 rounded-xl border border-[#F97316]/20 bg-[#141414] p-4 space-y-4"
    >
      <div className="space-y-2 text-xs text-[#71717A]">
        {[
          ["Problem", answers.problem],
          ["Workflow", answers.workflow],
          ["Timeline", answers.timeline],
          ["Budget", answers.budget],
        ].map(([label, val]) => (
          <div key={label} className="flex justify-between gap-2">
            <span>{label}</span>
            <span className="text-[#F8FAFC] text-right max-w-[60%]">{val}</span>
          </div>
        ))}
      </div>

      <div className="h-px bg-[#27272A]" />

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full",
              estimate.complexity === "Low" ? "bg-green-900/50 text-green-300"
              : estimate.complexity === "Medium" ? "bg-yellow-900/50 text-yellow-300"
              : estimate.complexity === "Med-High" ? "bg-orange-900/50 text-orange-300"
              : "bg-red-900/50 text-red-300"
            )}
          >
            {estimate.complexity} Complexity
          </span>
          <span className="text-[10px] text-[#71717A]">{estimate.delivery}</span>
        </div>
        <div className="text-[10px] text-[#71717A]">
          <span className="font-medium text-[#F8FAFC]">Stack:</span> {estimate.stack}
        </div>
        <div className="pt-2">
          <p className="text-[10px] text-[#71717A] uppercase tracking-wider">Estimated Investment</p>
          <p className="text-2xl font-bold text-[#F97316]">
            ${estimate.estimateLow.toLocaleString()} – ${estimate.estimateHigh.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="h-px bg-[#27272A]" />

      <div className="flex gap-2">
        <button
          onClick={onSubmit}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#F97316] text-white text-sm font-medium hover:bg-[#EA6C0A] transition-colors cursor-pointer"
        >
          Request Review <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#27272A] text-[#71717A] text-sm hover:border-[#F97316]/50 hover:text-[#F8FAFC] transition-colors cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" /> Edit
        </button>
      </div>
    </motion.div>
  );
}
