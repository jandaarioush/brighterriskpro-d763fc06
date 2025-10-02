import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, TrendingUp, Target, DollarSign, Calendar as CalendarIcon } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { calculateMonthData, calculateMonthlyStats, Trade } from '@/lib/riskCalculations';
import { MonthlyRiskDialog } from '@/components/MonthlyRiskDialog';
import { toast } from 'sonner';

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthlyRisk, setMonthlyRisk] = useState<number | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [showRiskDialog, setShowRiskDialog] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadProfile();
      loadTrades();
    }
  }, [user, currentMonth]);

  const loadProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('monthly_risk')
      .eq('id', user?.id)
      .single();

    if (data) {
      setMonthlyRisk(data.monthly_risk);
      if (!data.monthly_risk) {
        setShowRiskDialog(true);
      }
    }
  };

  const loadTrades = async () => {
    const startDate = format(currentMonth, 'yyyy-MM-01');
    const endDate = format(currentMonth, 'yyyy-MM-31');

    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user?.id)
      .gte('trade_date', startDate)
      .lte('trade_date', endDate);

    if (data) {
      setTrades(data as Trade[]);
    }
  };

  const monthData = monthlyRisk ? calculateMonthData(monthlyRisk, trades, currentMonth) : [];
  const stats = monthlyRisk ? calculateMonthlyStats(trades, monthlyRisk) : null;

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const getDayColor = (trade?: Trade) => {
    if (!trade) return 'bg-card border-border';
    if (trade.result_reais > 0) return 'bg-green-500/20 border-green-500';
    return 'bg-red-500/20 border-red-500';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 font-montserrat">Gestão de Risco</h1>
          <p className="text-muted-foreground">A gestão de risco Brighter para você</p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-background border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resultado Mensal</p>
                <p className="text-3xl font-bold">{stats?.totalResultPoints.toFixed(0) || 0} pts</p>
                <p className="text-sm text-green-500">R$ {stats?.totalResult.toFixed(2) || '0.00'}</p>
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
                <p className="text-sm text-muted-foreground">Risco Usado</p>
                <p className="text-3xl font-bold">{stats?.riskUsedPercent.toFixed(1) || 0}%</p>
                <p className="text-sm text-muted-foreground">
                  R$ {stats?.riskUsed.toFixed(2) || '0.00'} de R$ {monthlyRisk?.toFixed(2) || '0.00'}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </Card>
        </div>

        {/* Evolution Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Evolução Diária</h3>
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              Nenhum trade registrado ainda
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Evolução Semanal</h3>
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              Nenhum trade registrado ainda
            </div>
          </Card>
        </div>

        {/* Summary and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Resumo do Mês
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Resultado Total</span>
                <span className="font-semibold text-green-500">+{stats?.totalResultPoints || 0} pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground"></span>
                <span className="font-medium">R$ {stats?.totalResult.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Risco Usado</span>
                <span className="font-semibold">R$ {stats?.riskUsed.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">de R$ {monthlyRisk?.toFixed(2) || '0.00'} disponível</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(stats?.riskUsedPercent || 0, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{stats?.riskUsedPercent.toFixed(1)}% utilizado</p>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="text-muted-foreground">Risco Restante</span>
                <span className="font-semibold">R$ {stats?.riskRemaining.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxa de Acerto</span>
                <span className="font-semibold">{stats?.winRate.toFixed(1)}%</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Estatísticas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-green-500/10">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-green-500">{stats?.wins || 0}</p>
                <p className="text-sm text-muted-foreground">Wins</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-red-500/10">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-6 h-6 text-red-500 rotate-180" />
                </div>
                <p className="text-2xl font-bold text-red-500">{stats?.losses || 0}</p>
                <p className="text-sm text-muted-foreground">Losses</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowRiskDialog(true)}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Alterar Risco Mensal
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Target className="w-4 h-4 mr-2" />
                Exportar Relatório
              </Button>
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
            {monthData.map((dayData, index) => (
              <Card
                key={index}
                className={`p-3 min-h-[120px] transition-all hover:shadow-lg border-2 ${getDayColor(dayData.trade)} ${
                  dayData.isWeekend ? 'opacity-50' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-lg">{dayData.day}</span>
                  {!dayData.isWeekend && (
                    <Button size="icon" variant="ghost" className="h-6 w-6">
                      +
                    </Button>
                  )}
                </div>
                {!dayData.isWeekend && (
                  <div className="space-y-1 text-xs">
                    <p className="text-muted-foreground">
                      Stop Índice: <span className="font-medium">{dayData.stopIndice.toFixed(0)} pts/contrato</span>
                    </p>
                    <p className="text-muted-foreground">
                      Stop Dólar: <span className="font-medium">{dayData.stopDolar.toFixed(0)} pts/contrato</span>
                    </p>
                    {dayData.trade && (
                      <p className={`font-semibold ${dayData.trade.result_reais > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {dayData.trade.result_reais > 0 ? '+' : ''}{dayData.trade.result_points.toFixed(0)} pts
                      </p>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </Card>
      </div>

      <MonthlyRiskDialog
        open={showRiskDialog}
        onClose={() => {
          setShowRiskDialog(false);
          loadProfile();
        }}
      />
    </div>
  );
}
