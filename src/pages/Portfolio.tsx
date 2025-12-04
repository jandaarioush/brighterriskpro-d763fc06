import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { 
  Wallet, 
  Plus, 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Loader2 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Portfolio {
  id: string;
  name: string;
  capital_inicial: number;
  capital_atual: number;
  created_at: string;
}

interface PortfolioEntry {
  id: string;
  entry_date: string;
  ticker: string;
  tipo: 'compra' | 'venda';
  quantidade: number;
  preco: number;
  valor_total: number;
  notes?: string;
}

export default function PortfolioPage() {
  const { dashboardId } = useParams<{ dashboardId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [entries, setEntries] = useState<PortfolioEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEntryDialog, setShowEntryDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [newPortfolioCapital, setNewPortfolioCapital] = useState('');
  const [newEntry, setNewEntry] = useState({
    ticker: '',
    tipo: 'compra' as 'compra' | 'venda',
    quantidade: '',
    preco: '',
    notes: '',
  });
  const [activeTab, setActiveTab] = useState('diario');
  const [dashboard, setDashboard] = useState<{ type: string } | null>(null);

  useEffect(() => {
    if (user && dashboardId) {
      loadDashboard();
      loadPortfolios();
    }
  }, [user, dashboardId]);

  useEffect(() => {
    if (selectedPortfolio) {
      loadEntries();
    }
  }, [selectedPortfolio]);

  const loadDashboard = async () => {
    const { data } = await supabase
      .from('dashboards')
      .select('type')
      .eq('id', dashboardId)
      .single();
    
    if (data) {
      setDashboard(data);
    }
  };

  const loadPortfolios = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user?.id)
        .eq('dashboard_id', dashboardId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setPortfolios(data || []);
      if (data && data.length > 0 && !selectedPortfolio) {
        setSelectedPortfolio(data[0] as Portfolio);
      }
    } catch (error) {
      console.error('Error loading portfolios:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEntries = async () => {
    if (!selectedPortfolio) return;

    try {
      const { data, error } = await supabase
        .from('portfolio_entries')
        .select('*')
        .eq('portfolio_id', selectedPortfolio.id)
        .order('entry_date', { ascending: false });

      if (error) throw error;

      setEntries((data || []) as PortfolioEntry[]);
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const createPortfolio = async () => {
    if (!newPortfolioName.trim()) {
      toast.error('Digite um nome para a carteira');
      return;
    }

    setCreating(true);
    try {
      const capitalInicial = parseFloat(newPortfolioCapital) || 0;
      const { data, error } = await supabase
        .from('portfolios')
        .insert({
          user_id: user?.id,
          dashboard_id: dashboardId,
          name: newPortfolioName,
          capital_inicial: capitalInicial,
          capital_atual: capitalInicial,
        })
        .select()
        .single();

      if (error) throw error;

      setPortfolios([...portfolios, data as Portfolio]);
      setSelectedPortfolio(data as Portfolio);
      setShowCreateDialog(false);
      setNewPortfolioName('');
      setNewPortfolioCapital('');
      toast.success('Carteira criada com sucesso!');
    } catch (error) {
      console.error('Error creating portfolio:', error);
      toast.error('Erro ao criar carteira');
    } finally {
      setCreating(false);
    }
  };

  const addEntry = async () => {
    if (!selectedPortfolio || !newEntry.ticker || !newEntry.quantidade || !newEntry.preco) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setCreating(true);
    try {
      const quantidade = parseInt(newEntry.quantidade);
      const preco = parseFloat(newEntry.preco);
      const valorTotal = quantidade * preco;

      const { error } = await supabase
        .from('portfolio_entries')
        .insert({
          portfolio_id: selectedPortfolio.id,
          user_id: user?.id,
          entry_date: new Date().toISOString().split('T')[0],
          ticker: newEntry.ticker.toUpperCase(),
          tipo: newEntry.tipo,
          quantidade,
          preco,
          valor_total: valorTotal,
          notes: newEntry.notes || null,
        });

      if (error) throw error;

      // Update portfolio capital
      const multiplier = newEntry.tipo === 'compra' ? -1 : 1;
      const newCapital = selectedPortfolio.capital_atual + (valorTotal * multiplier);
      
      await supabase
        .from('portfolios')
        .update({ capital_atual: newCapital })
        .eq('id', selectedPortfolio.id);

      setSelectedPortfolio({ ...selectedPortfolio, capital_atual: newCapital });
      setShowEntryDialog(false);
      setNewEntry({ ticker: '', tipo: 'compra', quantidade: '', preco: '', notes: '' });
      loadEntries();
      toast.success('Entrada registrada com sucesso!');
    } catch (error) {
      console.error('Error adding entry:', error);
      toast.error('Erro ao registrar entrada');
    } finally {
      setCreating(false);
    }
  };

  // Filter entries based on period
  const filterEntriesByPeriod = (period: string) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    switch (period) {
      case 'diario':
        return entries.filter(e => e.entry_date === todayStr);
      case 'semanal':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return entries.filter(e => new Date(e.entry_date) >= weekAgo);
      case 'mensal':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return entries.filter(e => new Date(e.entry_date) >= monthStart);
      default:
        return entries;
    }
  };

  const filteredEntries = filterEntriesByPeriod(activeTab);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar dashboardId={dashboardId!} dashboardType={dashboard?.type || 'acoes'} />
      
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => navigate(`/dashboard/${dashboardId}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Dashboard
          </Button>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2 font-montserrat flex items-center gap-3">
                <Wallet className="w-8 h-8" />
                Carteira
              </h1>
              <p className="text-muted-foreground">
                Acompanhe a evolução das suas carteiras
              </p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Carteira
            </Button>
          </div>

          {/* Portfolio Selection */}
          {portfolios.length > 0 && (
            <div className="flex gap-2 mb-6 flex-wrap">
              {portfolios.map((portfolio) => (
                <Button
                  key={portfolio.id}
                  variant={selectedPortfolio?.id === portfolio.id ? 'default' : 'outline'}
                  onClick={() => setSelectedPortfolio(portfolio)}
                >
                  {portfolio.name}
                </Button>
              ))}
            </div>
          )}

          {selectedPortfolio ? (
            <>
              {/* Portfolio Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Capital Inicial</span>
                  </div>
                  <p className="text-2xl font-bold">
                    R$ {selectedPortfolio.capital_inicial.toLocaleString()}
                  </p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Capital Atual</span>
                  </div>
                  <p className="text-2xl font-bold">
                    R$ {selectedPortfolio.capital_atual.toLocaleString()}
                  </p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    {selectedPortfolio.capital_atual >= selectedPortfolio.capital_inicial ? (
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-500" />
                    )}
                    <span className="text-sm text-muted-foreground">Rentabilidade</span>
                  </div>
                  <p className={`text-2xl font-bold ${
                    selectedPortfolio.capital_atual >= selectedPortfolio.capital_inicial 
                      ? 'text-green-500' 
                      : 'text-red-500'
                  }`}>
                    {selectedPortfolio.capital_inicial > 0 
                      ? (((selectedPortfolio.capital_atual - selectedPortfolio.capital_inicial) / selectedPortfolio.capital_inicial) * 100).toFixed(2)
                      : 0
                    }%
                  </p>
                </Card>
              </div>

              {/* Entries Tabs */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Movimentações</CardTitle>
                  <Button onClick={() => setShowEntryDialog(true)} size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nova Entrada
                  </Button>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="diario">Diário</TabsTrigger>
                      <TabsTrigger value="semanal">Semanal</TabsTrigger>
                      <TabsTrigger value="mensal">Mensal</TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab}>
                      {filteredEntries.length > 0 ? (
                        <div className="space-y-3">
                          {filteredEntries.map((entry) => (
                            <Card key={entry.id} className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className={`p-2 rounded ${entry.tipo === 'compra' ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                                    {entry.tipo === 'compra' ? (
                                      <TrendingDown className="w-4 h-4 text-red-500" />
                                    ) : (
                                      <TrendingUp className="w-4 h-4 text-green-500" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium">{entry.ticker}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {entry.quantidade} x R$ {entry.preco.toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className={`font-medium ${entry.tipo === 'compra' ? 'text-red-500' : 'text-green-500'}`}>
                                    {entry.tipo === 'compra' ? '-' : '+'}R$ {entry.valor_total.toFixed(2)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {entry.entry_date.split('-').reverse().join('/')}
                                  </p>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          Nenhuma movimentação no período
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="p-12 text-center">
              <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma carteira criada</h3>
              <p className="text-muted-foreground mb-4">
                Crie sua primeira carteira para começar a acompanhar seus investimentos
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Carteira
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Create Portfolio Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Carteira</DialogTitle>
            <DialogDescription>
              Crie uma nova carteira para acompanhar seus investimentos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="portfolio-name">Nome da Carteira</Label>
              <Input
                id="portfolio-name"
                value={newPortfolioName}
                onChange={(e) => setNewPortfolioName(e.target.value)}
                placeholder="Ex: Dividendos"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolio-capital">Capital Inicial</Label>
              <Input
                id="portfolio-capital"
                type="number"
                value={newPortfolioCapital}
                onChange={(e) => setNewPortfolioCapital(e.target.value)}
                placeholder="10000"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={createPortfolio} disabled={creating}>
              {creating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Criar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Entry Dialog */}
      <Dialog open={showEntryDialog} onOpenChange={setShowEntryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Entrada</DialogTitle>
            <DialogDescription>
              Registre uma compra ou venda na carteira
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <div className="flex gap-2">
                <Button
                  variant={newEntry.tipo === 'compra' ? 'default' : 'outline'}
                  onClick={() => setNewEntry({ ...newEntry, tipo: 'compra' })}
                  className="flex-1"
                >
                  Compra
                </Button>
                <Button
                  variant={newEntry.tipo === 'venda' ? 'default' : 'outline'}
                  onClick={() => setNewEntry({ ...newEntry, tipo: 'venda' })}
                  className="flex-1"
                >
                  Venda
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="entry-ticker">Ticker</Label>
              <Input
                id="entry-ticker"
                value={newEntry.ticker}
                onChange={(e) => setNewEntry({ ...newEntry, ticker: e.target.value.toUpperCase() })}
                placeholder="PETR4"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entry-quantidade">Quantidade</Label>
                <Input
                  id="entry-quantidade"
                  type="number"
                  value={newEntry.quantidade}
                  onChange={(e) => setNewEntry({ ...newEntry, quantidade: e.target.value })}
                  placeholder="100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entry-preco">Preço</Label>
                <Input
                  id="entry-preco"
                  type="number"
                  step="0.01"
                  value={newEntry.preco}
                  onChange={(e) => setNewEntry({ ...newEntry, preco: e.target.value })}
                  placeholder="25.50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="entry-notes">Observações</Label>
              <Input
                id="entry-notes"
                value={newEntry.notes}
                onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                placeholder="Anotações..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowEntryDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={addEntry} disabled={creating}>
              {creating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Registrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
