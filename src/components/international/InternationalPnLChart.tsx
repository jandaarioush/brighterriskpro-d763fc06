import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatUSD, formatBRL } from '@/lib/internationalRiskCalculations';

interface InternationalTrade {
  id: string;
  trade_date: string;
  resultado_usd: number;
  resultado_brl: number;
}

interface InternationalPnLChartProps {
  trades: InternationalTrade[];
  currency: 'USD' | 'BRL';
}

export function InternationalPnLChart({ trades, currency }: InternationalPnLChartProps) {
  const chartData = useMemo(() => {
    if (!trades.length) return [];

    // Sort trades by date
    const sortedTrades = [...trades].sort(
      (a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
    );

    // Group by date and accumulate
    const dailyResults: Record<string, { usd: number; brl: number }> = {};
    sortedTrades.forEach((trade) => {
      const dateKey = trade.trade_date;
      if (!dailyResults[dateKey]) {
        dailyResults[dateKey] = { usd: 0, brl: 0 };
      }
      dailyResults[dateKey].usd += trade.resultado_usd;
      dailyResults[dateKey].brl += trade.resultado_brl;
    });

    // Build cumulative data
    let cumulativeUSD = 0;
    let cumulativeBRL = 0;
    
    return Object.entries(dailyResults)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, values]) => {
        cumulativeUSD += values.usd;
        cumulativeBRL += values.brl;
        return {
          date,
          dailyUSD: values.usd,
          dailyBRL: values.brl,
          cumulativeUSD,
          cumulativeBRL,
          displayDate: format(parseISO(date), 'dd/MM', { locale: ptBR }),
        };
      });
  }, [trades]);

  const dataKey = currency === 'USD' ? 'cumulativeUSD' : 'cumulativeBRL';
  const formatFn = currency === 'USD' ? formatUSD : formatBRL;
  const strokeColor = chartData.length > 0 && chartData[chartData.length - 1][dataKey] >= 0 
    ? 'hsl(var(--success))' 
    : 'hsl(var(--destructive))';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium mb-2">{label}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Dia:</span>
            <span className={data.dailyUSD >= 0 ? 'text-success' : 'text-destructive'}>
              {formatUSD(data.dailyUSD)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Acumulado:</span>
            <span className={data.cumulativeUSD >= 0 ? 'text-success' : 'text-destructive'}>
              {formatUSD(data.cumulativeUSD)}
            </span>
          </div>
          <div className="flex justify-between gap-4 pt-1 border-t border-border">
            <span className="text-muted-foreground">Em BRL:</span>
            <span className={data.cumulativeBRL >= 0 ? 'text-success' : 'text-destructive'}>
              {formatBRL(data.cumulativeBRL)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (!chartData.length) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Evolução do P&L</h3>
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          Nenhum trade registrado ainda
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Evolução do P&L ({currency})</h3>
        <div className="text-sm text-muted-foreground">
          Total: <span className={`font-semibold ${chartData[chartData.length - 1][dataKey] >= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatFn(chartData[chartData.length - 1][dataKey])}
          </span>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
              tickFormatter={(value) => currency === 'USD' ? `$${value}` : `R$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={strokeColor}
              strokeWidth={2}
              dot={{ fill: strokeColor, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
