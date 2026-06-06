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
