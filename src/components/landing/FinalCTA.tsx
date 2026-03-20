import { Link } from "react-router-dom";

export const FinalCTA = () => (
  <section className="py-24 md:py-32 px-6 border-t border-[hsl(0,0%,100%,0.04)] relative">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_100%,hsl(43,96%,56%,0.04),transparent)]" />
    <div className="container relative mx-auto max-w-3xl text-center scroll-reveal">
      <h2 className="font-montserrat text-3xl md:text-5xl font-bold leading-tight mb-6">
        Sem controle de risco, não existe consistência.
      </h2>
      <p className="text-[hsl(0,0%,50%)] text-lg mb-10 max-w-xl mx-auto" style={{ WebkitTextFillColor: 'initial' }}>
        Proteja seu capital com disciplina e dados. Comece agora.
      </p>
      <Link to="/checkout?plano=mensal">
        <button className="px-10 py-4 text-base font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 active:scale-[0.97] transition-all duration-200 shadow-[0_0_24px_hsl(43,96%,56%,0.2)]">
          Começar Agora
        </button>
      </Link>
    </div>
  </section>
);
