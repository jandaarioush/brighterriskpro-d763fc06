import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { PeriodFilter } from '@/components/PeriodFilter';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { StockTrade } from '@/lib/stockRiskCalculations';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

interface StockPnLEvolutionChartProps {
  userId: string;
  dashboardId: string;
  defaultPeriod?: string;
  showFilters?: boolean;
}

export function StockPnLEvolutionChart({ 
  userId, 
  dashboardId,
  defaultPeriod = '30d', 
  showFilters = true 
}: StockPnLEvolutionChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(defaultPeriod);
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  const [trades, setTrades] = useState<StockTrade[]>([]);
  const [loading, setLoading] = useState(true);

  const { startDate, endDate } = useMemo(() => {
    const today = new Date();
    let start: Date;
    let end: Date = today;

    switch (selectedPeriod) {
      case '7d':
        start = subDays(today, 7);
        break;
      case '15d':
        start = subDays(today, 15);
        break;
      case '30d':
        start = subDays(today, 30);
        break;
      case 'month':
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      case 'custom':
        start = customStartDate || subDays(today, 30);
        end = customEndDate || today;
        break;
      default:
        start = subDays(today, 30);
    }

    return { startDate: start, endDate: end };
  }, [selectedPeriod, customStartDate, customEndDate]);

  useEffect(() => {
    loadTrades();
  }, [userId, dashboardId, startDate, endDate]);

  const loadTrades = async () => {
    if (!userId || !dashboardId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stock_trades')
        .select('*')
        .eq('user_id', userId)
        .eq('dashboard_id', dashboardId)
        .gte('trade_date', format(startDate, 'yyyy-MM-dd'))
        .lte('trade_date', format(endDate, 'yyyy-MM-dd'))
        .order('trade_date', { ascending: true });

      if (!error) {
        setTrades(data as StockTrade[]);
      }
    } catch (error) {
      console.error('Error loading trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    if (!trades.length) return [];

    const grouped = trades.reduce((acc, trade) => {
      const date = trade.trade_date;
      if (!acc[date]) {
        acc[date] = { trades: [], dailyResult: 0, dailyPercent: 0 };
      }
      acc[date].trades.push(trade);
      acc[date].dailyResult += trade.resultado_reais;
      acc[date].dailyPercent += trade.resultado_percentual;
      return acc;
    }, {} as Record<string, { trades: StockTrade[]; dailyResult: number; dailyPercent: number }>);

    let cumulative = 0;
    let cumulativePercent = 0;
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => {
        cumulative += data.dailyResult;
        cumulativePercent += data.dailyPercent;
        return {
          date: date.split('-').reverse().slice(0, 2).join('/'),
          dailyResult: data.dailyResult,
          dailyPercent: data.dailyPercent,
          cumulative,
          cumulativePercent,
          trades: data.trades.length,
        };
      });
  }, [trades]);

  const getBarColor = (value: number) => {
    if (value > 0) return 'hsl(var(--success))';
    if (value < 0) return 'hsl(var(--danger))';
    return 'hsl(var(--muted))';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Evolução do P&L
        </CardTitle>
        {showFilters && (
          <PeriodFilter
            selectedPeriod={selectedPeriod as any}
            onPeriodChange={(v) => setSelectedPeriod(v)}
            customStartDate={customStartDate}
            customEndDate={customEndDate}
            onCustomDateChange={(start, end) => {
              setCustomStartDate(start);
              setCustomEndDate(end);
            }}
          />
        )}
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Nenhum trade no período selecionado
          </div>
        ) : (
          <Tabs defaultValue="cumulative">
            <TabsList className="mb-4">
              <TabsTrigger value="cumulative">Acumulado</TabsTrigger>
              <TabsTrigger value="daily">Diário</TabsTrigger>
            </TabsList>

            <TabsContent value="cumulative">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(v) => `R$${v}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Acumulado']}
                  />
                  <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                  <Line 
                    type="monotone" 
                    dataKey="cumulative" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="daily">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(v) => `R$${v}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Resultado']}
                  />
                  <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                  <Bar dataKey="dailyResult" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.dailyResult)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
