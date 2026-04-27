import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Upload, FileSpreadsheet, Loader2, AlertTriangle, ChevronDown, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { formatCurrencyBR } from "@/lib/formatting";

interface ParsedTrade {
  trade_date: string;
  asset_type: "indice" | "dolar";
  result_reais: number;
  result_points: number;
  contracts: number;
}

interface SkippedRow {
  raw: string;
  reason: string;
}

interface ParseResult {
  trades: ParsedTrade[];
  skipped: SkippedRow[];
  totals: {
    count: number;
    sumReais: number;
    firstDate: string | null;
    lastDate: string | null;
  };
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
}

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED = [".pdf", ".xlsx", ".xls"];

const fmtDate = (iso: string) => iso.split("-").reverse().join("/");

export function ProfitImportDialog({ open, onOpenChange, onImported }: Props) {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<"idle" | "parsing" | "preview" | "importing">("idle");
  const [filename, setFilename] = useState<string>("");
  const [result, setResult] = useState<ParseResult | null>(null);
  const [showSkipped, setShowSkipped] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const reset = () => {
    setStage("idle");
    setFilename("");
    setResult(null);
    setShowSkipped(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleClose = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleFile = async (file: File) => {
    if (!user) return;
    const ext = "." + file.name.split(".").pop()!.toLowerCase();
    if (!ACCEPTED.includes(ext)) {
      toast.error("Formato não suportado", { description: "Use PDF, XLSX ou XLS." });
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error("Arquivo muito grande", { description: "Máximo: 10MB." });
      return;
    }

    setFilename(file.name);
    setStage("parsing");

    try {
      const buf = await file.arrayBuffer();
      // base64 encoding em chunks (evita stack overflow em arquivos grandes)
      const bytes = new Uint8Array(buf);
      let binary = "";
      const chunk = 0x8000;
      for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode.apply(
          null,
          bytes.subarray(i, i + chunk) as unknown as number[],
        );
      }
      const contentBase64 = btoa(binary);

      const { data, error } = await supabase.functions.invoke("parse-profit-report", {
        body: { filename: file.name, contentBase64 },
      });

      if (error) throw error;
      if (!data || (data as any).error) throw new Error((data as any)?.error || "Erro ao analisar");

      const parsed = data as ParseResult;
      if (!parsed.trades || parsed.trades.length === 0) {
        toast.error("Nenhum trade detectado", {
          description: "Verifique se é um relatório do Profit (Nelogica).",
        });
        setStage("idle");
        setFilename("");
        return;
      }

      setResult(parsed);
      setStage("preview");
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao analisar arquivo", { description: err?.message ?? "Tente novamente." });
      setStage("idle");
      setFilename("");
    }
  };

  const handleConfirm = async () => {
    if (!result || !user) return;
    setStage("importing");
    try {
      const rows = result.trades.map((t) => ({
        user_id: user.id,
        trade_date: t.trade_date,
        asset_type: t.asset_type,
        result_reais: t.result_reais,
        result_points: t.result_points,
        notes: `Importado do Profit (${t.contracts} contrato${t.contracts > 1 ? "s" : ""})`,
      }));
      const { error } = await supabase.from("trades").insert(rows);
      if (error) throw error;
      toast.success(`${rows.length} trade${rows.length > 1 ? "s" : ""} importado${rows.length > 1 ? "s" : ""} com sucesso!`);
      onImported();
      handleClose(false);
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao salvar trades", { description: err?.message });
      setStage("preview");
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Importar do Profit (Nelogica)
          </DialogTitle>
          <DialogDescription>
            Envie o relatório de operações em PDF ou Excel. Trades de WIN e WDO serão detectados automaticamente.
          </DialogDescription>
        </DialogHeader>

        {stage === "idle" && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors cursor-pointer ${
              dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
            }`}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium mb-1">Arraste o arquivo aqui ou clique para selecionar</p>
            <p className="text-sm text-muted-foreground">PDF, XLSX ou XLS — até 10MB</p>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </div>
        )}

        {stage === "parsing" && (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-primary" />
            <p className="font-medium">Analisando {filename}...</p>
            <p className="text-sm text-muted-foreground">Isso pode levar alguns segundos.</p>
          </div>
        )}

        {stage === "preview" && result && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="p-3">
                <p className="text-xs text-muted-foreground">Trades detectados</p>
                <p className="font-mono text-xl font-semibold">{result.totals.count}</p>
              </Card>
              <Card className="p-3">
                <p className="text-xs text-muted-foreground">Resultado total</p>
                <p
                  className={`font-mono text-xl font-semibold ${
                    result.totals.sumReais >= 0 ? "text-success" : "text-destructive"
                  }`}
                >
                  {formatCurrencyBR(result.totals.sumReais)}
                </p>
              </Card>
              <Card className="p-3">
                <p className="text-xs text-muted-foreground">Período</p>
                <p className="font-mono text-sm font-semibold">
                  {result.totals.firstDate ? fmtDate(result.totals.firstDate) : "-"}
                  {result.totals.lastDate && result.totals.lastDate !== result.totals.firstDate && (
                    <> → {fmtDate(result.totals.lastDate)}</>
                  )}
                </p>
              </Card>
              <Card className="p-3">
                <p className="text-xs text-muted-foreground">Linhas ignoradas</p>
                <p className="font-mono text-xl font-semibold text-muted-foreground">
                  {result.skipped.length}
                </p>
              </Card>
            </div>

            <Card className="overflow-hidden">
              <div className="max-h-[360px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-card z-10">
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Ativo</TableHead>
                      <TableHead className="text-right">Resultado (R$)</TableHead>
                      <TableHead className="text-right">Pontos</TableHead>
                      <TableHead className="text-right">Contratos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.trades.map((t, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-mono">{fmtDate(t.trade_date)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {t.asset_type === "indice" ? "Índice" : "Dólar"}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={`text-right font-mono ${
                            t.result_reais >= 0 ? "text-success" : "text-destructive"
                          }`}
                        >
                          {formatCurrencyBR(t.result_reais)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {t.result_points.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right font-mono">{t.contracts}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {result.skipped.length > 0 && (
              <Collapsible open={showSkipped} onOpenChange={setShowSkipped}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-between">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      {result.skipped.length} linha{result.skipped.length > 1 ? "s" : ""} ignorada
                      {result.skipped.length > 1 ? "s" : ""}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${showSkipped ? "rotate-180" : ""}`}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <Card className="p-3 max-h-40 overflow-y-auto">
                    <ul className="text-xs space-y-1">
                      {result.skipped.slice(0, 50).map((s, i) => (
                        <li key={i} className="text-muted-foreground">
                          <span className="text-amber-600">{s.reason}:</span>{" "}
                          <span className="font-mono">{s.raw}</span>
                        </li>
                      ))}
                      {result.skipped.length > 50 && (
                        <li className="text-muted-foreground italic">
                          ...e mais {result.skipped.length - 50}
                        </li>
                      )}
                    </ul>
                  </Card>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        )}

        {stage === "importing" && (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-primary" />
            <p className="font-medium">Salvando trades...</p>
          </div>
        )}

        <DialogFooter>
          {stage === "preview" && (
            <>
              <Button variant="outline" onClick={() => handleClose(false)}>
                Cancelar
              </Button>
              <Button onClick={handleConfirm} className="gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Confirmar e importar {result?.trades.length} trade
                {(result?.trades.length ?? 0) > 1 ? "s" : ""}
              </Button>
            </>
          )}
          {(stage === "idle" || stage === "parsing") && (
            <Button variant="outline" onClick={() => handleClose(false)} disabled={stage === "parsing"}>
              Fechar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
