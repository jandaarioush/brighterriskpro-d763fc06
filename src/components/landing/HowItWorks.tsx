import { InteractiveTour } from "./InteractiveTour";
import { StockInteractiveTour } from "./StockInteractiveTour";

const futuresSteps = [
  { num: "01", title: "Configure seu Risco", desc: "Defina capital e risco mensal em reais." },
  { num: "02", title: "Defina Limites", desc: "O sistema calcula stops diários para Índice e Dólar." },
  { num: "03", title: "Opere com Proteção", desc: "Registre trades e o risco se ajusta automaticamente." },
  { num: "04", title: "Acompanhe no Calendário", desc: "Visualize o risco distribuído dia a dia no mês." },
];

const stockSteps = [
  { num: "01", title: "Configure Capital e Risco %", desc: "Defina seu capital total e o percentual de risco mensal." },
  { num: "02", title: "Veja os Limites", desc: "O sistema calcula risco diário em % e R$ automaticamente." },
  { num: "03", title: "Registre Operações", desc: "Adicione trades com ticker, preço de entrada e saída." },
  { num: "04", title: "Calendário de Risco", desc: "Acompanhe a distribuição de risco no mês em tempo real." },
];

function StepCards({ steps }: { steps: typeof futuresSteps }) {
  return (
    <div className="grid md:grid-cols-4 gap-6 scroll-reveal">
      {steps.map((step, i) => (
        <div key={i} className="scroll-reveal-child text-center md:text-left">
          <span className="text-5xl font-montserrat font-bold text-gradient-gold block mb-4">{step.num}</span>
          <h3 className="font-montserrat text-base font-semibold mb-2">{step.title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed" style={{ WebkitTextFillColor: 'initial' }}>{step.desc}</p>
        </div>
      ))}
    </div>
  );
}

export const HowItWorks = () => (
  <>
    {/* Futuros */}
    <section className="py-24 md:py-32 px-6 border-t border-border/10">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 scroll-reveal">
          <p className="text-primary text-sm font-medium tracking-widest uppercase mb-3" style={{ WebkitTextFillColor: 'initial' }}>
            Índice e Dólar
          </p>
          <h2 className="font-montserrat text-3xl md:text-5xl font-bold">Como Funciona — Futuros</h2>
        </div>
        <StepCards steps={futuresSteps} />
        <InteractiveTour />
      </div>
    </section>

    {/* Ações */}
    <section className="py-24 md:py-32 px-6 border-t border-border/10">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 scroll-reveal">
          <p className="text-primary text-sm font-medium tracking-widest uppercase mb-3" style={{ WebkitTextFillColor: 'initial' }}>
            Mercado de Ações
          </p>
          <h2 className="font-montserrat text-3xl md:text-5xl font-bold">Como Funciona — Ações</h2>
        </div>
        <StepCards steps={stockSteps} />
        <StockInteractiveTour />
      </div>
    </section>
  </>
);
