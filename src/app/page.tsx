import Link from "next/link";
import { getServerSession } from "next-auth";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { authOptions } from "@/lib/auth";

// Import home components
import { HeroSection } from "@/components/home/HeroSection";
import ScrollIndicator from "@/components/home/ScrollIndicator";
import { StatsSection } from "@/components/home/StatsSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { TimelineSection } from "@/components/home/TimelineSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { PricingSection } from "@/components/home/PricingSection";
import { FAQSection } from "@/components/home/FAQSection";
import { CTASection } from "@/components/home/CTASection";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const isAuthenticated = !!session?.user;

  return (
    <main className="bg-gray-50">
      {/* Hero Section */}
      <HeroSection isAuthenticated={isAuthenticated} />
      
      {/* Scroll Indicator */}
      <ScrollIndicator />
      
      {/* Stats Section */}
      <StatsSection />
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* Timeline Section */}
      <TimelineSection />
      
      {/* Testimonials Section */}
      <TestimonialsSection />
      
      {/* Pricing Section */}
      {/* <PricingSection /> */}
      
      {/* FAQ Section */}
      <FAQSection />
      
      {/* CTA Section */}
      <CTASection />
    </main>
  );
}