"use client";

import { cn } from "@/lib/utils";

const labels = ["Problem", "Workflow", "Timeline", "Budget", "Estimate"];

export function StageBar({ currentStage }: { currentStage: number }) {
  return (
    <div className="px-4 py-3 border-b border-[#27272A]">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-[10px] left-[10px] right-[10px] h-[2px] bg-[#27272A]" />
        <div
          className="absolute top-[10px] left-[10px] h-[2px] bg-[#F97316] transition-all duration-500"
          style={{ width: `${(currentStage / 4) * 100}%` }}
        />
        {labels.map((label, i) => (
          <div key={label} className="flex flex-col items-center z-10">
            <div
              className={cn(
                "w-5 h-5 rounded-full border-2 transition-all duration-300",
                i < currentStage
                  ? "bg-[#F97316] border-[#F97316]"
                  : i === currentStage
                  ? "bg-[#141414] border-[#F97316] animate-pulse"
                  : "bg-[#141414] border-[#27272A]"
              )}
            />
            <span
              className={cn(
                "text-[10px] mt-1 font-medium transition-colors",
                i <= currentStage ? "text-[#F97316]" : "text-[#71717A]"
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
