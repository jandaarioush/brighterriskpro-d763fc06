const steps = [
  { num: "01", title: "Configure seu Risco", desc: "Defina capital, risco mensal e perfil operacional." },
  { num: "02", title: "Defina Limites", desc: "O sistema calcula stops diários para Índice e Dólar." },
  { num: "03", title: "Opere com Proteção", desc: "Registre trades e o risco se ajusta automaticamente." },
  { num: "04", title: "Acompanhe Resultados", desc: "Dashboard com gráficos, heatmaps e métricas em tempo real." },
];

export const HowItWorks = () => (
  <section className="py-24 md:py-32 px-6 border-t border-[hsl(0,0%,100%,0.04)]">
    <div className="container mx-auto max-w-6xl">
      <div className="text-center mb-16 scroll-reveal">
        <p className="text-primary text-sm font-medium tracking-widest uppercase mb-3" style={{ WebkitTextFillColor: 'initial' }}>
          Passo a Passo
        </p>
        <h2 className="font-montserrat text-3xl md:text-5xl font-bold">
          Como Funciona
        </h2>
      </div>

      <div className="grid md:grid-cols-4 gap-6 scroll-reveal">
        {steps.map((step, i) => (
          <div key={i} className="scroll-reveal-child text-center md:text-left">
            <span className="text-5xl font-montserrat font-bold text-gradient-gold block mb-4">
              {step.num}
            </span>
            <h3 className="font-montserrat text-base font-semibold mb-2">{step.title}</h3>
            <p className="text-[hsl(0,0%,50%)] text-sm leading-relaxed" style={{ WebkitTextFillColor: 'initial' }}>
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
