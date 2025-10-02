import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award,
  Download,
  Pencil,
  Trash2,
  Image as ImageIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { EditTradeDialog } from "@/components/EditTradeDialog";

interface Trade {
  id: string;
  trade_date: string;
  asset_type: string;
  result_points: number;
  result_reais: number;
  notes: string | null;
  setup_utilizado: string | null;
  tag: string | null;
  nota_disciplina: number | null;
  screenshot_url: string | null;
}

export default function Trades() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [filterAsset, setFilterAsset] = useState<string>("all");
  const [filterSetup, setFilterSetup] = useState<string>("all");
  const [filterTag, setFilterTag] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [deletingTradeId, setDeletingTradeId] = useState<string | null>(null);

  const fetchTrades = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", user.id)
        .order("trade_date", { ascending: false });

      if (error) throw error;
      setTrades(data || []);
    } catch (error) {
      console.error("Error fetching trades:", error);
      toast.error("Erro ao carregar trades");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, [user]);

  const handleDelete = async (tradeId: string) => {
    try {
      const { error } = await supabase
        .from("trades")
        .delete()
        .eq("id", tradeId);

      if (error) throw error;

      toast.success("Trade excluído com sucesso!");
      fetchTrades();
    } catch (error) {
      console.error("Error deleting trade:", error);
      toast.error("Erro ao excluir trade");
    }
    setDeletingTradeId(null);
  };

  const totalTrades = trades.length;
  const profitTrades = trades.filter(t => t.result_reais > 0).length;
  const totalProfit = trades.filter(t => t.result_reais > 0).reduce((acc, t) => acc + t.result_reais, 0);
  const totalLoss = trades.filter(t => t.result_reais < 0).reduce((acc, t) => acc + t.result_reais, 0);
  const winRate = totalTrades > 0 ? (profitTrades / totalTrades) * 100 : 0;
  const bestTrade = trades.length > 0 ? Math.max(...trades.map(t => t.result_reais)) : 0;
  const worstTrade = trades.length > 0 ? Math.min(...trades.map(t => t.result_reais)) : 0;

  const filteredTrades = trades.filter(trade => {
    const matchesAsset = filterAsset === "all" || trade.asset_type === filterAsset;
    const matchesSetup = filterSetup === "all" || trade.setup_utilizado === filterSetup;
    const matchesTag = filterTag === "all" || trade.tag === filterTag;
    const matchesSearch = !searchTerm || 
      (trade.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    return matchesAsset && matchesSetup && matchesTag && matchesSearch;
  });

  const formatSetup = (setup: string | null) => {
    if (!setup) return "-";
    const setupMap: { [key: string]: string } = {
      "rompimento": "Rompimento",
      "reversao": "Reversão",
      "tendencia": "Tendência",
      "suporte-resistencia": "Suporte/Resistência",
      "medias-moveis": "Médias Móveis",
      "divergencia": "Divergência",
      "padrao-candlestick": "Padrão Candlestick",
      "breakout": "Breakout",
      "pull-back": "Pull Back",
      "scalping": "Scalping",
      "swing-trade": "Swing Trade",
      "outro": "Outro"
    };
    return setupMap[setup] || setup;
  };

  const formatTag = (tag: string | null) => {
    if (!tag) return "-";
    const tagMap: { [key: string]: string } = {
      "disciplinado": "Disciplinado",
      "emocional": "Emocional",
      "fora-setup": "Fora de Setup",
      "overtrading": "Overtrading",
      "fomo": "FOMO",
      "revenge-trading": "Revenge Trading",
      "perfeito": "Perfeito",
      "experimental": "Experimental",
      "conservador": "Conservador",
      "agressivo": "Agressivo"
    };
    return tagMap[tag] || tag;
  };

  const getTagVariant = (tag: string | null) => {
    if (!tag) return "secondary";
    const positive = ["disciplinado", "perfeito", "conservador"];
    const negative = ["emocional", "fora-setup", "overtrading", "fomo", "revenge-trading"];
    if (positive.includes(tag)) return "success";
    if (negative.includes(tag)) return "destructive";
    return "secondary";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando trades...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Trades</h1>
          <p className="text-muted-foreground">
            Histórico completo e análise de performance
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total de Trades"
            value={totalTrades.toString()}
            subtitle={`Win Rate: ${winRate.toFixed(1)}%`}
            icon={Target}
            variant="default"
          />
          
          <StatCard
            title="Lucro Total"
            value={`R$ ${totalProfit.toFixed(2)}`}
            subtitle={`${profitTrades} trades positivos`}
            icon={TrendingUp}
            variant="success"
          />
          
          <StatCard
            title="Perda Total"
            value={`R$ ${Math.abs(totalLoss).toFixed(2)}`}
            subtitle={`${totalTrades - profitTrades} trades negativos`}
            icon={TrendingDown}
            variant="danger"
          />
          
          <StatCard
            title="Melhor Trade"
            value={`R$ ${bestTrade.toFixed(2)}`}
            subtitle={`Pior: R$ ${worstTrade.toFixed(2)}`}
            icon={Award}
            variant="success"
          />
        </div>

        {/* Filters and Actions */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por observações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={filterAsset} onValueChange={setFilterAsset}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filtrar ativo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os ativos</SelectItem>
                  <SelectItem value="indice">Índice</SelectItem>
                  <SelectItem value="dolar">Dólar</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Exportar
              </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <Select value={filterSetup} onValueChange={setFilterSetup}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Filtrar por setup" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os setups</SelectItem>
                  <SelectItem value="rompimento">Rompimento</SelectItem>
                  <SelectItem value="reversao">Reversão</SelectItem>
                  <SelectItem value="tendencia">Tendência</SelectItem>
                  <SelectItem value="suporte-resistencia">Suporte/Resistência</SelectItem>
                  <SelectItem value="medias-moveis">Médias Móveis</SelectItem>
                  <SelectItem value="divergencia">Divergência</SelectItem>
                  <SelectItem value="padrao-candlestick">Padrão Candlestick</SelectItem>
                  <SelectItem value="breakout">Breakout</SelectItem>
                  <SelectItem value="pull-back">Pull Back</SelectItem>
                  <SelectItem value="scalping">Scalping</SelectItem>
                  <SelectItem value="swing-trade">Swing Trade</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterTag} onValueChange={setFilterTag}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Filtrar por tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as tags</SelectItem>
                  <SelectItem value="disciplinado">Disciplinado</SelectItem>
                  <SelectItem value="emocional">Emocional</SelectItem>
                  <SelectItem value="fora-setup">Fora de Setup</SelectItem>
                  <SelectItem value="overtrading">Overtrading</SelectItem>
                  <SelectItem value="fomo">FOMO</SelectItem>
                  <SelectItem value="revenge-trading">Revenge Trading</SelectItem>
                  <SelectItem value="perfeito">Perfeito</SelectItem>
                  <SelectItem value="experimental">Experimental</SelectItem>
                  <SelectItem value="conservador">Conservador</SelectItem>
                  <SelectItem value="agressivo">Agressivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Trades Table */}
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead>Setup</TableHead>
                  <TableHead>Tag</TableHead>
                  <TableHead className="text-center">Disciplina</TableHead>
                  <TableHead className="text-right">Pontos</TableHead>
                  <TableHead className="text-right">Resultado</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead className="text-center">Foto</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrades.map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell className="font-medium">
                      {new Date(trade.trade_date).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      {trade.asset_type === "indice" ? "Índice" : "Dólar"}
                    </TableCell>
                    <TableCell>{formatSetup(trade.setup_utilizado)}</TableCell>
                    <TableCell>
                      {trade.tag ? (
                        <Badge variant={getTagVariant(trade.tag) as any}>
                          {formatTag(trade.tag)}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {trade.nota_disciplina ?? "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={trade.result_points > 0 ? "text-success" : "text-danger"}>
                        {trade.result_points > 0 ? "+" : ""}{trade.result_points}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-semibold ${trade.result_reais > 0 ? "text-success" : "text-danger"}`}>
                        R$ {trade.result_reais > 0 ? "+" : ""}{trade.result_reais.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate" title={trade.notes || ""}>
                      {trade.notes || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {trade.screenshot_url ? (
                        <a href={trade.screenshot_url} target="_blank" rel="noopener noreferrer">
                          <ImageIcon className="w-4 h-4 inline text-primary hover:text-primary/80" />
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingTrade(trade)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingTradeId(trade.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Edit Dialog */}
      <EditTradeDialog
        trade={editingTrade}
        open={!!editingTrade}
        onOpenChange={(open) => !open && setEditingTrade(null)}
        onTradeUpdated={fetchTrades}
      />

      {/* Delete Confirmation Dialog */}
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
    </div>
  );
}
