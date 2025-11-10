import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/StatCard";
import { Activity, TrendingUp, Users, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EngagementStats {
  totalTrades: number;
  avgTradesPerUser: number;
  retentionRate: number;
  activeUsers: number;
  tradesPerUser: { name: string; trades: number; email: string }[];
  weeklyUsage: { week: string; users: number; trades: number }[];
  topUsers: { 
    name: string; 
    email: string; 
    trades: number; 
    lastTrade: string;
    avgPerWeek: number;
  }[];
}

export default function AdminEngagement() {
  const [stats, setStats] = useState<EngagementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchStats();
    
    // Realtime subscription for trades
    const channel = supabase
      .channel('engagement-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trades'
        },
        () => {
          console.log('Trade update detected, refreshing stats...');
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [period]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const daysAgo = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const startDate = subDays(new Date(), daysAgo);

      // Total de trades no período
      const { data: tradesData, count: totalTrades } = await supabase
        .from('trades')
        .select('*', { count: 'exact' })
        .gte('trade_date', startDate.toISOString());

      // Buscar perfis de usuários
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, name, email');

      // Total de usuários
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status_pagamento', 'approved');

      // Usuários ativos (que fizeram trades no período)
      const activeUserIds = new Set(tradesData?.map(t => t.user_id) || []);
      const activeUsers = activeUserIds.size;

      // Taxa de retenção
      const retentionRate = totalUsers ? Math.round((activeUsers / totalUsers) * 100) : 0;

      // Média de trades por usuário
      const avgTradesPerUser = activeUsers > 0 ? Number((totalTrades || 0) / activeUsers).toFixed(1) : '0';

      // Criar mapa de perfis para lookup rápido
      const profilesMap = new Map(
        profilesData?.map(p => [p.id, { name: p.name || 'Sem nome', email: p.email }]) || []
      );

      // Trades por usuário (top 10)
      const tradesPerUserMap = new Map<string, { name: string; email: string; count: number }>();
      tradesData?.forEach(trade => {
        const key = trade.user_id;
        const existing = tradesPerUserMap.get(key);
        const profile = profilesMap.get(key);
        
        if (existing) {
          existing.count++;
        } else {
          tradesPerUserMap.set(key, {
            name: profile?.name || 'Sem nome',
            email: profile?.email || '',
            count: 1
          });
        }
      });

      const tradesPerUser = Array.from(tradesPerUserMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map(u => ({
          name: u.name,
          trades: u.count,
          email: u.email
        }));

      // Uso semanal (últimas 4 semanas)
      const weeklyUsageMap = new Map<string, { users: Set<string>; trades: number }>();
      
      for (let i = 0; i < 4; i++) {
        const weekStart = startOfWeek(subDays(new Date(), i * 7), { locale: ptBR });
        const weekEnd = endOfWeek(weekStart, { locale: ptBR });
        const weekLabel = format(weekStart, 'dd/MM', { locale: ptBR });
        
        const { data: weekTrades } = await supabase
          .from('trades')
          .select('user_id')
          .gte('trade_date', weekStart.toISOString())
          .lte('trade_date', weekEnd.toISOString());

        const users = new Set(weekTrades?.map(t => t.user_id) || []);
        
        weeklyUsageMap.set(weekLabel, {
          users,
          trades: weekTrades?.length || 0
        });
      }

      const weeklyUsage = Array.from(weeklyUsageMap.entries())
        .reverse()
        .map(([week, data]) => ({
          week,
          users: data.users.size,
          trades: data.trades
        }));

      // Top usuários mais ativos
      const topUsers = Array.from(tradesPerUserMap.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10)
        .map(([userId, data]) => {
          const userTrades = tradesData?.filter(t => t.user_id === userId) || [];
          const lastTradeDate = userTrades.length > 0 
            ? new Date(Math.max(...userTrades.map(t => new Date(t.trade_date).getTime())))
            : new Date();
          
          const weeksInPeriod = daysAgo / 7;
          const avgPerWeek = Number((data.count / weeksInPeriod).toFixed(1));

          return {
            name: data.name,
            email: data.email,
            trades: data.count,
            lastTrade: format(lastTradeDate, 'dd/MM/yyyy', { locale: ptBR }),
            avgPerWeek
          };
        });

      setStats({
        totalTrades: totalTrades || 0,
        avgTradesPerUser: Number(avgTradesPerUser),
        retentionRate,
        activeUsers,
        tradesPerUser,
        weeklyUsage,
        topUsers,
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas de engajamento:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Dashboard de Engajamento</h1>
            <p className="text-muted-foreground mt-2">
              Métricas em tempo real de uso da plataforma
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setPeriod('7d')}
              className={`px-4 py-2 rounded-md transition-colors ${
                period === '7d'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              7 dias
            </button>
            <button
              onClick={() => setPeriod('30d')}
              className={`px-4 py-2 rounded-md transition-colors ${
                period === '30d'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              30 dias
            </button>
            <button
              onClick={() => setPeriod('90d')}
              className={`px-4 py-2 rounded-md transition-colors ${
                period === '90d'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              90 dias
            </button>
          </div>
        </div>

        {/* Cards de métricas principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total de Trades"
            value={stats?.totalTrades.toString() || '0'}
            icon={Activity}
            variant="default"
          />
          <StatCard
            title="Média por Usuário"
            value={stats?.avgTradesPerUser.toString() || '0'}
            subtitle="trades"
            icon={Target}
            variant="success"
          />
          <StatCard
            title="Taxa de Retenção"
            value={`${stats?.retentionRate || 0}%`}
            subtitle={`${stats?.activeUsers || 0} usuários ativos`}
            icon={TrendingUp}
            variant="warning"
          />
          <StatCard
            title="Usuários Ativos"
            value={stats?.activeUsers.toString() || '0'}
            subtitle={`nos últimos ${period === '7d' ? '7' : period === '30d' ? '30' : '90'} dias`}
            icon={Users}
            variant="success"
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trades por usuário (Top 10) */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top 10 - Trades por Usuário</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.tradesPerUser} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="trades" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Uso semanal */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Uso Semanal (Últimas 4 Semanas)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.weeklyUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="Usuários Ativos"
                />
                <Line
                  type="monotone"
                  dataKey="trades"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  name="Total de Trades"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Tabela de usuários mais ativos */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top 10 - Usuários Mais Ativos</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-3 font-semibold">Posição</th>
                  <th className="pb-3 font-semibold">Nome</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold text-right">Total Trades</th>
                  <th className="pb-3 font-semibold text-right">Média/Semana</th>
                  <th className="pb-3 font-semibold text-right">Último Trade</th>
                </tr>
              </thead>
              <tbody>
                {stats?.topUsers.map((user, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-3 font-medium">{user.name}</td>
                    <td className="py-3 text-muted-foreground">{user.email}</td>
                    <td className="py-3 text-right font-semibold">{user.trades}</td>
                    <td className="py-3 text-right text-muted-foreground">{user.avgPerWeek}</td>
                    <td className="py-3 text-right text-muted-foreground">{user.lastTrade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
