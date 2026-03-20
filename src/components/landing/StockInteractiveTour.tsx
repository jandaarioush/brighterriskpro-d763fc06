import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Shield, Target, DollarSign, Percent, Activity, CalendarDays, Plus, Trash2 } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { calculateDailyStockRisk, calculateTradeResult, getWorkingDaysInMonth } from "@/lib/stockRiskCalculations";

const STEPS = [
  { title: "Configure seu Risco", tooltip: "Defina seu capital e o percentual de risco mensal." },
  { title: "Limites Calculados", tooltip: "O sistema distribui o risco em % e R$ pelos dias úteis." },
  { title: "Registre Trades", tooltip: "Adicione trades com ticker e preços para ver o impacto." },
  { title: "Calendário de Risco", tooltip: "Visualize o risco diário distribuído no mês." },
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

interface SimTrade {
  date: string;
  ticker: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  resultReais: number;
  resultPercent: number;
}

export function StockInteractiveTour() {
  const [step, setStep] = useState(0);
  const [capital, setCapital] = useState(100000);
  const [riskPercent, setRiskPercent] = useState(8);
  const [simulatedTrades, setSimulatedTrades] = useState<SimTrade[]>([]);
  const [newDate, setNewDate] = useState("");
  const [newTicker, setNewTicker] = useState("PETR4");
  const [newEntry, setNewEntry] = useState("28.50");
  const [newExit, setNewExit] = useState("29.20");
  const [newQty, setNewQty] = useState("100");

  const currentMonth = new Date();
  const workingDays = useMemo(() => getWorkingDaysInMonth(currentMonth), []);

  const accLossPercent = useMemo(() => {
    return simulatedTrades.filter(t => t.resultPercent < 0).reduce((s, t) => s + Math.abs(t.resultPercent), 0);
  }, [simulatedTrades]);

  const dailyRisk = useMemo(() => {
    const remaining = workingDays - simulatedTrades.length;
    return calculateDailyStockRisk(capital, riskPercent, accLossPercent, remaining > 0 ? remaining : 1);
  }, [capital, riskPercent, accLossPercent, workingDays, simulatedTrades.length]);

  const availableDates = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end }).filter(d => !isWeekend(d));
  }, []);

  const calendarData = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const allDays = eachDayOfInterval({ start, end });
    let accLoss = 0;
    let wdProcessed = 0;

    return allDays.map(date => {
      const isWknd = isWeekend(date);
      const dateStr = format(date, "yyyy-MM-dd");
      const dayTrades = simulatedTrades.filter(t => t.date === dateStr);

      if (!isWknd) wdProcessed++;
      const wdRemaining = workingDays - wdProcessed + 1;
      const risk = calculateDailyStockRisk(capital, riskPercent, accLoss, wdRemaining);
      const dayResult = dayTrades.reduce((s, t) => s + t.resultReais, 0);
      const loss = dayTrades.filter(t => t.resultPercent < 0).reduce((s, t) => s + Math.abs(t.resultPercent), 0);
      if (loss > 0) accLoss += loss;

      return { date, dateStr, isWeekend: isWknd, risk, trades: dayTrades, dayResult };
    });
  }, [capital, riskPercent, simulatedTrades, workingDays]);

  const addTrade = () => {
    if (!newDate || !newEntry || !newExit || !newQty) return;
    const entry = parseFloat(newEntry.replace(",", "."));
    const exit = parseFloat(newExit.replace(",", "."));
    const qty = parseInt(newQty);
    if (isNaN(entry) || isNaN(exit) || isNaN(qty)) return;

    const { resultadoReais, resultadoPercentual } = calculateTradeResult(entry, exit, qty, 1, 0);
    setSimulatedTrades(prev => [...prev, {
      date: newDate, ticker: newTicker.toUpperCase(), entryPrice: entry, exitPrice: exit,
      quantity: qty, resultReais: resultadoReais, resultPercent: resultadoPercentual,
    }]);
    setNewExit("");
  };

  const removeTrade = (index: number) => setSimulatedTrades(prev => prev.filter((_, i) => i !== index));
  const prev = () => setStep(s => Math.max(0, s - 1));
  const next = () => setStep(s => Math.min(3, s + 1));

  return (
    <div className="mt-16 scroll-reveal">
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <span className="text-primary text-xs font-medium tracking-widest uppercase" style={{ WebkitTextFillColor: "initial" }}>
            Passo {step + 1} de 4
          </span>
          <h3 className="font-montserrat text-lg md:text-xl font-bold mt-1 text-foreground">{STEPS[step].title}</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Step 1 */}
          <div className={`relative transition-opacity duration-500 ${step === 0 ? "opacity-100" : "opacity-20 pointer-events-none"}`}>
            {step === 0 && <TooltipOverlay text={STEPS[0].tooltip} />}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Configuração de Risco</span>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Capital Total (R$)</label>
                <input
                  type="text"
                  value={formatCurrency(capital)}
                  onChange={e => {
                    const cleaned = e.target.value.replace(/[^\d]/g, "");
                    setCapital(Number(cleaned) / 100);
                  }}
                  className="flex h-9 w-full rounded-md border border-border bg-background/50 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Risco Mensal (%)</label>
                <input
                  type="number"
                  value={riskPercent}
                  onChange={e => setRiskPercent(Number(e.target.value))}
                  min={1}
                  max={30}
                  step={0.5}
                  className="flex h-9 w-full rounded-md border border-border bg-background/50 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {workingDays} dias úteis • Risco: {formatCurrency((riskPercent / 100) * capital)}
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className={`relative transition-opacity duration-500 ${step === 1 ? "opacity-100" : "opacity-20 pointer-events-none"}`}>
            {step === 1 && <TooltipOverlay text={STEPS[1].tooltip} />}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Limites Calculados</span>
              </div>
              {[
                { label: "Risco Diário (%)", value: `${dailyRisk.dailyRiskPercent.toFixed(2)}%`, icon: Percent },
                { label: "Risco Diário (R$)", value: formatCurrency(dailyRisk.dailyRiskValue), icon: DollarSign },
                { label: "Risco Restante (%)", value: `${(riskPercent - accLossPercent).toFixed(2)}%`, icon: Percent },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/30">
                  <div className="flex items-center gap-2">
                    <item.icon className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 3 */}
          <div className={`relative transition-opacity duration-500 ${step === 2 ? "opacity-100" : "opacity-20 pointer-events-none"}`}>
            {step === 2 && <TooltipOverlay text={STEPS[2].tooltip} />}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Registrar Trade</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Data</label>
                  <select value={newDate} onChange={e => setNewDate(e.target.value)} className="h-8 w-full rounded-md border border-border bg-background/50 px-2 text-xs text-foreground">
                    <option value="">Dia</option>
                    {availableDates.map(d => (
                      <option key={format(d, "yyyy-MM-dd")} value={format(d, "yyyy-MM-dd")}>{format(d, "dd/MM")}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Ticker</label>
                  <input type="text" value={newTicker} onChange={e => setNewTicker(e.target.value)} className="h-8 w-full rounded-md border border-border bg-background/50 px-2 text-xs text-foreground uppercase" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Entrada</label>
                  <input type="text" value={newEntry} onChange={e => setNewEntry(e.target.value)} className="h-8 w-full rounded-md border border-border bg-background/50 px-2 text-xs text-foreground" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Saída</label>
                  <input type="text" value={newExit} onChange={e => setNewExit(e.target.value)} className="h-8 w-full rounded-md border border-border bg-background/50 px-2 text-xs text-foreground" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Qtd</label>
                  <input type="text" value={newQty} onChange={e => setNewQty(e.target.value)} className="h-8 w-full rounded-md border border-border bg-background/50 px-2 text-xs text-foreground" />
                </div>
              </div>
              <button onClick={addTrade} className="w-full h-8 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-1">
                <Plus className="w-3 h-3" /> Adicionar Trade
              </button>
              {simulatedTrades.length > 0 && (
                <div className="max-h-28 overflow-y-auto space-y-1">
                  {simulatedTrades.map((t, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded border border-border text-xs">
                      <span className="text-muted-foreground">{format(new Date(t.date + "T12:00:00"), "dd/MM")} • {t.ticker}</span>
                      <div className="flex items-center gap-2">
                        <span className={t.resultReais >= 0 ? "text-[hsl(142,71%,45%)]" : "text-[hsl(0,84%,60%)]"}>
                          {t.resultReais >= 0 ? "+" : ""}{formatCurrency(t.resultReais)}
                        </span>
                        <button onClick={() => removeTrade(i)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Step 4: Calendar */}
          <div className={`relative transition-opacity duration-500 ${step === 3 ? "opacity-100" : "opacity-20 pointer-events-none"}`}>
            {step === 3 && <TooltipOverlay text={STEPS[3].tooltip} />}
            <div className="space-y-3">
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
                      title={day.isWeekend ? "Fim de semana" : `Risco: ${day.risk.dailyRiskPercent.toFixed(2)}% (${formatCurrency(day.risk.dailyRiskValue)})`}
                    >
                      <div className="text-[10px] text-foreground/70">{format(day.date, "d")}</div>
                      {!day.isWeekend && (
                        <div className="text-[8px] text-muted-foreground truncate">
                          {hasTrades ? (isPositive ? "+" : "") + formatCurrency(day.dayResult) : `${day.risk.dailyRiskPercent.toFixed(1)}%`}
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
