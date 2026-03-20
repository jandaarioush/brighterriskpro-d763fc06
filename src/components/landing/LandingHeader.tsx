import { Link } from "react-router-dom";
import { ThemeLogo } from "@/components/ThemeLogo";

export const LandingHeader = () => (
  <header className="fixed top-0 left-0 right-0 z-50 border-b border-[hsl(0,0%,100%,0.06)] bg-[hsl(220,15%,5%,0.9)] backdrop-blur-md">
    <div className="container mx-auto px-6">
      <div className="relative flex items-center justify-between h-16">
        <Link to="/" className="flex items-center">
          <ThemeLogo className="h-8" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#sobre" className="text-[hsl(0,0%,60%)] hover:text-[hsl(0,0%,92%)] text-sm tracking-wide transition-colors duration-200">
            Sobre
          </a>
          <a href="#recursos" className="text-[hsl(0,0%,60%)] hover:text-[hsl(0,0%,92%)] text-sm tracking-wide transition-colors duration-200">
            Recursos
          </a>
          <a href="#planos" className="text-[hsl(0,0%,60%)] hover:text-[hsl(0,0%,92%)] text-sm tracking-wide transition-colors duration-200">
            Planos
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/auth">
            <button className="px-5 py-2 text-sm text-[hsl(0,0%,60%)] border border-[hsl(0,0%,100%,0.1)] rounded-lg hover:text-[hsl(0,0%,92%)] hover:border-[hsl(0,0%,100%,0.2)] transition-colors duration-200">
              Entrar
            </button>
          </Link>
          <Link to="/checkout?plano=mensal">
            <button className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 active:scale-[0.97] transition-all duration-200">
              Assinar Agora
            </button>
          </Link>
        </div>
      </div>
    </div>
  </header>
);
