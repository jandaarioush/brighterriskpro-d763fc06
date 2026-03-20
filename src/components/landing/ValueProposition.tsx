import { Shield, AlertTriangle, Target, Briefcase } from "lucide-react";

const cards = [
  {
    icon: Shield,
    title: "Controle de Risco Automatizado",
    desc: "Cálculos precisos de stop loss diário e mensal ajustados ao seu capital e perfil de risco.",
  },
  {
    icon: AlertTriangle,
    title: "Proteção Contra Perdas Excessivas",
    desc: "Limites claros que impedem que um dia ruim comprometa seu mês inteiro de operações.",
  },
  {
    icon: Target,
    title: "Disciplina Operacional",
    desc: "Regras objetivas que substituem decisões emocionais por processos consistentes.",
  },
  {
    icon: Briefcase,
    title: "Gestão Profissional de Capital",
    desc: "Dashboard completo com métricas de performance, heatmaps e relatórios exportáveis.",
  },
];

export const ValueProposition = () => (
  <section id="sobre" className="py-24 md:py-32 px-6">
    <div className="container mx-auto max-w-6xl">
      <div className="text-center mb-16 scroll-reveal">
        <p className="text-primary text-sm font-medium tracking-widest uppercase mb-3" style={{ WebkitTextFillColor: 'initial' }}>
          Por que RiskPro
        </p>
        <h2 className="font-montserrat text-3xl md:text-5xl font-bold">
          Gestão de risco que protege seu capital
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-5 scroll-reveal">
        {cards.map((card, i) => (
          <div
            key={i}
            className="scroll-reveal-child glass-card-hover rounded-xl p-8"
          >
            <card.icon className="w-8 h-8 text-primary mb-5" />
            <h3 className="font-montserrat text-lg font-semibold mb-2">{card.title}</h3>
            <p className="text-[hsl(0,0%,50%)] text-sm leading-relaxed" style={{ WebkitTextFillColor: 'initial' }}>
              {card.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
