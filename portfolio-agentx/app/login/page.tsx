"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, Search, Mail } from "lucide-react";
import { AgentXLogo } from "@/components/shared/agentx-logo";
import { NeuralBackground } from "@/components/shared/neural-background";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

const agentOrbs = [
  { name: "Warren", icon: TrendingUp, color: "#f0b429", desc: "Stock analyst" },
  { name: "Sherlock", icon: Search, color: "#4a9eff", desc: "Research agent" },
  { name: "Harvey", icon: Mail, color: "#00c896", desc: "Email writer" },
];

const orbVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function LoginPage() {
  const { user, isLoading, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) router.replace("/");
  }, [user, isLoading, router]);

  return (
    <main className="min-h-screen bg-[#0A0A0A] flex">
      {/* Left panel — brand */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 relative flex-col justify-between p-12 bg-[#141414] overflow-hidden border-r border-[#27272A]">
        <NeuralBackground />
        <div className="relative z-10">
          <Link href="/">
            <AgentXLogo size="lg" />
          </Link>
        </div>
        <div className="relative z-10 flex-1 flex flex-col justify-center gap-8">
          <div>
            <h2 className="text-4xl font-bold text-[#F8FAFC] leading-tight mb-3">
              AI that works<br />while you sleep
            </h2>
            <p className="text-[#71717A] text-lg max-w-sm">
              Sign in to access Claude Code solutions and run AI agents in your own terminal.
            </p>
          </div>
          <motion.div
            className="flex gap-4"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } } }}
          >
            {agentOrbs.map(({ name, icon: Icon, color, desc }) => (
              <motion.div
                key={name}
                variants={orbVariants}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[#27272A] bg-[#0A0A0A]/60 backdrop-blur-sm"
                style={{ borderTopColor: color, borderTopWidth: "2px" }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <span className="text-xs font-semibold text-[#F8FAFC]">{name}</span>
                <span className="text-xs text-[#71717A]">{desc}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
        <div className="relative z-10 text-xs text-[#71717A]">
          Built by Ankit Goyal · Gurgaon, India
        </div>
      </div>

      {/* Right panel — login form */}
      <motion.div
        className="flex-1 flex flex-col items-center justify-center px-8 py-12"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
      >
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex justify-center mb-10 md:hidden">
            <Link href="/">
              <AgentXLogo size="md" />
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-[#F8FAFC] mb-2">Welcome back</h1>
          <p className="text-[#71717A] text-sm mb-8">
            Sign in with Google to continue.
          </p>

          <button
            onClick={login}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-[#27272A] bg-[#141414] text-[#F8FAFC] text-sm font-medium hover:bg-[#1f1f1f] hover:border-[#3f3f46] transition-colors duration-150 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <p className="mt-8 text-center text-xs text-[#71717A]">
            By continuing you agree to our{" "}
            <span className="text-[#F8FAFC]">terms of service</span>.
          </p>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-sm text-[#71717A] hover:text-[#F8FAFC] transition-colors duration-150"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
