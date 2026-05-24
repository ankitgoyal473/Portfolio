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

  const handleFieldChange = (field: string, value: string) => {
    setEdited((prev) => ({ ...prev, [field]: value }));
    setEditingField(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-2 my-2 rounded-xl border border-[#27272A] bg-[#141414] p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#FAFAFA]">Edit Requirements</h3>
        {showRecalculated && (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-[10px] px-2 py-0.5 rounded-full bg-[#E8D5B8]/10 text-[#E8D5B8] font-medium"
          >
            Recalculated
          </motion.span>
        )}
      </div>

      {stages.map((stage) => (
        <div key={stage.id} className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-[#71717A]">
            {stage.id}
          </label>
          {editingField === stage.id ? (
            <div className="flex flex-wrap gap-1.5">
              {stage.chips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleFieldChange(stage.id, chip)}
                  className={cn(
                    "px-2 py-1 text-[11px] rounded-full border transition-all",
                    edited[stage.id] === chip
                      ? "bg-[#E8D5B8] text-[#0A0A0A] border-[#E8D5B8]"
                      : "border-[#3F3F46] text-[#FAFAFA] hover:border-[#E8D5B8]"
                  )}
                >
                  {chip}
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={() => setEditingField(stage.id)}
              className="w-full text-left px-3 py-1.5 text-xs text-[#FAFAFA] bg-[#1E1E1E] rounded-lg border border-[#27272A] hover:border-[#E8D5B8]/50 transition-colors"
            >
              {edited[stage.id]}
            </button>
          )}
        </div>
      ))}

      {/* Live estimate preview */}
      <div className="pt-2 border-t border-[#27272A]">
        <p className="text-[10px] text-[#A1A1AA] uppercase tracking-wider">Updated Estimate</p>
        <p className="text-lg font-bold text-[#E8D5B8]">
          ${estimate.estimateLow.toLocaleString()} &ndash; $
          {estimate.estimateHigh.toLocaleString()}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onSave(edited)}
          className="flex-1 px-4 py-2 rounded-lg bg-[#E8D5B8] text-[#0A0A0A] text-sm font-medium hover:bg-[#E8D5B8]/90 transition-colors"
        >
          Save Changes
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-2 rounded-lg border border-[#27272A] text-[#A1A1AA] text-sm hover:border-[#E8D5B8]/50 hover:text-[#FAFAFA] transition-colors"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
}
