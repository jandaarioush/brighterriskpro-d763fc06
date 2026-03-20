import { useState } from "react";
import { ChevronLeft, ChevronRight, Shield, TrendingDown, BarChart3, Target, DollarSign, Activity } from "lucide-react";

const STEPS = [
  {
    title: "Configure seu Risco",
    tooltip: "Defina seu capital e quanto aceita perder por mês.",
  },
  {
    title: "Defina Limites",
    tooltip: "O sistema distribui o risco automaticamente pelos dias úteis.",
  },
  {
    title: "Opere com Proteção",
    tooltip: "Cada trade registrado ajusta seu risco em tempo real.",
  },
  {
    title: "Acompanhe Resultados",
    tooltip: "Visualize sua performance com gráficos e heatmaps.",
  },
];

const MOCK_WEEKLY = [
  { day: "Seg", value: 320 },
  { day: "Ter", value: -180 },
  { day: "Qua", value: 450 },
  { day: "Qui", value: -90 },
  { day: "Sex", value: 260 },
];

const MOCK_HEATMAP = [
  [1, 0, -1, 1, 1],
  [0, -1, 1, 0, 1],
  [-1, 1, 1, -1, 0],
  [1, 1, 0, 1, -1],
];

function StepIndicators({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i === current
              ? "w-8 bg-primary"
              : "w-2 bg-[hsl(0,0%,30%)]"
          }`}
        />
      ))}
    </div>
  );
}

function TooltipOverlay({ text }: { text: string }) {
  return (
    <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
      <div className="bg-primary text-primary-foreground text-xs font-medium px-4 py-2 rounded-lg shadow-lg shadow-primary/20">
        {text}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-primary rotate-45" />
      </div>
    </div>
  );
}

function Step1Configure({ active }: { active: boolean }) {
  return (
    <div className={`relative transition-opacity duration-500 ${active ? "opacity-100" : "opacity-20 pointer-events-none"}`}>
      {active && <TooltipOverlay text={STEPS[0].tooltip} />}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Configuração de Risco</span>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Capital</label>
          <div className="h-9 rounded-md border border-border bg-background/50 flex items-center px-3 text-sm text-foreground">
            R$ 50.000,00
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Risco Mensal</label>
          <div className="h-9 rounded-md border border-border bg-background/50 flex items-center px-3 text-sm text-foreground">
            R$ 3.000,00
          </div>
        </div>
        <button className="w-full h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          Calcular
        </button>
      </div>
    </div>
  );
}

function Step2Limits({ active }: { active: boolean }) {
  return (
    <div className={`relative transition-opacity duration-500 ${active ? "opacity-100" : "opacity-20 pointer-events-none"}`}>
      {active && <TooltipOverlay text={STEPS[1].tooltip} />}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Limites Calculados</span>
        </div>
        {[
          { label: "Risco Diário", value: "R$ 136,36", icon: DollarSign },
          { label: "Stop Índice", value: "682 pts", icon: TrendingDown },
          { label: "Stop Dólar", value: "13,6 pts", icon: TrendingDown },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/30"
          >
            <div className="flex items-center gap-2">
              <item.icon className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
            <span className="text-sm font-bold text-foreground">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Step3Trade({ active }: { active: boolean }) {
  return (
    <div className={`relative transition-opacity duration-500 ${active ? "opacity-100" : "opacity-20 pointer-events-none"}`}>
      {active && <TooltipOverlay text={STEPS[2].tooltip} />}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Registro de Trade</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Ativo</label>
            <div className="h-8 rounded-md border border-border bg-background/50 flex items-center px-2 text-xs text-foreground">
              Índice
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Resultado</label>
            <div className="h-8 rounded-md border border-border bg-background/50 flex items-center px-2 text-xs text-[hsl(142,71%,45%)]">
              + R$ 320,00
            </div>
          </div>
        </div>
        <div className="p-3 rounded-lg border border-primary/30 bg-primary/5">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Novo Risco Diário</span>
            <span className="text-sm font-bold text-foreground">R$ 136,36</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-muted-foreground">Risco Restante</span>
            <span className="text-sm font-bold text-primary">R$ 3.000,00</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step4Results({ active }: { active: boolean }) {
  const maxVal = Math.max(...MOCK_WEEKLY.map((d) => Math.abs(d.value)));

  return (
    <div className={`relative transition-opacity duration-500 ${active ? "opacity-100" : "opacity-20 pointer-events-none"}`}>
      {active && <TooltipOverlay text={STEPS[3].tooltip} />}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Performance</span>
        </div>
        {/* Mini bar chart */}
        <div className="flex items-end gap-1.5 h-20">
          {MOCK_WEEKLY.map((d) => {
            const height = (Math.abs(d.value) / maxVal) * 100;
            const isPositive = d.value >= 0;
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center" style={{ height: "60px" }}>
                  <div
                    className={`w-full max-w-[24px] rounded-t-sm transition-all ${
                      isPositive ? "bg-[hsl(142,71%,45%)]" : "bg-[hsl(0,84%,60%)]"
                    }`}
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{d.day}</span>
              </div>
            );
          })}
        </div>
        {/* Mini heatmap */}
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Heatmap Mensal</span>
          <div className="grid grid-cols-5 gap-1">
            {MOCK_HEATMAP.flat().map((val, i) => (
              <div
                key={i}
                className={`h-5 rounded-sm ${
                  val > 0
                    ? "bg-[hsl(142,71%,45%,0.6)]"
                    : val < 0
                    ? "bg-[hsl(0,84%,60%,0.6)]"
                    : "bg-[hsl(0,0%,30%,0.3)]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function InteractiveTour() {
  const [step, setStep] = useState(0);

  const prev = () => setStep((s) => Math.max(0, s - 1));
  const next = () => setStep((s) => Math.min(3, s + 1));

  return (
    <div className="mt-16 scroll-reveal">
      <div className="bg-[hsl(0,0%,11%)] border border-[hsl(0,0%,100%,0.1)] rounded-2xl p-6 md:p-8 max-w-4xl mx-auto">
        {/* Step title + tooltip indicator */}
        <div className="text-center mb-6">
          <span className="text-primary text-xs font-medium tracking-widest uppercase" style={{ WebkitTextFillColor: "initial" }}>
            Passo {step + 1} de 4
          </span>
          <h3 className="font-montserrat text-lg md:text-xl font-bold mt-1 text-foreground">
            {STEPS[step].title}
          </h3>
        </div>

        {/* Dashboard grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <Step1Configure active={step === 0} />
          <Step2Limits active={step === 1} />
          <Step3Trade active={step === 2} />
          <Step4Results active={step === 3} />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-[hsl(0,0%,100%,0.05)]">
          <button
            onClick={prev}
            disabled={step === 0}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>

          <StepIndicators current={step} total={4} />

          <button
            onClick={next}
            disabled={step === 3}
            className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Próximo
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
