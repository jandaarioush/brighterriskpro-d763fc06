import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import { processEvolutionData, groupTradesByWeek, type Trade } from "@/lib/chartDataProcessing";
import { startOfMonth, endOfMonth } from "date-fns";
import { formatCurrency } from "@/lib/formatting";

interface DailyWeeklyChartsProps {
  trades: Trade[];
  currentMonth: Date;
  monthlyRisk: number;
}

export function DailyWeeklyCharts({ trades, currentMonth, monthlyRisk }: DailyWeeklyChartsProps) {
  const dailyData = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return processEvolutionData(trades, start, end);
  }, [trades, currentMonth]);

  const weeklyData = useMemo(() => {
    return groupTradesByWeek(trades, currentMonth);
  }, [trades, currentMonth]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-1">{data.dateLabel}</p>
          <p className="text-sm">
            Resultado: <span className={data.dailyResult >= 0 ? "text-success" : "text-destructive"}>
              {formatCurrency(data.dailyResult)}
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            {data.tradesCount} trade{data.tradesCount !== 1 ? "s" : ""} ({data.wins}W / {data.losses}L)
          </p>
        </div>
      );
    }
    return null;
  };

  const getBarColor = (value: number) => {
    if (value > 0) return "hsl(var(--chart-2))"; // Green
    if (value < 0) return "hsl(var(--chart-1))"; // Red
    return "hsl(var(--muted))";
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Evolução Diária</CardTitle>
        </CardHeader>
        <CardContent>
          {dailyData.length === 0 ? (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              Nenhum trade no mês
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="dateLabel" 
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tickFormatter={(value) => `R$ ${value}`}
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                <Bar
                  dataKey="dailyResult"
                  radius={[4, 4, 0, 0]}
                >
                  {dailyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.dailyResult)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evolução Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          {weeklyData.length === 0 ? (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              Nenhum trade no mês
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="dateLabel" 
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis 
                  tickFormatter={(value) => `R$ ${value}`}
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                <Bar
                  dataKey="dailyResult"
                  radius={[4, 4, 0, 0]}
                >
                  {weeklyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.dailyResult)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
