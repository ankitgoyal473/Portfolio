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
