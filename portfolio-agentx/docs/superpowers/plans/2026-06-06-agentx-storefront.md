# AGentX Storefront Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current AGentX hosted SaaS with a single-page storefront that sells 4 Claude Code solutions (Rudy, Warren, Harvey, Sherlock) as one-time ZIP purchases via Razorpay.

**Architecture:** Next.js 16 App Router server component homepage with client component islands (ProductCard, BuyModal, FAQ accordion, Success page). Razorpay handles payment; Supabase Storage delivers the ZIP via a 24h signed URL. No auth, no sessions.

**Tech Stack:** Next.js 16, TypeScript, Tailwind v4, Razorpay, Supabase Storage, Nodemailer, Lucide React

---

## File Map

### Delete entirely
```
app/agents/                  app/admin/               app/dashboard/
app/login/                   app/hire/                app/mcp/
app/projects/                app/tools/               app/auth/
app/api/agents/              app/api/admin/           app/api/leads/
app/api/send-reminder/       app/api/stripe/          app/api/submit-lead/
app/api/tools/               app/api/update-lead/
proxy.ts
lib/agent-types.ts           lib/agents.ts            lib/constants.ts
lib/estimate.ts              lib/mock-auth.ts         lib/mock-data.ts
lib/mock-leads.ts            lib/mock-prospects.ts    lib/mock-sessions.ts
lib/paywall.ts               lib/use-agent-stream.ts
components/agents/           components/admin/        components/auth/
components/chat/             components/dashboard/    components/home/
components/projects/         components/tools/        components/ui/
```

### Modify
```
app/globals.css              ← new color tokens + Plus Jakarta Sans
app/layout.tsx               ← new font import, remove auth providers
app/page.tsx                 ← full storefront homepage
lib/email.ts                 ← rewrite: downloadEmail() only
app/api/razorpay/create-order/route.ts  ← rewrite for product_slug + email
app/api/razorpay/verify/route.ts        ← rewrite: verify → purchases → signed URL → email
components/layout/navbar.tsx            ← rewrite: logo + anchor link only
components/layout/footer.tsx            ← rewrite: simple footer
```

### Create
```
lib/products.ts                          ← Product type + 4 product definitions
app/success/page.tsx                     ← post-payment download page
components/store/product-card.tsx        ← client: card + buy flow trigger
components/store/buy-modal.tsx           ← client: email capture → Razorpay
components/store/hero-section.tsx        ← server: headline + subhead
components/store/explainer-section.tsx   ← server: What is Claude Code?
components/store/products-section.tsx    ← server: 2×2 grid of ProductCards
components/store/how-it-works-section.tsx ← server: 3-step diagram
components/store/faq-section.tsx         ← client: accordion
```

---

## Task 1: Wipe Old Code

**Files:** Delete everything listed in the "Delete entirely" section above.

- [ ] **Step 1: Delete app directories**

```powershell
Remove-Item -Recurse -Force "portfolio-agentx\app\agents", "portfolio-agentx\app\admin", "portfolio-agentx\app\dashboard", "portfolio-agentx\app\login", "portfolio-agentx\app\hire", "portfolio-agentx\app\mcp", "portfolio-agentx\app\projects", "portfolio-agentx\app\tools", "portfolio-agentx\app\auth"
```

- [ ] **Step 2: Delete API directories**

```powershell
Remove-Item -Recurse -Force "portfolio-agentx\app\api\agents", "portfolio-agentx\app\api\admin", "portfolio-agentx\app\api\leads", "portfolio-agentx\app\api\send-reminder", "portfolio-agentx\app\api\stripe", "portfolio-agentx\app\api\submit-lead", "portfolio-agentx\app\api\tools", "portfolio-agentx\app\api\update-lead"
```

- [ ] **Step 3: Delete lib files**

```powershell
Remove-Item -Force "portfolio-agentx\proxy.ts", "portfolio-agentx\lib\agent-types.ts", "portfolio-agentx\lib\agents.ts", "portfolio-agentx\lib\constants.ts", "portfolio-agentx\lib\estimate.ts", "portfolio-agentx\lib\mock-auth.ts", "portfolio-agentx\lib\mock-data.ts", "portfolio-agentx\lib\mock-leads.ts", "portfolio-agentx\lib\mock-prospects.ts", "portfolio-agentx\lib\mock-sessions.ts", "portfolio-agentx\lib\paywall.ts", "portfolio-agentx\lib\use-agent-stream.ts"
```

- [ ] **Step 4: Delete component directories**

```powershell
Remove-Item -Recurse -Force "portfolio-agentx\components\agents", "portfolio-agentx\components\admin", "portfolio-agentx\components\auth", "portfolio-agentx\components\chat", "portfolio-agentx\components\dashboard", "portfolio-agentx\components\home", "portfolio-agentx\components\projects", "portfolio-agentx\components\tools", "portfolio-agentx\components\ui"
```

- [ ] **Step 5: Verify TypeScript still compiles (expect errors — fix by stub in next tasks)**

```bash
cd portfolio-agentx && npx tsc --noEmit 2>&1 | head -30
```

Expected: errors about missing imports in `app/page.tsx`, `app/layout.tsx`. That's fine — we'll fix them in subsequent tasks.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "chore: delete old AGentX SaaS code — pivot to storefront"
```

---

## Task 2: Design Tokens + Font

**Files:** Modify `app/globals.css`, `app/layout.tsx`

- [ ] **Step 1: Replace `app/globals.css` entirely**

```css
@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

@theme inline {
  --color-background: #0A0A0A;
  --color-background-card: #141414;
  --color-foreground: #F8FAFC;
  --color-foreground-muted: #71717A;
  --color-border: #27272A;
  --color-cta: #F97316;
  --color-cta-hover: #EA6C0A;
  --color-rudy: #a855f7;
  --color-warren: #f0b429;
  --color-sherlock: #4a9eff;
  --color-harvey: #00c896;
  --font-sans: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
}

* { box-sizing: border-box; }

body {
  background: var(--color-background);
  color: var(--color-foreground);
  font-family: var(--font-sans), system-ui, sans-serif;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.animate-fade-up {
  animation: fade-up 0.5s ease forwards;
}
```

- [ ] **Step 2: Replace `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "AGentX — Claude Code Solutions",
  description: "AI solutions that run in your terminal. Buy once, own forever.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat(design): Plus Jakarta Sans + new dark storefront tokens"
```

---

## Task 3: Product Data

**Files:** Create `lib/products.ts`

- [ ] **Step 1: Create `lib/products.ts`**

```ts
export type Product = {
  slug: string
  name: string
  tagline: string
  description: string
  price: number          // paise (99900 = ₹999)
  color: string          // persona accent hex
  whatYouGet: string[]
}

export const PRODUCTS: Product[] = [
  {
    slug: "rudy",
    name: "Rudy",
    tagline: "Autonomous job search & apply",
    description: "Searches LinkedIn, Naukri, and Indeed daily. Scores each role, tailors your resume, and applies — all while you sleep.",
    price: 99900,
    color: "#a855f7",
    whatYouGet: [
      "CLAUDE.md operating manual",
      "buyer-config.json template",
      "5 portal playbooks (LinkedIn, Naukri, Indeed, Wellfound, Instahyre)",
      "Resume tailoring guide",
      "Application tracker (CSV)",
    ],
  },
  {
    slug: "warren",
    name: "Warren",
    tagline: "Stock research agent",
    description: "Give it any ticker. It pulls fundamentals, technicals, and web sentiment — and returns a full investment research report in minutes.",
    price: 99900,
    color: "#f0b429",
    whatYouGet: [
      "CLAUDE.md operating manual",
      "config.json template",
      "6-pillar analysis framework",
      "NSE + NYSE + NASDAQ support",
    ],
  },
  {
    slug: "sherlock",
    name: "Sherlock",
    tagline: "Deep research & investigation",
    description: "Give it a topic, person, or company. It searches the web, synthesises sources, and delivers a structured research report.",
    price: 99900,
    color: "#4a9eff",
    whatYouGet: [
      "CLAUDE.md operating manual",
      "config.json template",
      "Research report template",
      "Source citation guide",
    ],
  },
  {
    slug: "harvey",
    name: "Harvey",
    tagline: "Email & outreach agent",
    description: "Drafts cold emails, follow-ups, and LinkedIn messages tailored to each prospect. Tracks threads and suggests next actions.",
    price: 99900,
    color: "#00c896",
    whatYouGet: [
      "CLAUDE.md operating manual",
      "config.json template",
      "Cold email playbook",
      "Follow-up sequence templates",
    ],
  },
]

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug)
}

export function formatPrice(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/products.ts
git commit -m "feat: product data — Rudy, Warren, Sherlock, Harvey"
```

---

## Task 4: Email Template

**Files:** Modify `lib/email.ts` — replace subscription emails with download delivery email.

- [ ] **Step 1: Rewrite `lib/email.ts`**

```ts
import nodemailer from "nodemailer";

function getTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(opts: EmailOptions): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("[email] GMAIL_USER or GMAIL_APP_PASSWORD not set — skipping");
    return;
  }
  try {
    await transporter.sendMail({ from: `"AGentX" <${process.env.GMAIL_USER}>`, ...opts });
  } catch (err) {
    console.error("[email] Failed to send:", err);
  }
}

export function downloadEmail(opts: {
  productName: string;
  downloadUrl: string;
  paymentId: string;
}): { subject: string; html: string } {
  return {
    subject: `Your ${opts.productName} download is ready`,
    html: `
      <div style="font-family:'Plus Jakarta Sans',sans-serif;max-width:480px;margin:0 auto;color:#1a1a1a">
        <h2 style="color:#0A0A0A">Your download is ready</h2>
        <p>Thanks for buying <strong>${opts.productName}</strong>. Your download link is below — it expires in 24 hours.</p>
        <div style="margin:24px 0">
          <a href="${opts.downloadUrl}"
             style="display:inline-block;background:#F97316;color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px">
            Download ${opts.productName} →
          </a>
        </div>
        <p style="color:#666;font-size:13px">
          Payment ID: <code>${opts.paymentId}</code><br>
          If your link has expired, reply to this email and I'll send a new one.
        </p>
        <p style="color:#666;font-size:13px">— Ankit, AGentX</p>
      </div>
    `,
  };
}

export function adminSaleEmail(opts: {
  productName: string;
  email: string;
  paymentId: string;
}): { subject: string; html: string } {
  return {
    subject: `Sale: ${opts.productName} — ${opts.email}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#1a1a1a">
        <h2>New Sale</h2>
        <p><strong>${opts.productName}</strong> sold to ${opts.email}</p>
        <p style="font-family:monospace;font-size:13px;color:#666">Payment ID: ${opts.paymentId}</p>
      </div>
    `,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/email.ts
git commit -m "feat(email): replace subscription emails with downloadEmail + adminSaleEmail"
```

---

## Task 5: Supabase — purchases Table + Storage Bucket

These are manual steps in the Supabase dashboard / SQL editor. No code to write.

- [ ] **Step 1: Create `purchases` table**

Go to Supabase → SQL Editor → run:

```sql
create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  product_slug text not null,
  razorpay_payment_id text not null unique,
  razorpay_order_id text not null,
  created_at timestamptz default now()
);
```

- [ ] **Step 2: Create `solutions` Storage bucket**

Go to Supabase → Storage → New bucket:
- Name: `solutions`
- Public: **OFF** (private — signed URLs only)

- [ ] **Step 3: Upload placeholder ZIPs**

Upload a `placeholder.txt` (or real ZIPs if ready) into the bucket as:
- `rudy.zip`
- `warren.zip`
- `sherlock.zip`
- `harvey.zip`

(These are the files the verify route will generate signed URLs for. Placeholder is fine for dev.)

- [ ] **Step 4: Verify env vars exist locally**

Check `portfolio-agentx/.env.local` has:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
GMAIL_USER=...
GMAIL_APP_PASSWORD=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 5: Commit (no code change — just a note)**

```bash
git commit --allow-empty -m "chore: supabase purchases table + solutions bucket created"
```

---

## Task 6: API — create-order

**Files:** Rewrite `app/api/razorpay/create-order/route.ts`

- [ ] **Step 1: Rewrite the route**

```ts
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getProduct } from "@/lib/products";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  const { product_slug, email } = await req.json();

  if (!product_slug || !email) {
    return NextResponse.json({ error: "product_slug and email required" }, { status: 400 });
  }

  const product = getProduct(product_slug);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 400 });
  }

  const order = await razorpay.orders.create({
    amount: product.price,
    currency: "INR",
    receipt: `${product_slug}-${Date.now()}`,
    notes: { product_slug, email },
  });

  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
    productName: product.name,
  });
}
```

- [ ] **Step 2: Manual test**

Start the dev server: `npm run dev`

```bash
curl -X POST http://localhost:3000/api/razorpay/create-order \
  -H "Content-Type: application/json" \
  -d '{"product_slug":"rudy","email":"test@example.com"}'
```

Expected: `{ "orderId": "order_...", "amount": 99900, "currency": "INR", "keyId": "rzp_test_...", "productName": "Rudy" }`

Test invalid slug:
```bash
curl -X POST http://localhost:3000/api/razorpay/create-order \
  -H "Content-Type: application/json" \
  -d '{"product_slug":"unknown","email":"test@example.com"}'
```
Expected: `{ "error": "Product not found" }` with status 400.

- [ ] **Step 3: Commit**

```bash
git add app/api/razorpay/create-order/route.ts
git commit -m "feat(api): create-order route for product ZIP purchases"
```

---

## Task 7: API — verify

**Files:** Rewrite `app/api/razorpay/verify/route.ts`

- [ ] **Step 1: Rewrite the route**

```ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getProduct } from "@/lib/products";
import { sendEmail, downloadEmail, adminSaleEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, product_slug, email } =
    await req.json();

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !product_slug || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // 1. HMAC verify
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
  }

  // 2. Validate product
  const product = getProduct(product_slug);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 400 });
  }

  // 3. Insert purchase (idempotent — unique constraint on payment_id)
  await supabaseAdmin
    .from("purchases")
    .insert({ email, product_slug, razorpay_payment_id, razorpay_order_id })
    .onConflict("razorpay_payment_id")
    .ignore();

  // 4. Generate signed download URL (24h)
  const { data: urlData, error: urlError } = await supabaseAdmin.storage
    .from("solutions")
    .createSignedUrl(`${product_slug}.zip`, 60 * 60 * 24);

  if (urlError || !urlData?.signedUrl) {
    console.error("[verify] Storage signed URL error:", urlError);
    // Fire admin alert, return fallback message
    await sendEmail({
      to: process.env.GMAIL_USER!,
      ...adminSaleEmail({ productName: product.name, email, paymentId: razorpay_payment_id }),
    });
    return NextResponse.json({
      downloadUrl: null,
      productSlug: product_slug,
      fallback: true,
    });
  }

  // 5. Send download email (fire-and-forget)
  sendEmail({
    to: email,
    ...downloadEmail({
      productName: product.name,
      downloadUrl: urlData.signedUrl,
      paymentId: razorpay_payment_id,
    }),
  });

  // 6. Send admin notification
  sendEmail({
    to: process.env.GMAIL_USER!,
    ...adminSaleEmail({ productName: product.name, email, paymentId: razorpay_payment_id }),
  });

  return NextResponse.json({ downloadUrl: urlData.signedUrl, productSlug: product_slug });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/razorpay/verify/route.ts
git commit -m "feat(api): verify route — HMAC check, purchase insert, signed URL, email"
```

---

## Task 8: Navbar + Footer

**Files:** Rewrite `components/layout/navbar.tsx`, `components/layout/footer.tsx`

- [ ] **Step 1: Rewrite `components/layout/navbar.tsx`**

```tsx
import Link from "next/link";
import AgentXLogo from "@/components/shared/agentx-logo";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-[#27272A] bg-[#0A0A0A]/90 backdrop-blur-sm">
      <Link href="/" className="flex items-center gap-2">
        <AgentXLogo size="sm" />
        <span className="font-semibold text-sm tracking-tight text-[#F8FAFC]">AGentX</span>
      </Link>
      <a
        href="#what-is-claude-code"
        className="text-sm text-[#71717A] hover:text-[#F8FAFC] transition-colors duration-150 cursor-pointer"
      >
        What is Claude Code?
      </a>
    </nav>
  );
}
```

- [ ] **Step 2: Rewrite `components/layout/footer.tsx`**

```tsx
import AgentXLogo from "@/components/shared/agentx-logo";

export default function Footer() {
  const products = ["rudy", "warren", "sherlock", "harvey"];
  return (
    <footer className="border-t border-[#27272A] px-6 py-12 mt-24">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <AgentXLogo size="sm" />
          <span className="text-sm text-[#71717A]">AGentX — Built by Ankit Goyal</span>
        </div>
        <div className="flex gap-6">
          {products.map((slug) => (
            <a
              key={slug}
              href={`#${slug}`}
              className="text-sm text-[#71717A] hover:text-[#F8FAFC] transition-colors duration-150 capitalize cursor-pointer"
            >
              {slug}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/layout/navbar.tsx components/layout/footer.tsx
git commit -m "feat(layout): minimal storefront navbar + footer"
```

---

## Task 9: BuyModal

**Files:** Create `components/store/buy-modal.tsx`

This client component: collects email → calls create-order → loads Razorpay → on success calls verify → navigates to /success.

- [ ] **Step 1: Create `components/store/buy-modal.tsx`**

```tsx
"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.querySelector('script[src*="checkout.razorpay.com"]')) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

interface BuyModalProps {
  product: Product;
  onClose: () => void;
}

export default function BuyModal({ product, onClose }: BuyModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleBuy() {
    if (!email || !email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      // 1. Load Razorpay SDK
      const ok = await loadRazorpayScript();
      if (!ok) throw new Error("Failed to load payment SDK. Check your connection.");

      // 2. Create order
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_slug: product.slug, email }),
      });
      if (!orderRes.ok) throw new Error("Could not create order. Please try again.");
      const order = await orderRes.json();

      // 3. Open Razorpay modal
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "AGentX",
        description: product.name,
        order_id: order.orderId,
        prefill: { email },
        theme: { color: "#F97316" },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          // 4. Verify payment
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              product_slug: product.slug,
              email,
            }),
          });
          const result = await verifyRes.json();

          if (!verifyRes.ok) {
            setError("Payment verification failed. Contact support with your payment ID.");
            setLoading(false);
            return;
          }

          // 5. Navigate to success page
          if (result.downloadUrl) {
            window.location.href = `/success?url=${encodeURIComponent(result.downloadUrl)}&product=${product.slug}`;
          } else {
            // Fallback: storage error — email was still sent
            window.location.href = `/success?product=${product.slug}&fallback=1`;
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      });

      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-[#141414] border border-[#27272A] rounded-xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#71717A] hover:text-[#F8FAFC] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <h2 className="text-lg font-semibold mb-1">Buy {product.name}</h2>
        <p className="text-sm text-[#71717A] mb-5">
          Enter your email — we&apos;ll send your download link there.
        </p>

        <label htmlFor="buy-email" className="block text-sm font-medium mb-1.5">
          Email address
        </label>
        <input
          id="buy-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleBuy()}
          placeholder="you@example.com"
          className="w-full bg-[#0A0A0A] border border-[#27272A] rounded-lg px-3 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#71717A] focus:outline-none focus:border-[#F97316] transition-colors mb-4"
        />

        {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

        <button
          onClick={handleBuy}
          disabled={loading}
          className="w-full bg-[#F97316] hover:bg-[#EA6C0A] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors duration-150 cursor-pointer"
        >
          {loading ? "Processing…" : `Pay ${formatPrice(product.price)}`}
        </button>

        <p className="text-xs text-[#71717A] text-center mt-3">
          One-time purchase · No subscription · Download link valid 24h
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/store/buy-modal.tsx
git commit -m "feat(store): BuyModal — email capture + Razorpay + verify flow"
```

---

## Task 10: ProductCard

**Files:** Create `components/store/product-card.tsx`

- [ ] **Step 1: Create `components/store/product-card.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";
import BuyModal from "./buy-modal";

export default function ProductCard({ product }: { product: Product }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div
        id={product.slug}
        className="relative bg-[#141414] border border-[#27272A] rounded-xl p-6 flex flex-col gap-4 hover:scale-[1.02] transition-transform duration-150 group"
        style={{
          borderTop: `3px solid ${product.color}`,
          boxShadow: `0 0 0 0 ${product.color}`,
        }}
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
      </div>

      {modalOpen && (
        <BuyModal product={product} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/store/product-card.tsx
git commit -m "feat(store): ProductCard with persona color accent + buy trigger"
```

---

## Task 11: Homepage Sections (Static)

**Files:** Create `components/store/hero-section.tsx`, `components/store/explainer-section.tsx`, `components/store/products-section.tsx`, `components/store/how-it-works-section.tsx`, `components/store/faq-section.tsx`

- [ ] **Step 1: Create `components/store/hero-section.tsx`**

```tsx
export default function HeroSection() {
  return (
    <section className="pt-40 pb-24 px-6 text-center">
      <div className="max-w-3xl mx-auto">
        <p className="text-sm font-medium text-[#71717A] uppercase tracking-widest mb-4">
          Claude Code Solutions
        </p>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
          AI that runs in{" "}
          <span className="text-[#F97316]">your terminal.</span>
        </h1>
        <p className="text-lg text-[#71717A] mb-10 max-w-xl mx-auto">
          Buy once. Download. Run with Claude Code. No subscriptions, no servers, no accounts.
          Your AI, on your machine.
        </p>
        <a
          href="#products"
          className="inline-block bg-[#F97316] hover:bg-[#EA6C0A] text-white font-semibold px-8 py-3.5 rounded-xl transition-colors duration-150 cursor-pointer"
        >
          See the solutions ↓
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `components/store/explainer-section.tsx`**

```tsx
import { Terminal, Download, Zap } from "lucide-react";

const steps = [
  {
    icon: Terminal,
    title: "What is Claude Code?",
    body: "Claude Code is Anthropic's AI assistant for your terminal. It reads a CLAUDE.md file in any folder and becomes an expert at that task.",
  },
  {
    icon: Download,
    title: "How do I get it?",
    body: "Install it with one command: npm install -g claude. Requires a Claude account (free tier available). Works on Mac, Windows, and Linux.",
  },
  {
    icon: Zap,
    title: "Why is it powerful?",
    body: "It can browse the web, fill forms, read files, send emails, and automate anything on your computer — all by following the instructions in CLAUDE.md.",
  },
];

export default function ExplainerSection() {
  return (
    <section
      id="what-is-claude-code"
      className="py-20 px-6 border-y border-[#27272A] bg-[#0D0D0D]"
    >
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-12">
          New to Claude Code?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex flex-col gap-3">
              <Icon size={24} className="text-[#F97316]" />
              <h3 className="font-semibold text-[#F8FAFC]">{title}</h3>
              <p className="text-sm text-[#71717A] leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create `components/store/products-section.tsx`**

```tsx
import { PRODUCTS } from "@/lib/products";
import ProductCard from "./product-card";

export default function ProductsSection() {
  return (
    <section id="products" className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">Choose your solution</h2>
        <p className="text-center text-[#71717A] mb-12">
          Each solution is a self-contained Claude Code workspace. Buy, unzip, run.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create `components/store/how-it-works-section.tsx`**

```tsx
const steps = [
  {
    number: "01",
    title: "Buy",
    body: "Click Buy Now, enter your email, and pay with UPI, card, or netbanking. Takes 30 seconds.",
  },
  {
    number: "02",
    title: "Unzip",
    body: "You'll get a download link instantly. Unzip it into any folder on your Mac or Windows machine.",
  },
  {
    number: "03",
    title: "Run with Claude",
    body: 'Open your terminal in that folder and type "claude". The AI reads the instructions and gets to work.',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 px-6 bg-[#0D0D0D] border-y border-[#27272A]">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col gap-3">
              <span className="text-4xl font-black text-[#27272A]">{step.number}</span>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="text-sm text-[#71717A] leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Create `components/store/faq-section.tsx`**

```tsx
"use client";

import { useState } from "react";
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
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium hover:bg-[#141414] transition-colors duration-150 cursor-pointer"
                aria-expanded={open === i}
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={16}
                  className="shrink-0 text-[#71717A] transition-transform duration-200"
                  style={{ transform: open === i ? "rotate(180deg)" : "rotate(0deg)" }}
                />
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-sm text-[#71717A] leading-relaxed border-t border-[#27272A]">
                  <div className="pt-3">{faq.a}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add components/store/
git commit -m "feat(store): Hero, Explainer, Products, HowItWorks, FAQ sections"
```

---

## Task 12: Homepage Assembly

**Files:** Rewrite `app/page.tsx`

- [ ] **Step 1: Rewrite `app/page.tsx`**

```tsx
import HeroSection from "@/components/store/hero-section";
import ExplainerSection from "@/components/store/explainer-section";
import ProductsSection from "@/components/store/products-section";
import HowItWorksSection from "@/components/store/how-it-works-section";
import FaqSection from "@/components/store/faq-section";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <ExplainerSection />
      <ProductsSection />
      <HowItWorksSection />
      <FaqSection />
    </main>
  );
}
```

- [ ] **Step 2: Run type check**

```bash
cd portfolio-agentx && npx tsc --noEmit
```

Expected: 0 errors. Fix any that appear before committing.

- [ ] **Step 3: Run dev server and visually check**

```bash
npm run dev
```

Open http://localhost:3000. Verify:
- Navbar shows logo + "What is Claude Code?" link
- Hero headline renders
- Explainer section has 3 columns
- 4 product cards in 2×2 grid, each with persona color top border
- How it works has 3 numbered steps
- FAQ accordion opens/closes
- Footer shows product anchor links

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: homepage — storefront assembled"
```

---

## Task 13: Success Page

**Files:** Create `app/success/page.tsx`

- [ ] **Step 1: Create `app/success/page.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { Download, Mail, CheckCircle } from "lucide-react";
import Link from "next/link";
import { getProduct } from "@/lib/products";

export default function SuccessPage() {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [productName, setProductName] = useState("your solution");
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const url = params.get("url");
    const slug = params.get("product");
    const isFallback = params.get("fallback") === "1";

    if (url) setDownloadUrl(decodeURIComponent(url));
    if (slug) {
      const p = getProduct(slug);
      if (p) setProductName(p.name);
    }
    setFallback(isFallback);
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="max-w-md w-full text-center">
        <CheckCircle size={48} className="text-[#00c896] mx-auto mb-6" />

        <h1 className="text-3xl font-bold mb-3">Payment successful</h1>
        <p className="text-[#71717A] mb-8">
          {fallback
            ? `Your download link for ${productName} will arrive in your email within 5 minutes.`
            : `Your ${productName} is ready. Download link also sent to your email.`}
        </p>

        {downloadUrl && !fallback && (
          <a
            href={downloadUrl}
            className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#EA6C0A] text-white font-semibold px-8 py-3.5 rounded-xl transition-colors duration-150 cursor-pointer mb-6"
          >
            <Download size={18} />
            Download {productName}
          </a>
        )}

        <div className="flex items-center justify-center gap-2 text-sm text-[#71717A] mb-8">
          <Mail size={14} />
          <span>Check your email for a backup link (valid 24h)</span>
        </div>

        <p className="text-xs text-[#71717A]">
          Link expired?{" "}
          <a
            href="mailto:ankitgoyal473@gmail.com"
            className="underline hover:text-[#F8FAFC] transition-colors"
          >
            Email for a new one
          </a>
        </p>

        <div className="mt-10 pt-6 border-t border-[#27272A]">
          <Link
            href="/"
            className="text-sm text-[#71717A] hover:text-[#F8FAFC] transition-colors"
          >
            ← Browse all solutions
          </Link>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Run type check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add app/success/page.tsx
git commit -m "feat: success page — download button + email fallback message"
```

---

## Task 14: Smoke Test + Deploy Prep

- [ ] **Step 1: Full type check + lint**

```bash
cd portfolio-agentx && npx tsc --noEmit && npm run lint
```

Expected: 0 errors, 0 warnings.

- [ ] **Step 2: Production build**

```bash
npm run build
```

Expected: build completes with no errors. Fix any that appear.

- [ ] **Step 3: Manual buy flow test (test mode)**

With dev server running:
1. Go to http://localhost:3000
2. Click "Buy Now" on Rudy card
3. Enter a test email
4. Verify Razorpay modal opens with correct product name + amount
5. Use test UPI `success@razorpay` or test card `4111 1111 1111 1111` / OTP `1234`
6. Verify redirect to `/success` with download button
7. Verify download email arrives at test email address

- [ ] **Step 4: Add missing Razorpay env vars to Vercel**

```bash
vercel env add RAZORPAY_KEY_ID
vercel env add RAZORPAY_KEY_SECRET
```

Select "Production" and "Preview" for both.

- [ ] **Step 5: Deploy**

```bash
git push origin main
```

Verify Vercel build passes. Open the live URL and repeat the smoke test.

- [ ] **Step 6: Final commit if any fixes applied**

```bash
git add -A && git commit -m "fix: post-deploy smoke test fixes"
```

---

## Self-Review Notes

**Spec coverage check:**
- ✅ 4 products with correct slugs, colors, prices
- ✅ Single-page storefront with all 6 sections
- ✅ Buy flow: email modal → create-order → Razorpay → verify → signed URL → success
- ✅ `purchases` table with unique constraint on payment_id (idempotent)
- ✅ Supabase Storage signed URL (24h)
- ✅ Email: download email + admin notification
- ✅ Error handling: HMAC fail → 400; Storage fail → fallback message; email fail → log only
- ✅ Env var cleanup (ANTHROPIC_API_KEY etc. removed)
- ✅ Old code deleted in Task 1
- ✅ Plus Jakarta Sans font
- ✅ Persona colors: Rudy purple, Warren gold, Sherlock blue, Harvey green
- ✅ CTA orange (#F97316)
- ✅ No auth, no sessions, no Railway

**Out of scope (confirmed not implemented):**
- Admin dashboard for purchase history
- Refund automation
- Re-download portal
- Warren/Harvey/Sherlock CLAUDE.md content (upload ZIPs to Supabase Storage separately before launch)
