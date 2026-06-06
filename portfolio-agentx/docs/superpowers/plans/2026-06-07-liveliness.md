# AGentX Liveliness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a complete motion layer — floating code hero background, scroll-triggered section entrances, animated stat counters, spring hover on product cards, animated FAQ accordion, and entrance animations on the login page.

**Architecture:** Framer Motion `whileInView` for scroll animations via a shared `AnimatedSection` wrapper. DOM-based floating code fragments for the hero. Stat counters use `useInView` + `requestAnimationFrame`. All reduced-motion cases are explicitly handled. No new npm dependencies — Framer Motion is already installed.

**Tech Stack:** Next.js 16, Framer Motion (already installed), Tailwind CSS v4, TypeScript

**Working directory for all commands:** `portfolio-agentx/`

---

### Task 1: Add CSS keyframe + reduced-motion override to globals.css

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Append the `floatCode` keyframe and reduced-motion rule**

Open `app/globals.css`. After the existing `.animate-fade-up` block (currently ends at line 37), append exactly:

```css
@keyframes floatCode {
  0%   { transform: translateY(0);       opacity: 0; }
  8%   { opacity: 1; }
  85%  { opacity: 0.75; }
  100% { transform: translateY(-110vh);  opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .floating-code-bg { display: none; }
}
```

- [ ] **Step 2: Verify no syntax errors**

```bash
npx tsc --noEmit
```

Expected: no output (0 errors). CSS syntax is not checked by tsc — just confirm the file saved correctly by opening it.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat(liveliness): add floatCode keyframe and reduced-motion CSS"
```

---

### Task 2: Create `AnimatedSection` scroll wrapper

**Files:**
- Create: `components/shared/animated-section.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";

interface AnimatedSectionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function AnimatedSection({ children, delay = 0, className = "" }: AnimatedSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.35, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Type check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add components/shared/animated-section.tsx
git commit -m "feat(liveliness): add AnimatedSection scroll entrance wrapper"
```

---

### Task 3: Create `FloatingCodeBackground` hero component

**Files:**
- Create: `components/shared/floating-code-bg.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

const SNIPPETS = [
  "claude",
  "CLAUDE.md",
  "> warren analyze RELIANCE",
  "use_computer: true",
  "tool_use: web_search",
  "✓ 32/32 tests passed",
  "export ANTHROPIC_API_KEY=sk-...",
  '> sherlock research "HDFC"',
  "npm install -g @anthropic-ai/claude-code",
  "streaming: true",
  "FastAPI + Strands",
  "# Claude Code Solution",
];

interface Particle {
  id: number;
  snippet: string;
  left: string;
  duration: number;
  color: string;
  fontSize: string;
}

export function FloatingCodeBackground() {
  const prefersReducedMotion = useReducedMotion();
  const [particles, setParticles] = useState<Particle[]>([]);
  const counter = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const MAX = 8;

    const spawn = () => {
      setParticles((prev) => {
        if (prev.length >= MAX) return prev;
        const id = counter.current++;
        return [
          ...prev,
          {
            id,
            snippet: SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)],
            left: `${5 + Math.random() * 80}%`,
            duration: 6 + Math.random() * 4,
            color: Math.random() > 0.5 ? "#F9731655" : "#4a9eff45",
            fontSize: `${0.55 + Math.random() * 0.15}rem`,
          },
        ];
      });
    };

    const interval = setInterval(spawn, 900);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  const remove = (id: number) =>
    setParticles((prev) => prev.filter((p) => p.id !== id));

  if (prefersReducedMotion) return null;

  return (
    <div
      className="floating-code-bg absolute inset-0 overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          onAnimationEnd={() => remove(p.id)}
          style={{
            position: "absolute",
            bottom: "-30px",
            left: p.left,
            color: p.color,
            fontSize: p.fontSize,
            fontFamily: "monospace",
            whiteSpace: "nowrap",
            animation: `floatCode ${p.duration}s linear forwards`,
          }}
        >
          {p.snippet}
        </span>
      ))}
      {/* Fade out near top */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, transparent 55%, #0A0A0A 92%)",
          zIndex: 1,
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Type check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add components/shared/floating-code-bg.tsx
git commit -m "feat(liveliness): add FloatingCodeBackground hero component"
```

---

### Task 4: Wire `FloatingCodeBackground` into hero section

**Files:**
- Modify: `components/store/hero-section.tsx`

- [ ] **Step 1: Replace the entire file**

The current `hero-section.tsx` is a plain server component with no animation. Replace it entirely:

```tsx
import { motion } from "framer-motion";
import { FloatingCodeBackground } from "@/components/shared/floating-code-bg";

export default function HeroSection() {
  return (
    <section className="relative pt-40 pb-24 px-6 text-center overflow-hidden">
      <FloatingCodeBackground />
      <div className="relative z-10 max-w-3xl mx-auto">
        <p className="text-sm font-medium text-[#71717A] uppercase tracking-widest mb-4">
          Claude Code Solutions
        </p>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
          AI that runs in{" "}
          <span className="text-[#F97316]">your terminal.</span>
        </h1>
        <p className="text-lg text-[#71717A] mb-10 max-w-xl mx-auto">
          Buy once. Download. Run with Claude Code. No subscriptions, no
          servers, no accounts. Your AI, on your machine.
        </p>
        <motion.a
          href="#products"
          className="inline-block bg-[#F97316] hover:bg-[#EA6C0A] text-white font-semibold px-8 py-3.5 rounded-xl transition-colors duration-150 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          See the solutions ↓
        </motion.a>
      </div>
    </section>
  );
}
```

Key changes: `relative overflow-hidden` on the section, `FloatingCodeBackground` as first child, `relative z-10` on the content div.

- [ ] **Step 2: Type check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Start dev server and verify hero**

```bash
npm run dev
```

Open http://localhost:3000. You should see code snippets (`claude`, `CLAUDE.md`, etc.) floating upward behind the hero text. They should fade out near the top. The hero text must remain fully readable above the fragments.

- [ ] **Step 4: Commit**

```bash
git add components/store/hero-section.tsx
git commit -m "feat(liveliness): wire FloatingCodeBackground into hero section"
```

---

### Task 5: Create `StatsSection` with animated counters

**Files:**
- Create: `components/store/stats-section.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useRef, useEffect, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const STATS = [
  { end: 20, suffix: "+", label: "AI Tools Shipped" },
  { end: 5000, suffix: "+", label: "Hours Automated", comma: true },
  { end: 3, suffix: "+", label: "Enterprise Teams" },
];

function Counter({
  end,
  suffix,
  label,
  comma,
  animate,
}: {
  end: number;
  suffix: string;
  label: string;
  comma?: boolean;
  animate: boolean;
}) {
  const [count, setCount] = useState(animate ? 0 : end);

  useEffect(() => {
    if (!animate) {
      setCount(end);
      return;
    }
    const startTime = performance.now();
    const duration = 1500;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 2); // quadratic ease-out
      const current = Math.floor(eased * end);
      setCount(current);
      if (progress < 1) requestAnimationFrame(tick);
      else setCount(end);
    };

    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [animate, end]);

  const display = comma ? count.toLocaleString() : count.toString();

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-4xl md:text-5xl font-black text-[#F97316]">
        {display}{suffix}
      </span>
      <span className="text-sm text-[#71717A]">{label}</span>
    </div>
  );
}

export function StatsSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = isInView && !prefersReducedMotion;

  return (
    <section
      ref={ref}
      className="py-14 px-6 border-y border-[#27272A] bg-[#0D0D0D]"
    >
      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-3 gap-8">
          {STATS.map((s) => (
            <Counter key={s.label} {...s} animate={shouldAnimate} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add components/store/stats-section.tsx
git commit -m "feat(liveliness): add StatsSection with animated counters"
```

---

### Task 6: Wire `StatsSection` + `AnimatedSection` into homepage

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace the entire file**

```tsx
import HeroSection from "@/components/store/hero-section";
import ExplainerSection from "@/components/store/explainer-section";
import ProductsSection from "@/components/store/products-section";
import HowItWorksSection from "@/components/store/how-it-works-section";
import FaqSection from "@/components/store/faq-section";
import ProjectsSection from "@/components/store/projects-section";
import HireCtaSection from "@/components/store/hire-cta-section";
import { StatsSection } from "@/components/store/stats-section";
import { AnimatedSection } from "@/components/shared/animated-section";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <StatsSection />
      <AnimatedSection>
        <ExplainerSection />
      </AnimatedSection>
      <AnimatedSection delay={0.05}>
        <ProductsSection />
      </AnimatedSection>
      <AnimatedSection>
        <HowItWorksSection />
      </AnimatedSection>
      <AnimatedSection>
        <FaqSection />
      </AnimatedSection>
      <AnimatedSection>
        <ProjectsSection />
      </AnimatedSection>
      <AnimatedSection>
        <HireCtaSection />
      </AnimatedSection>
    </main>
  );
}
```

- [ ] **Step 2: Type check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Verify in browser**

With dev server running (http://localhost:3000):
- Scroll past the hero — the stats section should appear with numbers counting up (20+, 5,000+, 3+)
- Continue scrolling — each section should fade in with a slight upward drift
- The product cards section has a 50ms extra delay — it should arrive just slightly after the section above

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat(liveliness): wire StatsSection and AnimatedSection into homepage"
```

---

### Task 7: Upgrade product card hover to Framer Motion spring

**Files:**
- Modify: `components/store/product-card.tsx`

- [ ] **Step 1: Replace the entire file**

```tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";
import BuyModal from "./buy-modal";

export default function ProductCard({ product }: { product: Product }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <motion.div
        id={product.slug}
        className="relative bg-[#141414] border border-[#27272A] rounded-xl p-6 flex flex-col gap-4 group cursor-default"
        style={{ borderTop: `3px solid ${product.color}` }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 20px 0 ${product.color}22`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        }}
      >
        {/* Header */}
        <div>
          <h3
            className="text-xl font-bold tracking-tight mb-1"
            style={{ color: product.color }}
          >
            {product.name}
          </h3>
          <p className="text-sm text-[#71717A] font-medium">{product.tagline}</p>
        </div>

        {/* Description */}
        <p className="text-sm text-[#F8FAFC] leading-relaxed">{product.description}</p>

        {/* What you get */}
        <ul className="flex flex-col gap-2 flex-1">
          {product.whatYouGet.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-[#F8FAFC]">
              <Check size={14} className="mt-0.5 shrink-0" style={{ color: product.color }} />
              {item}
            </li>
          ))}
        </ul>

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-2 border-t border-[#27272A]">
          <span className="text-lg font-semibold">{formatPrice(product.price)}</span>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-[#F97316] hover:bg-[#EA6C0A] text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors duration-150 cursor-pointer"
          >
            Buy Now →
          </button>
        </div>
      </motion.div>

      {modalOpen && (
        <BuyModal product={product} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
```

Key changes: `div` → `motion.div`, added `whileHover` + spring `transition`, removed `hover:scale-[1.02] transition-transform duration-150` from className (Framer Motion now owns scale), kept `onMouseEnter`/`onMouseLeave` for the glow.

- [ ] **Step 2: Type check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Verify in browser**

Hover over each product card at http://localhost:3000/#products. The card should spring to 102% scale smoothly (slight physical feel, no bounce overshoot). The orange glow should still appear on hover. Clicking "Buy Now" should still open the modal.

- [ ] **Step 4: Commit**

```bash
git add components/store/product-card.tsx
git commit -m "feat(liveliness): upgrade product card hover to Framer Motion spring"
```

---

### Task 8: Animate FAQ accordion open/close

**Files:**
- Modify: `components/store/faq-section.tsx`

- [ ] **Step 1: Replace the entire file**

```tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Do I need to know how to code?",
    a: "No. You only need to install Claude Code (one terminal command) and fill in a config file with your details. No programming required.",
  },
  {
    q: "What is Claude Code and how do I get it?",
    a: "Claude Code is an AI assistant that runs in your terminal. Install it with: npm install -g claude. You'll need a Claude account — a free tier is available at claude.ai.",
  },
  {
    q: "What happens after I buy?",
    a: "You'll get a download link on the page immediately and via email. The link is valid for 24 hours. Unzip the file, open the folder in your terminal, and type 'claude' to start.",
  },
  {
    q: "Will it work on Windows and Mac?",
    a: "Yes. Claude Code runs on Mac, Windows (via PowerShell or WSL), and Linux. The solutions are tested on all three.",
  },
  {
    q: "Can I get a refund?",
    a: "Because these are digital downloads, we don't offer refunds after the download link is generated. If something doesn't work, email ankitgoyal473@gmail.com and I'll fix it or refund you manually.",
  },
  {
    q: "What if my download link expires?",
    a: "Email ankitgoyal473@gmail.com with your payment ID and I'll send a new link within a few hours.",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">FAQ</h2>
        <div className="flex flex-col gap-2">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-[#27272A] rounded-lg overflow-hidden">
              <motion.button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium hover:bg-[#141414] transition-colors duration-150 cursor-pointer"
                aria-expanded={open === i}
                whileHover={{ x: 2 }}
                transition={{ duration: 0.15 }}
              >
                <span>{faq.q}</span>
                <motion.div
                  animate={{ rotate: open === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={16} className="shrink-0 text-[#71717A]" />
                </motion.div>
              </motion.button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="px-5 pb-4 text-sm text-[#71717A] leading-relaxed border-t border-[#27272A]">
                      <div className="pt-3">{faq.a}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

Key changes: `button` → `motion.button` with `whileHover={{ x: 2 }}`, chevron rotates via `motion.div animate`, answer wrapped in `AnimatePresence` + `motion.div` for height animation. `initial={false}` on `AnimatePresence` prevents entry animation on first render.

- [ ] **Step 2: Type check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Verify in browser**

Scroll to the FAQ section at http://localhost:3000. Click a question — the answer should slide open smoothly (not snap). Click again — it should slide closed. The chevron should rotate 180° on open. Hovering a question row should nudge it 2px right.

- [ ] **Step 4: Commit**

```bash
git add components/store/faq-section.tsx
git commit -m "feat(liveliness): animate FAQ accordion with AnimatePresence height"
```

---

### Task 9: Login page entrance animations

**Files:**
- Modify: `app/login/page.tsx`

- [ ] **Step 1: Replace the entire file**

```tsx
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
```

Key changes: agent orbs container → `motion.div` with `staggerChildren: 0.12`, each orb → `motion.div` with `orbVariants`. Right panel div → `motion.div` sliding in from x:20.

- [ ] **Step 2: Type check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Verify in browser**

Navigate to http://localhost:3000/login. On page load:
- The right panel (form) should slide in from the right (x: 20 → 0) and fade in over 400ms
- The three agent orbs on the left should stagger in from below — Warren first, then Sherlock 120ms later, then Harvey 120ms after that
- NeuralBackground (animated nodes + lines) should still be running on the left panel

- [ ] **Step 4: Commit**

```bash
git add app/login/page.tsx
git commit -m "feat(liveliness): add entrance animations to login page"
```

---

### Task 10: Final typecheck, lint, and deploy

**Files:** None — validation only.

- [ ] **Step 1: Full typecheck**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 2: Lint**

```bash
npm run lint
```

Expected: 0 errors, 0 warnings (lint takes ~30s on this machine).

- [ ] **Step 3: Production build check**

```bash
npm run build
```

Expected: build completes with no errors. Check that the output shows all pages compiled — especially `/` and `/login`.

- [ ] **Step 4: Visual smoke test**

With the production build running (`npm start`) or dev server (`npm run dev`), verify:
- `/` — floating code visible in hero, stats count up on scroll, sections fade in on scroll, product cards spring on hover, FAQ animates open/close
- `/login` — right panel slides in, agent orbs stagger in, NeuralBackground running

- [ ] **Step 5: Push to Vercel**

```bash
git push origin main
```

Vercel auto-deploys. Check https://portfolio-one-topaz-65.vercel.app after ~2 min.
