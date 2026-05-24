"use client";

import { cn } from "@/lib/utils";

interface StageBarProps {
  currentStage: number;
}

const labels = ["Problem", "Workflow", "Timeline", "Budget", "Estimate"];

export function StageBar({ currentStage }: StageBarProps) {
  return (
    <div className="px-4 py-3 border-b border-[#27272A]">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-[10px] left-[10px] right-[10px] h-[2px] bg-[#27272A]" />
        <div
          className="absolute top-[10px] left-[10px] h-[2px] bg-[#E8D5B8] transition-all duration-500"
          style={{ width: `${(currentStage / 4) * 100}%` }}
        />

        {labels.map((label, i) => (
          <div key={label} className="flex flex-col items-center z-10">
            <div
              className={cn(
                "w-5 h-5 rounded-full border-2 transition-all duration-300",
                i < currentStage
                  ? "bg-[#E8D5B8] border-[#E8D5B8]"
                  : i === currentStage
                    ? "bg-[#1E1E1E] border-[#E8D5B8] animate-pulse"
                    : "bg-[#1E1E1E] border-[#71717A]"
              )}
            />
            <span
              className={cn(
                "text-[10px] mt-1 font-medium transition-colors",
                i <= currentStage ? "text-[#E8D5B8]" : "text-[#71717A]"
              )}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
