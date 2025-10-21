import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, format } from "date-fns";

interface Trade {
  id: string;
  trade_date: string;
  result_reais: number;
}

interface DayResult {
  day: number;
  totalResult: number;
  isWeekend: boolean;
  date: string;
  tradesCount: number;
}

interface MonthHeatmapProps {
  trades: Trade[];
}

export function MonthHeatmap({ trades }: MonthHeatmapProps) {
  const currentMonth = new Date();
  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const allDays = eachDayOfInterval({ start, end });

  const monthData: DayResult[] = allDays.map((date, index) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayTrades = trades.filter(t => t.trade_date === dateStr);
    const totalResult = dayTrades.reduce((sum, t) => sum + t.result_reais, 0);
    
    return {
      day: index + 1,
      totalResult: dayTrades.length > 0 ? totalResult : 0,
      isWeekend: isWeekend(date),
      date: dateStr,
      tradesCount: dayTrades.length
    };
  });

  const getColorClass = (totalResult: number, isWeekend: boolean, tradesCount: number) => {
    // Days without trades or weekends have no background
    if (tradesCount === 0 || isWeekend) return "bg-transparent border border-border/30";
    
    // Color based on profit/loss intensity
    if (totalResult > 200) return "bg-success hover:bg-success/90";
    if (totalResult > 0) return "bg-success/60 hover:bg-success/70";
    if (totalResult < -200) return "bg-danger hover:bg-danger/90";
    if (totalResult < 0) return "bg-danger/60 hover:bg-danger/70";
    return "bg-muted hover:bg-muted/80";
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Consistência Mensal</h3>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {monthData.map((day) => (
          <div
            key={day.day}
            className={`
              aspect-square rounded-md flex items-center justify-center
              text-sm font-medium transition-all cursor-pointer
              ${getColorClass(day.totalResult, day.isWeekend, day.tradesCount)}
            `}
            title={
              day.tradesCount > 0
                ? `Dia ${day.day}: ${day.tradesCount} trade(s) - R$ ${day.totalResult.toFixed(2)}`
                : `Dia ${day.day}: Sem trade`
            }
          >
            {day.day}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-success" />
          <span>Lucro alto</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-success/60" />
          <span>Lucro</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-danger/60" />
          <span>Perda</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-danger" />
          <span>Perda alta</span>
        </div>
      </div>
    </Card>
  );
}
