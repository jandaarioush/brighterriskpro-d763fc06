import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StatCard } from '@/components/StatCard';
import GreetingBanner from '@/components/GreetingBanner';
import { StockPnLEvolutionChart } from '@/components/stock/StockPnLEvolutionChart';
import { StockRiskCalculator } from '@/components/stock/StockRiskCalculator';
import { StockMonthHeatmap } from '@/components/stock/StockMonthHeatmap';
import { StockTradeForm } from '@/components/stock/StockTradeForm';
import { BrokerSelectionDialog, BrokerType } from '@/components/stock/BrokerSelectionDialog';
import DashboardLayoutWrapper from '@/components/DashboardLayoutWrapper';
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Percent,
  Shield,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  getWorkingDaysInMonth, 
  getWorkingDaysRemaining, 
  calculateStockMonthData,
  calculateStockMonthlyStats,
  getLastUsedRiskPercentual,
  StockTrade 
} from '@/lib/stockRiskCalculations';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import DashboardTabs from '@/components/DashboardTabs';
import { Json } from '@/integrations/supabase/types';

interface DashboardConfig {
  broker?: BrokerType;
  capital_total?: number;
}

interface Dashboard {
  id: string;
  name: string;
  type: string;
  monthly_risk: number | null;
  config: DashboardConfig | null;
}

export default function StockDashboard() {
  const { dashboardId } = useParams<{ dashboardId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [capitalTotal, setCapitalTotal] = useState(100000);
  const [baseRiskPercentual, setBaseRiskPercentual] = useState(8);
  const [workingDaysInMonth, setWorkingDaysInMonth] = useState(0);
  const [workingDaysRemaining, setWorkingDaysRemaining] = useState(0);
  const [dailyRiskPercent, setDailyRiskPercent] = useState(0);
  const [dailyRiskValue, setDailyRiskValue] = useState(0);
  const [accumulatedResult, setAccumulatedResult] = useState(0);
  const [accumulatedResultPercent, setAccumulatedResultPercent] = useState(0);
  const [accumulatedDrawdown, setAccumulatedDrawdown] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentMonthTrades, setCurrentMonthTrades] = useState<StockTrade[]>([]);
  const [showBrokerDialog, setShowBrokerDialog] = useState(false);
  const [broker, setBroker] = useState<BrokerType | null>(null);

  useEffect(() => {
    if (!user || !dashboardId) return;
    loadDashboard();
    fetchData();
  }, [user, dashboardId]);

  const loadDashboard = async () => {
    const { data, error } = await supabase
      .from('dashboards')
      .select('*')
      .eq('id', dashboardId)
      .eq('user_id', user?.id)
      .single();

    if (error || !data) {
      navigate('/hub');
      return;
    }

    const dashboardData = data as Dashboard;
    setDashboard(dashboardData);

    // Check if broker is configured
    const config = dashboardData.config as DashboardConfig | null;
    if (config?.broker) {
      setBroker(config.broker);
    } else {
      // First access - show broker selection dialog
      setShowBrokerDialog(true);
    }

    // Load capital from config if available
    if (config?.capital_total) {
      setCapitalTotal(config.capital_total);
    }
  };

  const handleBrokerSelect = async (selectedBroker: BrokerType) => {
    setBroker(selectedBroker);
    setShowBrokerDialog(false);

    // Save broker to dashboard config
    const currentConfig = (dashboard?.config || {}) as DashboardConfig;
    const newConfig: DashboardConfig = {
      ...currentConfig,
      broker: selectedBroker,
    };

    await supabase
      .from('dashboards')
      .update({ config: newConfig as unknown as Json })
      .eq('id', dashboardId);

    // Update local state
    if (dashboard) {
      setDashboard({ ...dashboard, config: newConfig });
    }
  };

  const handleCapitalChange = async (newCapital: number) => {
    setCapitalTotal(newCapital);

    // Save capital to dashboard config
    const currentConfig = (dashboard?.config || {}) as DashboardConfig;
    const newConfig: DashboardConfig = {
      ...currentConfig,
      capital_total: newCapital,
    };

    await supabase
      .from('dashboards')
      .update({ config: newConfig as unknown as Json })
      .eq('id', dashboardId);

    // Update local state
    if (dashboard) {
      setDashboard({ ...dashboard, config: newConfig });
    }
  };

  const fetchData = async () => {
    try {
      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const { data: trades } = await supabase
        .from('stock_trades')
        .select('*')
        .eq('user_id', user?.id)
        .eq('dashboard_id', dashboardId)
        .gte('trade_date', format(startOfMonth, 'yyyy-MM-dd'))
        .lte('trade_date', format(endOfMonth, 'yyyy-MM-dd'));

      const monthTrades = (trades as StockTrade[]) || [];
      setCurrentMonthTrades(monthTrades);

      const lastRisk = getLastUsedRiskPercentual(monthTrades);
      setBaseRiskPercentual(lastRisk);

      const totalWorkingDays = getWorkingDaysInMonth(currentMonth);
      const remainingWorkingDays = getWorkingDaysRemaining(currentMonth);
      setWorkingDaysInMonth(totalWorkingDays);
      setWorkingDaysRemaining(remainingWorkingDays);

      const monthData = calculateStockMonthData(capitalTotal, lastRisk, monthTrades, currentMonth);
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayData = monthData.find(d => format(d.date, 'yyyy-MM-dd') === today);

      if (todayData) {
        setDailyRiskPercent(todayData.riskPercentual);
        setDailyRiskValue(todayData.capitalAtRisk);
      }

      const stats = calculateStockMonthlyStats(monthTrades, lastRisk, capitalTotal);
      setAccumulatedResult(stats.totalResultReais);
      setAccumulatedResultPercent(stats.totalResultPercentual);
      
      const totalLoss = monthTrades
        .filter(t => t.resultado_reais < 0)
        .reduce((sum, t) => sum + t.resultado_reais, 0);
      setAccumulatedDrawdown(totalLoss);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !dashboard) {
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
      {/* Broker Selection Dialog */}
      <BrokerSelectionDialog
        open={showBrokerDialog}
        onSelect={handleBrokerSelect}
      />

      <div className="container mx-auto px-4 py-8">
        <GreetingBanner user={profile} />
        <DashboardTabs 
          dashboardId={dashboardId!} 
          dashboardType={dashboard.type as 'acoes' | 'internacional'} 
        />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{dashboard.name}</h1>
          <p className="text-muted-foreground">
            Gestão de risco para {dashboard.type === 'acoes' ? 'Ações' : 'Mercado Internacional'}
            {broker && (
              <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                {broker === 'btg' ? 'BTG Pactual' : 
                 broker === 'xp' ? 'XP' : 
                 broker === 'clear' ? 'Clear' : 
                 broker === 'warren' ? 'Warren' : 'Outra'}
              </span>
            )}
          </p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Risco Mensal"
            value={`${baseRiskPercentual.toFixed(1)}%`}
            subtitle={`R$ ${((baseRiskPercentual / 100) * capitalTotal).toLocaleString()} do capital`}
            icon={Shield}
            variant="default"
          />
          
          <StatCard
            title="Risco Diário Atual"
            value={`${dailyRiskPercent.toFixed(2)}%`}
            subtitle={`R$ ${dailyRiskValue.toFixed(2)} - ${workingDaysRemaining} dias restantes`}
            icon={AlertTriangle}
            variant="warning"
          />
          
          <StatCard
            title="Resultado Acumulado"
            value={`R$ ${accumulatedResult.toFixed(2)}`}
            subtitle={`${accumulatedResultPercent.toFixed(2)}% do capital`}
            icon={TrendingUp}
            variant={accumulatedResult >= 0 ? "success" : "danger"}
            trend={{
              value: `${accumulatedResultPercent.toFixed(2)}%`,
              isPositive: accumulatedResult >= 0
            }}
          />
        </div>

        {/* Capital and Drawdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Capital Total"
            value={`R$ ${capitalTotal.toLocaleString()}`}
            subtitle="Capital base para cálculos"
            icon={DollarSign}
            variant="default"
          />
          
          <StatCard
            title="Risco Base"
            value={`${baseRiskPercentual.toFixed(1)}%`}
            subtitle="Baseado no último trade"
            icon={Percent}
            variant="default"
          />
          
          <StatCard
            title="Drawdown Acumulado"
            value={`R$ ${Math.abs(accumulatedDrawdown).toFixed(2)}`}
            subtitle={`${((Math.abs(accumulatedDrawdown) / capitalTotal) * 100).toFixed(2)}% do capital`}
            icon={Activity}
            variant="danger"
          />
        </div>

        {/* Charts and Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <StockPnLEvolutionChart 
              userId={user?.id || ""} 
              dashboardId={dashboardId!}
              defaultPeriod="month" 
              showFilters={true} 
            />
          </div>
          
          <StockRiskCalculator 
            broker={broker || 'outra'} 
            capitalTotal={capitalTotal} 
            onCapitalChange={handleCapitalChange} 
          />
        </div>

        {/* Heatmap and Trade Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StockMonthHeatmap 
            trades={currentMonthTrades} 
            capitalTotal={capitalTotal}
            baseRiskPercentual={baseRiskPercentual}
          />
          <StockTradeForm 
            dashboardId={dashboardId!} 
            capitalTotal={capitalTotal}
            onTradeAdded={fetchData}
          />
        </div>
      </div>
    </DashboardLayoutWrapper>
  );
}
