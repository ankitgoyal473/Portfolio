"use client";

import { useState } from "react";
import Link from "next/link";
import { NeuralBackground } from "@/components/shared/neural-background";
import { Button } from "@/components/ui/button";

const MESSAGES = [
  {
    agent: "Warren",
    text: "Even Buffett takes a wrong turn sometimes. This page doesn't exist.",
    color: "#f0b429",
  },
  {
    agent: "Sherlock",
    text: "Elementary — there's nothing here to investigate. Page not found.",
    color: "#4a9eff",
  },
  {
    agent: "Harvey",
    text: "This page ghosted you. Let's find something worth clicking.",
    color: "#00c896",
  },
];

export default function NotFound() {
  const [message] = useState(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);

  return (
    <main className="relative min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <NeuralBackground />
      <div className="relative z-10 flex flex-col items-center text-center">
        <h1 className="text-accent font-bold" style={{ fontSize: "clamp(80px, 15vw, 160px)" }}>
          404
        </h1>
        <p className="max-w-md text-center text-lg mt-4" style={{ color: message.color }}>
          {message.text}
        </p>
        <p className="text-sm text-foreground-muted mt-2">— {message.agent}</p>
        <div className="flex gap-4 mt-8">
          <Link href="/">
            <Button>Back to home &rarr;</Button>
          </Link>
          <Link href="/agents">
            <Button variant="secondary">Meet the Squad &rarr;</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
