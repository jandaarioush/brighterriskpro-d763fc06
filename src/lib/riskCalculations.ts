import { startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, format } from 'date-fns';

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

export interface DayRiskData {
  date: Date;
  day: number;
  dailyRisk: number;
  stopIndice: number;
  stopDolar: number;
  dailyGoal: number;
  goalIndice: number;
  goalDolar: number;
  trades: Trade[];
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

export function calculateDailyRisk(
  monthlyRisk: number,
  accumulatedLoss: number,
  workingDaysRemaining: number
): number {
  if (workingDaysRemaining === 0) return 0;
  const adjustedRisk = monthlyRisk - Math.abs(accumulatedLoss);
  return adjustedRisk / workingDaysRemaining;
}

export function calculateStopPoints(dailyRisk: number): { indice: number; dolar: number } {
  return {
    indice: dailyRisk / 0.2,
    dolar: dailyRisk / 10,
  };
}

export function calculateDailyGoal(
  monthlyGoal: number,
  accumulatedProfit: number,
  workingDaysRemaining: number
): number {
  if (workingDaysRemaining === 0) return 0;
  const goalRemaining = monthlyGoal - accumulatedProfit;
  return Math.max(0, goalRemaining / workingDaysRemaining);
}

export function calculateGoalPoints(dailyGoal: number): { indice: number; dolar: number } {
  return {
    indice: dailyGoal / 0.2,
    dolar: dailyGoal / 10,
  };
}

export function calculateMonthData(
  monthlyRisk: number,
  trades: Trade[],
  currentMonth: Date,
  monthlyGoal: number = 0
): DayRiskData[] {
  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const allDays = eachDayOfInterval({ start, end });
  
  const workingDaysInMonth = getWorkingDaysInMonth(currentMonth);
  const dayDataArray: DayRiskData[] = [];
  
  let accumulatedLoss = 0;
  let accumulatedProfit = 0;
  let workingDaysProcessed = 0;

  allDays.forEach((date, index) => {
    const isWeekendDay = isWeekend(date);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayTrades = trades.filter(t => t.trade_date === dateStr);

    if (!isWeekendDay) {
      workingDaysProcessed++;
    }

    const workingDaysRemaining = workingDaysInMonth - workingDaysProcessed + 1;
    const dailyRisk = calculateDailyRisk(monthlyRisk, accumulatedLoss, workingDaysRemaining);
    const stops = calculateStopPoints(dailyRisk);
    
    const dailyGoal = monthlyGoal > 0 ? calculateDailyGoal(monthlyGoal, accumulatedProfit, workingDaysRemaining) : 0;
    const goalPts = calculateGoalPoints(dailyGoal);

    dayDataArray.push({
      date,
      day: index + 1,
      dailyRisk,
      stopIndice: stops.indice,
      stopDolar: stops.dolar,
      dailyGoal,
      goalIndice: goalPts.indice,
      goalDolar: goalPts.dolar,
      trades: dayTrades,
      isWeekend: isWeekendDay,
    });

    // Update accumulated loss for next day
    const dayLoss = dayTrades
      .filter(t => t.result_reais < 0)
      .reduce((sum, t) => sum + Math.abs(t.result_reais), 0);
    if (dayLoss > 0) {
      accumulatedLoss += dayLoss;
    }

    // Update accumulated profit for goal tracking
    const dayProfit = dayTrades
      .filter(t => t.result_reais > 0)
      .reduce((sum, t) => sum + t.result_reais, 0);
    if (dayProfit > 0) {
      accumulatedProfit += dayProfit;
    }
  });

  return dayDataArray;
}

export function calculateMonthlyStats(trades: Trade[], monthlyRisk: number, monthlyGoal: number = 0) {
  const totalResult = trades.reduce((sum, t) => sum + t.result_reais, 0);
  const wins = trades.filter(t => t.result_reais > 0).length;
  const losses = trades.filter(t => t.result_reais < 0).length;
  const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0;
  
  const totalLoss = trades
    .filter(t => t.result_reais < 0)
    .reduce((sum, t) => sum + Math.abs(t.result_reais), 0);
  
  const totalProfit = trades
    .filter(t => t.result_reais > 0)
    .reduce((sum, t) => sum + t.result_reais, 0);
  
  const riskUsed = totalLoss;
  const riskUsedPercent = monthlyRisk > 0 ? (riskUsed / monthlyRisk) * 100 : 0;
  const riskRemaining = monthlyRisk - riskUsed;

  const goalUsed = totalProfit;
  const goalUsedPercent = monthlyGoal > 0 ? (goalUsed / monthlyGoal) * 100 : 0;
  const goalRemaining = monthlyGoal - goalUsed;

  return {
    totalResult,
    totalResultPoints: trades.reduce((sum, t) => sum + t.result_points, 0),
    wins,
    losses,
    winRate,
    riskUsed,
    riskUsedPercent,
    riskRemaining,
    goalUsed,
    goalUsedPercent,
    goalRemaining,
    monthlyGoal,
  };
}
