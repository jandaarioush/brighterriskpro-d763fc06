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
import { z } from 'zod';
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const editTradeSchema = z.object({
  contracts: z.string()
    .trim()
    .min(1, 'Contratos é obrigatório')
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num > 0;
    }, 'Contratos deve ser maior que zero'),
  entry: z.string().optional(),
  exit: z.string().optional(),
  observations: z.string().trim().max(1000, 'Observações muito longas').optional(),
  setupUtilizado: z.string().optional(),
  tag: z.string().optional(),
}).refine((data) => {
  // If entry is provided, exit must be provided too
  if (data.entry && !data.exit) return false;
  if (!data.entry && data.exit) return false;
  return true;
}, {
  message: 'Entrada e saída devem ser preenchidos juntos',
  path: ['exit'],
});

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
  const { user } = useAuth();
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

  // Custom setup and tag management
  const [customSetups, setCustomSetups] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [showNewSetupInput, setShowNewSetupInput] = useState(false);
  const [showNewTagInput, setShowNewTagInput] = useState(false);
  const [newSetupValue, setNewSetupValue] = useState("");
  const [newTagValue, setNewTagValue] = useState("");

  // Default options
  const defaultSetups = [
    "Rompimento",
    "Reversão",
    "Tendência",
    "Suporte/Resistência",
    "Médias Móveis",
    "Divergência",
    "Padrão Candlestick",
    "Breakout",
    "Pull Back",
    "Scalping",
    "Swing Trade"
  ];

  const defaultTags = [
    "Disciplinado",
    "Emocional",
    "Fora de Setup",
    "Overtrading",
    "FOMO",
    "Revenge Trading",
    "Perfeito",
    "Experimental",
    "Conservador",
    "Agressivo"
  ];

  // Load user's custom setups and tags
  useEffect(() => {
    if (!user) return;

    const loadCustomOptions = async () => {
      const { data: trades } = await supabase
        .from('trades')
        .select('setup_utilizado, tag')
        .eq('user_id', user.id)
        .not('setup_utilizado', 'is', null)
        .not('tag', 'is', null);

      if (trades) {
        const setups = new Set<string>();
        const tags = new Set<string>();

        trades.forEach(tradeItem => {
          if (tradeItem.setup_utilizado && !defaultSetups.includes(tradeItem.setup_utilizado)) {
            setups.add(tradeItem.setup_utilizado);
          }
          if (tradeItem.tag && !defaultTags.includes(tradeItem.tag)) {
            tags.add(tradeItem.tag);
          }
        });

        setCustomSetups(Array.from(setups));
        setCustomTags(Array.from(tags));
      }
    };

    loadCustomOptions();
  }, [user]);

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

  const handleAddNewSetup = () => {
    if (newSetupValue.trim()) {
      const trimmed = newSetupValue.trim();
      if (!customSetups.includes(trimmed) && !defaultSetups.includes(trimmed)) {
        setCustomSetups([...customSetups, trimmed]);
      }
      setFormData({...formData, setupUtilizado: trimmed});
      setNewSetupValue("");
      setShowNewSetupInput(false);
    }
  };

  const handleAddNewTag = () => {
    if (newTagValue.trim()) {
      const trimmed = newTagValue.trim();
      if (!customTags.includes(trimmed) && !defaultTags.includes(trimmed)) {
        setCustomTags([...customTags, trimmed]);
      }
      setFormData({...formData, tag: trimmed});
      setNewTagValue("");
      setShowNewTagInput(false);
    }
  };

  const handleSave = async () => {
    if (!trade) return;

    setSaving(true);
    try {
      // Validate inputs
      const validationResult = editTradeSchema.safeParse(formData);

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast.error(firstError.message);
        setSaving(false);
        return;
      }

      const updates: any = {
        notes: formData.observations.trim() || null,
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
              {showNewSetupInput ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite o nome do setup..."
                    value={newSetupValue}
                    onChange={(e) => setNewSetupValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNewSetup();
                      }
                      if (e.key === 'Escape') {
                        setShowNewSetupInput(false);
                        setNewSetupValue("");
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddNewSetup}
                  >
                    OK
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowNewSetupInput(false);
                      setNewSetupValue("");
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Select
                  value={formData.setupUtilizado}
                  onValueChange={(v) => {
                    if (v === "_new_") {
                      setShowNewSetupInput(true);
                    } else {
                      setFormData({ ...formData, setupUtilizado: v });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um setup" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="_new_" className="text-primary font-medium">
                      <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Criar novo setup...
                      </div>
                    </SelectItem>
                    {defaultSetups.map(setup => (
                      <SelectItem key={setup} value={setup}>
                        {setup}
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
              )}
            </div>

            <div className="space-y-2">
              <Label>Tag</Label>
              {showNewTagInput ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite o nome da tag..."
                    value={newTagValue}
                    onChange={(e) => setNewTagValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNewTag();
                      }
                      if (e.key === 'Escape') {
                        setShowNewTagInput(false);
                        setNewTagValue("");
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddNewTag}
                  >
                    OK
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowNewTagInput(false);
                      setNewTagValue("");
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Select
                  value={formData.tag}
                  onValueChange={(v) => {
                    if (v === "_new_") {
                      setShowNewTagInput(true);
                    } else {
                      setFormData({ ...formData, tag: v });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma tag" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="_new_" className="text-primary font-medium">
                      <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Criar nova tag...
                      </div>
                    </SelectItem>
                    {defaultTags.map(tag => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
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
              )}
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
