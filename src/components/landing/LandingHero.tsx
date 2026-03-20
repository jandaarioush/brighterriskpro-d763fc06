import { ChevronDown } from "lucide-react";
import logoHero from "@/assets/logo-hero.png";

export const LandingHero = () => (
  <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-16">
    {/* Subtle radial glow */}
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,hsl(43,96%,56%,0.04),transparent)]" />

    <div className="relative text-center max-w-4xl mx-auto">
      <img
        src={logoHero}
        alt="Brighter Risk Pro"
        className="w-64 md:w-80 lg:w-96 h-auto object-contain mx-auto hero-enter drop-shadow-[0_0_40px_hsl(43,96%,56%,0.15)]"
      />

      <h1 className="font-montserrat text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.95] mt-6 hero-enter-delay-1 !text-gradient-gold">
        Proteja seu capital.
        <br />
        Sobreviva no mercado.
      </h1>

      <p className="text-[hsl(0,0%,55%)] text-lg md:text-xl max-w-2xl mx-auto mt-6 hero-enter-delay-2 leading-relaxed" style={{ WebkitTextFillColor: 'initial' }}>
        Gestão de risco automatizada para traders que buscam consistência, disciplina e longevidade operacional.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10 hero-enter-delay-3">
        <a href="#planos">
          <button className="px-8 py-3.5 text-base font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 active:scale-[0.97] transition-all duration-200 shadow-[0_0_20px_hsl(43,96%,56%,0.2)]">
            Começar Agora
          </button>
        </a>
        <a href="#sobre">
          <button className="px-8 py-3.5 text-base font-medium text-primary border border-primary/40 rounded-lg hover:border-primary/70 hover:bg-primary/5 active:scale-[0.97] transition-all duration-200">
            Saiba Mais
          </button>
        </a>
      </div>

      <div className="mt-16 hero-enter-delay-4">
        <ChevronDown className="w-6 h-6 text-primary/50 mx-auto animate-bounce-gentle" />
      </div>
    </div>
  </section>
);
