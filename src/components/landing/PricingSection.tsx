import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  "Cálculos automáticos de stop",
  "Dashboard com heatmaps",
  "Relatórios PDF/Excel",
  "Gestão por Índice e Dólar",
  "Backup em nuvem",
  "Suporte prioritário",
];

export const PricingSection = () => (
  <section id="planos" className="py-24 md:py-32 px-6 border-t border-[hsl(0,0%,100%,0.04)]">
    <div className="container mx-auto max-w-5xl">
      <div className="text-center mb-16 scroll-reveal">
        <p className="text-primary text-sm font-medium tracking-widest uppercase mb-3" style={{ WebkitTextFillColor: 'initial' }}>
          Planos
        </p>
        <h2 className="font-montserrat text-3xl md:text-5xl font-bold">
          Escolha seu plano
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6 scroll-reveal">
        {/* Mensal */}
        <div className="scroll-reveal-child glass-card-hover rounded-xl p-8 flex flex-col">
          <h3 className="font-montserrat text-xl font-semibold mb-1">Assinatura Mensal</h3>
          <div className="mt-4 mb-6">
            <span className="text-4xl font-montserrat font-bold text-gradient-gold">R$ 147</span>
            <span className="text-[hsl(0,0%,50%)] text-sm ml-1" style={{ WebkitTextFillColor: 'initial' }}>/mês</span>
          </div>
          <ul className="space-y-3 mb-8 flex-1">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm text-[hsl(0,0%,65%)]" style={{ WebkitTextFillColor: 'initial' }}>
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Link to="/checkout?plano=mensal" className="block">
            <button className="w-full py-3 text-sm font-semibold border border-primary/40 text-primary rounded-lg hover:bg-primary/10 hover:border-primary/60 active:scale-[0.97] transition-all duration-200">
              Assinar Mensal
            </button>
          </Link>
        </div>

        {/* Anual */}
        <div className="scroll-reveal-child relative glass-card-hover rounded-xl p-8 flex flex-col border-primary/30">
          <span className="absolute -top-3 left-6 px-3 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-full tracking-wide">
            MELHOR VALOR
          </span>
          <h3 className="font-montserrat text-xl font-semibold mb-1">Assinatura Anual</h3>
          <div className="mt-4 mb-6">
            <span className="text-4xl font-montserrat font-bold text-gradient-gold">R$ 997</span>
            <span className="text-[hsl(0,0%,50%)] text-sm ml-1" style={{ WebkitTextFillColor: 'initial' }}>/ano</span>
          </div>
          <ul className="space-y-3 mb-8 flex-1">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm text-[hsl(0,0%,65%)]" style={{ WebkitTextFillColor: 'initial' }}>
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Link to="/checkout?plano=anual" className="block">
            <button className="w-full py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 active:scale-[0.97] transition-all duration-200 shadow-[0_0_16px_hsl(43,96%,56%,0.15)]">
              Assinar Anual
            </button>
          </Link>
        </div>
      </div>
    </div>
  </section>
);
