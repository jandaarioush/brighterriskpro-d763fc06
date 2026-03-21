import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Shield, Target, TrendingDown, Activity, CalendarDays } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { calculateDailyRisk, calculateStopPoints, getWorkingDaysInMonth } from "@/lib/riskCalculations";

const CAPITAL = 50000;
const MONTHLY_RISK = 3000;

const STEPS = [
  { title: "Configure seu Risco", tooltip: "Defina seu capital e quanto aceita perder por mês." },
  { title: "Limites Calculados", tooltip: "O sistema distribui o risco em pontos pelos dias úteis." },
  { title: "Opere com Proteção", tooltip: "Cada trade ajusta os stops automaticamente." },
  { title: "Calendário de Risco", tooltip: "Visualize os stops diários distribuídos no mês." },
];

const MOCK_TRADES = [
  { date: "2026-03-05", asset: "indice" as const, result: 200 },
  { date: "2026-03-10", asset: "dolar" as const, result: -150 },
  { date: "2026-03-13", asset: "indice" as const, result: 350 },
  { date: "2026-03-18", asset: "dolar" as const, result: -80 },
];

function StepIndicators({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === current ? "w-8 bg-primary" : "w-2 bg-muted"}`} />
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

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function InteractiveTour() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");

  const currentMonth = new Date();
  const workingDays = useMemo(() => getWorkingDaysInMonth(currentMonth), []);

  const accumulatedLoss = useMemo(() => {
    return MOCK_TRADES.filter(t => t.result < 0).reduce((sum, t) => sum + Math.abs(t.result), 0);
  }, []);

  const dailyRisk = useMemo(() => {
    const remaining = workingDays - MOCK_TRADES.length;
    return calculateDailyRisk(MONTHLY_RISK, accumulatedLoss, remaining > 0 ? remaining : 1);
  }, [accumulatedLoss, workingDays]);

  const stops = useMemo(() => calculateStopPoints(dailyRisk), [dailyRisk]);

  const calendarData = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const allDays = eachDayOfInterval({ start, end });
    let accLoss = 0;
    let wdProcessed = 0;

    return allDays.map(date => {
      const isWknd = isWeekend(date);
      const dateStr = format(date, "yyyy-MM-dd");
      const dayTrades = MOCK_TRADES.filter(t => t.date === dateStr);

      if (!isWknd) wdProcessed++;
      const wdRemaining = workingDays - wdProcessed + 1;
      const risk = calculateDailyRisk(MONTHLY_RISK, accLoss, wdRemaining);
      const stopsCalc = calculateStopPoints(risk);

      const dayResult = dayTrades.reduce((s, t) => s + t.result, 0);
      const loss = dayTrades.filter(t => t.result < 0).reduce((s, t) => s + Math.abs(t.result), 0);
      if (loss > 0) accLoss += loss;

      return { date, dateStr, isWeekend: isWknd, risk, stops: stopsCalc, trades: dayTrades, dayResult };
    });
  }, [workingDays]);

  const prev = () => { setDirection("left"); setStep(s => Math.max(0, s - 1)); };
  const next = () => { setDirection("right"); setStep(s => Math.min(3, s + 1)); };

  const getSlideClass = (index: number) => {
    if (index === step) return "translate-x-0 opacity-100";
    if (index < step) return "-translate-x-full opacity-0";
    return "translate-x-full opacity-0";
  };

  return (
    <div className="mt-16 scroll-reveal">
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <span className="text-primary text-xs font-medium tracking-widest uppercase" style={{ WebkitTextFillColor: "initial" }}>
            Passo {step + 1} de 4
          </span>
          <h3 className="font-montserrat text-lg md:text-xl font-bold mt-1 text-foreground">{STEPS[step].title}</h3>
        </div>

        <div className="relative overflow-hidden" style={{ minHeight: "320px" }}>
          {/* Step 1: Config */}
          <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${getSlideClass(0)}`}>
            <div className="relative">
              <TooltipOverlay text={STEPS[0].tooltip} />
            </div>
            <div className="space-y-3 pt-8 max-w-md mx-auto">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Configuração de Risco</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/30">
                <span className="text-xs text-muted-foreground">Capital</span>
                <span className="text-sm font-bold text-foreground">{formatCurrency(CAPITAL)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/30">
                <span className="text-xs text-muted-foreground">Risco Mensal</span>
                <span className="text-sm font-bold text-foreground">{formatCurrency(MONTHLY_RISK)}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {workingDays} dias úteis no mês • {((MONTHLY_RISK / CAPITAL) * 100).toFixed(1)}% do capital
              </div>
            </div>
          </div>

          {/* Step 2: Limits */}
          <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${getSlideClass(1)}`}>
            <div className="relative">
              <TooltipOverlay text={STEPS[1].tooltip} />
            </div>
            <div className="space-y-3 pt-8 max-w-md mx-auto">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Limites Calculados</span>
              </div>
              {[
                { label: "Risco Diário", value: formatCurrency(dailyRisk), icon: TrendingDown },
                { label: "Stop Índice", value: `${stops.indice.toFixed(0)} pts`, icon: TrendingDown },
                { label: "Stop Dólar", value: `${stops.dolar.toFixed(1)} pts`, icon: TrendingDown },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/30">
                  <div className="flex items-center gap-2">
                    <item.icon className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{item.value}</span>
                </div>
              ))}
              <div className="text-xs text-muted-foreground">
                Risco restante: {formatCurrency(MONTHLY_RISK - accumulatedLoss)}
              </div>
            </div>
          </div>

          {/* Step 3: Trades */}
          <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${getSlideClass(2)}`}>
            <div className="relative">
              <TooltipOverlay text={STEPS[2].tooltip} />
            </div>
            <div className="space-y-3 pt-8 max-w-md mx-auto">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Trades Registrados</span>
              </div>
              <div className="space-y-1.5">
                {MOCK_TRADES.map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-background/30 text-xs">
                    <span className="text-muted-foreground">{format(new Date(t.date + "T12:00:00"), "dd/MM")} • {t.asset === "indice" ? "Índice" : "Dólar"}</span>
                    <span className={t.result >= 0 ? "text-[hsl(142,71%,45%)] font-semibold" : "text-[hsl(0,84%,60%)] font-semibold"}>
                      {t.result >= 0 ? "+" : ""}{formatCurrency(t.result)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Total: <span className="font-semibold text-foreground">{formatCurrency(MOCK_TRADES.reduce((s, t) => s + t.result, 0))}</span>
              </div>
            </div>
          </div>

          {/* Step 4: Calendar */}
          <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${getSlideClass(3)}`}>
            <div className="relative">
              <TooltipOverlay text={STEPS[3].tooltip} />
            </div>
            <div className="space-y-3 pt-8 max-w-lg mx-auto">
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  {format(currentMonth, "MMMM yyyy", { locale: ptBR }).replace(/^\w/, c => c.toUpperCase())}
                </span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
                  <div key={i} className="text-[10px] text-muted-foreground font-medium py-1">{d}</div>
                ))}
                {Array.from({ length: getDay(startOfMonth(currentMonth)) }).map((_, i) => (
                  <div key={`e${i}`} />
                ))}
                {calendarData.map(day => {
                  const hasTrades = day.trades.length > 0;
                  const isPositive = day.dayResult > 0;
                  return (
                    <div
                      key={day.dateStr}
                      className={`rounded-sm p-0.5 text-center ${
                        day.isWeekend
                          ? "bg-muted/20 text-muted-foreground/40"
                          : hasTrades
                          ? isPositive
                            ? "bg-[hsl(142,71%,45%,0.2)] border border-[hsl(142,71%,45%,0.4)]"
                            : "bg-[hsl(0,84%,60%,0.2)] border border-[hsl(0,84%,60%,0.4)]"
                          : "bg-background/30 border border-border/50"
                      }`}
                      title={day.isWeekend ? "Fim de semana" : `Stop Índ: ${day.stops.indice.toFixed(0)}pts | Stop Dól: ${day.stops.dolar.toFixed(1)}pts`}
                    >
                      <div className="text-[10px] text-foreground/70">{format(day.date, "d")}</div>
                      {!day.isWeekend && (
                        <div className="text-[8px] text-muted-foreground truncate">
                          {hasTrades
                            ? (isPositive ? "+" : "") + formatCurrency(day.dayResult)
                            : `${day.stops.indice.toFixed(0)}pts`}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/30">
          <button onClick={prev} disabled={step === 0} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>
          <StepIndicators current={step} total={4} />
          <button onClick={next} disabled={step === 3} className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium">
            Próximo <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
