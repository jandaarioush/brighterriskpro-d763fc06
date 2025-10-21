import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";

interface QuickTradeDialogProps {
  open: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onTradeAdded: () => void;
}

export function QuickTradeDialog({ open, onClose, selectedDate, onTradeAdded }: QuickTradeDialogProps) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [customSetups, setCustomSetups] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [showNewSetup, setShowNewSetup] = useState(false);
  const [showNewTag, setShowNewTag] = useState(false);
  const [newSetupName, setNewSetupName] = useState("");
  const [newTagName, setNewTagName] = useState("");

  const [formData, setFormData] = useState({
    assetType: "indice" as "indice" | "dolar",
    operation: "compra" as "compra" | "venda",
    contracts: 1,
    points: 0,
    entryPrice: "",
    exitPrice: "",
    setupUtilizado: "",
    tag: "",
    notaDisciplina: 5,
    notes: "",
  });

  const defaultSetups = ["Rompimento", "Pullback", "Reversão", "Tendência"];
  const defaultTags = ["Planejado", "Impulsivo", "Revenge Trade", "Disciplinado"];

  useEffect(() => {
    if (user && open) {
      loadCustomOptions();
    }
  }, [user, open]);

  const loadCustomOptions = async () => {
    const { data: trades } = await supabase
      .from("trades")
      .select("setup_utilizado, tag")
      .eq("user_id", user?.id)
      .not("setup_utilizado", "is", null)
      .not("tag", "is", null);

    if (trades) {
      const setups = [...new Set(trades.map((t) => t.setup_utilizado).filter(Boolean))] as string[];
      const tags = [...new Set(trades.map((t) => t.tag).filter(Boolean))] as string[];
      setCustomSetups(setups);
      setCustomTags(tags);
    }
  };

  const handleAddNewSetup = () => {
    if (newSetupName.trim()) {
      setCustomSetups([...customSetups, newSetupName.trim()]);
      setFormData({ ...formData, setupUtilizado: newSetupName.trim() });
      setNewSetupName("");
      setShowNewSetup(false);
    }
  };

  const handleAddNewTag = () => {
    if (newTagName.trim()) {
      setCustomTags([...customTags, newTagName.trim()]);
      setFormData({ ...formData, tag: newTagName.trim() });
      setNewTagName("");
      setShowNewTag(false);
    }
  };

  const calculateResult = () => {
    const entry = parseFloat(formData.entryPrice) || 0;
    const exit = parseFloat(formData.exitPrice) || 0;
    const contracts = formData.contracts;
    
    let points = 0;
    if (formData.operation === "compra") {
      points = exit - entry;
    } else {
      points = entry - exit;
    }

    const pointValue = formData.assetType === "indice" ? 0.2 : 10;
    const resultReais = points * pointValue * contracts;

    return { points: points * contracts, reais: resultReais };
  };

  const handleSubmit = async () => {
    if (!user || !selectedDate) return;

    const result = calculateResult();

    if (formData.contracts <= 0) {
      toast.error("Número de contratos deve ser maior que zero");
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase.from("trades").insert({
        user_id: user.id,
        trade_date: format(selectedDate, "yyyy-MM-dd"),
        asset_type: formData.assetType,
        result_reais: result.reais,
        result_points: result.points,
        setup_utilizado: formData.setupUtilizado || null,
        tag: formData.tag || null,
        nota_disciplina: formData.notaDisciplina,
        notes: formData.notes || null,
      });

      if (error) throw error;

      toast.success("Trade registrado com sucesso!");
      onTradeAdded();
      onClose();
      
      // Reset form
      setFormData({
        assetType: "indice",
        operation: "compra",
        contracts: 1,
        points: 0,
        entryPrice: "",
        exitPrice: "",
        setupUtilizado: "",
        tag: "",
        notaDisciplina: 5,
        notes: "",
      });
    } catch (error) {
      console.error("Erro ao salvar trade:", error);
      toast.error("Erro ao registrar trade");
    } finally {
      setSaving(false);
    }
  };

  const result = calculateResult();
  const allSetups = [...defaultSetups, ...customSetups];
  const allTags = [...defaultTags, ...customTags];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Trade</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ativo e Operação */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Ativo</Label>
              <Select
                value={formData.assetType}
                onValueChange={(value: "indice" | "dolar") =>
                  setFormData({ ...formData, assetType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="indice">Índice</SelectItem>
                  <SelectItem value="dolar">Dólar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Operação</Label>
              <Select
                value={formData.operation}
                onValueChange={(value: "compra" | "venda") =>
                  setFormData({ ...formData, operation: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compra">Compra</SelectItem>
                  <SelectItem value="venda">Venda</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contratos, Pontuação, Entrada, Saída */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Contratos</Label>
              <Input
                type="number"
                value={formData.contracts}
                onChange={(e) => setFormData({ ...formData, contracts: parseInt(e.target.value) || 1 })}
                min="1"
              />
            </div>

            <div>
              <Label>Pontuação</Label>
              <Input
                placeholder="Ex: 100 ou -50"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label>Entrada (Opcional)</Label>
              <Input
                placeholder="Pontos"
                value={formData.entryPrice}
                onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
              />
            </div>

            <div>
              <Label>Saída (Opcional)</Label>
              <Input
                placeholder="Pontos"
                value={formData.exitPrice}
                onChange={(e) => setFormData({ ...formData, exitPrice: e.target.value })}
              />
            </div>
          </div>

          {/* Setup Utilizado */}
          <div>
            <Label>Setup Utilizado</Label>
            {showNewSetup ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Nome do setup"
                  value={newSetupName}
                  onChange={(e) => setNewSetupName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddNewSetup()}
                />
                <Button onClick={handleAddNewSetup} size="sm">
                  Adicionar
                </Button>
                <Button onClick={() => setShowNewSetup(false)} variant="outline" size="sm">
                  Cancelar
                </Button>
              </div>
            ) : (
              <Select value={formData.setupUtilizado} onValueChange={(value) => setFormData({ ...formData, setupUtilizado: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um setup" />
                </SelectTrigger>
                <SelectContent>
                  {allSetups.map((setup) => (
                    <SelectItem key={setup} value={setup}>
                      {setup}
                    </SelectItem>
                  ))}
                  <SelectItem value="__new__" onClick={() => setShowNewSetup(true)}>
                    + Adicionar novo setup
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Tag */}
          <div>
            <Label>Tag</Label>
            {showNewTag ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Nome da tag"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddNewTag()}
                />
                <Button onClick={handleAddNewTag} size="sm">
                  Adicionar
                </Button>
                <Button onClick={() => setShowNewTag(false)} variant="outline" size="sm">
                  Cancelar
                </Button>
              </div>
            ) : (
              <Select value={formData.tag} onValueChange={(value) => setFormData({ ...formData, tag: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma tag" />
                </SelectTrigger>
                <SelectContent>
                  {allTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                  <SelectItem value="__new__" onClick={() => setShowNewTag(true)}>
                    + Adicionar nova tag
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Nota de Disciplina */}
          <div>
            <Label>Nota de Disciplina (1-10)</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[formData.notaDisciplina]}
                onValueChange={([value]) => setFormData({ ...formData, notaDisciplina: value })}
                min={1}
                max={10}
                step={1}
                className="flex-1"
              />
              <span className="text-2xl font-bold w-8 text-center">{formData.notaDisciplina}</span>
            </div>
          </div>

          {/* Observações */}
          <div>
            <Label>Observações</Label>
            <Textarea
              placeholder="Setup usado, condições de mercado, etc."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
            />
          </div>

          {/* Resultado Calculado */}
          {(formData.entryPrice && formData.exitPrice) && (
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground mb-1">Resultado calculado:</p>
              <p className={`text-2xl font-bold ${result.reais >= 0 ? "text-green-500" : "text-red-500"}`}>
                {result.reais >= 0 ? "+" : ""}{result.points.toFixed(0)} pts / R$ {result.reais.toFixed(2)}
              </p>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={saving} className="flex-1">
              {saving ? "Salvando..." : "Registrar Trade"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
