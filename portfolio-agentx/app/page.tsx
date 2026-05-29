import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { ToolsPreview } from "@/components/home/tools-preview";
import { SocialProof } from "@/components/home/social-proof";
import { CtaSection } from "@/components/home/cta-section";

export const metadata: Metadata = {
  title: "AGentX — AI Agents by Ankit Goyal",
  description:
    "Meet Warren, Sherlock & Harvey — three AI agents that replace your most expensive hires.",
};

export default function Home() {
  return (
    <>
      <Hero />
      <SocialProof />
      <ToolsPreview />
      <CtaSection />
    </>
  );
}
