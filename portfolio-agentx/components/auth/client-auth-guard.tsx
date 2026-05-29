"use client";

import { type ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMockAuth, saveRedirectPath } from "@/lib/mock-auth";

interface ClientAuthGuardProps {
  children: ReactNode;
}

export function ClientAuthGuard({ children }: ClientAuthGuardProps) {
  const { user, isLoading } = useMockAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      saveRedirectPath(window.location.pathname);
      router.push("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
