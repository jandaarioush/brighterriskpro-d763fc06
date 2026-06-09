import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/StatCard';
import { DollarSign, TrendingUp, Percent, BarChart3, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DashboardLayoutWrapper from '@/components/DashboardLayoutWrapper';
import DashboardTabs from '@/components/DashboardTabs';
import { StockPnLEvolutionChart } from '@/components/stock/StockPnLEvolutionChart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface StockTrade {
  id: string;
  ticker: string;
  trade_date: string;
  preco_entrada: number;
  preco_saida: number;
  quantidade: number;
  resultado_reais: number;
  resultado_percentual: number;
  modalidade: string;
}

interface Dashboard {
  id: string;
  name: string;
  type: 'futuros' | 'acoes' | 'internacional';
}

export default function WeeklyPortfolio() {
  const { dashboardId } = useParams<{ dashboardId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [trades, setTrades] = useState<StockTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingTradeId, setDeletingTradeId] = useState<string | null>(null);

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  useEffect(() => {
    if (user && dashboardId) {
      loadData();
    }
  }, [user, dashboardId]);

  const loadData = async () => {
    try {
      // Load dashboard
      const { data: dashData } = await supabase
        .from('dashboards')
        .select('id, name, type')
        .eq('id', dashboardId)
        .single();

      if (dashData) {
        setDashboard(dashData as Dashboard);
      }

      // Load trades for current week
      const { data: tradesData } = await supabase
        .from('stock_trades')
        .select('*')
        .eq('dashboard_id', dashboardId)
        .eq('user_id', user?.id)
        .gte('trade_date', format(weekStart, 'yyyy-MM-dd'))
        .lte('trade_date', format(weekEnd, 'yyyy-MM-dd'))
        .order('trade_date', { ascending: false });

      if (tradesData) {
        setTrades(tradesData as StockTrade[]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tradeId: string) => {
    try {
      const { error } = await supabase
        .from('stock_trades')
        .delete()
        .eq('id', tradeId);

      if (error) throw error;
      toast.success('Trade excluído com sucesso!');
      loadData();
    } catch (error) {
      toast.error('Erro ao excluir trade');
    }
    setDeletingTradeId(null);
  };

  // Calculate KPIs
  const totalInvestido = trades.reduce((sum, t) => sum + (t.preco_entrada * t.quantidade), 0);
  const resultadoTotal = trades.reduce((sum, t) => sum + t.resultado_reais, 0);
  const rentabilidade = totalInvestido > 0 ? (resultadoTotal / totalInvestido) * 100 : 0;
  const totalTrades = trades.length;

  if (loading) {
    return (
      <DashboardLayoutWrapper>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayoutWrapper>
    );
  }

  return (
    <DashboardLayoutWrapper>
      {dashboard && (
        <DashboardTabs dashboardId={dashboardId} dashboardType={dashboard.type} />
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 font-montserrat">Carteira Semanal</h1>
          <p className="text-muted-foreground">
            {format(weekStart, "dd 'de' MMMM", { locale: ptBR })} - {format(weekEnd, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Capital Investido"
            value={`R$ ${totalInvestido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={DollarSign}
          />
          <StatCard
            title="Resultado Total"
            value={`R$ ${resultadoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={TrendingUp}
            variant={resultadoTotal >= 0 ? 'success' : 'danger'}
          />
          <StatCard
            title="Rentabilidade"
            value={`${rentabilidade.toFixed(2)}%`}
            icon={Percent}
            variant={rentabilidade >= 0 ? 'success' : 'danger'}
          />
          <StatCard
            title="Trades Realizados"
            value={totalTrades.toString()}
            icon={BarChart3}
          />
        </div>

        {/* Chart */}
        {user && dashboardId && (
          <Card className="p-6 mb-8">
            <StockPnLEvolutionChart userId={user.id} dashboardId={dashboardId} defaultPeriod="7d" />
          </Card>
        )}

        {/* Trades Table */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Trades da Semana</h2>
            <Button onClick={() => navigate(`/stock-dashboard/${dashboardId}`)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Trade
            </Button>
          </div>

          {trades.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum trade registrado nesta semana.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Modalidade</TableHead>
                  <TableHead className="text-right">Entrada</TableHead>
                  <TableHead className="text-right">Saída</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                  <TableHead className="text-right">Resultado</TableHead>
                  <TableHead className="text-right">%</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell>{trade.trade_date.split('-').reverse().join('/')}</TableCell>
                    <TableCell className="font-medium">{trade.ticker}</TableCell>
                    <TableCell>{trade.modalidade}</TableCell>
                    <TableCell className="text-right">R$ {trade.preco_entrada.toFixed(2)}</TableCell>
                    <TableCell className="text-right">R$ {trade.preco_saida.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{trade.quantidade}</TableCell>
                    <TableCell className={`text-right font-semibold ${trade.resultado_reais >= 0 ? 'text-success' : 'text-destructive'}`}>
                      R$ {trade.resultado_reais.toFixed(2)}
                    </TableCell>
                    <TableCell className={`text-right ${trade.resultado_percentual >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {trade.resultado_percentual.toFixed(2)}%
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingTradeId(trade.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      <AlertDialog open={!!deletingTradeId} onOpenChange={() => setDeletingTradeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este trade? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingTradeId && handleDelete(deletingTradeId)}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayoutWrapper>
  );
}
