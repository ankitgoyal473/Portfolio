"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface WelcomeHeaderProps {
  userName: string;
  plan: "free" | "pro";
}

export function WelcomeHeader({ userName, plan }: WelcomeHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          Welcome back, {userName}
        </h1>
        <p className="mt-1 text-foreground-secondary">
          Your squad is ready.
        </p>
      </div>

      <div className="flex items-center gap-3">
        {plan === "pro" ? (
          <Badge
            className={cn(
              "text-sm px-3 py-1 bg-accent/15 text-accent border-accent/30",
              "shadow-[0_0_12px_rgba(232,213,184,0.2)]"
            )}
          >
            Pro
          </Badge>
        ) : (
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              Free plan
            </Badge>
            <Link
              href="#"
              className="text-sm font-medium text-accent hover:text-accent-hover transition-colors"
            >
              Upgrade &rarr;
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
