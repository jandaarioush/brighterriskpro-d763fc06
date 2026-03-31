import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, TrendingUp, Target, DollarSign, Calendar as CalendarIcon, Zap } from 'lucide-react';
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
import { KpiValue } from '@/components/KpiValue';
import { formatNumberBR, formatCurrencyBR } from '@/lib/formatting';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

      const channel = supabase
        .channel('calendar-trades-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'trades', filter: `user_id=eq.${user.id}` }, () => { loadTrades(); })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
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

    const { data } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user?.id)
      .gte('trade_date', startDate)
      .lte('trade_date', endDate);

    if (data) setTrades(data as Trade[]);
  };

  const monthData = monthlyRisk ? calculateMonthData(monthlyRisk, trades, currentMonth, monthlyGoal || 0) : [];
  const stats = monthlyRisk ? calculateMonthlyStats(trades, monthlyRisk, monthlyGoal || 0) : null;

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Semantic day color for trading journal
  const getDayStyle = (dayTrades: Trade[], dailyGoal: number) => {
    if (!dayTrades.length) return { bg: 'bg-secondary/20', border: 'border-border/30', glow: '' };
    const totalResult = dayTrades.reduce((sum, t) => sum + t.result_reais, 0);
    if (totalResult >= dailyGoal && dailyGoal > 0) {
      // Meta batida — green glow
      return { bg: 'bg-success/15', border: 'border-success/40', glow: 'shadow-[0_0_12px_hsl(var(--success)/0.15)]' };
    }
    if (totalResult > 0) {
      // Positivo mas abaixo da meta — gold
      return { bg: 'bg-primary/10', border: 'border-primary/30', glow: '' };
    }
    if (totalResult < 0) {
      // Prejuízo — red
      return { bg: 'bg-danger/15', border: 'border-danger/40', glow: 'shadow-[0_0_12px_hsl(var(--danger)/0.15)]' };
    }
    return { bg: 'bg-secondary/20', border: 'border-border/30', glow: '' };
  };

  const exportReport = () => {
    if (!monthlyRisk || !stats) {
      toast.error('Não há dados para exportar');
      return;
    }
    const monthName = format(currentMonth, 'MMMM_yyyy', { locale: ptBR });
    let csvContent = 'Relatório de Trading - Brighter\n';
    csvContent += `Mês: ${format(currentMonth, 'MMMM yyyy', { locale: ptBR })}\n\n`;
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

  const firstDayOfMonth = startOfMonth(currentMonth);
  const startingDayOfWeek = getDay(firstDayOfMonth);
  const offset = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

  // Insight
  const getInsight = () => {
    if (!stats || !monthlyGoal || monthlyGoal <= 0) return null;
    const p = stats.goalUsedPercent;
    if (p >= 95) return { text: "🎯 Meta praticamente batida!", color: "text-success" };
    if (p >= 60) return { text: "📈 Acima da média do mês", color: "text-success" };
    if (p >= 30) return { text: "💪 Ritmo constante, continue assim", color: "text-primary" };
    return { text: "⚡ Precisa acelerar o ritmo", color: "text-primary" };
  };
  const insight = getInsight();

  return (
    <div className="min-h-screen bg-background">
      <DashboardTabs dashboardType="futuros" />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-1">Gestão de Risco</p>
          <h1 className="text-4xl font-bold mb-2 font-montserrat">Calendário de Trading</h1>
          <p className="text-muted-foreground">A gestão de risco Brighter para você</p>
        </div>

        {/* Goal Progress Bar */}
        {monthlyGoal && monthlyGoal > 0 && stats && (
          <Card className="card-glow card-glow-primary p-5 mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Progresso da Meta</span>
              </div>
              {insight && <span className={`text-xs font-medium ${insight.color}`}>{insight.text}</span>}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary progress-glow transition-all duration-700"
                    style={{ width: `${Math.min(stats.goalUsedPercent, 100)}%` }}
                  />
                </div>
              </div>
              <span className="text-lg font-bold font-mono-trading text-primary min-w-[60px] text-right">
                {stats.goalUsedPercent.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>R$ {stats.goalUsed.toFixed(2)} atingido</span>
              <span>Falta R$ {Math.max(0, stats.goalRemaining).toFixed(2)}</span>
            </div>
          </Card>
        )}

        {/* Top Stats */}
        <div className={`grid grid-cols-1 ${monthlyGoal && monthlyGoal > 0 ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-6 mb-8`}>
          <Card className="p-6 card-glow card-glow-success">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Resultado Mensal</p>
                <p className="text-3xl font-bold font-mono-trading mt-1 animate-count-up">{stats?.totalResultPoints.toFixed(0) || 0} pts</p>
                <p className="text-sm text-success mt-1">R$ {stats?.totalResult.toFixed(2) || '0.00'}</p>
              </div>
              <TrendingUp className="w-6 h-6 text-success/40" />
            </div>
          </Card>

          <Card className="p-6 card-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Taxa de Acerto</p>
                <p className="text-3xl font-bold font-mono-trading mt-1 animate-count-up">{stats?.winRate.toFixed(1) || 0}%</p>
                <p className="text-sm text-muted-foreground mt-1">{stats?.wins || 0}W / {stats?.losses || 0}L</p>
              </div>
              <Target className="w-6 h-6 text-primary/40" />
            </div>
          </Card>

          <Card className="p-6 card-glow card-glow-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Risco Usado</p>
                <p className="text-3xl font-bold font-mono-trading mt-1 animate-count-up">{stats?.riskUsedPercent.toFixed(1) || 0}%</p>
                <p className="text-sm text-muted-foreground mt-1">
                  R$ {stats?.riskUsed.toFixed(2) || '0.00'} de R$ {monthlyRisk?.toFixed(2) || '0.00'}
                </p>
              </div>
              <DollarSign className="w-6 h-6 text-primary/40" />
            </div>
          </Card>

          {monthlyGoal && monthlyGoal > 0 && (
            <Card className="p-6 card-glow card-glow-primary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Objetivo Mensal</p>
                  <p className="text-3xl font-bold font-mono-trading mt-1 animate-count-up">{stats?.goalUsedPercent.toFixed(1) || 0}%</p>
                  <p className="text-sm text-primary mt-1">
                    R$ {stats?.goalUsed.toFixed(2) || '0.00'} de R$ {monthlyGoal.toFixed(2)}
                  </p>
                </div>
                <Target className="w-6 h-6 text-primary/40" />
              </div>
            </Card>
          )}
        </div>

        {/* Evolution Charts */}
        <DailyWeeklyCharts trades={trades} currentMonth={currentMonth} monthlyRisk={monthlyRisk || 0} />

        {/* Summary and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 card-glow">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Resumo do Mês
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Resultado Total</span>
                <span className="font-semibold font-mono-trading text-success">+{stats?.totalResultPoints || 0} pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground"></span>
                <span className="font-medium font-mono-trading">R$ {stats?.totalResult.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Risco Usado</span>
                <span className="font-semibold font-mono-trading">R$ {stats?.riskUsed.toFixed(2) || '0.00'}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(stats?.riskUsedPercent || 0, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{stats?.riskUsedPercent.toFixed(1)}% utilizado</p>
              
              {monthlyGoal && monthlyGoal > 0 && stats && (
                <>
                  <div className="flex justify-between pt-2 border-t border-border/50">
                    <span className="text-muted-foreground">Objetivo Mensal</span>
                    <span className="font-semibold font-mono-trading text-primary">R$ {monthlyGoal.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-2 rounded-full progress-glow transition-all duration-500"
                      style={{ width: `${Math.min(stats.goalUsedPercent, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{stats.goalUsedPercent.toFixed(1)}% atingido</p>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Falta</span>
                    <span className="font-semibold font-mono-trading text-primary">R$ {Math.max(0, stats.goalRemaining).toFixed(2)}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between pt-2 border-t border-border/50">
                <span className="text-muted-foreground">Risco Restante</span>
                <span className="font-semibold font-mono-trading">R$ {stats?.riskRemaining.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxa de Acerto</span>
                <span className="font-semibold font-mono-trading">{stats?.winRate.toFixed(1)}%</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 card-glow">
            <h3 className="text-lg font-semibold mb-4">Estatísticas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-success/10 border border-success/20">
                <TrendingUp className="w-5 h-5 text-success mx-auto mb-2 opacity-60" />
                <p className="text-2xl font-bold font-mono-trading text-success">{stats?.wins || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Wins</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-danger/10 border border-danger/20">
                <TrendingUp className="w-5 h-5 text-danger rotate-180 mx-auto mb-2 opacity-60" />
                <p className="text-2xl font-bold font-mono-trading text-danger">{stats?.losses || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Losses</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 card-glow">
            <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start hover:border-primary/30 hover:bg-primary/5 transition-all"
                onClick={() => setShowRiskDialog(true)}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Alterar Risco Mensal
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start hover:border-primary/30 hover:bg-primary/5 transition-all"
                onClick={exportReport}
              >
                <Target className="w-4 h-4 mr-2" />
                Exportar Relatório
              </Button>
            </div>
          </Card>
        </div>

        {/* Calendar */}
        <Card className="p-6 card-glow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold font-montserrat">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handlePrevMonth} className="hover:border-primary/30">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth} className="hover:border-primary/30">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-success/15 border border-success/40" />
              <span>Meta batida</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-primary/10 border border-primary/30" />
              <span>Abaixo da meta</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-danger/15 border border-danger/40" />
              <span>Prejuízo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-secondary/20 border border-border/30" />
              <span>Não operou</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => (
              <div key={day} className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: offset }).map((_, index) => (
              <div key={`empty-${index}`} />
            ))}
            
            {monthData.map((dayData, index) => {
              const totalPoints = dayData.trades.reduce((sum, t) => sum + t.result_points, 0);
              const totalReais = dayData.trades.reduce((sum, t) => sum + t.result_reais, 0);
              const dailyGoalValue = monthlyGoal && monthlyGoal > 0 ? dayData.goalIndice * 0.2 : 0; // convert back to R$
              const style = getDayStyle(dayData.trades, dailyGoalValue);
              
              return (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <Card
                      className={`p-3 min-h-[140px] transition-all border ${style.bg} ${style.border} ${style.glow} ${
                        dayData.isWeekend ? 'opacity-40' : 'hover:scale-[1.02] cursor-pointer'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-lg font-mono-trading">{dayData.day}</span>
                        {!dayData.isWeekend && (
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6 opacity-40 hover:opacity-100"
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
                            Stop Índ: <span className="font-mono-trading font-medium">{dayData.stopIndice.toFixed(0)}</span>
                          </p>
                          <p className="text-muted-foreground">
                            Stop Dól: <span className="font-mono-trading font-medium">{dayData.stopDolar.toFixed(0)}</span>
                          </p>
                          {monthlyGoal && monthlyGoal > 0 && (
                            <>
                              <p className="text-primary">
                                Meta Índ: <span className="font-mono-trading font-medium">{dayData.goalIndice.toFixed(0)}</span>
                              </p>
                              <p className="text-primary">
                                Meta Dól: <span className="font-mono-trading font-medium">{dayData.goalDolar.toFixed(0)}</span>
                              </p>
                            </>
                          )}
                          {dayData.trades.length > 0 && (
                            <>
                              {dayData.trades.length === 1 ? (
                                <p className={`font-semibold font-mono-trading ${totalReais > 0 ? 'text-success' : 'text-danger'}`}>
                                  {totalReais > 0 ? '+' : ''}{totalPoints.toFixed(0)} pts
                                </p>
                              ) : (
                                <div className="space-y-0.5">
                                  <p className={`font-semibold font-mono-trading ${totalReais > 0 ? 'text-success' : 'text-danger'}`}>
                                    {totalReais > 0 ? '+' : ''}{totalPoints.toFixed(0)} pts ({dayData.trades.length})
                                  </p>
                                  {dayData.trades.map((trade, idx) => (
                                    <p key={trade.id} className={`text-[10px] font-mono-trading ${trade.result_reais > 0 ? 'text-success/70' : 'text-danger/70'}`}>
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
                  </TooltipTrigger>
                  {!dayData.isWeekend && dayData.trades.length > 0 && (
                    <TooltipContent side="top" className="tooltip-glass">
                      <div className="space-y-1">
                        <p className="font-semibold">Dia {dayData.day}</p>
                        <p className="font-mono-trading text-sm">
                          <span className={totalReais >= 0 ? 'text-success' : 'text-danger'}>
                            R$ {totalReais.toFixed(2)}
                          </span>
                          {' · '}
                          {totalPoints.toFixed(0)} pts
                        </p>
                        <p className="text-xs text-muted-foreground">{dayData.trades.length} trade(s)</p>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
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
