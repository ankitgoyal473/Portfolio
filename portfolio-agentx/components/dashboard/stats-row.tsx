"use client";

import { motion } from "framer-motion";

interface StatsRowProps {
  stats: {
    reportsRun: number;
    rivalsTracked: number;
    emailsWritten: number;
    sessionsSaved: number;
  };
}

const statLabels: { key: keyof StatsRowProps["stats"]; label: string }[] = [
  { key: "reportsRun", label: "Reports run" },
  { key: "rivalsTracked", label: "Rivals tracked" },
  { key: "emailsWritten", label: "Emails written" },
  { key: "sessionsSaved", label: "Sessions saved" },
];

export function StatsRow({ stats }: StatsRowProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {statLabels.map((item, i) => (
        <motion.div
          key={item.key}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
          className="rounded-xl bg-background-card/60 border border-border/50 p-4"
        >
          <p className="text-xs text-foreground-secondary mb-1">{item.label}</p>
          <p className="text-2xl font-bold text-foreground">{stats[item.key]}</p>
        </motion.div>
      ))}
    </div>
  );
}
