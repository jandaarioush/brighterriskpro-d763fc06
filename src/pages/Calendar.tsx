import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, TrendingUp, Target, DollarSign, Calendar as CalendarIcon } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { calculateMonthData, calculateMonthlyStats, Trade } from '@/lib/riskCalculations';
import { MonthlyRiskDialog } from '@/components/MonthlyRiskDialog';
import { QuickTradeDialog } from '@/components/QuickTradeDialog';
import { DailyWeeklyCharts } from '@/components/DailyWeeklyCharts';
import DashboardTabs from '@/components/DashboardTabs';
import { toast } from 'sonner';

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthlyRisk, setMonthlyRisk] = useState<number | null>(null);
  const [monthlyGoal, setMonthlyGoal] = useState<number | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [showRiskDialog, setShowRiskDialog] = useState(false);
  const [showTradeDialog, setShowTradeDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [futurosDashboardId, setFuturosDashboardId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadFuturosDashboard();
      loadTrades();

      // Setup realtime subscription for trades
      const channel = supabase
        .channel('calendar-trades-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'trades',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            // Reload trades when any change happens
            loadTrades();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, currentMonth]);

  const loadFuturosDashboard = async () => {
    const { data } = await supabase
      .from('dashboards')
      .select('id, monthly_risk, monthly_goal')
      .eq('user_id', user?.id)
      .eq('type', 'futuros')
      .maybeSingle();

    if (data) {
      setFuturosDashboardId(data.id);
      setMonthlyRisk(data.monthly_risk);
      setMonthlyGoal((data as any).monthly_goal ?? null);
      if (!data.monthly_risk || data.monthly_risk === 0) {
        setShowRiskDialog(true);
      }
    }
  };

  const loadTrades = async () => {
    const startDate = format(currentMonth, 'yyyy-MM-01');
    const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

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

  const monthData = monthlyRisk ? calculateMonthData(monthlyRisk, trades, currentMonth, monthlyGoal || 0) : [];
  const stats = monthlyRisk ? calculateMonthlyStats(trades, monthlyRisk, monthlyGoal || 0) : null;

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const getDayColor = (trades: Trade[]) => {
    if (!trades.length) return 'bg-card border-border';
    const totalResult = trades.reduce((sum, t) => sum + t.result_reais, 0);
    if (totalResult > 0) return 'bg-green-500/20 border-green-500';
    if (totalResult < 0) return 'bg-red-500/20 border-red-500';
    return 'bg-card border-border';
  };

  const exportReport = () => {
    if (!monthlyRisk || !stats) {
      toast.error('Não há dados para exportar');
      return;
    }

    const monthName = format(currentMonth, 'MMMM_yyyy', { locale: ptBR });
    
    // Header do relatório
    let csvContent = 'Relatório de Trading - Brighter\n';
    csvContent += `Mês: ${format(currentMonth, 'MMMM yyyy', { locale: ptBR })}\n\n`;
    
    // Resumo
    csvContent += 'RESUMO DO MÊS\n';
    csvContent += `Resultado Total (Pontos),${stats.totalResultPoints.toFixed(2)}\n`;
    csvContent += `Resultado Total (R$),${stats.totalResult.toFixed(2)}\n`;
    csvContent += `Taxa de Acerto,${stats.winRate.toFixed(2)}%\n`;
    csvContent += `Wins,${stats.wins}\n`;
    csvContent += `Losses,${stats.losses}\n`;
    csvContent += `Risco Mensal,${monthlyRisk.toFixed(2)}\n`;
    csvContent += `Risco Usado,${stats.riskUsed.toFixed(2)}\n`;
    csvContent += `Risco Usado (%),${stats.riskUsedPercent.toFixed(2)}%\n`;
    csvContent += `Risco Restante,${stats.riskRemaining.toFixed(2)}\n\n`;
    
    // Trades detalhados
    csvContent += 'TRADES DETALHADOS\n';
    csvContent += 'Data,Ativo,Resultado (R$),Resultado (Pontos),Setup,Tag,Nota Disciplina,Observações\n';
    
    trades
      .sort((a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime())
      .forEach(trade => {
        const tradeDate = trade.trade_date.split('-').reverse().join('/');
        const assetType = trade.asset_type === 'indice' ? 'Índice' : 'Dólar';
        const notes = (trade.notes || '').replace(/,/g, ';').replace(/\n/g, ' ');
        
        csvContent += `${tradeDate},${assetType},${trade.result_reais.toFixed(2)},${trade.result_points.toFixed(2)},${trade.setup_utilizado || '-'},${trade.tag || '-'},${trade.nota_disciplina || '-'},${notes}\n`;
      });

    // Criar e fazer download do arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_${monthName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Relatório exportado com sucesso!');
  };

  // Get the day of week the month starts on (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = startOfMonth(currentMonth);
  const startingDayOfWeek = getDay(firstDayOfMonth);
  // Adjust so Monday = 0, Sunday = 6
  const offset = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

  return (
    <div className="min-h-screen bg-background">
      <DashboardTabs dashboardType="futuros" />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 font-montserrat">Gestão de Risco</h1>
          <p className="text-muted-foreground">A gestão de risco Brighter para você</p>
        </div>

        {/* Top Stats */}
        <div className={`grid grid-cols-1 ${monthlyGoal && monthlyGoal > 0 ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-6 mb-8`}>
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

          {monthlyGoal && monthlyGoal > 0 && (
            <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-background border-yellow-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Objetivo Mensal</p>
                  <p className="text-3xl font-bold">{stats?.goalUsedPercent.toFixed(1) || 0}%</p>
                  <p className="text-sm text-yellow-500">
                    R$ {stats?.goalUsed.toFixed(2) || '0.00'} de R$ {monthlyGoal.toFixed(2)}
                  </p>
                </div>
                <Target className="w-8 h-8 text-yellow-500" />
              </div>
            </Card>
          )}
        </div>

        {/* Evolution Charts */}
        <DailyWeeklyCharts trades={trades} currentMonth={currentMonth} monthlyRisk={monthlyRisk || 0} />

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
              
              {monthlyGoal && monthlyGoal > 0 && stats && (
                <>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="text-muted-foreground">Objetivo Mensal</span>
                    <span className="font-semibold text-yellow-500">R$ {monthlyGoal.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(stats.goalUsedPercent, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{stats.goalUsedPercent.toFixed(1)}% atingido</p>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Falta</span>
                    <span className="font-semibold text-yellow-500">R$ {Math.max(0, stats.goalRemaining).toFixed(2)}</span>
                  </div>
                </>
              )}

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
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={exportReport}
              >
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
            {/* Empty cells for days before the month starts */}
            {Array.from({ length: offset }).map((_, index) => (
              <div key={`empty-${index}`} />
            ))}
            
            {/* Actual days of the month */}
            {monthData.map((dayData, index) => {
              const totalPoints = dayData.trades.reduce((sum, t) => sum + t.result_points, 0);
              const totalReais = dayData.trades.reduce((sum, t) => sum + t.result_reais, 0);
              
              return (
                <Card
                  key={index}
                  className={`p-3 min-h-[140px] transition-all hover:shadow-lg border-2 ${getDayColor(dayData.trades)} ${
                    dayData.isWeekend ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-lg">{dayData.day}</span>
                    {!dayData.isWeekend && (
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-6 w-6"
                        onClick={() => {
                          setSelectedDate(new Date(dayData.date));
                          setShowTradeDialog(true);
                        }}
                      >
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
                      {dayData.trades.length > 0 && (
                        <>
                          {dayData.trades.length === 1 ? (
                            <p className={`font-semibold ${totalReais > 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {totalReais > 0 ? '+' : ''}{totalPoints.toFixed(0)} pts
                            </p>
                          ) : (
                            <div className="space-y-0.5">
                              <p className={`font-semibold ${totalReais > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {totalReais > 0 ? '+' : ''}{totalPoints.toFixed(0)} pts ({dayData.trades.length} trades)
                              </p>
                              {dayData.trades.map((trade, idx) => (
                                <p key={trade.id} className={`text-[10px] ${trade.result_reais > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  #{idx + 1}: {trade.result_reais > 0 ? '+' : ''}{trade.result_points.toFixed(0)} pts
                                </p>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </Card>
      </div>

      <MonthlyRiskDialog
        open={showRiskDialog}
        dashboardId={futurosDashboardId || undefined}
        onClose={() => {
          setShowRiskDialog(false);
          loadFuturosDashboard();
        }}
      />

      <QuickTradeDialog
        open={showTradeDialog}
        onClose={() => setShowTradeDialog(false)}
        selectedDate={selectedDate}
        onTradeAdded={() => {
          loadTrades();
          setShowTradeDialog(false);
        }}
      />
    </div>
  );
}
