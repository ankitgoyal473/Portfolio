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
      className="mx-2 my-2 rounded-xl border border-[#E8D5B8]/20 bg-[#141414] p-4 space-y-4"
    >
      {/* Summary */}
      <div className="space-y-2 text-xs text-[#A1A1AA]">
        <div className="flex justify-between">
          <span>Problem</span>
          <span className="text-[#FAFAFA] text-right max-w-[60%]">{answers.problem}</span>
        </div>
        <div className="flex justify-between">
          <span>Workflow</span>
          <span className="text-[#FAFAFA] text-right max-w-[60%]">{answers.workflow}</span>
        </div>
        <div className="flex justify-between">
          <span>Timeline</span>
          <span className="text-[#FAFAFA]">{answers.timeline}</span>
        </div>
        <div className="flex justify-between">
          <span>Budget</span>
          <span className="text-[#FAFAFA]">{answers.budget}</span>
        </div>
      </div>

      <div className="h-px bg-[#27272A]" />

      {/* Estimate details */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full",
              estimate.complexity === "Low"
                ? "bg-green-900/50 text-green-300"
                : estimate.complexity === "Medium"
                  ? "bg-yellow-900/50 text-yellow-300"
                  : estimate.complexity === "Med-High"
                    ? "bg-orange-900/50 text-orange-300"
                    : "bg-red-900/50 text-red-300"
            )}
          >
            {estimate.complexity} Complexity
          </span>
          <span className="text-[10px] text-[#A1A1AA]">{estimate.delivery}</span>
        </div>

        <div className="text-[10px] text-[#A1A1AA]">
          <span className="font-medium text-[#FAFAFA]">Stack:</span> {estimate.stack}
        </div>

        {/* Big price */}
        <div className="pt-2">
          <p className="text-[10px] text-[#A1A1AA] uppercase tracking-wider">
            Estimated Investment
          </p>
          <p className="text-2xl font-bold text-[#E8D5B8]">
            ${estimate.estimateLow.toLocaleString()} &ndash; $
            {estimate.estimateHigh.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="h-px bg-[#27272A]" />

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onSubmit}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#E8D5B8] text-[#0A0A0A] text-sm font-medium hover:bg-[#E8D5B8]/90 transition-colors"
        >
          Request Review <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#27272A] text-[#A1A1AA] text-sm hover:border-[#E8D5B8]/50 hover:text-[#FAFAFA] transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" /> Edit
        </button>
      </div>
    </motion.div>
  );
}
