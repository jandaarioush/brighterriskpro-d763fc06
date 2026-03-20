import { X, Check } from "lucide-react";

const comparisons = [
  { bad: "Opera por impulso emocional", good: "Regras claras e objetivas" },
  { bad: "Sem limite de perda definido", good: "Stop diário automático" },
  { bad: "Um dia ruim compromete o mês", good: "Risco distribuído por dias úteis" },
  { bad: "Sem registro de operações", good: "Histórico completo com métricas" },
  { bad: "Decisões baseadas em feeling", good: "Decisões baseadas em dados" },
];

export const Differentiation = () => (
  <section className="py-24 md:py-32 px-6 border-t border-[hsl(0,0%,100%,0.04)]">
    <div className="container mx-auto max-w-5xl">
      <div className="text-center mb-16 scroll-reveal">
        <p className="text-primary text-sm font-medium tracking-widest uppercase mb-3" style={{ WebkitTextFillColor: 'initial' }}>
          Comparativo
        </p>
        <h2 className="font-montserrat text-3xl md:text-5xl font-bold">
          Trader Comum vs Com RiskPro
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-5 scroll-reveal">
        {/* Left — Trader Comum */}
        <div className="rounded-xl border border-[hsl(0,84%,60%,0.15)] bg-[hsl(0,84%,60%,0.03)] p-8">
          <h3 className="font-montserrat text-lg font-semibold mb-6 text-[hsl(0,84%,60%)]" style={{ WebkitTextFillColor: 'initial' }}>
            Trader Comum
          </h3>
          <ul className="space-y-4">
            {comparisons.map((c, i) => (
              <li key={i} className="scroll-reveal-child flex items-start gap-3 text-sm text-[hsl(0,0%,50%)]" style={{ WebkitTextFillColor: 'initial' }}>
                <X className="w-4 h-4 text-[hsl(0,84%,60%)] mt-0.5 flex-shrink-0" />
                {c.bad}
              </li>
            ))}
          </ul>
        </div>

        {/* Right — Com RiskPro */}
        <div className="rounded-xl border border-primary/20 bg-[hsl(43,96%,56%,0.03)] p-8">
          <h3 className="font-montserrat text-lg font-semibold mb-6 text-primary" style={{ WebkitTextFillColor: 'initial' }}>
            Com RiskPro
          </h3>
          <ul className="space-y-4">
            {comparisons.map((c, i) => (
              <li key={i} className="scroll-reveal-child flex items-start gap-3 text-sm text-[hsl(0,0%,70%)]" style={{ WebkitTextFillColor: 'initial' }}>
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                {c.good}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
);
