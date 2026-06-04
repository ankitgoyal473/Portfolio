"use client";

import { motion } from "framer-motion";
import { TrendingUp, Search, Mail } from "lucide-react";
import { NeuralBackground } from "@/components/shared/neural-background";
import { AgentXLogoAnimated } from "@/components/shared/agentx-logo-animated";
import { AgentXLogo } from "@/components/shared/agentx-logo";
import { Button } from "@/components/ui/button";
import { useMockAuth } from "@/lib/mock-auth";

export default function LoginPage() {
  const { login } = useMockAuth();

  const agentOrbs = [
    { name: "Warren", icon: TrendingUp, color: "#f0b429", desc: "Stock analyst" },
    { name: "Sherlock", icon: Search, color: "#4a9eff", desc: "Competitor intel" },
    { name: "Harvey", icon: Mail, color: "#00c896", desc: "Cold email writer" },
  ];

  return (
    <main className="min-h-screen bg-background flex">
      {/* LEFT PANEL — brand, hidden on mobile */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 relative flex-col justify-between p-12 bg-background-card overflow-hidden">
        <NeuralBackground />

        <AgentXLogoAnimated size={400} />

        {/* Logo */}
        <div className="relative z-10">
          <AgentXLogo size="lg" />
        </div>

        {/* Center content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="text-4xl font-bold text-foreground leading-tight mb-3">
              Your AI squad grows<br />
              <span className="text-accent">with your ambition.</span>
            </h2>
            <p className="text-foreground-secondary text-lg mb-12">
              Warren. Sherlock. Harvey. More coming.
            </p>
          </motion.div>

          {/* Agent orbs — vertical roster */}
          <div className="relative flex flex-col gap-6">
            {/* Connecting line */}
            <div className="absolute left-6 top-6 bottom-6 w-px bg-border" />

            {agentOrbs.map((agent, i) => {
              const Icon = agent.icon;
              return (
                <motion.div
                  key={agent.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-4 relative z-10"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${agent.color}20`, border: `1px solid ${agent.color}40` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: agent.color }} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{agent.name}</p>
                    <p className="text-sm text-foreground-secondary">{agent.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom stat */}
        <div className="relative z-10">
          <p className="text-xs text-foreground-muted">
            3 agents live · Custom workflows on the way
          </p>
        </div>
      </div>

      {/* RIGHT PANEL — auth form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          {/* Logo — mobile only */}
          <div className="flex justify-center mb-8 md:hidden">
            <AgentXLogo size="md" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            Sign in to AGentX
          </h1>
          <p className="text-sm text-foreground-secondary mb-8">
            Access Warren, Sherlock, and Harvey
          </p>

          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={login}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" className="mr-2">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>

          <p className="text-xs text-foreground-secondary text-center mt-6">
            By signing in you agree to our terms of service
          </p>
        </motion.div>
      </div>
    </main>
  );
}
