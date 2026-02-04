import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { CTASection } from "@/components/landing/cta-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { TrendingSection } from "@/components/landing/trending-section";

export default function Home() {
  return (
    <main className="flex-1">
      <HeroSection />
      <FeaturesSection />
      <TrendingSection />
      <HowItWorks />
      <CTASection />
    </main>
  );
}
