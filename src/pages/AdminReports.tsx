import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/StatCard";
import { Users, CheckCircle, XCircle, TrendingUp, Calendar as CalendarIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  revokedUsers: number;
  usersByPlan: { plano: string; count: number }[];
  newUsersByDay: { date: string; count: number }[];
  usersByMonth: { month: string; count: number }[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export default function AdminReports() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | 'all'>('30d');

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Total de usuários
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Usuários ativos
      const { count: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status_pagamento', 'approved');

      // Usuários revogados
      const { count: revokedUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .neq('status_pagamento', 'approved');

      // Usuários por plano
      const { data: plansData } = await supabase
        .from('profiles')
        .select('plano');

      const usersByPlan = plansData?.reduce((acc: any[], curr) => {
        const plano = curr.plano || 'Sem Plano';
        const existing = acc.find(item => item.plano === plano);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ plano, count: 1 });
        }
        return acc;
      }, []) || [];

      // Novos usuários por período
      const daysAgo = period === '7d' ? 7 : period === '30d' ? 30 : 365;
      const startDate = subDays(new Date(), daysAgo);

      const { data: newUsersData } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      // Agrupar por dia
      const newUsersByDay = newUsersData?.reduce((acc: any[], curr) => {
        const date = format(new Date(curr.created_at), 'dd/MM', { locale: ptBR });
        const existing = acc.find(item => item.date === date);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ date, count: 1 });
        }
        return acc;
      }, []) || [];

      // Usuários por mês (últimos 6 meses)
      const { data: allUsersData } = await supabase
        .from('profiles')
        .select('created_at')
        .order('created_at', { ascending: true });

      const usersByMonth = allUsersData?.reduce((acc: any[], curr) => {
        const month = format(new Date(curr.created_at), 'MMM/yy', { locale: ptBR });
        const existing = acc.find(item => item.month === month);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ month, count: 1 });
        }
        return acc;
      }, []).slice(-6) || [];

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        revokedUsers: revokedUsers || 0,
        usersByPlan,
        newUsersByDay,
        usersByMonth,
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <h1 className="text-4xl font-bold tracking-tight">Relatórios</h1>
            <p className="text-muted-foreground mt-2">
              Estatísticas e análises de usuários
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
              onClick={() => setPeriod('all')}
              className={`px-4 py-2 rounded-md transition-colors ${
                period === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Todos
            </button>
          </div>
        </div>

        {/* Cards de estatísticas principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total de Usuários"
            value={stats?.totalUsers.toString() || '0'}
            icon={Users}
            variant="default"
          />
          <StatCard
            title="Usuários Ativos"
            value={stats?.activeUsers.toString() || '0'}
            icon={CheckCircle}
            variant="success"
          />
          <StatCard
            title="Acesso Revogado"
            value={stats?.revokedUsers.toString() || '0'}
            icon={XCircle}
            variant="danger"
          />
          <StatCard
            title="Taxa de Ativação"
            value={`${stats?.totalUsers ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%`}
            icon={TrendingUp}
            variant="warning"
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Usuários por Plano */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Usuários por Plano</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats?.usersByPlan}
                  dataKey="count"
                  nameKey="plano"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.plano}: ${entry.count}`}
                >
                  {stats?.usersByPlan.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Novos usuários (período selecionado) */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Novos Cadastros - {period === '7d' ? '7 dias' : period === '30d' ? '30 dias' : 'Todos'}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.newUsersByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Evolução mensal */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Evolução de Cadastros (Últimos 6 Meses)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats?.usersByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="Novos Usuários"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Tabela de resumo por plano */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Resumo por Plano</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-3 font-semibold">Plano</th>
                  <th className="pb-3 font-semibold text-right">Usuários</th>
                  <th className="pb-3 font-semibold text-right">Percentual</th>
                </tr>
              </thead>
              <tbody>
                {stats?.usersByPlan.map((item, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-3">{item.plano}</td>
                    <td className="py-3 text-right">{item.count}</td>
                    <td className="py-3 text-right">
                      {Math.round((item.count / (stats?.totalUsers || 1)) * 100)}%
                    </td>
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
