"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChipSelectorProps {
  chips: string[];
  onSelect: (chip: string) => void;
  disabled?: boolean;
}

export function ChipSelector({ chips, onSelect, disabled }: ChipSelectorProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (chip: string) => {
    if (disabled || selected) return;
    setSelected(chip);
    onSelect(chip);
  };

  return (
    <div className="flex flex-wrap gap-2 px-1">
      {chips.map((chip) => (
        <motion.button
          key={chip}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSelect(chip)}
          disabled={disabled || !!selected}
          className={cn(
            "px-3 py-1.5 text-xs rounded-full border transition-all duration-200 cursor-pointer",
            selected === chip
              ? "bg-[#F97316] text-white border-[#F97316]"
              : disabled || selected
              ? "border-[#27272A] text-[#71717A] cursor-not-allowed"
              : "border-[#27272A] text-[#F8FAFC] hover:border-[#F97316] hover:shadow-[0_0_8px_rgba(249,115,22,0.2)]"
          )}
        >
          {chip}
        </motion.button>
      ))}
    </div>
  );
}
