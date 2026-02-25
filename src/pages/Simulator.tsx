import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { calculateMonthData, Trade } from '@/lib/riskCalculations';
import { format } from 'date-fns';
import DashboardTabs from '@/components/DashboardTabs';

export default function Simulator() {
  const { user } = useAuth();
  const [assetType, setAssetType] = useState<'indice' | 'dolar'>('indice');
  const [contracts, setContracts] = useState(1);
  const [stopLoss, setStopLoss] = useState(0);
  const [autoStop, setAutoStop] = useState(true);
  
  const [dailyRisk, setDailyRisk] = useState(0);
  const [stopIndice, setStopIndice] = useState(0);
  const [stopDolar, setStopDolar] = useState(0);
  const [maxContractsIndice, setMaxContractsIndice] = useState(0);
  const [maxContractsDolar, setMaxContractsDolar] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const { data: futurosDashboard } = await supabase
          .from('dashboards')
          .select('monthly_risk')
          .eq('user_id', user.id)
          .eq('type', 'futuros')
          .maybeSingle();

        const userMonthlyRisk = futurosDashboard?.monthly_risk || 0;

        const currentMonth = new Date();
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

        const { data: trades } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', user.id)
          .gte('trade_date', format(startOfMonth, 'yyyy-MM-dd'))
          .lte('trade_date', format(endOfMonth, 'yyyy-MM-dd'));

        const monthTrades = (trades as Trade[]) || [];
        const monthData = calculateMonthData(userMonthlyRisk, monthTrades, currentMonth);
        const today = format(new Date(), 'yyyy-MM-dd');
        const todayData = monthData.find(d => format(d.date, 'yyyy-MM-dd') === today);

        if (todayData) {
          setDailyRisk(todayData.dailyRisk);
          setStopIndice(todayData.stopIndice);
          setStopDolar(todayData.stopDolar);
          setMaxContractsIndice(Math.floor(todayData.dailyRisk / (todayData.stopIndice * 0.2)));
          setMaxContractsDolar(Math.floor(todayData.dailyRisk / (todayData.stopDolar * 10)));
        }
      } catch (error) {
        console.error('Error fetching simulator data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    if (autoStop) {
      const pointValue = assetType === 'indice' ? 0.2 : 10;
      const maxStop = assetType === 'indice' ? stopIndice : stopDolar;
      
      // Calculate stop loss based on daily risk divided by contracts
      const calculatedStop = Math.round(dailyRisk / (contracts * pointValue));
      
      // Use the minimum between calculated and max available
      const finalStop = Math.min(calculatedStop, maxStop);
      
      setStopLoss(finalStop);
    }
  }, [assetType, autoStop, stopIndice, stopDolar, contracts, dailyRisk]);

  const pointValue = assetType === 'indice' ? 0.2 : 10;
  const riskPerContract = stopLoss * pointValue;
  const totalRisk = riskPerContract * contracts;
  const availableRisk = dailyRisk;
  const remainingRisk = availableRisk - totalRisk;
  const isWithinLimit = remainingRisk >= 0;
  const maxRecommendedContracts = assetType === 'indice' ? maxContractsIndice : maxContractsDolar;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando simulador...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardTabs dashboardType="futuros" />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 font-montserrat">Simulador de Alavancagem</h1>
          <p className="text-muted-foreground">Simule diferentes cenários de alavancagem e gestão de risco</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Simulação de Alavancagem */}
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/20">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Simulação de Alavancagem</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="asset">Ativo</Label>
                <Select value={assetType} onValueChange={(value: 'indice' | 'dolar') => setAssetType(value)}>
                  <SelectTrigger id="asset">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indice">Índice</SelectItem>
                    <SelectItem value="dolar">Dólar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="contracts">Quantidade de Contratos</Label>
                <Input
                  id="contracts"
                  type="number"
                  min="1"
                  value={contracts}
                  onChange={(e) => setContracts(Math.max(1, parseInt(e.target.value) || 1))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Máximo recomendado: {maxRecommendedContracts} contratos
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="stoploss">Stop Loss (pontos)</Label>
                  <Button
                    size="sm"
                    variant={autoStop ? "default" : "outline"}
                    onClick={() => setAutoStop(!autoStop)}
                  >
                    Auto
                  </Button>
                </div>
                <Input
                  id="stoploss"
                  type="number"
                  min="0"
                  value={stopLoss}
                  onChange={(e) => {
                    setAutoStop(false);
                    setStopLoss(parseFloat(e.target.value) || 0);
                  }}
                  disabled={autoStop}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Máximo disponível hoje: {assetType === 'indice' ? stopIndice.toFixed(0) : stopDolar.toFixed(0)} pts/contrato
                </p>
              </div>
            </div>
          </Card>

          {/* Análise de Risco */}
          <Card className="p-6 bg-gradient-to-br from-muted to-muted/50 border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/20">
                <AlertTriangle className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Análise de Risco</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-start p-3 rounded-lg bg-background/50">
                <div>
                  <p className="text-sm text-muted-foreground">Risco por Contrato</p>
                  <p className="text-xs text-muted-foreground">R$ {riskPerContract.toFixed(2)}</p>
                </div>
                <p className="text-lg font-bold">{stopLoss.toFixed(0)} pts</p>
              </div>

              <div className="flex justify-between items-start p-3 rounded-lg bg-background/50">
                <div>
                  <p className="text-sm text-muted-foreground">Risco Total</p>
                  <p className="text-xs text-muted-foreground">R$ {totalRisk.toFixed(2)}</p>
                </div>
                <p className="text-lg font-bold">{(stopLoss * contracts).toFixed(0)} pts</p>
              </div>

              <div className="flex justify-between items-start p-3 rounded-lg bg-background/50">
                <p className="text-sm text-muted-foreground">Risco Disponível Hoje</p>
                <p className="text-lg font-bold text-primary">R$ {availableRisk.toFixed(2)}</p>
              </div>

              <div className={`p-4 rounded-lg ${isWithinLimit ? 'bg-success/20 border border-success/30' : 'bg-destructive/20 border border-destructive/30'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className={`h-5 w-5 ${isWithinLimit ? 'text-success' : 'text-destructive'}`} />
                  <p className={`font-semibold ${isWithinLimit ? 'text-success' : 'text-destructive'}`}>
                    {isWithinLimit ? 'Dentro do Limite' : 'Acima do Limite'}
                  </p>
                </div>
                <p className="text-sm">
                  {isWithinLimit ? 'Sobra' : 'Excede'}: R$ {Math.abs(remainingRisk).toFixed(2)}
                </p>
              </div>
            </div>
          </Card>

          {/* Novo Sistema - Hoje */}
          <Card className="p-6 bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-success/20">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <h2 className="text-xl font-bold">Novo Sistema - Hoje</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                <p className="text-sm text-muted-foreground">Stop Atual (Índice)</p>
                <p className="font-bold text-success">{stopIndice.toFixed(0)} pts/contrato</p>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                <p className="text-sm text-muted-foreground">Stop Atual (Dólar)</p>
                <p className="font-bold text-success">{stopDolar.toFixed(0)} pts/contrato</p>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                <p className="text-sm text-muted-foreground">Risco Base Diário</p>
                <p className="font-bold">R$ {dailyRisk.toFixed(2)}</p>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                <p className="text-sm text-muted-foreground">Máx. Contratos (Índice)</p>
                <p className="font-bold">{maxContractsIndice}</p>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                <p className="text-sm text-muted-foreground">Máx. Contratos (Dólar)</p>
                <p className="font-bold">{maxContractsDolar}</p>
              </div>

              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <p className="text-xs font-semibold text-success mb-2">Novo Sistema de Gestão:</p>
                <p className="text-xs text-muted-foreground">
                  O risco diário é calculado dividindo o risco mensal restante pelos dias úteis restantes. 
                  Perdas reduzem o risco mensal, ganhos mantêm o risco inalterado.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
