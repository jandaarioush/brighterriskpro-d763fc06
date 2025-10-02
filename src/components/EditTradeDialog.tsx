import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

interface EditTradeDialogProps {
  trade: Trade | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTradeUpdated: () => void;
}

export function EditTradeDialog({
  trade,
  open,
  onOpenChange,
  onTradeUpdated,
}: EditTradeDialogProps) {
  const [formData, setFormData] = useState({
    entry: "",
    exit: "",
    contracts: "1",
    observations: "",
    setupUtilizado: "",
    tag: "",
    notaDisciplina: 5,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (trade) {
      const pointValue = trade.asset_type === "indice" ? 0.2 : 10;
      const estimatedContracts = Math.abs(Math.round(trade.result_reais / (trade.result_points * pointValue))) || 1;
      
      setFormData({
        entry: "",
        exit: "",
        contracts: estimatedContracts.toString(),
        observations: trade.notes || "",
        setupUtilizado: trade.setup_utilizado || "",
        tag: trade.tag || "",
        notaDisciplina: trade.nota_disciplina || 5,
      });
    }
  }, [trade]);

  const handleSave = async () => {
    if (!trade) return;

    setSaving(true);
    try {
      const updates: any = {
        notes: formData.observations,
        setup_utilizado: formData.setupUtilizado || null,
        tag: formData.tag || null,
        nota_disciplina: formData.notaDisciplina,
      };

      // If entry and exit are provided, recalculate points and result
      if (formData.entry && formData.exit) {
        const points = parseFloat(formData.exit) - parseFloat(formData.entry);
        const pointValue = trade.asset_type === "indice" ? 0.2 : 10;
        const result = points * pointValue * parseInt(formData.contracts);
        
        updates.result_points = points;
        updates.result_reais = result;
      }

      const { error } = await supabase
        .from("trades")
        .update(updates)
        .eq("id", trade.id);

      if (error) throw error;

      toast.success("Trade atualizado com sucesso!");
      onTradeUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating trade:", error);
      toast.error("Erro ao atualizar trade");
    } finally {
      setSaving(false);
    }
  };

  if (!trade) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Trade</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Contratos</Label>
              <Input
                type="number"
                value={formData.contracts}
                onChange={(e) => setFormData({ ...formData, contracts: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Entrada (opcional)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Pontos"
                value={formData.entry}
                onChange={(e) => setFormData({ ...formData, entry: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Saída (opcional)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Pontos"
                value={formData.exit}
                onChange={(e) => setFormData({ ...formData, exit: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Setup Utilizado</Label>
              <Select
                value={formData.setupUtilizado}
                onValueChange={(v) => setFormData({ ...formData, setupUtilizado: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um setup" />
                </SelectTrigger>
                <SelectContent>
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
            </div>

            <div className="space-y-2">
              <Label>Tag</Label>
              <Select
                value={formData.tag}
                onValueChange={(v) => setFormData({ ...formData, tag: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma tag" />
                </SelectTrigger>
                <SelectContent>
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

          <div className="space-y-2">
            <Label>Nota de Disciplina (0-10)</Label>
            <div className="space-y-2">
              <Slider
                value={[formData.notaDisciplina]}
                onValueChange={(v) => setFormData({ ...formData, notaDisciplina: v[0] })}
                min={0}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="text-center text-sm text-muted-foreground">
                {formData.notaDisciplina}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              placeholder="Setup usado, condições de mercado, etc."
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              rows={3}
            />
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Ativo: {trade.asset_type === "indice" ? "Índice" : "Dólar"}</p>
            <p>Data: {new Date(trade.trade_date).toLocaleDateString("pt-BR")}</p>
            <p>Resultado atual: R$ {trade.result_reais.toFixed(2)}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
