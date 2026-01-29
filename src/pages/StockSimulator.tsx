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
import { Calculator, AlertTriangle, CheckCircle2, Plus, Trash2, TrendingUp, Wallet, Info, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { calculateDailyStockRisk, getWorkingDaysRemaining, StockTrade } from '@/lib/stockRiskCalculations';
import { btgAssets, getBTGAsset } from '@/lib/btgAssets';
import { format, endOfMonth } from 'date-fns';
import DashboardLayoutWrapper from '@/components/DashboardLayoutWrapper';
import DashboardTabs from '@/components/DashboardTabs';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

type Modalidade = 'daytrade' | 'swing';

export default function StockSimulator() {
  const { dashboardId } = useParams<{ dashboardId: string }>();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  // Modalidade, Valor Alocado e Stop Financeiro
  const [modalidade, setModalidade] = useState<Modalidade>('daytrade');
  const [valorAlocado, setValorAlocado] = useState(1000);
  const [stopFinanceiroMax, setStopFinanceiroMax] = useState(500);
  const [positions, setPositions] = useState<SimulatorPosition[]>([]);

  // Form para adicionar novo ativo
  const [isAddingPosition, setIsAddingPosition] = useState(false);
  const [newTicker, setNewTicker] = useState('');
  const [newPreco, setNewPreco] = useState(0);
  const [newStopPercentual, setNewStopPercentual] = useState(2);
  const [newObjetivoPercentual, setNewObjetivoPercentual] = useState(4);
  const [tickerOpen, setTickerOpen] = useState(false);

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
    if (modalidade === 'daytrade') {
      return btgAssets.map(a => a.ticker);
    }
    return btgAssets.map(a => a.ticker);
  }, [modalidade]);

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

  // Limpar posições ao mudar modalidade
  const handleModalidadeChange = (newModalidade: Modalidade) => {
    setModalidade(newModalidade);
    setPositions([]);
    setIsAddingPosition(false);
  };

  // Obter margem por ação
  const getMargemPorAcao = (ticker: string, preco: number): number => {
    if (modalidade === 'swing') {
      return preco / 5;
    }
    const btgAsset = getBTGAsset(ticker);
    if (btgAsset) {
      return btgAsset.marginPerShare;
    }
    return preco;
  };

  // Calcular alavancagem baseado na modalidade e ticker
  const getAlavancagem = (ticker: string): number => {
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

  // Adicionar nova posição com distribuição proporcional
  const handleAddPosition = () => {
    if (!newTicker || newPreco <= 0) return;

    const alavancagem = getAlavancagem(newTicker);
    const margemPorAcao = getMargemPorAcao(newTicker, newPreco);
    
    // Calcular nova distribuição proporcional
    const numPositions = positions.length + 1;
    const newStopPercent = 100 / numPositions;
    
    // Redistribuir posições existentes
    const redistributedPositions = positions.map(p => 
      recalculatePosition({ 
        ...p, 
        stopAlocadoPercent: (100 - newStopPercent) * (p.stopAlocadoPercent / 100) 
      })
    );

    // Criar nova posição
    const stopAlocado = stopFinanceiroMax * (newStopPercent / 100);
    const stopPorAcao = newPreco * (newStopPercentual / 100);
    const ganhoPorAcao = newPreco * (newObjetivoPercentual / 100);
    
    const qtdMaxMargem = Math.floor(valorAlocado / margemPorAcao);
    const qtdMaxStop = stopPorAcao > 0 ? Math.floor(stopAlocado / stopPorAcao) : 0;
    const quantidade = Math.min(qtdMaxMargem, qtdMaxStop);
    const limiteFator: 'margem' | 'stop' = qtdMaxMargem <= qtdMaxStop ? 'margem' : 'stop';

    if (quantidade <= 0) return;

    const perdaMaxima = quantidade * stopPorAcao;
    const ganhoObjetivo = quantidade * ganhoPorAcao;
    const margemNecessaria = quantidade * margemPorAcao;

    const newPosition: SimulatorPosition = {
      id: crypto.randomUUID(),
      ticker: newTicker.toUpperCase(),
      precoAtivo: newPreco,
      stopPercentual: newStopPercentual,
      objetivoPercentual: newObjetivoPercentual,
      alavancagem,
      margemPorAcao,
      stopAlocadoPercent: newStopPercent,
      stopAlocado,
      qtdMaxMargem,
      qtdMaxStop,
      quantidade,
      perdaMaxima,
      ganhoObjetivo,
      margemNecessaria,
      limiteFator,
    };

    setPositions([...redistributedPositions, newPosition]);
    setNewTicker('');
    setNewPreco(0);
    setNewStopPercentual(2);
    setNewObjetivoPercentual(4);
    setIsAddingPosition(false);
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

  // Preview do cálculo
  const previewCalculo = useMemo(() => {
    if (!newTicker || newPreco <= 0) return null;
    
    const alavancagem = getAlavancagem(newTicker);
    const margemPorAcao = getMargemPorAcao(newTicker, newPreco);
    const stopPorAcao = newPreco * (newStopPercentual / 100);
    const ganhoPorAcao = newPreco * (newObjetivoPercentual / 100);
    
    // Para preview, assumir distribuição igual
    const previewStopPercent = 100 / (positions.length + 1);
    const previewStopAlocado = stopFinanceiroMax * (previewStopPercent / 100);
    
    const qtdMaxMargem = Math.floor(valorAlocado / margemPorAcao);
    const qtdMaxStop = stopPorAcao > 0 ? Math.floor(previewStopAlocado / stopPorAcao) : 0;
    const quantidade = Math.min(qtdMaxMargem, qtdMaxStop);
    const limiteFator = qtdMaxMargem <= qtdMaxStop ? 'margem' : 'stop';
    
    return {
      quantidade,
      qtdMaxMargem,
      qtdMaxStop,
      limiteFator,
      perdaMaxima: quantidade * stopPorAcao,
      ganhoObjetivo: quantidade * ganhoPorAcao,
      margemNecessaria: quantidade * margemPorAcao,
      alavancagem,
      margemPorAcao,
      stopAlocadoPercent: previewStopPercent,
    };
  }, [newTicker, newPreco, newStopPercentual, newObjetivoPercentual, valorAlocado, stopFinanceiroMax, positions.length, modalidade]);

  if (loading) {
    return (
      <DashboardLayoutWrapper>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayoutWrapper>
    );
  }

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Simulação de Operação */}
          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Calculator className="h-6 w-6 text-purple-500" />
              </div>
              <h2 className="text-xl font-bold">Simulação de Operação</h2>
            </div>

            <div className="space-y-5">
              {/* Seletor de Modalidade */}
              <div>
                <Label htmlFor="modalidade">Modalidade</Label>
                <Select value={modalidade} onValueChange={(v: Modalidade) => handleModalidadeChange(v)}>
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
                    ? 'Alavancagem automática baseada na lista BTG' 
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
                        <p>Capital que você vai usar como margem para operar. Este valor determina a quantidade máxima de ações baseado na alavancagem.</p>
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
                <p className="text-xs text-muted-foreground mt-1">
                  Capital disponível para margem
                </p>
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
                  {!isStopValido && (
                    <span className="text-xs text-destructive font-medium">Excede 70%!</span>
                  )}
                </div>
              </div>

              {/* Resumo de Limites */}
              <div className="p-3 rounded-lg bg-background/50 border border-border/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Stop Total Alocado:</span>
                  <span className="font-medium text-blue-500">
                    R$ {stopFinanceiroMax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Perda Máx Total:</span>
                  <span className={`font-medium ${totalPerdaUsada > stopFinanceiroMax ? 'text-destructive' : 'text-green-500'}`}>
                    R$ {totalPerdaUsada.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ganho Potencial Total:</span>
                  <span className="font-medium text-green-500">
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
                            <span className="text-green-500">
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
                                  ? 'bg-orange-500/20 text-orange-500' 
                                  : 'bg-blue-500/20 text-blue-500'
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
                                <Target className="h-3 w-3 text-green-500" />
                                <span className="text-green-500">
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

              {/* Formulário para Adicionar Ativo */}
              {isAddingPosition ? (
                <div className="p-4 rounded-lg bg-background/80 border border-primary/30 space-y-4">
                  <Label className="text-primary font-semibold">Adicionar Ativo</Label>
                  
                  {/* Seletor de Ticker */}
                  <div>
                    <Label htmlFor="ticker" className="text-sm">Ticker</Label>
                    <Popover open={tickerOpen} onOpenChange={setTickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={tickerOpen}
                          className="w-full justify-between"
                        >
                          {newTicker || "Selecione o ticker..."}
                          <TrendingUp className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Buscar ticker..." />
                          <CommandList>
                            <CommandEmpty>Ticker não encontrado.</CommandEmpty>
                            <CommandGroup className="max-h-60 overflow-auto">
                              {tickerList.map((ticker) => {
                                const btgAsset = getBTGAsset(ticker);
                                return (
                                  <CommandItem
                                    key={ticker}
                                    value={ticker}
                                    onSelect={(value) => {
                                      setNewTicker(value.toUpperCase());
                                      setTickerOpen(false);
                                    }}
                                  >
                                    <span className="font-medium">{ticker}</span>
                                    {modalidade === 'daytrade' && btgAsset && (
                                      <span className="ml-auto text-xs text-muted-foreground">
                                        {btgAsset.leverage}x | R$ {btgAsset.marginPerShare.toFixed(2)}/ação
                                      </span>
                                    )}
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Preço da Ação */}
                  <div>
                    <Label htmlFor="preco" className="text-sm">Preço da Ação (R$)</Label>
                    <Input
                      id="preco"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newPreco || ''}
                      onChange={(e) => setNewPreco(parseFloat(e.target.value) || 0)}
                      placeholder="Ex: 35.50"
                    />
                  </div>

                  {/* Slider de Stop % */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-sm">Stop Loss (%)</Label>
                      <span className="text-sm font-bold text-destructive">{newStopPercentual.toFixed(1)}%</span>
                    </div>
                    <Slider
                      value={[newStopPercentual]}
                      onValueChange={(v) => setNewStopPercentual(v[0])}
                      min={0.1}
                      max={10}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0.1%</span>
                      <span>10%</span>
                    </div>
                  </div>

                  {/* Slider de Objetivo % */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-sm">Objetivo / Gain (%)</Label>
                      <span className="text-sm font-bold text-green-500">{newObjetivoPercentual.toFixed(1)}%</span>
                    </div>
                    <Slider
                      value={[newObjetivoPercentual]}
                      onValueChange={(v) => setNewObjetivoPercentual(v[0])}
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

                  {/* Preview do Cálculo */}
                  {previewCalculo && previewCalculo.quantidade > 0 && (
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 space-y-2">
                      <p className="text-sm font-semibold text-primary">Prévia do cálculo:</p>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Alavancagem:</span>{' '}
                          <span className="font-medium">{previewCalculo.alavancagem}x</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Alocação:</span>{' '}
                          <span className="font-medium">{previewCalculo.stopAlocadoPercent.toFixed(0)}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Qtd máx (margem):</span>{' '}
                          <span className={`font-medium ${previewCalculo.limiteFator === 'margem' ? 'text-orange-500' : ''}`}>
                            {previewCalculo.qtdMaxMargem}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Qtd máx (stop):</span>{' '}
                          <span className={`font-medium ${previewCalculo.limiteFator === 'stop' ? 'text-blue-500' : ''}`}>
                            {previewCalculo.qtdMaxStop}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-primary/20">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-primary text-lg">
                            {previewCalculo.quantidade} ações
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            previewCalculo.limiteFator === 'margem' 
                              ? 'bg-orange-500/20 text-orange-500' 
                              : 'bg-blue-500/20 text-blue-500'
                          }`}>
                            Limite: {previewCalculo.limiteFator === 'margem' ? 'Margem' : 'Stop'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                          <span className="text-destructive">
                            Perda: R$ {previewCalculo.perdaMaxima.toFixed(2)}
                          </span>
                          <span className="text-green-500">
                            Ganho: R$ {previewCalculo.ganhoObjetivo.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {previewCalculo && previewCalculo.quantidade <= 0 && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-sm text-destructive">
                        Sem margem ou stop disponível para adicionar este ativo.
                      </p>
                    </div>
                  )}

                  {/* Botões */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setIsAddingPosition(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleAddPosition}
                      disabled={!newTicker || newPreco <= 0 || !previewCalculo || previewCalculo.quantidade <= 0}
                    >
                      Adicionar
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsAddingPosition(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Ativo
                </Button>
              )}
            </div>
          </Card>

          {/* Card 2: Análise de Risco */}
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <AlertTriangle className="h-6 w-6 text-blue-500" />
              </div>
              <h2 className="text-xl font-bold">Análise de Risco</h2>
            </div>

            <div className="space-y-4">
              {/* Resumo por ativo */}
              {positions.length > 0 ? (
                <ScrollArea className="h-[280px] pr-2">
                  <div className="space-y-3">
                    {positions.map((pos) => (
                      <div key={pos.id} className="p-3 rounded-lg bg-background/50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-bold">{pos.ticker}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {pos.alavancagem}x
                            </span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            pos.limiteFator === 'margem' 
                              ? 'bg-orange-500/20 text-orange-500' 
                              : 'bg-blue-500/20 text-blue-500'
                          }`}>
                            {pos.limiteFator === 'margem' ? 'Limitado por Margem' : 'Limitado por Stop'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Quantidade:</span>{' '}
                            <span className="font-bold text-primary">{pos.quantidade}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Alocação:</span>{' '}
                            <span className="font-bold">{pos.stopAlocadoPercent.toFixed(0)}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3 text-destructive" />
                            <span className="text-destructive">R$ {pos.perdaMaxima.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3 text-green-500" />
                            <span className="text-green-500">R$ {pos.ganhoObjetivo.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Valor posição: R$ {(pos.precoAtivo * pos.quantidade).toFixed(2)}
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
                  className={`h-3 ${percentualMargemUsada > 100 ? '[&>div]:bg-destructive' : '[&>div]:bg-orange-500'}`}
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
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                    <p className="text-xs text-muted-foreground">Ganho Potencial</p>
                    <p className="font-bold text-green-500">R$ {totalGanhoObjetivo.toFixed(2)}</p>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className={`p-4 rounded-lg ${isWithinLimit ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className={`h-5 w-5 ${isWithinLimit ? 'text-green-500' : 'text-red-500'}`} />
                  <p className={`font-semibold ${isWithinLimit ? 'text-green-500' : 'text-red-500'}`}>
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
          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <h2 className="text-xl font-bold">Parâmetros Atuais</h2>
            </div>

            <div className="space-y-4">
              {/* Valores Alocados */}
              <div className="p-3 rounded-lg bg-background/50 border-l-4 border-purple-500">
                <p className="text-xs text-muted-foreground mb-1">Valor Alocado</p>
                <p className="font-bold text-lg">R$ {valorAlocado.toLocaleString('pt-BR')}</p>
              </div>

              <div className="p-3 rounded-lg bg-background/50 border-l-4 border-orange-500">
                <p className="text-xs text-muted-foreground mb-1">Margem Total Utilizada</p>
                <p className="font-bold text-lg text-orange-500">R$ {totalMargemUsada.toFixed(2)}</p>
              </div>

              <div className="p-3 rounded-lg bg-background/50 border-l-4 border-green-500">
                <p className="text-xs text-muted-foreground mb-1">Margem Disponível</p>
                <p className={`font-bold text-lg ${margemDisponivel >= 0 ? 'text-green-500' : 'text-destructive'}`}>
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
                  <p className="font-bold text-green-500">{riskPercentual}%</p>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                  <p className="text-sm text-muted-foreground">Risco Diário (R$)</p>
                  <p className="font-bold text-blue-500">R$ {dailyRiskValue.toFixed(2)}</p>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                  <p className="text-sm text-muted-foreground">Perda Acumulada (Mês)</p>
                  <p className="font-bold text-red-500">{accumulatedLoss.toFixed(2)}%</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-xs font-semibold text-green-500 mb-2">Como funciona:</p>
                <p className="text-xs text-muted-foreground">
                  Distribua o risco entre múltiplas ações usando os sliders.
                  <br />• <strong>Arraste o slider</strong> para alocar mais/menos risco em cada ativo
                  <br />• <strong className="text-green-500">Objetivo:</strong> Ganho potencial em R$
                  <br />• <strong className="text-destructive">Stop:</strong> Perda máxima em R$
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayoutWrapper>
  );
}
