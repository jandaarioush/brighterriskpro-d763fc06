import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatUSD } from '@/lib/internationalRiskCalculations';

interface InternationalTrade {
  id: string;
  trade_date: string;
  resultado_usd: number;
  resultado_brl: number;
}

interface InternationalMonthHeatmapProps {
  trades: InternationalTrade[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function InternationalMonthHeatmap({
  trades,
  selectedDate,
  onDateChange,
}: InternationalMonthHeatmapProps) {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Group trades by date
  const tradesByDate = useMemo(() => {
    const grouped: Record<string, number> = {};
    trades.forEach((trade) => {
      const dateKey = trade.trade_date;
      grouped[dateKey] = (grouped[dateKey] || 0) + trade.resultado_usd;
    });
    return grouped;
  }, [trades]);

  // Calculate color intensity
  const getColorClass = (result: number | undefined) => {
    if (result === undefined) return 'bg-muted/30';
    if (result > 0) {
      if (result > 100) return 'bg-success/80 text-success-foreground';
      if (result > 50) return 'bg-success/60 text-success-foreground';
      return 'bg-success/40';
    } else if (result < 0) {
      if (result < -100) return 'bg-destructive/80 text-destructive-foreground';
      if (result < -50) return 'bg-destructive/60 text-destructive-foreground';
      return 'bg-destructive/40';
    }
    return 'bg-muted/50';
  };

  // Get first day offset
  const firstDayOffset = getDay(monthStart);

  // Month navigation
  const goToPreviousMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };

  // Calculate monthly totals
  const monthlyTotal = useMemo(() => {
    return Object.values(tradesByDate).reduce((sum, val) => sum + val, 0);
  }, [tradesByDate]);

  const tradingDays = Object.keys(tradesByDate).length;
  const winningDays = Object.values(tradesByDate).filter((v) => v > 0).length;

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Heatmap Mensal</h3>
          <p className="text-sm text-muted-foreground">
            Resultado diário em USD
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            ←
          </button>
          <span className="font-medium min-w-[150px] text-center">
            {format(selectedDate, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            →
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
          <div key={day} className="text-center text-xs text-muted-foreground font-medium py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for offset */}
        {Array.from({ length: firstDayOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Day cells */}
        {daysInMonth.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const result = tradesByDate[dateKey];
          const colorClass = getColorClass(result);

          return (
            <div
              key={dateKey}
              className={`aspect-square rounded-md flex flex-col items-center justify-center text-xs cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 ${colorClass}`}
              title={result !== undefined ? formatUSD(result) : 'Sem trades'}
            >
              <span className="font-medium">{format(day, 'd')}</span>
              {result !== undefined && (
                <span className="text-[10px] truncate max-w-full px-1">
                  {result >= 0 ? '+' : ''}{result.toFixed(0)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Total do Mês</p>
          <p className={`text-lg font-bold ${monthlyTotal >= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatUSD(monthlyTotal)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Dias Operados</p>
          <p className="text-lg font-bold">{tradingDays}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Dias Positivos</p>
          <p className="text-lg font-bold text-success">
            {winningDays} ({tradingDays > 0 ? ((winningDays / tradingDays) * 100).toFixed(0) : 0}%)
          </p>
        </div>
      </div>
    </Card>
  );
}
