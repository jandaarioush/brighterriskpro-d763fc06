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
  Activity
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
  Trade 
} from "@/lib/riskCalculations";
import { format } from "date-fns";
import DashboardLayoutWrapper from "@/components/DashboardLayoutWrapper";

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [monthlyRisk, setMonthlyRisk] = useState(0);
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

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch user profile to get monthly_risk
        const { data: profile } = await supabase
          .from('profiles')
          .select('monthly_risk')
          .eq('id', user.id)
          .single();

        const userMonthlyRisk = profile?.monthly_risk || 0;
        setMonthlyRisk(userMonthlyRisk);

        // Fetch trades for current month
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

        // Calculate working days
        const totalWorkingDays = getWorkingDaysInMonth(currentMonth);
        const remainingWorkingDays = getWorkingDaysRemaining(currentMonth);
        setWorkingDaysInMonth(totalWorkingDays);
        setWorkingDaysRemaining(remainingWorkingDays);

        // Calculate month data to get today's risk and stops
        const monthData = calculateMonthData(userMonthlyRisk, monthTrades, currentMonth);
        const today = format(new Date(), 'yyyy-MM-dd');
        const todayData = monthData.find(d => format(d.date, 'yyyy-MM-dd') === today);

        if (todayData) {
          setDailyRisk(todayData.dailyRisk);
          setStopIndice(todayData.stopIndice);
          setStopDolar(todayData.stopDolar);
        }

        // Calculate monthly stats
        const stats = calculateMonthlyStats(monthTrades, userMonthlyRisk);
        setAccumulatedResult(stats.totalResult);
        
        // Calculate drawdown (accumulated losses)
        const totalLoss = monthTrades
          .filter(t => t.result_reais < 0)
          .reduce((sum, t) => sum + t.result_reais, 0);
        setAccumulatedDrawdown(totalLoss);

        // Calculate percentage
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

  return (
    <DashboardLayoutWrapper>
      <div className="container mx-auto px-4 py-8">
        <GreetingBanner user={profile} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Gestão de risco e performance em tempo real
          </p>
        </div>

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
