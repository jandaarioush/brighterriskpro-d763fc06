import { useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ThemeLogo } from "@/components/ThemeLogo";
import logoHero from "@/assets/logo-hero.png";
import { GoldenParticles } from "@/components/landing/GoldenParticles";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingHero } from "@/components/landing/LandingHero";
import { ValueProposition } from "@/components/landing/ValueProposition";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { Differentiation } from "@/components/landing/Differentiation";
import { PricingSection } from "@/components/landing/PricingSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";

const Index = () => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setupObserver = useCallback(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            // Stagger children
            const children = entry.target.querySelectorAll(".scroll-reveal-child");
            children.forEach((child, i) => {
              setTimeout(() => child.classList.add("revealed"), 80 * (i + 1));
            });
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll(".scroll-reveal").forEach((el) => {
      observerRef.current?.observe(el);
    });
  }, []);

  useEffect(() => {
    setupObserver();
    return () => observerRef.current?.disconnect();
  }, [setupObserver]);

  return (
    <div className="min-h-screen bg-[hsl(220,15%,5%)] text-[hsl(0,0%,92%)] font-inter overflow-x-hidden">
      <LandingHeader />
      <LandingHero />
      <ValueProposition />
      <HowItWorks />
      <FeaturesSection />
      <Differentiation />
      <PricingSection />
      <FinalCTA />
      <LandingFooter />
    </div>
  );
};

export default Index;
