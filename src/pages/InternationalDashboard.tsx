import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingUp, Calendar, List, Calculator, Settings, Loader2, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import DashboardLayoutWrapper from '@/components/DashboardLayoutWrapper';
import { InternationalBrokerDialog, type InternationalBrokerType } from '@/components/international/InternationalBrokerDialog';
import { InternationalRiskCalculator } from '@/components/international/InternationalRiskCalculator';
import { InternationalTradeForm } from '@/components/international/InternationalTradeForm';
import { InternationalMonthHeatmap } from '@/components/international/InternationalMonthHeatmap';
import { InternationalPnLChart } from '@/components/international/InternationalPnLChart';
import { formatUSD, formatBRL } from '@/lib/internationalRiskCalculations';
import { DEFAULT_EXCHANGE_RATE } from '@/lib/ninjatraderAssets';

interface Dashboard {
  id: string;
  name: string;
  type: string;
  config: {
    broker?: InternationalBrokerType;
    exchangeRate?: number;
  } | null;
  monthly_risk: number | null;
}

interface InternationalTrade {
  id: string;
  trade_date: string;
  symbol: string;
  trade_type: string;
  contracts: number;
  entry_price: number;
  exit_price: number;
  resultado_usd: number;
  resultado_brl: number;
  resultado_percentual: number;
  margin_used: number;
  setup_utilizado: string | null;
  tag: string | null;
  nota_disciplina: number | null;
  notes: string | null;
}

export default function InternationalDashboard() {
  const { dashboardId } = useParams<{ dashboardId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [trades, setTrades] = useState<InternationalTrade[]>([]);
  const [showBrokerDialog, setShowBrokerDialog] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState('dashboard');

  const loadDashboard = useCallback(async () => {
    if (!dashboardId || !user) return;

    try {
      const { data, error } = await supabase
        .from('dashboards')
        .select('*')
        .eq('id', dashboardId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error('Dashboard não encontrado');
        navigate('/hub');
        return;
      }

      // Parse config safely
      const config = typeof data.config === 'object' && data.config !== null
        ? data.config as Dashboard['config']
        : null;

      setDashboard({ ...data, config });

      // Show broker dialog if not configured
      if (!config?.broker) {
        setShowBrokerDialog(true);
      }
    } catch (error: any) {
      console.error('Error loading dashboard:', error);
      toast.error('Erro ao carregar dashboard');
    }
  }, [dashboardId, user, navigate]);

  const loadTrades = useCallback(async () => {
    if (!dashboardId || !user) return;

    try {
      const { data, error } = await supabase
        .from('international_trades')
        .select('*')
        .eq('dashboard_id', dashboardId)
        .eq('user_id', user.id)
        .order('trade_date', { ascending: false });

      if (error) throw error;
      setTrades(data || []);
    } catch (error: any) {
      console.error('Error loading trades:', error);
    } finally {
      setLoading(false);
    }
  }, [dashboardId, user]);

  useEffect(() => {
    if (user && dashboardId) {
      loadDashboard();
      loadTrades();
    }
  }, [user, dashboardId, loadDashboard, loadTrades]);

  const handleBrokerSelect = async (broker: InternationalBrokerType) => {
    if (!dashboard) return;

    try {
      const newConfig = {
        ...(dashboard.config || {}),
        broker,
      };

      const { error } = await supabase
        .from('dashboards')
        .update({ config: newConfig })
        .eq('id', dashboard.id);

      if (error) throw error;

      setDashboard({ ...dashboard, config: newConfig });
      setShowBrokerDialog(false);
      toast.success('Corretora configurada com sucesso!');
    } catch (error: any) {
      console.error('Error saving broker:', error);
      toast.error('Erro ao salvar configuração');
    }
  };

  // Calculate stats
  const totalResultUSD = trades.reduce((sum, t) => sum + t.resultado_usd, 0);
  const totalResultBRL = trades.reduce((sum, t) => sum + t.resultado_brl, 0);
  const totalTrades = trades.length;
  const winningTrades = trades.filter((t) => t.resultado_usd > 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const avgResult = totalTrades > 0 ? totalResultUSD / totalTrades : 0;

  if (loading) {
    return (
      <DashboardLayoutWrapper>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayoutWrapper>
    );
  }

  return (
    <DashboardLayoutWrapper>
      <div className="p-6 space-y-6">
        {/* Broker Selection Dialog */}
        <InternationalBrokerDialog
          open={showBrokerDialog}
          onSelect={handleBrokerSelect}
        />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{dashboard?.name || 'Mercado Internacional'}</h1>
              <p className="text-sm text-muted-foreground">
                {dashboard?.config?.broker === 'ninjatrader' ? 'NinjaTrader' : 'Futuros Internacionais'}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => setShowBrokerDialog(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Configurar Corretora
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Resultado (USD)</span>
            </div>
            <p className={`text-2xl font-bold ${totalResultUSD >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatUSD(totalResultUSD)}
            </p>
            <p className="text-xs text-muted-foreground">
              ≈ {formatBRL(totalResultBRL)}
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Win Rate</span>
            </div>
            <p className="text-2xl font-bold">{winRate.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">
              {winningTrades}/{totalTrades} trades
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <List className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total de Trades</span>
            </div>
            <p className="text-2xl font-bold">{totalTrades}</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Média por Trade</span>
            </div>
            <p className={`text-2xl font-bold ${avgResult >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatUSD(avgResult)}
            </p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Calculadora
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Calendário
            </TabsTrigger>
            <TabsTrigger value="trades" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Trades
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6 space-y-6">
            {/* P&L Chart */}
            <InternationalPnLChart trades={trades} currency="USD" />

            {/* Trade Form */}
            {dashboardId && (
              <InternationalTradeForm
                dashboardId={dashboardId}
                onTradeAdded={loadTrades}
              />
            )}
          </TabsContent>

          <TabsContent value="calculator" className="mt-6">
            <InternationalRiskCalculator />
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <InternationalMonthHeatmap
              trades={trades}
              selectedDate={selectedMonth}
              onDateChange={setSelectedMonth}
            />
          </TabsContent>

          <TabsContent value="trades" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Histórico de Trades</h3>
              {trades.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum trade registrado ainda
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2">Data</th>
                        <th className="text-left py-3 px-2">Ativo</th>
                        <th className="text-left py-3 px-2">Tipo</th>
                        <th className="text-right py-3 px-2">Contratos</th>
                        <th className="text-right py-3 px-2">Entrada</th>
                        <th className="text-right py-3 px-2">Saída</th>
                        <th className="text-right py-3 px-2">Resultado (USD)</th>
                        <th className="text-right py-3 px-2">Resultado (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trades.map((trade) => (
                        <tr key={trade.id} className="border-b border-border/50 hover:bg-muted/50">
                          <td className="py-3 px-2">{trade.trade_date}</td>
                          <td className="py-3 px-2 font-medium">{trade.symbol}</td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              trade.trade_type === 'long' 
                                ? 'bg-success/20 text-success' 
                                : 'bg-destructive/20 text-destructive'
                            }`}>
                              {trade.trade_type === 'long' ? 'Long' : 'Short'}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right">{trade.contracts}</td>
                          <td className="py-3 px-2 text-right">{trade.entry_price}</td>
                          <td className="py-3 px-2 text-right">{trade.exit_price}</td>
                          <td className={`py-3 px-2 text-right font-medium ${
                            trade.resultado_usd >= 0 ? 'text-success' : 'text-destructive'
                          }`}>
                            {formatUSD(trade.resultado_usd)}
                          </td>
                          <td className={`py-3 px-2 text-right ${
                            trade.resultado_percentual >= 0 ? 'text-success' : 'text-destructive'
                          }`}>
                            {trade.resultado_percentual.toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayoutWrapper>
  );
}
