import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Calculator, AlertTriangle, CheckCircle2, Trash2, TrendingUp, Wallet, Info, Target, Search, X, ChevronRight, ChevronLeft, ArrowRight, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { calculateDailyStockRisk, getWorkingDaysRemaining, StockTrade } from '@/lib/stockRiskCalculations';
import { btgAssets, getBTGAsset } from '@/lib/btgAssets';
import { format, endOfMonth } from 'date-fns';
import DashboardLayoutWrapper from '@/components/DashboardLayoutWrapper';
import DashboardTabs from '@/components/DashboardTabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Dashboard {
  id: string;
  name: string;
  type: 'futuros' | 'acoes' | 'internacional';
  monthly_risk: number;
}

interface SimulatorPosition {
  id: string;
  ticker: string;
  precoAtivo: number;
  stopPercentual: number;
  objetivoPercentual: number;
  alavancagem: number;
  margemPorAcao: number;
  stopAlocadoPercent: number;
  stopAlocado: number;
  qtdMaxMargem: number;
  qtdMaxStop: number;
  quantidade: number;
  perdaMaxima: number;
  ganhoObjetivo: number;
  margemNecessaria: number;
  limiteFator: 'margem' | 'stop';
}

interface SelectedAsset {
  ticker: string;
  preco: number;
  isManual?: boolean;
}

type Modalidade = 'daytrade' | 'swing';
type WizardStep = 'select' | 'prices' | 'params' | 'results';

export default function StockSimulator() {
  const { dashboardId } = useParams<{ dashboardId: string }>();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>('select');
  const [selectedAssets, setSelectedAssets] = useState<SelectedAsset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modalidade, Valor Alocado e Stop Financeiro
  const [modalidade, setModalidade] = useState<Modalidade>('daytrade');
  const [valorAlocado, setValorAlocado] = useState(1000);
  const [stopFinanceiroMax, setStopFinanceiroMax] = useState(500);
  const [stopLossPercent, setStopLossPercent] = useState(2);
  const [objetivoPercent, setObjetivoPercent] = useState(4);
  const [positions, setPositions] = useState<SimulatorPosition[]>([]);

  // Parâmetros atuais (do dashboard)
  const [capitalTotal, setCapitalTotal] = useState(0);
  const [riskPercentual, setRiskPercentual] = useState(8);
  const [dailyRiskPercent, setDailyRiskPercent] = useState(0);
  const [dailyRiskValue, setDailyRiskValue] = useState(0);
  const [accumulatedLoss, setAccumulatedLoss] = useState(0);

  // Validações
  const stopMaximoPermitido = valorAlocado * 0.70;
  const isStopValido = stopFinanceiroMax <= stopMaximoPermitido;

  // Lista de tickers disponíveis
  const tickerList = useMemo(() => {
    return btgAssets.map(a => a.ticker);
  }, []);

  // Filtered tickers based on search - show all assets
  const filteredTickers = useMemo(() => {
    if (!searchQuery.trim()) return tickerList;
    return tickerList.filter(ticker => 
      ticker.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, tickerList]);

  // Check if search query doesn't match any BTG asset
  const searchNotFound = useMemo(() => {
    if (!searchQuery.trim()) return false;
    return filteredTickers.length === 0;
  }, [searchQuery, filteredTickers]);

  useEffect(() => {
    if (user && dashboardId) {
      fetchData();
    }
  }, [user, dashboardId]);

  const fetchData = async () => {
    try {
      const { data: dashData } = await supabase
        .from('dashboards')
        .select('id, name, type, monthly_risk')
        .eq('id', dashboardId)
        .single();

      if (dashData) {
        setDashboard(dashData as Dashboard);
        setCapitalTotal(dashData.monthly_risk || 0);
      }

      const currentMonth = new Date();
      const startDate = format(currentMonth, 'yyyy-MM-01');
      const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

      const { data: tradesData } = await supabase
        .from('stock_trades')
        .select('*')
        .eq('dashboard_id', dashboardId)
        .eq('user_id', user?.id)
        .gte('trade_date', startDate)
        .lte('trade_date', endDate);

      if (tradesData) {
        const losses = (tradesData as StockTrade[])
          .filter(t => t.resultado_reais < 0)
          .reduce((sum, t) => sum + Math.abs(t.resultado_percentual), 0);
        setAccumulatedLoss(losses);

        if (tradesData.length > 0) {
          setRiskPercentual(tradesData[tradesData.length - 1].risco_percentual || 8);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate daily risk
  useEffect(() => {
    if (capitalTotal > 0) {
      const workingDaysRemaining = getWorkingDaysRemaining(new Date());
      const { dailyRiskPercent: drp, dailyRiskValue: drv } = calculateDailyStockRisk(
        capitalTotal,
        riskPercentual,
        accumulatedLoss,
        workingDaysRemaining
      );
      setDailyRiskPercent(drp);
      setDailyRiskValue(drv);
    }
  }, [capitalTotal, riskPercentual, accumulatedLoss]);

  // Check if asset is already selected
  const isSelected = (ticker: string) => {
    return selectedAssets.some(a => a.ticker === ticker);
  };

  // Add asset to selection
  const addAsset = (ticker: string, isManual: boolean = false) => {
    if (!isSelected(ticker)) {
      setSelectedAssets(prev => [...prev, { ticker, preco: 0, isManual }]);
    }
  };

  // Add manual asset (not in BTG list)
  const addManualAsset = (ticker: string) => {
    const normalized = ticker.toUpperCase().trim();
    // Validate basic format (4-6 characters, alphanumeric)
    if (normalized.length >= 3 && normalized.length <= 8 && !isSelected(normalized)) {
      addAsset(normalized, true);
      setSearchQuery('');
      toast.info(`"${normalized}" adicionado como ativo manual (1x alavancagem)`);
    }
  };

  // Remove asset from selection
  const removeAsset = (ticker: string) => {
    setSelectedAssets(prev => prev.filter(a => a.ticker !== ticker));
  };

  // Update asset price
  const updateAssetPrice = (ticker: string, preco: number) => {
    setSelectedAssets(prev => prev.map(a => 
      a.ticker === ticker ? { ...a, preco } : a
    ));
  };

  // Obter margem por ação (considera ativos manuais)
  const getMargemPorAcao = (ticker: string, preco: number, isManual?: boolean): number => {
    // Ativos manuais: margem = preço (sem alavancagem)
    if (isManual) {
      return preco;
    }
    if (modalidade === 'swing') {
      return preco / 5;
    }
    const btgAsset = getBTGAsset(ticker);
    if (btgAsset) {
      return btgAsset.marginPerShare;
    }
    return preco;
  };

  // Calcular alavancagem baseado na modalidade, ticker e se é manual
  const getAlavancagem = (ticker: string, isManual?: boolean): number => {
    // Ativos manuais: sempre 1x
    if (isManual) {
      return 1;
    }
    if (modalidade === 'swing') {
      return 5;
    }
    const btgAsset = getBTGAsset(ticker);
    return btgAsset?.leverage || 1;
  };

  // Cálculos de margem e stop disponíveis
  const totalMargemUsada = positions.reduce((sum, p) => sum + p.margemNecessaria, 0);
  const margemDisponivel = valorAlocado - totalMargemUsada;
  const totalPerdaUsada = positions.reduce((sum, p) => sum + p.perdaMaxima, 0);
  const totalGanhoObjetivo = positions.reduce((sum, p) => sum + p.ganhoObjetivo, 0);
  const stopDisponivel = stopFinanceiroMax - totalPerdaUsada;

  // Recalcular uma posição com base no stopAlocadoPercent
  const recalculatePosition = (pos: SimulatorPosition): SimulatorPosition => {
    const stopAlocado = stopFinanceiroMax * (pos.stopAlocadoPercent / 100);
    const stopPorAcao = pos.precoAtivo * (pos.stopPercentual / 100);
    const ganhoPorAcao = pos.precoAtivo * (pos.objetivoPercentual / 100);
    
    const qtdMaxMargem = Math.floor(valorAlocado / pos.margemPorAcao);
    const qtdMaxStop = stopPorAcao > 0 ? Math.floor(stopAlocado / stopPorAcao) : 0;
    const quantidade = Math.min(qtdMaxMargem, qtdMaxStop);
    
    const perdaMaxima = quantidade * stopPorAcao;
    const ganhoObjetivo = quantidade * ganhoPorAcao;
    const margemNecessaria = quantidade * pos.margemPorAcao;
    const limiteFator: 'margem' | 'stop' = qtdMaxMargem <= qtdMaxStop ? 'margem' : 'stop';
    
    return {
      ...pos,
      stopAlocado,
      qtdMaxMargem,
      qtdMaxStop,
      quantidade,
      perdaMaxima,
      ganhoObjetivo,
      margemNecessaria,
      limiteFator,
    };
  };

  // Redistribuir percentuais ao mudar slider
  const handleStopAllocationChange = (id: string, newPercent: number) => {
    const MIN_PERCENT = 5;
    
    setPositions(prev => {
      const others = prev.filter(p => p.id !== id);
      const totalOthersOld = others.reduce((sum, p) => sum + p.stopAlocadoPercent, 0);
      const remaining = 100 - newPercent;
      
      // Verificar se podemos redistribuir
      if (others.length > 0 && remaining < others.length * MIN_PERCENT) {
        return prev; // Não permite se outros ficarem abaixo do mínimo
      }
      
      return prev.map(p => {
        if (p.id === id) {
          return recalculatePosition({ ...p, stopAlocadoPercent: newPercent });
        }
        // Redistribui proporcionalmente
        const ratio = totalOthersOld > 0 ? p.stopAlocadoPercent / totalOthersOld : 1 / others.length;
        const newOtherPercent = Math.max(MIN_PERCENT, remaining * ratio);
        return recalculatePosition({ ...p, stopAlocadoPercent: newOtherPercent });
      });
    });
  };

  // Calculate all positions from selected assets
  const calculateAllPositions = () => {
    if (selectedAssets.length === 0) return;

    const numPositions = selectedAssets.length;
    const stopPercentEach = 100 / numPositions;

    const newPositions: SimulatorPosition[] = selectedAssets.map(asset => {
      const alavancagem = getAlavancagem(asset.ticker, asset.isManual);
      const margemPorAcao = getMargemPorAcao(asset.ticker, asset.preco, asset.isManual);
      const stopAlocado = stopFinanceiroMax * (stopPercentEach / 100);
      const stopPorAcao = asset.preco * (stopLossPercent / 100);
      const ganhoPorAcao = asset.preco * (objetivoPercent / 100);
      
      const qtdMaxMargem = Math.floor(valorAlocado / margemPorAcao);
      const qtdMaxStop = stopPorAcao > 0 ? Math.floor(stopAlocado / stopPorAcao) : 0;
      const quantidade = Math.min(qtdMaxMargem, qtdMaxStop);
      const limiteFator: 'margem' | 'stop' = qtdMaxMargem <= qtdMaxStop ? 'margem' : 'stop';

      const perdaMaxima = quantidade * stopPorAcao;
      const ganhoObjetivo = quantidade * ganhoPorAcao;
      const margemNecessaria = quantidade * margemPorAcao;

      return {
        id: crypto.randomUUID(),
        ticker: asset.ticker,
        precoAtivo: asset.preco,
        stopPercentual: stopLossPercent,
        objetivoPercentual: objetivoPercent,
        alavancagem,
        margemPorAcao,
        stopAlocadoPercent: stopPercentEach,
        stopAlocado,
        qtdMaxMargem,
        qtdMaxStop,
        quantidade,
        perdaMaxima,
        ganhoObjetivo,
        margemNecessaria,
        limiteFator,
      };
    });

    setPositions(newPositions);
    setCurrentStep('results');
  };

  // Remover posição e redistribuir
  const handleRemovePosition = (id: string) => {
    const remainingPositions = positions.filter(p => p.id !== id);
    
    if (remainingPositions.length === 0) {
      setPositions([]);
      return;
    }
    
    // Redistribuir proporcionalmente entre os restantes
    const totalPercent = remainingPositions.reduce((sum, p) => sum + p.stopAlocadoPercent, 0);
    const redistributedPositions = remainingPositions.map(p => 
      recalculatePosition({ 
        ...p, 
        stopAlocadoPercent: (p.stopAlocadoPercent / totalPercent) * 100 
      })
    );
    
    setPositions(redistributedPositions);
  };

  // Recalcular todas as posições quando stopFinanceiroMax mudar
  useEffect(() => {
    if (positions.length > 0) {
      setPositions(prev => prev.map(p => recalculatePosition(p)));
    }
  }, [stopFinanceiroMax, valorAlocado]);

  // Cálculos totais
  const percentualStopUsado = stopFinanceiroMax > 0 ? (totalPerdaUsada / stopFinanceiroMax) * 100 : 0;
  const percentualMargemUsada = valorAlocado > 0 ? (totalMargemUsada / valorAlocado) * 100 : 0;
  const isWithinLimit = totalPerdaUsada <= stopFinanceiroMax && totalMargemUsada <= valorAlocado;

  // Navigation
  const canProceedSelect = selectedAssets.length > 0;
  const canProceedPrices = selectedAssets.every(a => a.preco > 0);
  const canProceedParams = isStopValido && valorAlocado > 0 && stopFinanceiroMax > 0;

  const handleNext = () => {
    if (currentStep === 'select' && canProceedSelect) {
      setCurrentStep('prices');
    } else if (currentStep === 'prices' && canProceedPrices) {
      setCurrentStep('params');
    } else if (currentStep === 'params' && canProceedParams) {
      calculateAllPositions();
    }
  };

  const handleBack = () => {
    if (currentStep === 'prices') {
      setCurrentStep('select');
    } else if (currentStep === 'params') {
      setCurrentStep('prices');
    } else if (currentStep === 'results') {
      setCurrentStep('params');
    }
  };

  const handleReset = () => {
    setSelectedAssets([]);
    setPositions([]);
    setCurrentStep('select');
    setSearchQuery('');
  };

  if (loading) {
    return (
      <DashboardLayoutWrapper>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayoutWrapper>
    );
  }

  // Step Indicator Component
  const StepIndicator = ({ step, label, isActive, isCompleted }: { step: number; label: string; isActive: boolean; isCompleted: boolean }) => (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
        isActive ? 'bg-primary text-primary-foreground' : 
        isCompleted ? 'bg-success text-success-foreground' : 
        'bg-muted text-muted-foreground'
      }`}>
        {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : step}
      </div>
      <span className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </div>
  );

  return (
    <DashboardLayoutWrapper>
      {dashboard && (
        <DashboardTabs dashboardId={dashboardId} dashboardType={dashboard.type} />
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 font-montserrat">Simulador - {dashboard?.name}</h1>
          <p className="text-muted-foreground">
            Calcule quantas ações entrar em cada trade respeitando margem e stop máximo
          </p>
        </div>

        {/* Step Indicator */}
        {currentStep !== 'results' && (
          <div className="flex items-center justify-center gap-4 mb-8">
            <StepIndicator 
              step={1} 
              label="Selecionar Ativos" 
              isActive={currentStep === 'select'} 
              isCompleted={currentStep === 'prices' || currentStep === 'params'} 
            />
            <div className={`h-px w-12 ${currentStep !== 'select' ? 'bg-primary' : 'bg-border'}`} />
            <StepIndicator 
              step={2} 
              label="Preços" 
              isActive={currentStep === 'prices'} 
              isCompleted={currentStep === 'params'} 
            />
            <div className={`h-px w-12 ${currentStep === 'params' ? 'bg-primary' : 'bg-border'}`} />
            <StepIndicator 
              step={3} 
              label="Parâmetros" 
              isActive={currentStep === 'params'} 
              isCompleted={false} 
            />
          </div>
        )}

        {/* Step 1: Select Assets */}
        {currentStep === 'select' && (
          <Card className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/20">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Etapa 1: Selecionar Ativos</h2>
                <p className="text-sm text-muted-foreground">Pesquise e selecione as ações que deseja simular</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar ações (ex: PETR4, VALE3)..."
                  className="pl-10"
                />
              </div>

              {/* Available Tickers Grid */}
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">
                  Clique para adicionar ({filteredTickers.length} disponíveis)
                </Label>
                <ScrollArea className="h-[200px]">
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                    {filteredTickers.map((ticker) => {
                      const btgAsset = getBTGAsset(ticker);
                      const selected = isSelected(ticker);
                      return (
                        <TooltipProvider key={ticker}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant={selected ? "default" : "outline"}
                                size="sm"
                                className={`text-xs ${selected ? 'opacity-50' : ''}`}
                                onClick={() => !selected && addAsset(ticker, false)}
                                disabled={selected}
                              >
                                {ticker}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {btgAsset ? (
                                <p>{btgAsset.leverage}x | R$ {btgAsset.marginPerShare.toFixed(2)}/ação</p>
                              ) : (
                                <p>Ativo disponível</p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>
                </ScrollArea>

                {/* Asset Not Found - Manual Add */}
                {searchNotFound && searchQuery.trim() && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg mt-4">
                    <div className="flex items-center gap-2 text-amber-500 mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">
                        O ativo "{searchQuery.toUpperCase()}" não está na lista BTG
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="mt-2"
                      onClick={() => addManualAsset(searchQuery)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar "{searchQuery.toUpperCase()}" Manualmente
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Ativos manuais usarão alavancagem 1x e margem igual ao preço.
                    </p>
                  </div>
                )}
              </div>

              {/* Selected Assets */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Ativos Selecionados ({selectedAssets.length})
                </Label>
                {selectedAssets.length > 0 ? (
                  <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg min-h-[60px]">
                    {selectedAssets.map((asset) => (
                      <Badge 
                        key={asset.ticker} 
                        variant={asset.isManual ? "outline" : "default"}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm"
                      >
                        {asset.ticker}
                        {asset.isManual && (
                          <span className="text-xs text-amber-500 ml-1">(manual)</span>
                        )}
                        <button 
                          onClick={() => removeAsset(asset.ticker)}
                          className="ml-1 hover:text-destructive transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-muted/30 rounded-lg text-center text-muted-foreground">
                    Nenhum ativo selecionado. Clique nas ações acima para adicionar.
                  </div>
                )}
              </div>

              {/* Next Button */}
              <div className="flex justify-end">
                <Button 
                  onClick={handleNext} 
                  disabled={!canProceedSelect}
                  className="gap-2"
                >
                  Próximo
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: Configure Prices */}
        {currentStep === 'prices' && (
          <Card className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/20">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Etapa 2: Preços de Entrada</h2>
                <p className="text-sm text-muted-foreground">Informe o preço de entrada para cada ativo</p>
              </div>
            </div>

            <div className="space-y-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {selectedAssets.map((asset) => {
                    const btgAsset = getBTGAsset(asset.ticker);
                    return (
                      <div key={asset.ticker} className="p-4 rounded-lg border bg-card">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">{asset.ticker}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive/70 hover:text-destructive"
                              onClick={() => removeAsset(asset.ticker)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          {asset.isManual ? (
                            <span className="text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded">
                              Manual - 1x | Margem = Preço
                            </span>
                          ) : btgAsset ? (
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                              {btgAsset.leverage}x | R$ {btgAsset.marginPerShare.toFixed(2)}/ação
                            </span>
                          ) : null}
                        </div>
                        <div>
                          <Label htmlFor={`preco-${asset.ticker}`}>Preço de Entrada (R$)</Label>
                          <Input
                            id={`preco-${asset.ticker}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={asset.preco || ''}
                            onChange={(e) => updateAssetPrice(asset.ticker, parseFloat(e.target.value) || 0)}
                            placeholder="Ex: 35.50"
                            className={asset.preco <= 0 ? 'border-destructive/50' : ''}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={handleBack} className="gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Voltar
                </Button>
                <Button onClick={handleNext} disabled={!canProceedPrices} className="gap-2">
                  Próximo
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 3: Global Parameters */}
        {currentStep === 'params' && (
          <Card className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/20">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Etapa 3: Parâmetros da Operação</h2>
                <p className="text-sm text-muted-foreground">Defina os parâmetros de risco para todas as posições</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Left Column */}
              <div className="space-y-5">
                {/* Modalidade */}
                <div>
                  <Label htmlFor="modalidade">Modalidade</Label>
                  <Select value={modalidade} onValueChange={(v: Modalidade) => setModalidade(v)}>
                    <SelectTrigger id="modalidade">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daytrade">Day Trade (BTG)</SelectItem>
                      <SelectItem value="swing">Swing Trade (5x)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {modalidade === 'daytrade' 
                      ? 'Alavancagem automática baseada na lista BTG (ativos manuais: 1x)' 
                      : 'Alavancagem fixa de 5x para todos os ativos'}
                  </p>
                </div>

                {/* Valor Alocado */}
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="valorAlocado">Valor Alocado (R$)</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Capital que você vai usar como margem para operar.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="valorAlocado"
                    type="number"
                    min="0"
                    value={valorAlocado}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      setValorAlocado(value);
                      if (stopFinanceiroMax > value * 0.7) {
                        setStopFinanceiroMax(value * 0.7);
                      }
                    }}
                  />
                </div>

                {/* Stop Financeiro Máximo */}
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="stopMax">Stop Financeiro Máximo (R$)</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Máximo que você aceita perder. Limitado a 70% do Valor Alocado.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="stopMax"
                    type="number"
                    min="0"
                    max={stopMaximoPermitido}
                    value={stopFinanceiroMax}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      setStopFinanceiroMax(Math.min(value, stopMaximoPermitido));
                    }}
                    className={!isStopValido ? 'border-destructive' : ''}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className={`text-xs ${isStopValido ? 'text-muted-foreground' : 'text-destructive'}`}>
                      Limite máximo: R$ {stopMaximoPermitido.toFixed(2)} (70%)
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-5">
                {/* Stop Loss % */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Stop Loss (%)</Label>
                    <span className="text-sm font-bold text-destructive">{stopLossPercent.toFixed(1)}%</span>
                  </div>
                  <Slider
                    value={[stopLossPercent]}
                    onValueChange={(v) => setStopLossPercent(v[0])}
                    min={0.1}
                    max={20}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0.1%</span>
                    <span>20%</span>
                  </div>
                </div>

                {/* Objetivo % */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Objetivo / Gain (%)</Label>
                    <span className="text-sm font-bold text-success">{objetivoPercent.toFixed(1)}%</span>
                  </div>
                  <Slider
                    value={[objetivoPercent]}
                    onValueChange={(v) => setObjetivoPercent(v[0])}
                    min={0.1}
                    max={20}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0.1%</span>
                    <span>20%</span>
                  </div>
                </div>

                {/* Summary */}
                <div className="p-4 rounded-lg bg-muted/30 border">
                  <p className="text-sm font-medium mb-2">Resumo da Operação</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Ativos:</div>
                    <div className="font-medium">{selectedAssets.length}</div>
                    <div className="text-muted-foreground">Stop por ativo:</div>
                    <div className="font-medium text-destructive">
                      R$ {(stopFinanceiroMax / selectedAssets.length).toFixed(2)}
                    </div>
                    <div className="text-muted-foreground">R/R esperado:</div>
                    <div className="font-medium text-primary">
                      1:{(objetivoPercent / stopLossPercent).toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t mt-6">
              <Button variant="outline" onClick={handleBack} className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Voltar
              </Button>
              <Button onClick={handleNext} disabled={!canProceedParams} className="gap-2">
                <Calculator className="h-4 w-4" />
                Calcular Posições
              </Button>
            </div>
          </Card>
        )}

        {/* Step 4: Results */}
        {currentStep === 'results' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/20">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Resultado da Simulação</h2>
                  <p className="text-sm text-muted-foreground">{positions.length} posições calculadas</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <ArrowRight className="h-4 w-4" />
                Nova Simulação
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Simulação de Operação */}
              <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Calculator className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold">Simulação de Operação</h2>
                </div>

                <div className="space-y-5">
                  {/* Resumo de Limites */}
                  <div className="p-3 rounded-lg bg-background/50 border border-border/50 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Stop Total Alocado:</span>
                      <span className="font-medium text-primary">
                        R$ {stopFinanceiroMax.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Perda Máx Total:</span>
                      <span className={`font-medium ${totalPerdaUsada > stopFinanceiroMax ? 'text-destructive' : 'text-success'}`}>
                        R$ {totalPerdaUsada.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ganho Potencial Total:</span>
                      <span className="font-medium text-success">
                        R$ {totalGanhoObjetivo.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Lista de Posições com Sliders */}
                  {positions.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label>Distribuição de Risco</Label>
                        <span className="text-xs text-muted-foreground">
                          {positions.length} ativo(s)
                        </span>
                      </div>
                      
                      <ScrollArea className="h-[320px] pr-2">
                        <div className="space-y-4">
                          {positions.map((pos) => (
                            <div key={pos.id} className="p-4 rounded-lg bg-background/50 border border-border/50">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <span className="font-bold text-lg">{pos.ticker}</span>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    {pos.alavancagem}x | R$ {pos.precoAtivo.toFixed(2)}
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-destructive hover:text-destructive"
                                  onClick={() => handleRemovePosition(pos.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              {/* Info de Stop e Objetivo */}
                              <div className="flex gap-4 text-xs mb-3">
                                <span className="text-destructive">
                                  Stop: {pos.stopPercentual.toFixed(1)}%
                                </span>
                              <span className="text-success">
                                  Objetivo: {pos.objetivoPercentual.toFixed(1)}%
                                </span>
                              </div>
                              
                              {/* Slider de Alocação */}
                              <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-muted-foreground">Alocação do Stop:</span>
                                  <span className="font-bold text-primary">
                                    {pos.stopAlocadoPercent.toFixed(0)}% = R$ {pos.stopAlocado.toFixed(2)}
                                  </span>
                                </div>
                                <Slider
                                  value={[pos.stopAlocadoPercent]}
                                  onValueChange={(v) => handleStopAllocationChange(pos.id, v[0])}
                                  min={5}
                                  max={positions.length === 1 ? 100 : 95}
                                  step={1}
                                  className="w-full"
                                />
                              </div>
                              
                              {/* Resultado */}
                              <div className="mt-3 pt-3 border-t border-border/30">
                                <div className="flex justify-between items-center">
                                  <span className="text-primary font-bold text-lg">
                                    {pos.quantidade} ações
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    pos.limiteFator === 'margem' 
                                      ? 'bg-primary/20 text-primary' 
                                      : 'bg-muted text-muted-foreground'
                                  }`}>
                                    {pos.limiteFator === 'margem' ? 'Limite: Margem' : 'Limite: Stop'}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                                  <div className="flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3 text-destructive" />
                                    <span className="text-destructive">
                                      Perda: R$ {pos.perdaMaxima.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Target className="h-3 w-3 text-success" />
                                    <span className="text-success">
                                      Ganho: R$ {pos.ganhoObjetivo.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Margem: R$ {pos.margemNecessaria.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      
                      {/* Barra de Alocação Total */}
                      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Alocação Total</span>
                          <span className="text-sm font-bold text-primary">
                            {positions.reduce((sum, p) => sum + p.stopAlocadoPercent, 0).toFixed(0)}%
                          </span>
                        </div>
                        <Progress 
                          value={positions.reduce((sum, p) => sum + p.stopAlocadoPercent, 0)} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Card 2: Análise de Risco */}
              <Card className="p-6 bg-gradient-to-br from-muted to-muted/50 border-border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <AlertTriangle className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold">Análise de Risco</h2>
                </div>

                <div className="space-y-4">
                  {/* Resumo por ativo com sliders de redistribuição */}
                  {positions.length > 0 ? (
                    <ScrollArea className="h-[320px] pr-2">
                      <div className="space-y-3">
                        {positions.map((pos) => (
                          <div key={pos.id} className="p-3 rounded-lg bg-background/50">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold">{pos.ticker}</span>
                                <span className="text-xs text-muted-foreground">
                                  {pos.alavancagem}x
                                </span>
                                <button
                                  onClick={() => handleRemovePosition(pos.id)}
                                  className="text-destructive/60 hover:text-destructive transition-colors"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded ${
                                pos.limiteFator === 'margem' 
                                  ? 'bg-primary/20 text-primary' 
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                {pos.limiteFator === 'margem' ? 'Limitado por Margem' : 'Limitado por Stop'}
                              </span>
                            </div>
                            
                            {/* Slider de Alocação */}
                            <div className="mb-3">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-muted-foreground">Alocação do Stop:</span>
                                <span className="text-sm font-bold text-primary">
                                  {pos.stopAlocadoPercent.toFixed(0)}% (R$ {pos.stopAlocado.toFixed(2)})
                                </span>
                              </div>
                              <Slider
                                value={[pos.stopAlocadoPercent]}
                                onValueChange={(v) => handleStopAllocationChange(pos.id, v[0])}
                                min={5}
                                max={positions.length === 1 ? 100 : 95}
                                step={1}
                                className="w-full"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Quantidade:</span>{' '}
                                <span className="font-bold text-primary">{pos.quantidade}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">R$/Ação:</span>{' '}
                                <span className="font-medium">R$ {pos.precoAtivo.toFixed(2)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 text-destructive" />
                                <span className="text-destructive">R$ {pos.perdaMaxima.toFixed(2)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Target className="h-3 w-3 text-success" />
                                <span className="text-success">R$ {pos.ganhoObjetivo.toFixed(2)}</span>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Valor posição: R$ {(pos.precoAtivo * pos.quantidade).toFixed(2)} | R/R: 1:{(pos.ganhoObjetivo / (pos.perdaMaxima || 1)).toFixed(1)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>Adicione ativos para ver a análise de risco</p>
                    </div>
                  )}

                  {/* Barra de Progresso - Margem */}
                  <div className="pt-4 border-t border-border/30">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Wallet className="h-4 w-4" />
                        Margem Utilizada
                      </span>
                      <span className="font-bold">
                        R$ {totalMargemUsada.toFixed(2)} / R$ {valorAlocado.toFixed(2)}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(percentualMargemUsada, 100)} 
                      className={`h-3 ${percentualMargemUsada > 100 ? '[&>div]:bg-destructive' : '[&>div]:bg-primary'}`}
                    />
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                      {percentualMargemUsada.toFixed(1)}% utilizado
                    </p>
                  </div>

                  {/* Barra de Progresso - Stop */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4" />
                        Stop Utilizado
                      </span>
                      <span className="font-bold">
                        R$ {totalPerdaUsada.toFixed(2)} / R$ {stopFinanceiroMax.toFixed(2)}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(percentualStopUsado, 100)} 
                      className={`h-3 ${percentualStopUsado > 100 ? '[&>div]:bg-destructive' : ''}`}
                    />
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                      {percentualStopUsado.toFixed(1)}% utilizado
                    </p>
                  </div>

                  {/* Resumo Ganho/Perda */}
                  {positions.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
                        <p className="text-xs text-muted-foreground">Perda Máx Total</p>
                        <p className="font-bold text-destructive">R$ {totalPerdaUsada.toFixed(2)}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-center">
                        <p className="text-xs text-muted-foreground">Ganho Potencial</p>
                        <p className="font-bold text-success">R$ {totalGanhoObjetivo.toFixed(2)}</p>
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  <div className={`p-4 rounded-lg ${isWithinLimit ? 'bg-success/20 border border-success/30' : 'bg-destructive/20 border border-destructive/30'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className={`h-5 w-5 ${isWithinLimit ? 'text-success' : 'text-destructive'}`} />
                      <p className={`font-semibold ${isWithinLimit ? 'text-success' : 'text-destructive'}`}>
                        {isWithinLimit ? 'Dentro do Limite' : 'Acima do Limite'}
                      </p>
                    </div>
                    {isWithinLimit && positions.length > 0 && (
                      <div className="text-sm">
                        <p>Risco/Retorno: 1:{(totalGanhoObjetivo / (totalPerdaUsada || 1)).toFixed(1)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Card 3: Parâmetros Atuais */}
              <Card className="p-6 bg-gradient-to-br from-success/10 to-success/5 border-success/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-success/20">
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  </div>
                  <h2 className="text-xl font-bold">Parâmetros Atuais</h2>
                </div>

                <div className="space-y-4">
                  {/* Valores Alocados */}
                  <div className="p-3 rounded-lg bg-background/50 border-l-4 border-primary">
                    <p className="text-xs text-muted-foreground mb-1">Valor Alocado</p>
                    <p className="font-bold text-lg">R$ {valorAlocado.toLocaleString('pt-BR')}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-background/50 border-l-4 border-primary/70">
                    <p className="text-xs text-muted-foreground mb-1">Margem Total Utilizada</p>
                    <p className="font-bold text-lg text-primary">R$ {totalMargemUsada.toFixed(2)}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-background/50 border-l-4 border-success">
                    <p className="text-xs text-muted-foreground mb-1">Margem Disponível</p>
                    <p className={`font-bold text-lg ${margemDisponivel >= 0 ? 'text-success' : 'text-destructive'}`}>
                      R$ {margemDisponivel.toFixed(2)}
                    </p>
                  </div>

                  <div className="border-t border-border/30 pt-4">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                      <p className="text-sm text-muted-foreground">Capital Total</p>
                      <p className="font-bold">R$ {capitalTotal.toLocaleString('pt-BR')}</p>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                      <p className="text-sm text-muted-foreground">Risco Mensal Base</p>
                      <p className="font-bold text-success">{riskPercentual}%</p>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                      <p className="text-sm text-muted-foreground">Risco Diário (R$)</p>
                      <p className="font-bold text-primary">R$ {dailyRiskValue.toFixed(2)}</p>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                      <p className="text-sm text-muted-foreground">Perda Acumulada (Mês)</p>
                      <p className="font-bold text-destructive">{accumulatedLoss.toFixed(2)}%</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                    <p className="text-xs font-semibold text-success mb-2">Como funciona:</p>
                    <p className="text-xs text-muted-foreground">
                      Distribua o risco entre múltiplas ações usando os sliders.
                      <br />• <strong>Arraste o slider</strong> para alocar mais/menos risco em cada ativo
                      <br />• <strong className="text-success">Objetivo:</strong> Ganho potencial em R$
                      <br />• <strong className="text-destructive">Stop:</strong> Perda máxima em R$
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayoutWrapper>
  );
}
