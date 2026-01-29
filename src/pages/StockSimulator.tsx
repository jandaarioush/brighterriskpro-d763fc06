import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Calculator, AlertTriangle, CheckCircle2, Plus, Trash2, TrendingUp } from 'lucide-react';
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
  alavancagem: number;
  quantidade: number;
  perdaMaxima: number;
  margemNecessaria: number;
}

type Modalidade = 'daytrade' | 'swing';

export default function StockSimulator() {
  const { dashboardId } = useParams<{ dashboardId: string }>();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  // Modalidade e Stop Financeiro
  const [modalidade, setModalidade] = useState<Modalidade>('daytrade');
  const [stopFinanceiroMax, setStopFinanceiroMax] = useState(500);
  const [positions, setPositions] = useState<SimulatorPosition[]>([]);

  // Form para adicionar novo ativo
  const [isAddingPosition, setIsAddingPosition] = useState(false);
  const [newTicker, setNewTicker] = useState('');
  const [newPreco, setNewPreco] = useState(0);
  const [newStopPercentual, setNewStopPercentual] = useState(2);
  const [tickerOpen, setTickerOpen] = useState(false);

  // Parâmetros atuais (do dashboard)
  const [capitalTotal, setCapitalTotal] = useState(0);
  const [riskPercentual, setRiskPercentual] = useState(8);
  const [dailyRiskPercent, setDailyRiskPercent] = useState(0);
  const [dailyRiskValue, setDailyRiskValue] = useState(0);
  const [accumulatedLoss, setAccumulatedLoss] = useState(0);

  // Lista de tickers disponíveis
  const tickerList = useMemo(() => {
    if (modalidade === 'daytrade') {
      return btgAssets.map(a => a.ticker);
    }
    // Para swing, permitir qualquer ticker (usa os mesmos como sugestão)
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

  // Calcular alavancagem baseado na modalidade e ticker
  const getAlavancagem = (ticker: string): number => {
    if (modalidade === 'swing') {
      return 5;
    }
    const btgAsset = getBTGAsset(ticker);
    return btgAsset?.leverage || 1;
  };

  // Calcular margem necessária
  const getMargemNecessaria = (ticker: string, preco: number, quantidade: number): number => {
    if (modalidade === 'swing') {
      return (preco * quantidade) / 5;
    }
    const btgAsset = getBTGAsset(ticker);
    if (btgAsset) {
      return btgAsset.marginPerShare * quantidade;
    }
    return preco * quantidade;
  };

  // Adicionar nova posição
  const handleAddPosition = () => {
    if (!newTicker || newPreco <= 0) return;

    const stopPorAcao = newPreco * (newStopPercentual / 100);
    const stopDisponivel = stopFinanceiroMax - totalPerdaUsada;
    const quantidade = Math.floor(stopDisponivel / stopPorAcao);
    const perdaMaxima = quantidade * stopPorAcao;
    const alavancagem = getAlavancagem(newTicker);
    const margemNecessaria = getMargemNecessaria(newTicker, newPreco, quantidade);

    if (quantidade <= 0) return;

    const newPosition: SimulatorPosition = {
      id: crypto.randomUUID(),
      ticker: newTicker.toUpperCase(),
      precoAtivo: newPreco,
      stopPercentual: newStopPercentual,
      alavancagem,
      quantidade,
      perdaMaxima,
      margemNecessaria,
    };

    setPositions([...positions, newPosition]);
    setNewTicker('');
    setNewPreco(0);
    setNewStopPercentual(2);
    setIsAddingPosition(false);
  };

  // Remover posição
  const handleRemovePosition = (id: string) => {
    setPositions(positions.filter(p => p.id !== id));
  };

  // Cálculos totais
  const totalPerdaUsada = positions.reduce((sum, p) => sum + p.perdaMaxima, 0);
  const percentualUsado = stopFinanceiroMax > 0 ? (totalPerdaUsada / stopFinanceiroMax) * 100 : 0;
  const isWithinLimit = totalPerdaUsada <= stopFinanceiroMax;
  const stopDisponivel = stopFinanceiroMax - totalPerdaUsada;

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
            Calcule quantas ações entrar em cada trade respeitando seu stop máximo
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

              {/* Stop Financeiro Máximo */}
              <div>
                <Label htmlFor="stopMax">Stop Financeiro Máximo (R$)</Label>
                <Input
                  id="stopMax"
                  type="number"
                  min="0"
                  value={stopFinanceiroMax}
                  onChange={(e) => setStopFinanceiroMax(parseFloat(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Valor máximo que você aceita perder nesta simulação
                </p>
              </div>

              {/* Lista de Posições Adicionadas */}
              {positions.length > 0 && (
                <div className="space-y-3">
                  <Label>Ativos Adicionados</Label>
                  {positions.map((pos) => (
                    <div key={pos.id} className="p-3 rounded-lg bg-background/50 border border-border/50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-bold text-lg">{pos.ticker}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {pos.alavancagem}x
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => handleRemovePosition(pos.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Preço:</span>{' '}
                          <span className="font-medium">R$ {pos.precoAtivo.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Stop:</span>{' '}
                          <span className="font-medium">{pos.stopPercentual.toFixed(1)}%</span>
                        </div>
                        <div className="col-span-2 pt-2 border-t border-border/30">
                          <span className="text-primary font-bold text-lg">
                            {pos.quantidade} ações
                          </span>
                          <span className="text-muted-foreground text-xs ml-2">
                            (perda: R$ {pos.perdaMaxima.toFixed(2)})
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
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
                                        {btgAsset.leverage}x
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
                      <span className="text-sm font-bold text-primary">{newStopPercentual.toFixed(1)}%</span>
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

                  {/* Preview do Cálculo */}
                  {newTicker && newPreco > 0 && (
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="text-sm text-muted-foreground mb-1">Prévia do cálculo:</p>
                      <p className="font-bold text-primary">
                        {Math.floor(stopDisponivel / (newPreco * (newStopPercentual / 100)))} ações
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Perda máx: R$ {(Math.floor(stopDisponivel / (newPreco * (newStopPercentual / 100))) * newPreco * (newStopPercentual / 100)).toFixed(2)}
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
                      disabled={!newTicker || newPreco <= 0 || stopDisponivel <= 0}
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
                  disabled={stopDisponivel <= 0}
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
                <div className="space-y-3">
                  {positions.map((pos) => (
                    <div key={pos.id} className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                      <div>
                        <span className="font-bold">{pos.ticker}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {pos.quantidade} ações
                        </span>
                      </div>
                      <span className="text-destructive font-medium">
                        -R$ {pos.perdaMaxima.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Adicione ativos para ver a análise de risco</p>
                </div>
              )}

              {/* Barra de Progresso */}
              <div className="pt-4 border-t border-border/30">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Stop Utilizado</span>
                  <span className="font-bold">
                    R$ {totalPerdaUsada.toFixed(2)} / R$ {stopFinanceiroMax.toFixed(2)}
                  </span>
                </div>
                <Progress 
                  value={Math.min(percentualUsado, 100)} 
                  className={`h-3 ${percentualUsado > 100 ? '[&>div]:bg-destructive' : ''}`}
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {percentualUsado.toFixed(1)}% utilizado
                </p>
              </div>

              {/* Status */}
              <div className={`p-4 rounded-lg ${isWithinLimit ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className={`h-5 w-5 ${isWithinLimit ? 'text-green-500' : 'text-red-500'}`} />
                  <p className={`font-semibold ${isWithinLimit ? 'text-green-500' : 'text-red-500'}`}>
                    {isWithinLimit ? 'Dentro do Limite' : 'Acima do Limite'}
                  </p>
                </div>
                <p className="text-sm">
                  {isWithinLimit 
                    ? `Sobra: R$ ${stopDisponivel.toFixed(2)} para novos ativos`
                    : `Excede em R$ ${Math.abs(stopDisponivel).toFixed(2)}`
                  }
                </p>
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
              <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                <p className="text-sm text-muted-foreground">Capital Total</p>
                <p className="font-bold">R$ {capitalTotal.toLocaleString('pt-BR')}</p>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                <p className="text-sm text-muted-foreground">Risco Mensal Base</p>
                <p className="font-bold text-green-500">{riskPercentual}%</p>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                <p className="text-sm text-muted-foreground">Risco Diário Atual</p>
                <p className="font-bold">{dailyRiskPercent.toFixed(2)}%</p>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                <p className="text-sm text-muted-foreground">Risco Diário (R$)</p>
                <p className="font-bold text-blue-500">R$ {dailyRiskValue.toFixed(2)}</p>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                <p className="text-sm text-muted-foreground">Perda Acumulada (Mês)</p>
                <p className="font-bold text-red-500">{accumulatedLoss.toFixed(2)}%</p>
              </div>

              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-xs font-semibold text-green-500 mb-2">Dica:</p>
                <p className="text-xs text-muted-foreground">
                  Use o Risco Diário (R$) como referência para o Stop Financeiro Máximo 
                  para manter sua gestão de risco consistente.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayoutWrapper>
  );
}
