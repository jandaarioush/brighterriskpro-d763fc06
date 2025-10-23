import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface Trade {
  id: string;
  trade_date: string;
  asset_type: 'indice' | 'dolar';
  result_reais: number;
  result_points: number;
  notes?: string;
  setup_utilizado?: string;
  tag?: string;
  nota_disciplina?: number;
}

export interface ChartDataPoint {
  date: string;
  dateLabel: string;
  dailyResult: number;
  cumulativeResult: number;
  tradesCount: number;
  wins: number;
  losses: number;
}

export function processEvolutionData(
  trades: Trade[],
  startDate: Date,
  endDate: Date
): ChartDataPoint[] {
  const sortedTrades = [...trades].sort(
    (a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
  );

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  let cumulativeResult = 0;
  const dataPoints: ChartDataPoint[] = [];

  days.forEach((day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayTrades = sortedTrades.filter((t) => t.trade_date === dateStr);
    
    const dailyResult = dayTrades.reduce((sum, t) => sum + t.result_reais, 0);
    const wins = dayTrades.filter((t) => t.result_reais > 0).length;
    const losses = dayTrades.filter((t) => t.result_reais < 0).length;
    
    cumulativeResult += dailyResult;

    dataPoints.push({
      date: dateStr,
      dateLabel: format(day, 'dd/MM', { locale: ptBR }),
      dailyResult,
      cumulativeResult,
      tradesCount: dayTrades.length,
      wins,
      losses,
    });
  });

  return dataPoints;
}

export function groupTradesByDay(trades: Trade[]): Map<string, Trade[]> {
  const grouped = new Map<string, Trade[]>();
  
  trades.forEach((trade) => {
    const existing = grouped.get(trade.trade_date) || [];
    grouped.set(trade.trade_date, [...existing, trade]);
  });

  return grouped;
}

export function groupTradesByWeek(trades: Trade[], month: Date): ChartDataPoint[] {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  
  const weeks: Map<string, Trade[]> = new Map();
  
  trades.forEach((trade) => {
    const tradeDate = parseISO(trade.trade_date);
    const weekStart = startOfWeek(tradeDate, { locale: ptBR });
    const weekKey = format(weekStart, 'yyyy-MM-dd');
    
    const existing = weeks.get(weekKey) || [];
    weeks.set(weekKey, [...existing, trade]);
  });

  const weekDataPoints: ChartDataPoint[] = [];
  let weekNumber = 1;

  weeks.forEach((weekTrades, weekKey) => {
    const weekStart = parseISO(weekKey);
    const weekEnd = endOfWeek(weekStart, { locale: ptBR });
    
    const dailyResult = weekTrades.reduce((sum, t) => sum + t.result_reais, 0);
    const wins = weekTrades.filter((t) => t.result_reais > 0).length;
    const losses = weekTrades.filter((t) => t.result_reais < 0).length;

    weekDataPoints.push({
      date: weekKey,
      dateLabel: `Semana ${weekNumber}`,
      dailyResult,
      cumulativeResult: 0, // Not used for weekly view
      tradesCount: weekTrades.length,
      wins,
      losses,
    });

    weekNumber++;
  });

  return weekDataPoints.sort((a, b) => a.date.localeCompare(b.date));
}

export function calculateCumulativePnL(trades: Trade[]): number[] {
  const sortedTrades = [...trades].sort(
    (a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
  );

  let cumulative = 0;
  return sortedTrades.map((trade) => {
    cumulative += trade.result_reais;
    return cumulative;
  });
}
