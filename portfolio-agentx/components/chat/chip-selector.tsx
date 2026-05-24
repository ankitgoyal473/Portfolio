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
            "px-3 py-1.5 text-xs rounded-full border transition-all duration-200",
            selected === chip
              ? "bg-[#E8D5B8] text-[#0A0A0A] border-[#E8D5B8]"
              : disabled || selected
                ? "border-[#3F3F46] text-[#71717A] cursor-not-allowed"
                : "border-[#3F3F46] text-[#FAFAFA] hover:border-[#E8D5B8] hover:shadow-[0_0_8px_rgba(232,213,184,0.15)] cursor-pointer"
          )}
        >
          {chip}
        </motion.button>
      ))}
    </div>
  );
}
