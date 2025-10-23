import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PeriodFilter, PeriodType } from "./PeriodFilter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { processEvolutionData, Trade as ChartTrade } from "@/lib/chartDataProcessing";
import type { Database } from "@/integrations/supabase/types";
import { subDays, startOfMonth, endOfMonth } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatting";

interface PnLEvolutionChartProps {
  userId: string;
  defaultPeriod?: PeriodType;
  showFilters?: boolean;
}

export function PnLEvolutionChart({
  userId,
  defaultPeriod = "month",
  showFilters = true,
}: PnLEvolutionChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>(defaultPeriod);
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [trades, setTrades] = useState<ChartTrade[]>([]);
  const [loading, setLoading] = useState(true);

  const { startDate, endDate } = useMemo(() => {
    const today = new Date();
    
    if (selectedPeriod === "custom" && customStartDate && customEndDate) {
      return { startDate: customStartDate, endDate: customEndDate };
    }
    
    switch (selectedPeriod) {
      case "7d":
        return { startDate: subDays(today, 7), endDate: today };
      case "15d":
        return { startDate: subDays(today, 15), endDate: today };
      case "30d":
        return { startDate: subDays(today, 30), endDate: today };
      case "month":
      default:
        return { startDate: startOfMonth(today), endDate: endOfMonth(today) };
    }
  }, [selectedPeriod, customStartDate, customEndDate]);

  useEffect(() => {
    loadTrades();
  }, [userId, startDate, endDate]);

  const loadTrades = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", userId)
        .gte("trade_date", startDate.toISOString().split("T")[0])
        .lte("trade_date", endDate.toISOString().split("T")[0])
        .order("trade_date", { ascending: true });

      if (error) throw error;
      setTrades((data || []) as ChartTrade[]);
    } catch (error) {
      console.error("Error loading trades:", error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(
    () => processEvolutionData(trades, startDate, endDate),
    [trades, startDate, endDate]
  );

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-1">{data.dateLabel}</p>
          <p className="text-sm">
            Resultado: <span className={data.dailyResult >= 0 ? "text-green-500" : "text-red-500"}>
              {formatCurrency(data.dailyResult)}
            </span>
          </p>
          {payload[0].dataKey === "cumulativeResult" && (
            <p className="text-sm">
              Acumulado: <span className={data.cumulativeResult >= 0 ? "text-green-500" : "text-red-500"}>
                {formatCurrency(data.cumulativeResult)}
              </span>
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            {data.tradesCount} trade{data.tradesCount !== 1 ? "s" : ""} ({data.wins}W / {data.losses}L)
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolução do PnL</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução do PnL</CardTitle>
        {showFilters && (
          <PeriodFilter
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
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
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Nenhum trade encontrado no período selecionado
          </div>
        ) : (
          <Tabs defaultValue="cumulative" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
              <TabsTrigger value="cumulative">Acumulado</TabsTrigger>
              <TabsTrigger value="daily">Diário</TabsTrigger>
            </TabsList>
            
            <TabsContent value="cumulative">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
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
                  <Line
                    type="monotone"
                    dataKey="cumulativeResult"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="daily">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
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
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
