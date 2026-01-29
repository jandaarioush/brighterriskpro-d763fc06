import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Award, Download, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import DashboardLayoutWrapper from '@/components/DashboardLayoutWrapper';
import DashboardTabs from '@/components/DashboardTabs';

interface StockTrade {
  id: string;
  trade_date: string;
  ticker: string;
  modalidade: string;
  preco_entrada: number;
  preco_saida: number;
  quantidade: number;
  alavancagem: number;
  resultado_reais: number;
  resultado_percentual: number;
  notes: string | null;
  setup_utilizado: string | null;
  tag: string | null;
  nota_disciplina: number | null;
}

interface Dashboard {
  id: string;
  name: string;
  type: 'futuros' | 'acoes' | 'internacional';
}

export default function StockTrades() {
  const { dashboardId } = useParams<{ dashboardId: string }>();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [trades, setTrades] = useState<StockTrade[]>([]);
  const [filterModalidade, setFilterModalidade] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingTradeId, setDeletingTradeId] = useState<string | null>(null);

  useEffect(() => {
    if (user && dashboardId) {
      fetchData();
    }
  }, [user, dashboardId]);

  const fetchData = async () => {
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

      // Load trades
      const { data, error } = await supabase
        .from('stock_trades')
        .select('*')
        .eq('dashboard_id', dashboardId)
        .eq('user_id', user?.id)
        .order('trade_date', { ascending: false });

      if (error) throw error;
      setTrades(data || []);
    } catch (error) {
      toast.error('Erro ao carregar trades');
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
      fetchData();
    } catch (error) {
      toast.error('Erro ao excluir trade');
    }
    setDeletingTradeId(null);
  };

  const handleExport = () => {
    if (filteredTrades.length === 0) {
      toast.error('Nenhum trade para exportar');
      return;
    }

    const headers = ['Data', 'Ticker', 'Modalidade', 'Entrada', 'Saída', 'Qtd', 'Alavancagem', 'Resultado (R$)', 'Resultado (%)', 'Setup', 'Tag', 'Disciplina', 'Observações'];
    const csvContent = [
      headers.join(','),
      ...filteredTrades.map(trade => [
        trade.trade_date.split('-').reverse().join('/'),
        trade.ticker,
        trade.modalidade,
        trade.preco_entrada.toFixed(2),
        trade.preco_saida.toFixed(2),
        trade.quantidade,
        trade.alavancagem,
        trade.resultado_reais.toFixed(2),
        trade.resultado_percentual.toFixed(2),
        trade.setup_utilizado || '',
        trade.tag || '',
        trade.nota_disciplina ?? '',
        `"${(trade.notes || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `trades_${dashboard?.name || 'stock'}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Trades exportados com sucesso!');
  };

  const filteredTrades = trades.filter(trade => {
    const matchesModalidade = filterModalidade === 'all' || trade.modalidade === filterModalidade;
    const matchesSearch = trade.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trade.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesModalidade && matchesSearch;
  });

  // Stats
  const totalTrades = filteredTrades.length;
  const wins = filteredTrades.filter(t => t.resultado_reais > 0).length;
  const losses = filteredTrades.filter(t => t.resultado_reais < 0).length;
  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
  const totalResult = filteredTrades.reduce((sum, t) => sum + t.resultado_reais, 0);

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
          <h1 className="text-4xl font-bold mb-2 font-montserrat">Trades - {dashboard?.name}</h1>
          <p className="text-muted-foreground">Histórico de operações</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total de Trades"
            value={totalTrades.toString()}
            icon={Target}
          />
          <StatCard
            title="Taxa de Acerto"
            value={`${winRate.toFixed(1)}%`}
            subtitle={`${wins}W / ${losses}L`}
            icon={Award}
          />
          <StatCard
            title="Resultado Total"
            value={`R$ ${totalResult.toFixed(2)}`}
            icon={totalResult >= 0 ? TrendingUp : TrendingDown}
            variant={totalResult >= 0 ? 'success' : 'danger'}
          />
          <Card className="p-6">
            <Button onClick={handleExport} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por ticker ou observações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterModalidade} onValueChange={setFilterModalidade}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Modalidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="daytrade">Day Trade</SelectItem>
                <SelectItem value="swing">Swing Trade</SelectItem>
                <SelectItem value="position">Position</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Trades Table */}
        <Card className="p-6">
          {filteredTrades.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum trade encontrado.
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
                  <TableHead className="text-right">Alav.</TableHead>
                  <TableHead className="text-right">Resultado</TableHead>
                  <TableHead className="text-right">%</TableHead>
                  <TableHead>Setup</TableHead>
                  <TableHead>Tag</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrades.map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell>{trade.trade_date.split('-').reverse().join('/')}</TableCell>
                    <TableCell className="font-medium">{trade.ticker}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{trade.modalidade}</Badge>
                    </TableCell>
                    <TableCell className="text-right">R$ {trade.preco_entrada.toFixed(2)}</TableCell>
                    <TableCell className="text-right">R$ {trade.preco_saida.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{trade.quantidade}</TableCell>
                    <TableCell className="text-right">{trade.alavancagem}x</TableCell>
                    <TableCell className={`text-right font-semibold ${trade.resultado_reais >= 0 ? 'text-success' : 'text-destructive'}`}>
                      R$ {trade.resultado_reais.toFixed(2)}
                    </TableCell>
                    <TableCell className={`text-right ${trade.resultado_percentual >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {trade.resultado_percentual.toFixed(2)}%
                    </TableCell>
                    <TableCell>{trade.setup_utilizado || '-'}</TableCell>
                    <TableCell>{trade.tag || '-'}</TableCell>
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
