import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { StockTrade, calculateStockMonthData } from '@/lib/stockRiskCalculations';

interface StockMonthHeatmapProps {
  trades: StockTrade[];
  capitalTotal: number;
  baseRiskPercentual: number;
}

export function StockMonthHeatmap({ trades, capitalTotal, baseRiskPercentual }: StockMonthHeatmapProps) {
  const currentMonth = new Date();
  const monthData = calculateStockMonthData(capitalTotal, baseRiskPercentual, trades, currentMonth);

  // Get the day of week the month starts on (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = startOfMonth(currentMonth);
  const startingDayOfWeek = getDay(firstDayOfMonth);
  // Adjust so Monday = 0, Sunday = 6
  const offset = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

  const getDayColor = (dayTrades: StockTrade[]) => {
    if (!dayTrades.length) return 'bg-card hover:bg-accent';
    const totalResult = dayTrades.reduce((sum, t) => sum + t.resultado_reais, 0);
    if (totalResult > 0) return 'bg-green-500/20 border-green-500/50';
    if (totalResult < 0) return 'bg-red-500/20 border-red-500/50';
    return 'bg-card';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5" />
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground p-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before the month starts */}
          {Array.from({ length: offset }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {/* Actual days of the month */}
          {monthData.map((dayData, index) => {
            const totalResult = dayData.trades.reduce((sum, t) => sum + t.resultado_reais, 0);
            const totalPercent = dayData.trades.reduce((sum, t) => sum + t.resultado_percentual, 0);
            
            return (
              <div
                key={index}
                className={`aspect-square p-1 rounded border transition-all ${getDayColor(dayData.trades)} ${
                  dayData.isWeekend ? 'opacity-30' : ''
                }`}
              >
                <div className="flex flex-col h-full">
                  <span className="text-xs font-medium">{dayData.day}</span>
                  {dayData.trades.length > 0 && (
                    <div className="flex-1 flex flex-col justify-end">
                      <span className={`text-[10px] font-medium ${totalResult >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {totalResult >= 0 ? '+' : ''}{totalPercent.toFixed(1)}%
                      </span>
                    </div>
                  )}
                  {!dayData.isWeekend && dayData.trades.length === 0 && (
                    <div className="flex-1 flex flex-col justify-end">
                      <span className="text-[10px] text-muted-foreground">
                        {dayData.riskPercentual.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/50" />
            <span>Ganho</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/50" />
            <span>Perda</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-card border border-border" />
            <span>Sem trades</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
