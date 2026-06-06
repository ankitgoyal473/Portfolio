import HeroSection from "@/components/store/hero-section";
import ExplainerSection from "@/components/store/explainer-section";
import ProductsSection from "@/components/store/products-section";
import HowItWorksSection from "@/components/store/how-it-works-section";
import FaqSection from "@/components/store/faq-section";
import ProjectsSection from "@/components/store/projects-section";
import HireCtaSection from "@/components/store/hire-cta-section";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <ExplainerSection />
      <ProductsSection />
      <HowItWorksSection />
      <FaqSection />
      <ProjectsSection />
      <HireCtaSection />
    </main>
  );
}
