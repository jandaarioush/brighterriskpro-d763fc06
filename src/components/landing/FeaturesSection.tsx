import { Ban, Lock, BarChart3, FileText } from "lucide-react";

const features = [
  {
    icon: Ban,
    title: "Limite de Perda Diária",
    desc: "Stop diário calculado automaticamente com base no risco mensal e dias úteis restantes.",
  },
  {
    icon: Lock,
    title: "Bloqueio Automático",
    desc: "Ao atingir o limite, o sistema sinaliza que você deve parar — sem margem para erro emocional.",
  },
  {
    icon: BarChart3,
    title: "Gestão por Operação",
    desc: "Cada trade registrado ajusta o risco dos próximos dias, mantendo seu capital protegido.",
  },
  {
    icon: FileText,
    title: "Relatórios de Performance",
    desc: "Exporte dados em PDF e Excel. Analise padrões e evolua com dados concretos.",
  },
];

export const FeaturesSection = () => (
  <section id="recursos" className="py-24 md:py-32 px-6 border-t border-[hsl(0,0%,100%,0.04)]">
    <div className="container mx-auto max-w-6xl">
      <div className="text-center mb-16 scroll-reveal">
        <p className="text-primary text-sm font-medium tracking-widest uppercase mb-3" style={{ WebkitTextFillColor: 'initial' }}>
          Recursos
        </p>
        <h2 className="font-montserrat text-3xl md:text-5xl font-bold">
          Ferramentas que protegem seu capital
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-5 scroll-reveal">
        {features.map((feat, i) => (
          <div
            key={i}
            className="scroll-reveal-child glass-card-hover rounded-xl p-8"
          >
            <feat.icon className="w-8 h-8 text-primary mb-5" />
            <h3 className="font-montserrat text-lg font-semibold mb-2">{feat.title}</h3>
            <p className="text-[hsl(0,0%,50%)] text-sm leading-relaxed" style={{ WebkitTextFillColor: 'initial' }}>
              {feat.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
