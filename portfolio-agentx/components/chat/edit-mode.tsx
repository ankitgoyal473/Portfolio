"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { stages, generateEstimate } from "@/lib/estimate";
import { cn } from "@/lib/utils";

interface EditModeProps {
  answers: Record<string, string>;
  onSave: (updated: Record<string, string>) => void;
  onCancel: () => void;
}

export function EditMode({ answers, onSave, onCancel }: EditModeProps) {
  const [edited, setEdited] = useState<Record<string, string>>({ ...answers });
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showRecalculated, setShowRecalculated] = useState(false);
  const [prevBudget, setPrevBudget] = useState(answers.budget);

  useEffect(() => {
    if (edited.budget !== prevBudget) {
      setPrevBudget(edited.budget);
      setShowRecalculated(true);
      const timer = setTimeout(() => setShowRecalculated(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [edited.budget, prevBudget]);

  const estimate = generateEstimate(edited.problem, edited.budget);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-2 my-2 rounded-xl border border-[#27272A] bg-[#141414] p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#F8FAFC]">Edit Requirements</h3>
        {showRecalculated && (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[10px] px-2 py-0.5 rounded-full bg-[#F97316]/10 text-[#F97316] font-medium"
          >
            Recalculated
          </motion.span>
        )}
      </div>

      {stages.map((stage) => (
        <div key={stage.id} className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-[#71717A]">{stage.id}</label>
          {editingField === stage.id ? (
            <div className="flex flex-wrap gap-1.5">
              {stage.chips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => { setEdited((p) => ({ ...p, [stage.id]: chip })); setEditingField(null); }}
                  className={cn(
                    "px-2 py-1 text-[11px] rounded-full border transition-all cursor-pointer",
                    edited[stage.id] === chip
                      ? "bg-[#F97316] text-white border-[#F97316]"
                      : "border-[#27272A] text-[#F8FAFC] hover:border-[#F97316]"
                  )}
                >
                  {chip}
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={() => setEditingField(stage.id)}
              className="w-full text-left px-3 py-1.5 text-xs text-[#F8FAFC] bg-[#0A0A0A] rounded-lg border border-[#27272A] hover:border-[#F97316]/50 transition-colors cursor-pointer"
            >
              {edited[stage.id]}
            </button>
          )}
        </div>
      ))}

      <div className="pt-2 border-t border-[#27272A]">
        <p className="text-[10px] text-[#71717A] uppercase tracking-wider">Updated Estimate</p>
        <p className="text-lg font-bold text-[#F97316]">
          ${estimate.estimateLow.toLocaleString()} – ${estimate.estimateHigh.toLocaleString()}
        </p>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onSave(edited)}
          className="flex-1 px-4 py-2 rounded-lg bg-[#F97316] text-white text-sm font-medium hover:bg-[#EA6C0A] transition-colors cursor-pointer"
        >
          Save Changes
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-2 rounded-lg border border-[#27272A] text-[#71717A] text-sm hover:border-[#F97316]/50 hover:text-[#F8FAFC] transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
}
