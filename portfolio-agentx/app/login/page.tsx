"use client";

import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedGrid } from "@/components/shared/animated-grid";
import { Button } from "@/components/ui/button";
import { useMockAuth } from "@/lib/mock-auth";

export default function LoginPage() {
  const { login } = useMockAuth();

  return (
    <main className="relative min-h-screen bg-background flex items-center justify-center px-6">
      <AnimatedGrid />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="rounded-xl border border-border bg-background-card p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <Sparkles className="h-6 w-6 text-accent" />
            <span className="text-2xl font-bold text-foreground">
              AGent<span className="text-accent">X</span>
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-xl font-semibold text-foreground text-center mb-2">
            Sign in to AGentX
          </h1>
          <p className="text-sm text-foreground-secondary text-center mb-8">
            Access WARRen, Sherlock, and Harvey
          </p>

          {/* Requires Google OAuth configured in Supabase Dashboard → Auth → Providers → Google */}
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={login}
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          {/* Terms */}
          <p className="text-xs text-foreground-secondary text-center mt-6">
            By signing in you agree to our terms of service
          </p>
        </div>
      </motion.div>
    </main>
  );
}
