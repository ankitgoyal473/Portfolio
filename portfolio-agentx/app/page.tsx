import { Hero } from "@/components/home/hero";
import { ToolsPreview } from "@/components/home/tools-preview";
import { SocialProof } from "@/components/home/social-proof";
import { CtaSection } from "@/components/home/cta-section";

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
