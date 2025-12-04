import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, TrendingUp, Target, DollarSign, Calendar as CalendarIcon } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { calculateStockMonthData, calculateStockMonthlyStats, StockTrade } from '@/lib/stockRiskCalculations';
import DashboardLayoutWrapper from '@/components/DashboardLayoutWrapper';
import DashboardTabs from '@/components/DashboardTabs';
import { toast } from 'sonner';

interface Dashboard {
  id: string;
  name: string;
  type: 'futuros' | 'acoes' | 'internacional';
  monthly_risk: number;
}

export default function StockCalendar() {
  const { dashboardId } = useParams<{ dashboardId: string }>();
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [trades, setTrades] = useState<StockTrade[]>([]);
  const [capitalTotal, setCapitalTotal] = useState(0);
  const [riskPercentual, setRiskPercentual] = useState(8);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && dashboardId) {
      loadData();
    }
  }, [user, dashboardId, currentMonth]);

  const loadData = async () => {
    try {
      // Load dashboard
      const { data: dashData } = await supabase
        .from('dashboards')
        .select('id, name, type, monthly_risk')
        .eq('id', dashboardId)
        .single();

      if (dashData) {
        setDashboard(dashData as Dashboard);
        // monthly_risk here is treated as capital total for stock dashboards
        setCapitalTotal(dashData.monthly_risk || 0);
      }

      // Load trades for current month
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
        setTrades(tradesData as StockTrade[]);
        // Get risk percentual from last trade or default to 8%
        if (tradesData.length > 0) {
          setRiskPercentual(tradesData[tradesData.length - 1].risco_percentual || 8);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthData = capitalTotal > 0 ? calculateStockMonthData(capitalTotal, riskPercentual, trades, currentMonth) : [];
  const stats = capitalTotal > 0 ? calculateStockMonthlyStats(trades, riskPercentual, capitalTotal) : null;

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const getDayColor = (dayTrades: StockTrade[]) => {
    if (!dayTrades.length) return 'bg-card border-border';
    const totalResult = dayTrades.reduce((sum, t) => sum + t.resultado_reais, 0);
    if (totalResult > 0) return 'bg-green-500/20 border-green-500';
    if (totalResult < 0) return 'bg-red-500/20 border-red-500';
    return 'bg-card border-border';
  };

  const firstDayOfMonth = startOfMonth(currentMonth);
  const startingDayOfWeek = getDay(firstDayOfMonth);
  const offset = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

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
          <h1 className="text-4xl font-bold mb-2 font-montserrat">Calendário - {dashboard?.name}</h1>
          <p className="text-muted-foreground">Gestão de risco baseada em % do capital</p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-background border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resultado Mensal</p>
                <p className="text-3xl font-bold">R$ {stats?.totalResultReais.toFixed(2) || '0.00'}</p>
                <p className="text-sm text-green-500">{stats?.totalResultPercentual.toFixed(2) || '0.00'}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-background border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Acerto</p>
                <p className="text-3xl font-bold">{stats?.winRate.toFixed(1) || 0}%</p>
                <p className="text-sm text-muted-foreground">{stats?.wins || 0}W / {stats?.losses || 0}L</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-primary/10 to-background border-primary/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Capital Total</p>
                <p className="text-3xl font-bold">R$ {capitalTotal.toLocaleString('pt-BR')}</p>
                <p className="text-sm text-muted-foreground">Risco base: {riskPercentual}%</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </Card>
        </div>

        {/* Calendar */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold font-montserrat">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: offset }).map((_, index) => (
              <div key={`empty-${index}`} />
            ))}
            
            {monthData.map((dayData, index) => {
              const dayTrades = trades.filter(t => t.trade_date === format(dayData.date, 'yyyy-MM-dd'));
              const totalReais = dayTrades.reduce((sum, t) => sum + t.resultado_reais, 0);
              const totalPercent = dayTrades.reduce((sum, t) => sum + t.resultado_percentual, 0);
              
              return (
                <Card
                  key={index}
                  className={`p-3 min-h-[120px] transition-all hover:shadow-lg border-2 ${getDayColor(dayTrades)} ${
                    dayData.isWeekend ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-lg">{dayData.day}</span>
                  </div>
                  {!dayData.isWeekend && (
                    <div className="space-y-1 text-xs">
                      <p className="text-muted-foreground">
                        Risco: <span className="font-medium">{dayData.riskPercentual.toFixed(1)}%</span>
                      </p>
                      <p className="text-muted-foreground">
                        R$ <span className="font-medium">{dayData.capitalAtRisk.toFixed(0)}</span>
                      </p>
                      {dayTrades.length > 0 && (
                        <p className={`font-semibold ${totalReais > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {totalReais > 0 ? '+' : ''}R$ {totalReais.toFixed(2)}
                        </p>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </Card>
      </div>
    </DashboardLayoutWrapper>
  );
}
