import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { calculateDailyStockRisk, getWorkingDaysRemaining, StockTrade } from '@/lib/stockRiskCalculations';
import { format, endOfMonth } from 'date-fns';
import DashboardLayoutWrapper from '@/components/DashboardLayoutWrapper';
import DashboardTabs from '@/components/DashboardTabs';

interface Dashboard {
  id: string;
  name: string;
  type: 'futuros' | 'acoes' | 'internacional';
  monthly_risk: number;
}

export default function StockSimulator() {
  const { dashboardId } = useParams<{ dashboardId: string }>();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  // Form inputs
  const [modalidade, setModalidade] = useState<'daytrade' | 'swing' | 'position'>('daytrade');
  const [capitalOperacao, setCapitalOperacao] = useState(10000);
  const [alavancagem, setAlavancagem] = useState(1);
  const [stopLoss, setStopLoss] = useState(2);
  const [autoStop, setAutoStop] = useState(true);

  // Calculated values
  const [capitalTotal, setCapitalTotal] = useState(0);
  const [riskPercentual, setRiskPercentual] = useState(8);
  const [dailyRiskPercent, setDailyRiskPercent] = useState(0);
  const [dailyRiskValue, setDailyRiskValue] = useState(0);
  const [accumulatedLoss, setAccumulatedLoss] = useState(0);

  useEffect(() => {
    if (user && dashboardId) {
      fetchData();
    }
  }, [user, dashboardId]);

  const fetchData = async () => {
    try {
      // Load dashboard
      const { data: dashData } = await supabase
        .from('dashboards')
        .select('id, name, type, monthly_risk')
        .eq('id', dashboardId)
        .single();

      if (dashData) {
        setDashboard(dashData as Dashboard);
        setCapitalTotal(dashData.monthly_risk || 0);
      }

      // Load trades for accumulated loss calculation
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

        // Get risk from last trade
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

  // Calculate daily risk when inputs change
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

  // Auto-calculate stop loss
  useEffect(() => {
    if (autoStop && capitalOperacao > 0) {
      const maxLoss = dailyRiskValue / alavancagem;
      const stopPercent = (maxLoss / capitalOperacao) * 100;
      setStopLoss(Math.min(stopPercent, 10)); // Max 10%
    }
  }, [autoStop, dailyRiskValue, capitalOperacao, alavancagem]);

  // Calculations
  const riskPerTrade = (capitalOperacao * stopLoss / 100) * alavancagem;
  const remainingRisk = dailyRiskValue - riskPerTrade;
  const isWithinLimit = remainingRisk >= 0;
  const maxCapitalRecommended = dailyRiskValue / (stopLoss / 100) / alavancagem;

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
          <p className="text-muted-foreground">Simule operações com gestão de risco baseada em % do capital</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Simulação */}
          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Calculator className="h-6 w-6 text-purple-500" />
              </div>
              <h2 className="text-xl font-bold">Simulação de Operação</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="modalidade">Modalidade</Label>
                <Select value={modalidade} onValueChange={(v: 'daytrade' | 'swing' | 'position') => setModalidade(v)}>
                  <SelectTrigger id="modalidade">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daytrade">Day Trade</SelectItem>
                    <SelectItem value="swing">Swing Trade</SelectItem>
                    <SelectItem value="position">Position</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="capitalOperacao">Capital da Operação (R$)</Label>
                <Input
                  id="capitalOperacao"
                  type="number"
                  min="0"
                  value={capitalOperacao}
                  onChange={(e) => setCapitalOperacao(parseFloat(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Máximo recomendado: R$ {maxCapitalRecommended.toFixed(0)}
                </p>
              </div>

              <div>
                <Label htmlFor="alavancagem">Alavancagem</Label>
                <Select value={alavancagem.toString()} onValueChange={(v) => setAlavancagem(parseInt(v))}>
                  <SelectTrigger id="alavancagem">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 10, 20].map(a => (
                      <SelectItem key={a} value={a.toString()}>{a}x</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="stoploss">Stop Loss (%)</Label>
                  <Button
                    size="sm"
                    variant={autoStop ? 'default' : 'outline'}
                    onClick={() => setAutoStop(!autoStop)}
                  >
                    Auto
                  </Button>
                </div>
                <Input
                  id="stoploss"
                  type="number"
                  min="0"
                  step="0.1"
                  value={stopLoss}
                  onChange={(e) => {
                    setAutoStop(false);
                    setStopLoss(parseFloat(e.target.value) || 0);
                  }}
                  disabled={autoStop}
                />
              </div>
            </div>
          </Card>

          {/* Análise de Risco */}
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <AlertTriangle className="h-6 w-6 text-blue-500" />
              </div>
              <h2 className="text-xl font-bold">Análise de Risco</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-start p-3 rounded-lg bg-background/50">
                <div>
                  <p className="text-sm text-muted-foreground">Risco da Operação</p>
                  <p className="text-xs text-muted-foreground">{stopLoss.toFixed(1)}% x {alavancagem}x</p>
                </div>
                <p className="text-lg font-bold">R$ {riskPerTrade.toFixed(2)}</p>
              </div>

              <div className="flex justify-between items-start p-3 rounded-lg bg-background/50">
                <p className="text-sm text-muted-foreground">Risco Diário Disponível</p>
                <p className="text-lg font-bold text-blue-500">R$ {dailyRiskValue.toFixed(2)}</p>
              </div>

              <div className={`p-4 rounded-lg ${isWithinLimit ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className={`h-5 w-5 ${isWithinLimit ? 'text-green-500' : 'text-red-500'}`} />
                  <p className={`font-semibold ${isWithinLimit ? 'text-green-500' : 'text-red-500'}`}>
                    {isWithinLimit ? 'Dentro do Limite' : 'Acima do Limite'}
                  </p>
                </div>
                <p className="text-sm">
                  {isWithinLimit ? 'Sobra' : 'Excede'}: R$ {Math.abs(remainingRisk).toFixed(2)}
                </p>
              </div>
            </div>
          </Card>

          {/* Parâmetros Atuais */}
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
                <p className="text-sm text-muted-foreground">Perda Acumulada (Mês)</p>
                <p className="font-bold text-red-500">{accumulatedLoss.toFixed(2)}%</p>
              </div>

              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-xs font-semibold text-green-500 mb-2">Sistema de Gestão (%):</p>
                <p className="text-xs text-muted-foreground">
                  O risco diário é calculado dividindo o risco mensal restante pelos dias úteis restantes, 
                  baseado em percentuais do capital total.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayoutWrapper>
  );
}
