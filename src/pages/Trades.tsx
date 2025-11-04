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
  Upload,
  Pencil,
  Trash2,
  Image as ImageIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { EditTradeDialog } from "@/components/EditTradeDialog";
import { z } from "zod";

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

// Validation schema for CSV import
const tradeImportSchema = z.object({
  trade_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  asset_type: z.enum(["indice", "dolar"], { errorMap: () => ({ message: "Asset must be 'indice' or 'dolar'" }) }),
  result_points: z.number().finite({ message: "Points must be a valid number" }),
  result_reais: z.number().finite({ message: "Result must be a valid number" }),
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional().nullable(),
  setup_utilizado: z.string().max(100).optional().nullable(),
  tag: z.string().max(100).optional().nullable(),
  nota_disciplina: z.number().int().min(0).max(10, "Discipline score must be between 0-10").optional().nullable(),
});

// Normalizar texto: remove acentos, lowercase, trim
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .trim()
    .replace(/\s+/g, " "); // Normaliza espaços múltiplos
};

// Mapear setup do CSV para valor do banco
const mapSetupToValue = (setupStr: string): string | null => {
  const normalized = normalizeText(setupStr);
  
  const setupMap: Record<string, string> = {
    "rompimento": "rompimento",
    "reversao": "reversao",
    "tendencia": "tendencia",
    "suporte/resistencia": "suporte-resistencia",
    "suporteresistencia": "suporte-resistencia",
    "suporte resistencia": "suporte-resistencia",
    "medias moveis": "medias-moveis",
    "mediasmoveis": "medias-moveis",
    "divergencia": "divergencia",
    "padrao candlestick": "padrao-candlestick",
    "padraocandlestick": "padrao-candlestick",
    "breakout": "breakout",
    "pull back": "pull-back",
    "pullback": "pull-back",
    "scalping": "scalping",
    "swing trade": "swing-trade",
    "swingtrade": "swing-trade",
    "outro": "outro"
  };
  
  return setupMap[normalized] || null;
};

// Mapear tag do CSV para valor do banco
const mapTagToValue = (tagStr: string): string | null => {
  const normalized = normalizeText(tagStr);
  
  const tagMap: Record<string, string> = {
    "disciplinado": "disciplinado",
    "emocional": "emocional",
    "fora de setup": "fora-setup",
    "fora setup": "fora-setup",
    "forasetup": "fora-setup",
    "overtrading": "overtrading",
    "fomo": "fomo",
    "revenge trading": "revenge-trading",
    "revengetrading": "revenge-trading",
    "perfeito": "perfeito",
    "experimental": "experimental",
    "conservador": "conservador",
    "agressivo": "agressivo"
  };
  
  return tagMap[normalized] || null;
};

// Parse robusto de linha CSV
const parseCsvLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Aspas duplas escapadas
        current += '"';
        i++; // Pula próxima aspa
      } else {
        // Abre/fecha aspas
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Vírgula fora de aspas = separador
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
};

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
  const [importing, setImporting] = useState(false);
  const [screenshotUrls, setScreenshotUrls] = useState<{ [key: string]: string }>({});
  const [customSetups, setCustomSetups] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [showImportTemplate, setShowImportTemplate] = useState(false);

  // Default setup and tag options
  const defaultSetups = [
    { value: "rompimento", label: "Rompimento" },
    { value: "reversao", label: "Reversão" },
    { value: "tendencia", label: "Tendência" },
    { value: "suporte-resistencia", label: "Suporte/Resistência" },
    { value: "medias-moveis", label: "Médias Móveis" },
    { value: "divergencia", label: "Divergência" },
    { value: "padrao-candlestick", label: "Padrão Candlestick" },
    { value: "breakout", label: "Breakout" },
    { value: "pull-back", label: "Pull Back" },
    { value: "scalping", label: "Scalping" },
    { value: "swing-trade", label: "Swing Trade" },
    { value: "outro", label: "Outro" }
  ];

  const defaultTags = [
    { value: "disciplinado", label: "Disciplinado" },
    { value: "emocional", label: "Emocional" },
    { value: "fora-setup", label: "Fora de Setup" },
    { value: "overtrading", label: "Overtrading" },
    { value: "fomo", label: "FOMO" },
    { value: "revenge-trading", label: "Revenge Trading" },
    { value: "perfeito", label: "Perfeito" },
    { value: "experimental", label: "Experimental" },
    { value: "conservador", label: "Conservador" },
    { value: "agressivo", label: "Agressivo" }
  ];

  // Generate signed URL for screenshot
  const getScreenshotUrl = async (filePath: string, tradeId: string) => {
    if (screenshotUrls[tradeId]) return screenshotUrls[tradeId];
    
    try {
      const { data, error } = await supabase.storage
        .from('trade-screenshots')
        .createSignedUrl(filePath, 3600); // 1 hour expiry
      
      if (error || !data) return null;
      
      setScreenshotUrls(prev => ({ ...prev, [tradeId]: data.signedUrl }));
      return data.signedUrl;
    } catch {
      return null;
    }
  };

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
      
      // Load custom setups and tags from trades
      if (data) {
        const setups = new Set<string>();
        const tags = new Set<string>();

        data.forEach(trade => {
          if (trade.setup_utilizado && !defaultSetups.find(s => s.value === trade.setup_utilizado)) {
            setups.add(trade.setup_utilizado);
          }
          if (trade.tag && !defaultTags.find(t => t.value === trade.tag)) {
            tags.add(trade.tag);
          }
        });

        setCustomSetups(Array.from(setups));
        setCustomTags(Array.from(tags));

        // Pre-generate signed URLs for screenshots
        data.forEach(trade => {
          if (trade.screenshot_url) {
            getScreenshotUrl(trade.screenshot_url, trade.id);
          }
        });
      }
    } catch (error) {
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
      toast.error("Erro ao excluir trade");
    }
    setDeletingTradeId(null);
  };

  const handleExport = () => {
    if (filteredTrades.length === 0) {
      toast.error("Nenhum trade para exportar");
      return;
    }

    // Create CSV content
    const headers = ["Data", "Ativo", "Setup", "Tag", "Disciplina", "Pontos", "Resultado (R$)", "Observações"];
    const csvContent = [
      headers.join(","),
      ...filteredTrades.map(trade => [
        new Date(trade.trade_date).toLocaleDateString("pt-BR"),
        trade.asset_type === "indice" ? "Índice" : "Dólar",
        formatSetup(trade.setup_utilizado),
        formatTag(trade.tag),
        trade.nota_disciplina ?? "",
        trade.result_points,
        trade.result_reais.toFixed(2),
        `"${(trade.notes || "").replace(/"/g, '""')}"`
      ].join(","))
    ].join("\n");

    // Create blob and download
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `trades_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Trades exportados com sucesso!");
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validar tamanho (5MB max)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Arquivo muito grande", {
        description: "Tamanho máximo: 5MB"
      });
      return;
    }

    setImporting(true);

    try {
      // Ler arquivo com encoding correto
      const arrayBuffer = await file.arrayBuffer();
      const decoder = new TextDecoder('utf-8');
      let text = decoder.decode(arrayBuffer);

      // Remover BOM se existir
      if (text.charCodeAt(0) === 0xFEFF) {
        text = text.slice(1);
      }

      // Split em linhas e filtrar vazias
      const lines = text
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      if (lines.length < 2) {
        toast.error("Arquivo CSV vazio ou inválido", {
          description: "O arquivo deve conter pelo menos o cabeçalho e uma linha de dados"
        });
        return;
      }

      console.log(`📄 Processando ${lines.length - 1} linhas do CSV...`);

      // Pular cabeçalho
      const dataLines = lines.slice(1);
      const tradesToImport = [];
      const errors: string[] = [];

      for (let i = 0; i < dataLines.length; i++) {
        const line = dataLines[i];
        
        try {
          // Parse da linha
          const values = parseCsvLine(line);
          
          if (values.length < 7) {
            errors.push(`Linha ${i + 2}: Formato inválido (esperado 7+ colunas, encontrado ${values.length})`);
            continue;
          }

          const [dateStr, assetStr, setupStr, tagStr, disciplinaStr, pointsStr, resultStr, ...rest] = values;
          const notesStr = rest.join(','); // Juntar observações se tiver vírgulas

          console.log(`Linha ${i + 2}:`, { dateStr, assetStr, setupStr, tagStr, pointsStr, resultStr });

          // Validar e parsear data (dd/mm/yyyy)
          const dateParts = dateStr.trim().split("/");
          if (dateParts.length !== 3) {
            throw new Error("Data inválida (use formato dd/mm/aaaa)");
          }
          
          const [day, month, year] = dateParts.map(p => p.trim());
          if (!day || !month || !year) {
            throw new Error("Data incompleta");
          }
          
          const tradeDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          
          // Validar data é válida
          const dateTest = new Date(tradeDate);
          if (isNaN(dateTest.getTime())) {
            throw new Error("Data inválida");
          }

          // Parsear valores numéricos
          const points = parseFloat(pointsStr.trim().replace(',', '.'));
          if (isNaN(points)) {
            throw new Error("Pontos inválidos (deve ser número)");
          }

          const result = parseFloat(resultStr.trim().replace(',', '.'));
          if (isNaN(result)) {
            throw new Error("Resultado inválido (deve ser número)");
          }

          const disciplina = disciplinaStr?.trim() 
            ? parseInt(disciplinaStr.trim()) 
            : null;
          
          if (disciplina !== null && (isNaN(disciplina) || disciplina < 0 || disciplina > 10)) {
            throw new Error("Disciplina inválida (deve ser 0-10 ou vazio)");
          }

          // Mapear ativo (normalizado)
          const normalizedAsset = normalizeText(assetStr);
          const asset_type = normalizedAsset.includes("indice") ? "indice" : "dolar";

          // Mapear setup e tag (com normalização)
          const setup_utilizado = setupStr?.trim() ? mapSetupToValue(setupStr.trim()) : null;
          const tag = tagStr?.trim() ? mapTagToValue(tagStr.trim()) : null;

          // Validar com Zod
          const tradeData = tradeImportSchema.parse({
            trade_date: tradeDate,
            asset_type,
            result_points: points,
            result_reais: result,
            notes: notesStr?.trim() || null,
            setup_utilizado,
            tag,
            nota_disciplina: disciplina,
          });

          tradesToImport.push({
            user_id: user.id,
            ...tradeData
          });

          console.log(`✅ Linha ${i + 2} válida`);

        } catch (validationError) {
          console.error(`❌ Erro linha ${i + 2}:`, validationError);
          
          if (validationError instanceof z.ZodError) {
            const fieldErrors = validationError.errors
              .map(e => `${e.path.join('.')}: ${e.message}`)
              .join(', ');
            errors.push(`Linha ${i + 2}: ${fieldErrors}`);
          } else if (validationError instanceof Error) {
            errors.push(`Linha ${i + 2}: ${validationError.message}`);
          } else {
            errors.push(`Linha ${i + 2}: Dados inválidos`);
          }
        }
      }

      console.log(`📊 Resultado: ${tradesToImport.length} válidos, ${errors.length} erros`);

      // Verificar se tem trades válidos
      if (tradesToImport.length === 0) {
        toast.error("Nenhum trade válido encontrado", {
          description: errors.length > 0 
            ? `Erros: ${errors.slice(0, 2).join('; ')}` 
            : "Verifique o formato do arquivo"
        });
        return;
      }

      // Inserir no banco
      console.log(`💾 Inserindo ${tradesToImport.length} trades no banco...`);
      const { error: insertError } = await supabase
        .from("trades")
        .insert(tradesToImport);

      if (insertError) {
        console.error("Erro ao inserir:", insertError);
        throw new Error(`Erro ao salvar no banco: ${insertError.message}`);
      }

      // Mensagem de sucesso
      const successMessage = errors.length > 0 
        ? `${tradesToImport.length} trades importados. ${errors.length} linha(s) com erro.`
        : `${tradesToImport.length} trades importados com sucesso! 🎉`;
      
      const errorDetails = errors.length > 0 && errors.length <= 5
        ? errors.join('\n')
        : errors.length > 5
        ? `${errors.slice(0, 3).join('\n')}\n...e mais ${errors.length - 3} erros`
        : undefined;
      
      toast.success(successMessage, {
        description: errorDetails,
        duration: 5000
      });

      // Recarregar trades
      await fetchTrades();
      
    } catch (error) {
      console.error("Erro fatal na importação:", error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Erro desconhecido ao importar trades";
      
      toast.error("Erro ao importar trades", {
        description: errorMessage,
        duration: 5000
      });
    } finally {
      setImporting(false);
      // Limpar input para permitir reimportar o mesmo arquivo
      if (event.target) {
        event.target.value = "";
      }
    }
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

              <div className="flex gap-2">
                <Button variant="outline" className="gap-2" onClick={handleExport}>
                  <Download className="w-4 h-4" />
                  Exportar
                </Button>
                
                <Button 
                  variant="outline" 
                  className="gap-2" 
                  onClick={() => setShowImportTemplate(true)}
                >
                  <Upload className="w-4 h-4" />
                  Importar
                </Button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <Select value={filterSetup} onValueChange={setFilterSetup}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Filtrar por setup" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="all">Todos os setups</SelectItem>
                  {defaultSetups.map(setup => (
                    <SelectItem key={setup.value} value={setup.value}>
                      {setup.label}
                    </SelectItem>
                  ))}
                  {customSetups.length > 0 && (
                    <>
                      <SelectItem value="_divider_" disabled className="text-xs text-muted-foreground">
                        — Setups Personalizados —
                      </SelectItem>
                      {customSetups.map(setup => (
                        <SelectItem key={setup} value={setup}>
                          {setup}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>

              <Select value={filterTag} onValueChange={setFilterTag}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Filtrar por tag" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="all">Todas as tags</SelectItem>
                  {defaultTags.map(tag => (
                    <SelectItem key={tag.value} value={tag.value}>
                      {tag.label}
                    </SelectItem>
                  ))}
                  {customTags.length > 0 && (
                    <>
                      <SelectItem value="_divider_" disabled className="text-xs text-muted-foreground">
                        — Tags Personalizadas —
                      </SelectItem>
                      {customTags.map(tag => (
                        <SelectItem key={tag} value={tag}>
                          {tag}
                        </SelectItem>
                      ))}
                    </>
                  )}
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
                      {trade.trade_date.split('-').reverse().join('/')}
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
                        <a 
                          href={screenshotUrls[trade.id] || "#"} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            if (!screenshotUrls[trade.id]) {
                              e.preventDefault();
                              getScreenshotUrl(trade.screenshot_url!, trade.id).then(url => {
                                if (url) window.open(url, '_blank');
                              });
                            }
                          }}
                        >
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

      {/* Import Template Dialog */}
      <AlertDialog open={showImportTemplate} onOpenChange={setShowImportTemplate}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Modelo de Importação CSV</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>Use o formato abaixo para importar seus trades. Salve como arquivo .csv:</p>
                
                <div className="bg-muted p-4 rounded-md overflow-x-auto">
                  <pre className="text-xs">
{`Data,Ativo,Setup,Tag,Disciplina,Pontos,Resultado (R$),Observações
01/10/2024,Índice,Rompimento,Disciplinado,8,100,20.00,"Setup perfeito, entrada no rompimento"
02/10/2024,Dólar,Reversão,Emocional,5,-50,-500.00,"Entrei no FOMO"
03/10/2024,indice,pull-back,Perfeito,10,150,30.00,Seguiu o plano
04/10/2024,DOLAR,Tendência,Conservador,7,80,800.00,"Saída antecipada, mas lucro garantido"`}
                  </pre>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="font-semibold">✅ Instruções:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li><strong>Data:</strong> formato dd/mm/aaaa (ex: 01/10/2024)</li>
                    <li><strong>Ativo:</strong> "Índice" ou "Dólar" (aceita variações)</li>
                    <li><strong>Setup:</strong> Rompimento, Reversão, Tendência, etc.</li>
                    <li><strong>Tag:</strong> Disciplinado, Emocional, FOMO, etc.</li>
                    <li><strong>Disciplina:</strong> número de 0 a 10 (deixe vazio se não tiver)</li>
                    <li><strong>Pontos:</strong> número positivo ou negativo (ex: 100 ou -50)</li>
                    <li><strong>Resultado (R$):</strong> valor em reais (ex: 20.00 ou -500.00)</li>
                    <li><strong>Observações:</strong> texto livre entre aspas (opcional)</li>
                  </ul>
                  <p className="text-xs text-amber-600 mt-2">
                    💡 Dica: O sistema aceita variações de escrita (maiúsculas, acentos, espaços)
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel>Fechar</AlertDialogCancel>
            <AlertDialogAction asChild>
              <label className="cursor-pointer">
                Selecionar Arquivo CSV
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    handleImport(e);
                    setShowImportTemplate(false);
                  }}
                  disabled={importing}
                />
              </label>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
