"use client";

import Link from "next/link";
import { useMockAuth } from "@/lib/mock-auth";
import { Button } from "@/components/ui/button";

interface SignInNudgeProps {
  agentName: string;
}

export function SignInNudge({ agentName }: SignInNudgeProps) {
  const { user, isLoading } = useMockAuth();

  if (isLoading || user) return null;

  return (
    <div className="mx-auto max-w-2xl px-6 pb-12">
      <div className="rounded-xl border border-border bg-background-card/80 p-6 text-center">
        <p className="text-foreground-secondary mb-4">Sign in to keep using {agentName}</p>
        <Link href="/login">
          <Button variant="secondary">Sign in</Button>
        </Link>
      </div>
    </div>
  );
}
