import { startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, format } from 'date-fns';

export interface StockTrade {
  id: string;
  user_id: string;
  dashboard_id: string;
  trade_date: string;
  ticker: string;
  modalidade: 'daytrade' | 'swing';
  preco_entrada: number;
  preco_saida: number;
  quantidade: number;
  alavancagem: number;
  resultado_reais: number;
  resultado_percentual: number;
  corretagem: number;
  capital_utilizado: number;
  risco_percentual: number;
  setup_utilizado?: string;
  tag?: string;
  nota_disciplina?: number;
  notes?: string;
  screenshot_url?: string;
}

export interface StockDayRiskData {
  date: Date;
  day: number;
  riskPercentual: number;
  capitalAtRisk: number;
  trades: StockTrade[];
  isWeekend: boolean;
}

export function getWorkingDaysInMonth(date: Date): number {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const days = eachDayOfInterval({ start, end });
  return days.filter(day => !isWeekend(day)).length;
}

export function getWorkingDaysRemaining(date: Date): number {
  const today = new Date();
  const end = endOfMonth(date);
  const days = eachDayOfInterval({ start: today, end });
  return days.filter(day => !isWeekend(day)).length;
}

// Calculate trade result
export function calculateTradeResult(
  precoEntrada: number,
  precoSaida: number,
  quantidade: number,
  alavancagem: number,
  corretagem: number = 0
): { resultadoReais: number; resultadoPercentual: number } {
  const capitalBase = precoEntrada * quantidade;
  const capitalAlavancado = capitalBase * alavancagem;
  const diferenca = (precoSaida - precoEntrada) * quantidade * alavancagem;
  const resultadoReais = diferenca - corretagem;
  const resultadoPercentual = capitalAlavancado > 0 ? (resultadoReais / capitalAlavancado) * 100 : 0;
  
  return { resultadoReais, resultadoPercentual };
}

// Calculate daily risk based on last trade's risk percentage
export function calculateDailyStockRisk(
  capitalTotal: number,
  riskPercentual: number,
  accumulatedLossPercent: number,
  workingDaysRemaining: number
): { dailyRiskPercent: number; dailyRiskValue: number } {
  if (workingDaysRemaining === 0) return { dailyRiskPercent: 0, dailyRiskValue: 0 };
  
  const adjustedRisk = riskPercentual - Math.abs(accumulatedLossPercent);
  const dailyRiskPercent = adjustedRisk / workingDaysRemaining;
  const dailyRiskValue = (dailyRiskPercent / 100) * capitalTotal;
  
  return { dailyRiskPercent, dailyRiskValue };
}

// Calculate month data for stocks dashboard
export function calculateStockMonthData(
  capitalTotal: number,
  baseRiskPercentual: number,
  trades: StockTrade[],
  currentMonth: Date
): StockDayRiskData[] {
  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const allDays = eachDayOfInterval({ start, end });
  
  const workingDaysInMonth = getWorkingDaysInMonth(currentMonth);
  const dayDataArray: StockDayRiskData[] = [];
  
  let accumulatedLossPercent = 0;
  let workingDaysProcessed = 0;

  allDays.forEach((date, index) => {
    const isWeekendDay = isWeekend(date);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayTrades = trades.filter(t => t.trade_date === dateStr);

    if (!isWeekendDay) {
      workingDaysProcessed++;
    }

    const workingDaysRemaining = workingDaysInMonth - workingDaysProcessed + 1;
    const { dailyRiskPercent, dailyRiskValue } = calculateDailyStockRisk(
      capitalTotal,
      baseRiskPercentual,
      accumulatedLossPercent,
      workingDaysRemaining
    );

    dayDataArray.push({
      date,
      day: index + 1,
      riskPercentual: dailyRiskPercent,
      capitalAtRisk: dailyRiskValue,
      trades: dayTrades,
      isWeekend: isWeekendDay,
    });

    // Update accumulated loss for next day
    const dayLoss = dayTrades
      .filter(t => t.resultado_percentual < 0)
      .reduce((sum, t) => sum + Math.abs(t.resultado_percentual), 0);
    
    if (dayLoss > 0) {
      accumulatedLossPercent += dayLoss;
    }
  });

  return dayDataArray;
}

// Calculate monthly stats for stocks
export function calculateStockMonthlyStats(trades: StockTrade[], baseRiskPercentual: number, capitalTotal: number) {
  const totalResultReais = trades.reduce((sum, t) => sum + t.resultado_reais, 0);
  const totalResultPercentual = trades.reduce((sum, t) => sum + t.resultado_percentual, 0);
  const wins = trades.filter(t => t.resultado_reais > 0).length;
  const losses = trades.filter(t => t.resultado_reais < 0).length;
  const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0;
  
  const totalLossPercent = trades
    .filter(t => t.resultado_percentual < 0)
    .reduce((sum, t) => sum + Math.abs(t.resultado_percentual), 0);
  
  const riskUsedPercent = totalLossPercent;
  const riskRemainingPercent = baseRiskPercentual - riskUsedPercent;
  const riskUsedValue = (riskUsedPercent / 100) * capitalTotal;
  const riskRemainingValue = (riskRemainingPercent / 100) * capitalTotal;

  return {
    totalResultReais,
    totalResultPercentual,
    wins,
    losses,
    winRate,
    riskUsedPercent,
    riskRemainingPercent,
    riskUsedValue,
    riskRemainingValue,
  };
}

// Get last used risk percentage from trades
export function getLastUsedRiskPercentual(trades: StockTrade[]): number {
  if (trades.length === 0) return 8; // Default 8%
  
  const sortedTrades = [...trades].sort((a, b) => 
    new Date(b.trade_date).getTime() - new Date(a.trade_date).getTime()
  );
  
  return sortedTrades[0].risco_percentual || 8;
}
