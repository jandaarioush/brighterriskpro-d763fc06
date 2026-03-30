import { StatCard } from "@/components/StatCard";
import { RiskCalculator } from "@/components/RiskCalculator";
import { TradeForm } from "@/components/TradeForm";
import { MonthHeatmap } from "@/components/MonthHeatmap";
import GreetingBanner from "@/components/GreetingBanner";
import { PnLEvolutionChart } from "@/components/PnLEvolutionChart";
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Target,
  Shield,
  Activity,
  Zap
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  getWorkingDaysInMonth, 
  getWorkingDaysRemaining, 
  calculateMonthData,
  calculateMonthlyStats,
  calculateDailyGoal,
  calculateGoalPoints,
  Trade 
} from "@/lib/riskCalculations";
import { format } from "date-fns";
import DashboardLayoutWrapper from "@/components/DashboardLayoutWrapper";
import DashboardTabs from "@/components/DashboardTabs";

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [monthlyRisk, setMonthlyRisk] = useState(0);
  const [monthlyGoal, setMonthlyGoal] = useState(0);
  const [workingDaysInMonth, setWorkingDaysInMonth] = useState(0);
  const [workingDaysRemaining, setWorkingDaysRemaining] = useState(0);
  const [dailyRisk, setDailyRisk] = useState(0);
  const [stopIndice, setStopIndice] = useState(0);
  const [stopDolar, setStopDolar] = useState(0);
  const [accumulatedResult, setAccumulatedResult] = useState(0);
  const [accumulatedDrawdown, setAccumulatedDrawdown] = useState(0);
  const [monthlyResultPercent, setMonthlyResultPercent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentMonthTrades, setCurrentMonthTrades] = useState<Trade[]>([]);
  const [winRate, setWinRate] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const { data: futurosDashboard } = await supabase
          .from('dashboards')
          .select('monthly_risk, monthly_goal')
          .eq('user_id', user.id)
          .eq('type', 'futuros')
          .maybeSingle();

        const userMonthlyRisk = futurosDashboard?.monthly_risk || 0;
        const userMonthlyGoal = (futurosDashboard as any)?.monthly_goal || 0;
        setMonthlyRisk(userMonthlyRisk);
        setMonthlyGoal(userMonthlyGoal);

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
        setCurrentMonthTrades(monthTrades);

        const totalWorkingDays = getWorkingDaysInMonth(currentMonth);
        const remainingWorkingDays = getWorkingDaysRemaining(currentMonth);
        setWorkingDaysInMonth(totalWorkingDays);
        setWorkingDaysRemaining(remainingWorkingDays);

        const monthData = calculateMonthData(userMonthlyRisk, monthTrades, currentMonth, userMonthlyGoal);
        const today = format(new Date(), 'yyyy-MM-dd');
        const todayData = monthData.find(d => format(d.date, 'yyyy-MM-dd') === today);

        if (todayData) {
          setDailyRisk(todayData.dailyRisk);
          setStopIndice(todayData.stopIndice);
          setStopDolar(todayData.stopDolar);
        }

        const stats = calculateMonthlyStats(monthTrades, userMonthlyRisk, userMonthlyGoal);
        setAccumulatedResult(stats.totalResult);
        setWinRate(stats.winRate);

        const totalLoss = monthTrades
          .filter(t => t.result_reais < 0)
          .reduce((sum, t) => sum + t.result_reais, 0);
        setAccumulatedDrawdown(totalLoss);

        const resultPercent = userMonthlyRisk > 0 ? (stats.totalResult / userMonthlyRisk) * 100 : 0;
        setMonthlyResultPercent(resultPercent);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Calculate daily goal in points for the banner
  const dailyGoalValue = monthlyGoal > 0
    ? calculateDailyGoal(monthlyGoal, accumulatedResult, getWorkingDaysRemaining(new Date()))
    : 0;
  const goalPoints = dailyGoalValue > 0 ? calculateGoalPoints(dailyGoalValue) : null;

  // Insight do mês
  const getMonthInsight = () => {
    if (monthlyGoal <= 0) return null;
    const progress = (accumulatedResult / monthlyGoal) * 100;
    if (progress >= 95) return { text: "🎯 Meta praticamente batida!", color: "text-success" };
    if (progress >= 60) return { text: "📈 Acima da média do mês", color: "text-success" };
    if (progress >= 30) return { text: "💪 Ritmo constante", color: "text-primary" };
    return { text: "⚡ Precisa acelerar o ritmo", color: "text-primary" };
  };

  const insight = getMonthInsight();

  return (
    <DashboardLayoutWrapper>
      <div className="container mx-auto px-4 py-8">
        <GreetingBanner 
          user={profile} 
          monthlyGoal={monthlyGoal}
          accumulatedResult={accumulatedResult}
          dailyGoalPoints={goalPoints?.indice || 0}
        />
        <DashboardTabs dashboardType="futuros" />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Gestão de risco e performance em tempo real
          </p>
        </div>

        {/* Status Insight Card */}
        {insight && (
          <Card className="card-glow card-glow-primary p-4 mb-6 flex items-center gap-3">
            <Zap className="w-5 h-5 text-primary" />
            <span className={`text-sm font-medium ${insight.color}`}>{insight.text}</span>
            {dailyGoalValue > 0 && (
              <span className="ml-auto text-xs text-muted-foreground">
                Você precisa fazer <span className="font-mono-trading font-semibold text-primary">{goalPoints?.goalIndice.toFixed(0)} pts/dia</span> para bater sua meta
              </span>
            )}
          </Card>
        )}

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Risco Mensal"
            value={`R$ ${monthlyRisk.toLocaleString()}`}
            subtitle={`${workingDaysInMonth} dias úteis no mês`}
            icon={Shield}
            variant="default"
          />
          
          <StatCard
            title="Risco Diário Atual"
            value={`R$ ${dailyRisk.toFixed(2)}`}
            subtitle={`${workingDaysRemaining} dias úteis restantes`}
            icon={AlertTriangle}
            variant="warning"
          />
          
          <StatCard
            title="Resultado Acumulado"
            value={`R$ ${accumulatedResult.toFixed(2)}`}
            subtitle={`${monthlyResultPercent.toFixed(1)}% do risco mensal`}
            icon={TrendingUp}
            variant={accumulatedResult >= 0 ? "success" : "danger"}
            trend={{
              value: `${monthlyResultPercent.toFixed(1)}%`,
              isPositive: accumulatedResult >= 0
            }}
          />
        </div>

        {/* Stops and Drawdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Stop Índice"
            value={`${stopIndice.toFixed(0)} pts`}
            subtitle="1 ponto = R$ 0,20"
            icon={Target}
            variant="default"
          />
          
          <StatCard
            title="Stop Dólar"
            value={`${stopDolar.toFixed(1)} pts`}
            subtitle="1 ponto = R$ 10,00"
            icon={Target}
            variant="default"
          />
          
          <StatCard
            title="Drawdown Acumulado"
            value={`R$ ${Math.abs(accumulatedDrawdown).toFixed(2)}`}
            subtitle={`${((Math.abs(accumulatedDrawdown) / monthlyRisk) * 100).toFixed(1)}% do risco mensal`}
            icon={Activity}
            variant="danger"
          />
        </div>

        {/* Charts and Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <PnLEvolutionChart userId={user?.id || ""} defaultPeriod="month" showFilters={true} />
          </div>
          
          <RiskCalculator />
        </div>

        {/* Heatmap and Trade Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MonthHeatmap trades={currentMonthTrades} />
          <TradeForm />
        </div>
      </div>
    </DashboardLayoutWrapper>
  );
}
