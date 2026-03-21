import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Search, CheckCircle2, DollarSign, Target, Percent, Wallet } from "lucide-react";
import { btgAssets, getBTGAsset } from "@/lib/btgAssets";

const STEPS = [
  { num: 1, label: "Selecionar Ativos" },
  { num: 2, label: "Preços" },
  { num: 3, label: "Parâmetros" },
];

const MOCK_ASSETS = [
  { ticker: "PETR4", preco: 36.50, stopPercentual: 2.0, objetivoPercentual: 4.0 },
  { ticker: "VALE3", preco: 58.20, stopPercentual: 1.5, objetivoPercentual: 3.0 },
  { ticker: "ITUB4", preco: 34.80, stopPercentual: 2.0, objetivoPercentual: 3.5 },
];

const VALOR_ALOCADO = 5000;
const STOP_MAX = 2500;

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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

const TOOLTIPS = [
  "Selecione os ativos que deseja operar da lista BTG.",
  "Defina preços de entrada, stop loss e objetivo por ativo.",
  "O sistema calcula margem, quantidade e risco automaticamente.",
];

export function StockInteractiveTour() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTickers = useMemo(() => {
    const tickers = btgAssets.map(a => a.ticker);
    if (!searchQuery.trim()) return tickers.slice(0, 30);
    return tickers.filter(t => t.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 30);
  }, [searchQuery]);

  const positions = useMemo(() => {
    const numPositions = MOCK_ASSETS.length;
    const stopPercentEach = 100 / numPositions;

    return MOCK_ASSETS.map(asset => {
      const btg = getBTGAsset(asset.ticker);
      const alavancagem = btg?.leverage || 1;
      const margemPorAcao = btg?.marginPerShare || asset.preco;
      const stopAlocado = STOP_MAX * (stopPercentEach / 100);
      const margemAlocada = VALOR_ALOCADO * (stopPercentEach / 100);

      const stopPorAcao = asset.preco * (asset.stopPercentual / 100);
      const ganhoPorAcao = asset.preco * (asset.objetivoPercentual / 100);

      const qtdMaxMargem = margemPorAcao > 0 ? Math.floor(margemAlocada / margemPorAcao) : 0;
      const qtdMaxStop = stopPorAcao > 0 ? Math.floor(stopAlocado / stopPorAcao) : 0;
      const quantidade = Math.min(qtdMaxMargem, qtdMaxStop);

      const perdaMaxima = quantidade * stopPorAcao;
      const ganhoObjetivo = quantidade * ganhoPorAcao;
      const margemNecessaria = quantidade * margemPorAcao;
      const limiteFator = qtdMaxMargem <= qtdMaxStop ? "margem" : "stop";

      return {
        ticker: asset.ticker,
        preco: asset.preco,
        stopPercentual: asset.stopPercentual,
        objetivoPercentual: asset.objetivoPercentual,
        alavancagem,
        quantidade,
        perdaMaxima,
        ganhoObjetivo,
        margemNecessaria,
        limiteFator,
      };
    });
  }, []);

  const totalPerdaMax = positions.reduce((s, p) => s + p.perdaMaxima, 0);
  const totalGanho = positions.reduce((s, p) => s + p.ganhoObjetivo, 0);
  const totalMargem = positions.reduce((s, p) => s + p.margemNecessaria, 0);

  const prev = () => { setDirection("left"); setStep(s => Math.max(0, s - 1)); };
  const next = () => { setDirection("right"); setStep(s => Math.min(2, s + 1)); };

  const getSlideClass = (index: number) => {
    if (index === step) return "translate-x-0 opacity-100";
    if (index < step) return "-translate-x-full opacity-0";
    return "translate-x-full opacity-0";
  };

  return (
    <div className="mt-16 scroll-reveal">
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 max-w-5xl mx-auto">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i === step ? "bg-primary text-primary-foreground" :
                i < step ? "bg-primary/30 text-primary" :
                "bg-muted text-muted-foreground"
              }`}>
                {i < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.num}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${i === step ? "text-foreground" : "text-muted-foreground"}`}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && <div className={`h-px w-8 md:w-12 ${i < step ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <div className="relative overflow-hidden" style={{ minHeight: "300px" }}>
          {/* Step 1: Select Assets */}
          <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${getSlideClass(0)}`}>
            <div className="relative mb-4">
              <TooltipOverlay text={TOOLTIPS[0]} />
            </div>
            <div className="space-y-4 pt-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar ativo..."
                  className="h-8 w-full rounded-md border border-border bg-background/50 pl-9 pr-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5 max-h-32 overflow-y-auto">
                {filteredTickers.map(ticker => {
                  const isSelected = MOCK_ASSETS.some(a => a.ticker === ticker);
                  return (
                    <div
                      key={ticker}
                      className={`text-[10px] font-medium px-1.5 py-1 rounded text-center cursor-default transition-colors ${
                        isSelected
                          ? "bg-primary/20 text-primary border border-primary/40"
                          : "bg-muted/30 text-muted-foreground border border-transparent"
                      }`}
                    >
                      {ticker}
                    </div>
                  );
                })}
              </div>
              <div>
                <span className="text-xs font-semibold text-foreground">Ativos Selecionados</span>
                <div className="flex gap-2 mt-2">
                  {MOCK_ASSETS.map(a => (
                    <div key={a.ticker} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/15 border border-primary/30 text-xs font-medium text-primary">
                      <CheckCircle2 className="w-3 h-3" /> {a.ticker}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Prices */}
          <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${getSlideClass(1)}`}>
            <div className="relative mb-4">
              <TooltipOverlay text={TOOLTIPS[1]} />
            </div>
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-4 gap-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
                <span>Ativo</span>
                <span>Preço (R$)</span>
                <span>Stop (%)</span>
                <span>Objetivo (%)</span>
              </div>
              {MOCK_ASSETS.map(asset => (
                <div key={asset.ticker} className="grid grid-cols-4 gap-2 items-center p-2.5 rounded-lg border border-border bg-background/30">
                  <span className="text-xs font-bold text-foreground">{asset.ticker}</span>
                  <div className="h-7 flex items-center rounded-md border border-border bg-muted/20 px-2 text-xs text-foreground">
                    {asset.preco.toFixed(2)}
                  </div>
                  <div className="h-7 flex items-center rounded-md border border-border bg-muted/20 px-2 text-xs text-foreground">
                    {asset.stopPercentual.toFixed(1)}%
                  </div>
                  <div className="h-7 flex items-center rounded-md border border-border bg-muted/20 px-2 text-xs text-foreground">
                    {asset.objetivoPercentual.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 3: Parameters & Results */}
          <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${getSlideClass(2)}`}>
            <div className="relative mb-4">
              <TooltipOverlay text={TOOLTIPS[2]} />
            </div>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/30">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs text-muted-foreground">Valor Alocado</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{formatCurrency(VALOR_ALOCADO)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/30">
                  <div className="flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs text-muted-foreground">Stop Máximo</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{formatCurrency(STOP_MAX)}</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Ativo</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Alav.</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Qtd</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Margem</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Perda Máx</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Ganho Obj</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map(p => (
                      <tr key={p.ticker} className="border-b border-border/50">
                        <td className="py-2 px-1 font-bold text-foreground">{p.ticker}</td>
                        <td className="py-2 px-1 text-right text-muted-foreground">{p.alavancagem}x</td>
                        <td className="py-2 px-1 text-right font-semibold text-foreground">{p.quantidade}</td>
                        <td className="py-2 px-1 text-right text-muted-foreground">{formatCurrency(p.margemNecessaria)}</td>
                        <td className="py-2 px-1 text-right text-[hsl(0,84%,60%)] font-semibold">{formatCurrency(p.perdaMaxima)}</td>
                        <td className="py-2 px-1 text-right text-[hsl(142,71%,45%)] font-semibold">{formatCurrency(p.ganhoObjetivo)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold text-foreground">
                      <td className="py-2 px-1" colSpan={3}>Total</td>
                      <td className="py-2 px-1 text-right">{formatCurrency(totalMargem)}</td>
                      <td className="py-2 px-1 text-right text-[hsl(0,84%,60%)]">{formatCurrency(totalPerdaMax)}</td>
                      <td className="py-2 px-1 text-right text-[hsl(142,71%,45%)]">{formatCurrency(totalGanho)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="flex flex-wrap gap-2 text-[10px]">
                <div className="px-2 py-1 rounded-full bg-muted/30 border border-border text-muted-foreground">
                  Margem: {((totalMargem / VALOR_ALOCADO) * 100).toFixed(0)}% utilizada
                </div>
                <div className="px-2 py-1 rounded-full bg-muted/30 border border-border text-muted-foreground">
                  Stop: {((totalPerdaMax / STOP_MAX) * 100).toFixed(0)}% do máximo
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/30">
          <button onClick={prev} disabled={step === 0} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>
          <div className="flex items-center gap-2">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? "w-8 bg-primary" : "w-2 bg-muted"}`} />
            ))}
          </div>
          <button onClick={next} disabled={step === 2} className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium">
            Próximo <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
